<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { MerchantSDK } from 'merchant-sdk';
import 'merchant-sdk/dist/merchant-sdk.css';
import { MerchantWalletConnect } from './wallet-connect';
import { ApiService } from './services/api.service';
import type { SessionTypes } from '@walletconnect/types';

// WalletConnect instance
const walletConnect = ref<MerchantWalletConnect | null>(null);

// API service instance
const apiService = new ApiService({
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiSecret: import.meta.env.VITE_API_SECRET || '',
  network: (import.meta.env.VITE_NETWORK as 'mainnet' | 'testnet') || 'testnet',
});

// SDK instance
const sdk = ref<MerchantSDK | null>(null);

// State
const isLoading = ref(false);
const isInitialized = ref(false); 
const isConnecting = ref(false);
const isVerified = ref(false);
const uri = ref('');
const sessions = ref<SessionTypes.Struct[]>([]);
const currentSession = ref<SessionTypes.Struct | null>(null);
const verificationResult = ref<any>(null);

// Chain ID mapping for Concordium networks
const chainId = computed(() => {
  return 'ccd:4221332d34e1694168c2a0c0b3fd0f27'
});

// Get network name from environment
const network = computed(() => {
  return import.meta.env.VITE_NETWORK || 'testnet';
});

// Perform the full verification flow
const performVerification = async (session: SessionTypes.Struct) => {
  if (!walletConnect.value) {
    throw new Error('WalletConnect not initialized');
  }

  // Step 1: Request challenge from backend (API call)
  const challengeData = await apiService.initializeChallenge({
    context: 'IDProofVerificationByIdapp',
    network: network.value,
    contextDetails: {
      age: 18,
      operator: 'gte',
      proofType: ['AgeProof'],
    },
  });

  // Step 2: Request verifiable presentation from wallet (WalletConnect)
  const proof = await walletConnect.value.requestVerifiablePresentation(
    challengeData,
    session.topic,
    chainId.value
  );

  // Step 3: Verify the proof with backend (API call)
  const result = await apiService.verifyPresentation({
    presentation: {
      presentationContext: proof?.verifiablePresentationJson?.presentationContext,
      proof: proof?.verifiablePresentationJson?.proof,
      type: proof?.verifiablePresentationJson?.type,
      verifiableCredential: proof?.verifiablePresentationJson?.verifiableCredential,
    },
    network: network.value,
  });

  return result;
};

// Initialize WalletConnect client
const initWalletConnect = async () => {
  isLoading.value = true;

  try {
    walletConnect.value = new MerchantWalletConnect({
      onSessionEvent: () => { },
      onSessionDelete: () => {
        currentSession.value = null;
        refreshSessions();
      },
      onSessionExpire: () => {
        currentSession.value = null;
        refreshSessions();
      },
      onSessionRequestExpire: () => { },
      onReconnectRequired: async () => {
        currentSession.value = null;
        uri.value = '';
        sdk.value?.closeModal();
        await connectWallet();
      },
    });

    await walletConnect.value.initClient();
    refreshSessions();
  } catch (error) {
    // Handle error silently
  } finally {
    isLoading.value = false;
  }
};

// Initialize Merchant SDK
const initSDK = async () => {
  try {
    sdk.value = new MerchantSDK({
      onEvent: (event: any) => {
        switch (event.type) {
          case 'session-approved':
            isConnecting.value = false;
            refreshSessions();
            break;
          case 'verification-completed':
            verificationResult.value = event.data;
            break;
          case 'error':
            isConnecting.value = false;
            break;
        }
      }
    });

    isInitialized.value = true;
  } catch (error) {
    // Handle error silently
  }
};

// Refresh sessions list
const refreshSessions = () => {
  if (walletConnect.value) {
    sessions.value = walletConnect.value.getListOfSessions();
    currentSession.value = walletConnect.value.getMostRecentValidSession();
  }
};

// Handle network action - connect or show actions
const handleNetworkAction = async () => {
  if (!walletConnect.value) {
    await initWalletConnect();
  }

  refreshSessions();

  if (sessions.value.length === 0) {
    await connectWallet();
  }
};

// Connect wallet and show QR popup
const connectWallet = async () => {
  if (!walletConnect.value) {
    return;
  }

  isConnecting.value = true;

  try {
    const wcUri = await walletConnect.value.connect(chainId.value);
    uri.value = wcUri;

    if (!wcUri) {
      isConnecting.value = false;
      return;
    }

    if (sdk.value) {
      sdk.value.showWalletConnectPopup(wcUri);
    }
  } catch (error) {
    isConnecting.value = false;
  }
};

// Watch for session changes
watch(
  () => walletConnect.value?.session,
  async (newSession) => {
    if (newSession) {
      currentSession.value = newSession;
      uri.value = '';
      isConnecting.value = false;
      refreshSessions();

      if (sdk.value) {
        try {
          await sdk.value.handleSessionApproval({
            session: newSession,
            accounts: newSession.namespaces?.ccd?.accounts || [],
            walletConnectSessionTopic: newSession.topic
          });

          const result = await performVerification(newSession);
          verificationResult.value = result;

          if (result.verified) {
            isVerified.value = false;
            await sdk.value.showSuccessState();
          }
        } catch (error) {
          // Handle error silently
        }
      }
    }
  }
);

const disconnectAllSessions = async () => {
  if (walletConnect.value) {
    await walletConnect.value.disconnectAll();
    refreshSessions();
    currentSession.value = null;
  }
};

// Lifecycle
onMounted(async () => {
  await initWalletConnect();
  await initSDK();
});

onBeforeUnmount(() => {
  if (sdk.value) {
    sdk.value.closeModal();
  }
});
</script>

<template>
  <div class="wrapper tinder">
    <div v-if="!currentSession && !isVerified" class="blur"></div>

    <div class="header-wrap tinder"></div>
    <div class="bg-wrapper tinder"></div>
  </div>

  <!-- Loading overlay -->
  <div v-if="isConnecting" class="loading-overlay">
    <div class="spinner"></div>
    <p>Connecting...</p>
  </div>

  <!-- Show Logout when connected, Login when not -->
  <button v-if="currentSession" @click="disconnectAllSessions" :disabled="isConnecting" class="modal-btn">
    Logout
  </button>
  <button v-else @click="handleNetworkAction" :disabled="isConnecting" class="modal-btn">
    {{ isConnecting ? 'Loading...' : 'Login' }}
  </button>
</template>

<style scoped>
.modal-btn {
  position: absolute;
  top: 2%;
  right: 2%;
  padding: 9px 45px;
  font-size: 16px;
  background-color: white;
  color: black;
  border: none;
  border-radius: 1000px;
  cursor: pointer;
  z-index: 10;
  transition: opacity 0.2s ease;
}

.modal-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.blur {
  z-index: 1;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9998;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.loading-overlay p {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 500;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
/* Global styles for SDK modals - ensure they appear above blur */
.mobile--modal-overlay,
.desktop--modal-overlay {
  z-index: 9999 !important;
}
</style>
