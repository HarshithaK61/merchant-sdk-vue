import { SignClient } from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/types";
import logo from "./assets/browser-wallet-icon.svg";
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const network = import.meta.env.VITE_NETWORK;

export interface WalletConnectEventHandlers {
  onSessionEvent?: (event: any) => void;
  onSessionDelete?: (data: any) => void;
  onSessionExpire?: (data: any) => void;
  onSessionRequestExpire?: (data: any) => void;
  onReconnectRequired?: (reason: 'deleted' | 'expired') => void;
}

export class MerchantWalletConnect {
  private signClient: Awaited<ReturnType<typeof SignClient.init>> | null = null;
  public session: SessionTypes.Struct | null = null;
  public uri: string = "";
  private eventHandlers: WalletConnectEventHandlers = {};

  constructor(handlers?: WalletConnectEventHandlers) {
    if (handlers) {
      this.eventHandlers = handlers;
    }
  }

  async initClient(): Promise<void> {
    this.signClient = await SignClient.init({
      projectId,
      metadata: {
        name: "Merchant SDK Demo",
        description: "Merchant dApp using Concordium ID verification",
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      },
    });

    this.signClient.on("session_event", (event: any) => {
      this.eventHandlers.onSessionEvent?.(event);
    });

    this.signClient.on("session_authenticate", () => {});

    this.signClient.on("session_delete", (data: any) => {
      this.session = null;
      this.uri = "";
      this.eventHandlers.onSessionDelete?.(data);
      this.eventHandlers.onReconnectRequired?.('deleted');
    });

    this.signClient.on("session_expire", (data: any) => {
      this.session = null;
      this.uri = "";
      this.eventHandlers.onSessionExpire?.(data);
      this.eventHandlers.onReconnectRequired?.('expired');
    });

    this.signClient.on("session_request_expire", (data: any) => {
      this.eventHandlers.onSessionRequestExpire?.(data);
    });
  }

  getClient() {
    return this.signClient;
  }

  getSignClient() {
    return this.signClient;
  }

  getListOfPairings() {
    if (!this.signClient) return [];
    return this.signClient.pairing.getAll();
  }

  getListOfSessions(): SessionTypes.Struct[] {
    if (!this.signClient) return [];
    return this.signClient.session.getAll();
  }

  getMostRecentValidSession(): SessionTypes.Struct | null {
    const sessions = this.getListOfSessions();
    if (sessions && sessions.length > 0) {
      const now = Math.floor(Date.now() / 1000);
      const validSessions = sessions.filter((session) => session.expiry > now);
      if (validSessions.length === 0) return null;
      validSessions.sort((a, b) => b.expiry - a.expiry);
      return validSessions[0] ?? null;
    }
    return null;
  }

  async connect(chainId?: string): Promise<string> {
    if (!this.signClient)
      throw new Error("WalletConnect client not initialized");

    const chain = chainId || `ccd:${network}`;

    const { uri, approval } = await this.signClient.connect({
      optionalNamespaces: {
        ccd: {
          methods: ["request_verifiable_presentation_v1"],
          chains: [chain],
          events: [
            "session_ping",
            "chain_changed",
            "accounts_changed",
            "account_disconnected",
            "session_event",
          ],
        },
      },
      pairingTopic: undefined,
    });

    this.uri = uri || "";

    approval()
      .then((session) => {
        this.session = session;
      })
      .catch(() => {
        this.session = null;
      });

    return this.uri;
  }

  async disconnect(topic?: string): Promise<void> {
    if (!this.signClient)
      throw new Error("WalletConnect client not initialized");

    const sessionTopic = topic || this.session?.topic;
    if (!sessionTopic) {
      return;
    }

    await this.signClient.disconnect({
      topic: sessionTopic,
      reason: { code: 6000, message: "User disconnected" },
    });

    if (this.session?.topic === sessionTopic) {
      this.session = null;
    }
  }

  async disconnectAll(): Promise<void> {
    const sessions = this.getListOfSessions();
    if (sessions.length > 0) {
      for (const session of sessions) {
        await this.disconnect(session.topic);
      }
    }
  }

  async sendRequest<T = any>(
    method: string,
    params: any,
    chainId?: string,
  ): Promise<T> {
    if (!this.signClient)
      throw new Error("WalletConnect client not initialized");

    if (!this.session) {
      this.session = this.getMostRecentValidSession();
      if (!this.session) {
        throw new Error("No active session available");
      }
    }

    const chain = chainId || `ccd:${network}`;

    const result = await this.signClient.request<T>({
      topic: this.session.topic,
      chainId: chain,
      request: {
        method,
        params,
      },
    });

    return result;
  }

  async requestVerifiablePresentation(
    challengeData?: any,
    sessionTopic?: string,
    chainId?: string,
  ): Promise<any> {
    if (!this.signClient)
      throw new Error("WalletConnect client not initialized");

    const session = sessionTopic
      ? this.getListOfSessions().find((s) => s.topic === sessionTopic)
      : this.session || this.getMostRecentValidSession();

    if (!session) {
      throw new Error(
        "No active session available for verifiable presentation request",
      );
    }

    const chain = chainId || `ccd:${network}`;

    const proof = await this.signClient.request({
      topic: session.topic,
      chainId: chain,
      request: {
        method: "request_verifiable_presentation_v1",
        params: {
          ...(challengeData?.presentationRequest || {}),
          metadata: {
            description: "Requesting age verification",
            appName: "Concordium Merchant SDK",
            url: window.location.origin,
            icons: [logo],
          },
        },
      },
    });

    return proof;
  }

  formatExpiryIST(expiryUnixSeconds: number): string {
    const date = new Date(expiryUnixSeconds * 1000);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  formatExpiryLocal(expiryUnixSeconds: number): string {
    const date = new Date(expiryUnixSeconds * 1000);
    return date.toLocaleString();
  }

  isSessionValid(session: SessionTypes.Struct): boolean {
    const now = Math.floor(Date.now() / 1000);
    return session.expiry > now;
  }

  getSessionTimeRemaining(session: SessionTypes.Struct): number {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, session.expiry - now);
  }
}

export default MerchantWalletConnect;
