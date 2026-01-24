export interface ApiConfig {
  apiUrl: string;
  apiSecret: string;
  network: "mainnet" | "testnet";
}

export interface PresentationVerificationRequest {
  presentation: {
    presentationContext: any;
    proof: any;
    type: any;
    verifiableCredential: any;
  };
  network: string;
}

export interface VerificationResult {
  verified: any;
  valid: boolean;
  result?: any;
  error?: string;
}

export interface ChallengeResponse {
  challengeId: string;
  presentationRequest?: any;
}

export interface ChallengeRequest {
  context: string;
  network: string;
  contextDetails: {
    age: number;
    operator: "gte" | "lte" | "eq";
    proofType: string[];
  };
}

export class ApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Get common headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-api-secret": this.config.apiSecret,
    };
  }

  /**
   * Make a generic API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.config.apiUrl.replace(/\/$/, "")}${endpoint}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
      ...options,
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Request a challenge from the backend
   */
  async initializeChallenge(
    request: ChallengeRequest,
  ): Promise<ChallengeResponse> {
    return this.makeRequest<ChallengeResponse>("/api/v1/challenge", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Verify the presentation proof with the backend
   */
  async verifyPresentation(
    request: PresentationVerificationRequest,
  ): Promise<VerificationResult> {
    return this.makeRequest<VerificationResult>("/api/v1/verify/id-proof", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

export default ApiService;
