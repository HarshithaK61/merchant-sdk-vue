// ============================================
// MERCHANT SDK - TWO INTEGRATION MODES
// ============================================

// ====================================
// MODE 1: SDK-MANAGED (SIMPLE)
// ====================================
// Use this when you want simplicity - SDK handles everything

import { MerchantSDK } from 'merchant-sdk';
import 'merchant-sdk/dist/merchant-sdk.css';

// That's it! Just 3 lines:
const sdk = new MerchantSDK();
await sdk.initWalletConnect({
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  network: 'testnet'
});

// SDK automatically handles:
// - WalletConnect client creation
// - QR code generation
// - Session management
// - Error handling


// ====================================
// MODE 2: MERCHANT-PROVIDED (ADVANCED)
// ====================================
// Use this when you need full control over WalletConnect

import { MerchantSDK } from 'merchant-sdk';
import { SignClient } from '@walletconnect/sign-client';
import 'merchant-sdk/dist/merchant-sdk.css';

// Step 1: Create your own WalletConnect client (you manage this)
const walletConnectClient = await SignClient.init({
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  metadata: {
    name: 'My App',
    description: 'My app description',
    url: window.location.origin,
    icons: [`${window.location.origin}/logo.png`]
  }
});

// Step 2: Create connection and get URI (you manage this)
const { uri, approval } = await walletConnectClient.connect({
  optionalNamespaces: {
    ccd: {
      methods: ['request_verifiable_presentation_v1'],
      chains: ['ccd:testnet'],
      events: ['session_ping', 'chain_changed', 'accounts_changed']
    }
  }
});

// Step 3: Show QR code with SDK
const sdk = new MerchantSDK();
await sdk.showWalletConnectPopup(uri);

// Step 4: Handle session approval (you manage this)
const session = await approval();

// Step 5: Make verification requests (you manage this)
const result = await walletConnectClient.request({
  topic: session.topic,
  chainId: 'ccd:testnet',
  request: {
    method: 'request_verifiable_presentation_v1',
    params: challengeData
  }
});


// ====================================
// COMPARISON
// ====================================

/*
┌─────────────────────┬──────────────────┬────────────────────────┐
│ Feature             │ SDK-Managed      │ Merchant-Provided      │
├─────────────────────┼──────────────────┼────────────────────────┤
│ Lines of Code       │ ~5               │ ~50+                   │
│ Complexity          │ ⭐               │ ⭐⭐⭐                │
│ WalletConnect Setup │ Automatic        │ Manual                 │
│ Session Management  │ Automatic        │ Manual                 │
│ QR Code Generation  │ Automatic        │ Manual (URI provided)  │
│ Error Handling      │ Built-in         │ You implement          │
│ Best For            │ New projects     │ Existing infrastructure│
│ Control Level       │ Limited          │ Full                   │
└─────────────────────┴──────────────────┴────────────────────────┘
*/


// ====================================
// WHEN TO USE EACH MODE
// ====================================

/*
✅ Use SDK-MANAGED when:
   - You're building a new application
   - You want the simplest integration
   - You don't need custom WalletConnect features
   - You trust SDK to handle complexity

✅ Use MERCHANT-PROVIDED when:
   - You already have WalletConnect infrastructure
   - You need full control over sessions
   - You have custom requirements
   - You're integrating into existing code
*/


// ====================================
// FULL VUE 3 EXAMPLE: SDK-MANAGED
// ====================================

// App.vue - SDK-Managed Mode
/*
<script setup lang="ts">
import { ref } from 'vue';
import { MerchantSDK } from 'merchant-sdk';

const sdk = ref<MerchantSDK | null>(null);

const connectSDKManaged = async () => {
  sdk.value = new MerchantSDK();
  
  // SDK handles everything!
  await sdk.value.initWalletConnect({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    network: 'testnet'
  });
};
</script>

<template>
  <button @click="connectSDKManaged">
    Connect Wallet (SDK-Managed)
  </button>
</template>
*/


// ====================================
// FULL VUE 3 EXAMPLE: MERCHANT-PROVIDED
// ====================================

// App.vue - Merchant-Provided Mode
/*
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MerchantSDK } from 'merchant-sdk';
import { SignClient } from '@walletconnect/sign-client';

const sdk = ref<MerchantSDK | null>(null);
const walletConnect = ref<any>(null);

onMounted(async () => {
  // You initialize WalletConnect
  walletConnect.value = await SignClient.init({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: 'My App',
      description: 'My app',
      url: window.location.origin,
      icons: [`${window.location.origin}/logo.png`]
    }
  });
  
  sdk.value = new MerchantSDK();
});

const connectMerchantProvided = async () => {
  // You create connection
  const { uri, approval } = await walletConnect.value.connect({
    optionalNamespaces: {
      ccd: {
        methods: ['request_verifiable_presentation_v1'],
        chains: ['ccd:testnet'],
        events: ['session_ping']
      }
    }
  });
  
  // SDK just shows QR
  await sdk.value.showWalletConnectPopup(uri);
  
  // You handle approval
  const session = await approval();
};
</script>

<template>
  <button @click="connectMerchantProvided">
    Connect Wallet (Merchant-Provided)
  </button>
</template>
*/
