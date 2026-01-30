<script setup lang="ts">
/**
 * Merchant SDK Demo - Dual Integration Modes
 *
 * This demo shows TWO ways to integrate WalletConnect:
 *
 * 1. SDK-MANAGED MODE (Simple - Recommended)
 *    - SDK handles WalletConnect initialization
 *    - SDK generates QR code
 *    - SDK manages sessions
 *    - Code: sdk.initWalletConnect({ projectId, network })
 *
 * 2. MERCHANT-PROVIDED MODE (Advanced)
 *    - You create WalletConnect client
 *    - You generate URI
 *    - You manage sessions
 *    - Code: sdk.showWalletConnectPopup(uri)
 */

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { MerchantSDK } from 'merchant-sdk';
import 'merchant-sdk/dist/merchant-sdk.css';
import { MerchantWalletConnect } from './wallet-connect';
import { ApiService } from './services/api.service';
import type { SessionTypes } from '@walletconnect/types';

// Integration mode: 'sdk-managed' or 'merchant-provided'
const integrationMode = ref<'sdk-managed' | 'merchant-provided' | null>(null);
const showModeSelector = ref(true);

// WalletConnect instance (only used in merchant-provided mode)
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
  return 'ccd:4221332d34e1694168c2a0c0b3fd0f27';
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
      presentationContext:
        proof?.verifiablePresentationJson?.presentationContext,
      proof: proof?.verifiablePresentationJson?.proof,
      type: proof?.verifiablePresentationJson?.type,
      verifiableCredential:
        proof?.verifiablePresentationJson?.verifiableCredential,
    },
    network: network.value,
  });

  return result;
};

// Initialize WalletConnect client
const initWalletConnect = async () => {
  // Don't reinitialize if already exists
  if (walletConnect.value) {
    return;
  }

  isLoading.value = true;

  try {
    walletConnect.value = new MerchantWalletConnect({
      onSessionEvent: () => {},
      onSessionDelete: () => {
        currentSession.value = null;
        refreshSessions();
      },
      onSessionExpire: () => {
        currentSession.value = null;
        refreshSessions();
      },
      onSessionRequestExpire: () => {},
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
          case 'modal-closed':
          case 'user-rejected':
            isConnecting.value = false;
            break;
          case 'error':
            isConnecting.value = false;
            break;
        }
      },
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
  if (integrationMode.value === 'sdk-managed') {
    await connectWalletSDKManaged();
  } else {
    await connectWalletMerchantProvided();
  }
};

// SDK-Managed Mode: Let SDK handle everything
const connectWalletSDKManaged = async () => {
  if (!sdk.value) {
    await initSDK();
  }

  isConnecting.value = true;

  try {
    // SDK handles WalletConnect initialization, QR generation, and session management
    await sdk.value!.initWalletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
      network: import.meta.env.VITE_NETWORK,
      metadata: {
        name: 'Merchant SDK Demo',
        description: 'Merchant dApp using Concordium ID verification',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      },
    });
  } catch (error) {
    console.error('SDK-managed mode error:', error);
    isConnecting.value = false;
  }
};

// Merchant-Provided Mode: Merchant handles WalletConnect
const connectWalletMerchantProvided = async () => {
  if (!walletConnect.value) {
    await initWalletConnect();
  }

  refreshSessions();

  if (sessions.value.length === 0) {
    await connectWallet();
  }
};

// Connect wallet and show QR popup (merchant-provided mode)
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

// Select integration mode
const selectMode = async (mode: 'sdk-managed' | 'merchant-provided') => {
  integrationMode.value = mode;
  showModeSelector.value = false;

  // Initialize SDK first
  await initSDK();

  // Initialize WalletConnect only for merchant-provided mode
  if (mode === 'merchant-provided') {
    await initWalletConnect();
  }
};

// Change integration mode (reset everything)
const changeMode = async () => {
  // Disconnect if connected
  if (currentSession.value) {
    await disconnectAllSessions();
  }

  // Reset state
  integrationMode.value = null;
  showModeSelector.value = true;
  isConnecting.value = false;
  isVerified.value = false;
  currentSession.value = null;
  verificationResult.value = null;
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
            walletConnectSessionTopic: newSession.topic,
          });

          const result = await performVerification(newSession);
          verificationResult.value = result;

          if (result.verified) {
            isVerified.value = true;
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
  // Reset state when disconnecting
  isVerified.value = false;
  verificationResult.value = null;
};

// Check for existing sessions on load
const checkExistingSessions = async () => {
  try {
    // Try to initialize WalletConnect client to check for sessions
    walletConnect.value = new MerchantWalletConnect({
      onSessionEvent: () => {},
      onSessionDelete: () => {
        currentSession.value = null;
        isVerified.value = false;
        showModeSelector.value = true;
      },
      onSessionExpire: () => {
        currentSession.value = null;
        isVerified.value = false;
        showModeSelector.value = true;
      },
      onSessionRequestExpire: () => {},
      onReconnectRequired: async () => {
        currentSession.value = null;
        uri.value = '';
      },
    });

    await walletConnect.value.initClient();

    // Check if there are any active sessions
    const existingSessions = walletConnect.value.getListOfSessions();

    if (existingSessions && existingSessions.length > 0) {
      // Found existing session
      const session = walletConnect.value.getMostRecentValidSession();
      if (session) {
        currentSession.value = session;
        isVerified.value = true;
        showModeSelector.value = false;
        integrationMode.value = 'merchant-provided';

        // Initialize SDK for UI
        await initSDK();
      }
    } else {
      // No sessions found, show mode selector
      showModeSelector.value = true;
    }
  } catch (error) {
    console.log('No existing sessions found:', error);
    // Show mode selector if error or no sessions
    showModeSelector.value = true;
  }
};

// Lifecycle
onMounted(async () => {
  await checkExistingSessions();
});

onBeforeUnmount(() => {
  if (sdk.value) {
    sdk.value.closeModal();
  }
});
</script>

<template>
  <!-- Main Site Content -->
  <div class="wrapper tinder">
    <div
      v-if="!currentSession && !isVerified && !showModeSelector"
      class="blur"
    ></div>
    <div class="header-wrap tinder"></div>
    <div class="bg-wrapper tinder"></div>
  </div>

  <!-- Integration Mode Selection Modal -->
  <div v-if="showModeSelector" class="mode-selector-overlay">
    <div class="mode-selector-modal">
      <h2>Choose Integration Mode</h2>

      <button @click="selectMode('sdk-managed')" class="mode-btn">
        <strong>SDK-Managed</strong>
        <p>SDK handles everything</p>
      </button>

      <button @click="selectMode('merchant-provided')" class="mode-btn">
        <strong>Merchant-Provided</strong>
        <p>You manage WalletConnect</p>
      </button>
    </div>
  </div>

  <!-- Mode Badge (shown after selection) -->
  <div v-if="!showModeSelector && integrationMode" class="mode-badge">
    <span class="badge-text">{{
      integrationMode === 'sdk-managed' ? 'SDK-Managed' : 'Merchant-Provided'
    }}</span>
    <button @click="changeMode" class="badge-change-btn" title="Change mode">
      Change
    </button>
  </div>

  <!-- Loading overlay -->
  <div v-if="isConnecting" class="loading-overlay">
    <div class="spinner"></div>
    <p>Connecting...</p>
  </div>

  <!-- Show Logout when connected, Login when not -->
  <button
    v-if="!showModeSelector && currentSession"
    @click="disconnectAllSessions"
    :disabled="isConnecting"
    class="modal-btn"
  >
    Logout
  </button>
  <button
    v-else-if="!showModeSelector"
    @click="handleNetworkAction"
    :disabled="isConnecting"
    class="modal-btn"
  >
    {{ isConnecting ? 'Loading...' : 'Login' }}
  </button>
</template>

<style scoped>
/* Mode Selection Modal */
.mode-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.mode-selector-modal {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 320px;
  width: 90%;
}

.mode-selector-modal h2 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.mode-btn {
  width: 100%;
  background: white;
  border: 2px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  text-align: center;
}

.mode-btn:hover {
  border-color: #667eea;
}

.mode-btn:last-child {
  margin-bottom: 0;
}

.mode-btn strong {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.mode-btn p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

/* Mode Badge */
.mode-badge {
  position: fixed;
  top: 16px;
  left: 16px;
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  font-size: 14px;
}

.badge-text {
  font-weight: 500;
  color: #333;
}

.badge-change-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
}

.badge-change-btn:hover {
  background: #e5e5e5;
}

.modal-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 8px 20px;
  font-size: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  z-index: 10;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .mode-selector-modal {
    padding: 16px;
  }

  .mode-badge {
    top: 10px;
    left: 10px;
    padding: 6px 10px;
    font-size: 11px;
  }

  .modal-btn {
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    font-size: 12px;
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
*/ @media (max-width: 768px) { .mode-selector-modal { padding: 24px; }
.mode-badge { top: 12px; left: 12px; font-size: 12px; } .modal-btn { top: 12px;
right: 12
