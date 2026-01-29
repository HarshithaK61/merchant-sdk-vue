# Merchant SDK Integration Guide

This guide explains the two integration modes available in the Concordium Merchant SDK.

## Overview

The Merchant SDK supports two integration approaches:

1. **SDK-Managed Mode** - SDK handles all WalletConnect complexity
2. **Merchant-Provided Mode** - You manage WalletConnect yourself

## Mode Comparison

### SDK-Managed Mode

**Pros:**
- ✅ Simplest integration (3-5 lines of code)
- ✅ No WalletConnect knowledge required
- ✅ Automatic session management
- ✅ Built-in error handling
- ✅ Perfect for new projects

**Cons:**
- ❌ Less control over WalletConnect configuration
- ❌ Can't reuse existing WalletConnect infrastructure

### Merchant-Provided Mode

**Pros:**
- ✅ Full control over WalletConnect
- ✅ Can integrate with existing infrastructure
- ✅ Custom session management
- ✅ Advanced configuration options

**Cons:**
- ❌ More complex setup
- ❌ Requires WalletConnect knowledge
- ❌ More code to maintain

## Implementation Examples

### SDK-Managed Mode (Simple)

```typescript
import { MerchantSDK } from 'merchant-sdk';
import 'merchant-sdk/dist/merchant-sdk.css';

// Step 1: Create SDK instance
const sdk = new MerchantSDK();

// Step 2: Initialize with WalletConnect config
await sdk.initWalletConnect({
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  network: 'testnet', // or 'mainnet'
  metadata: {
    name: 'My Merchant App',
    description: 'Age verification for my service',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/logo.png']
  }
});

// That's it! SDK handles:
// - WalletConnect client initialization
// - QR code generation
// - Session management
// - Verification flow
```

### Merchant-Provided Mode (Advanced)

```typescript
import { MerchantSDK } from 'merchant-sdk';
import { SignClient } from '@walletconnect/sign-client';
import 'merchant-sdk/dist/merchant-sdk.css';

// Step 1: Create your own WalletConnect client
const walletConnectClient = await SignClient.init({
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  metadata: {
    name: 'My Merchant App',
    description: 'Age verification for my service',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/logo.png']
  }
});

// Step 2: Create a connection and get URI
const { uri, approval } = await walletConnectClient.connect({
  optionalNamespaces: {
    ccd: {
      methods: ['request_verifiable_presentation_v1'],
      chains: ['ccd:testnet'], // or 'ccd:mainnet'
      events: ['session_ping', 'chain_changed', 'accounts_changed']
    }
  }
});

// Step 3: Show QR code using SDK
const sdk = new MerchantSDK();
await sdk.showWalletConnectPopup(uri);

// Step 4: Handle session approval yourself
const session = await approval();

// Step 5: Request verification
const result = await walletConnectClient.request({
  topic: session.topic,
  chainId: 'ccd:testnet',
  request: {
    method: 'request_verifiable_presentation_v1',
    params: challengeData
  }
});
```

## Which Mode Should I Use?

### Choose SDK-Managed Mode if:
- ✓ You're building a new application
- ✓ You want the simplest possible integration
- ✓ You don't need custom WalletConnect features
- ✓ You want automatic session management
- ✓ You trust the SDK to handle complexity

### Choose Merchant-Provided Mode if:
- ✓ You already have WalletConnect infrastructure
- ✓ You need full control over sessions
- ✓ You have custom WalletConnect requirements
- ✓ You want to manage multiple connections
- ✓ You're integrating into existing code

## Complete Example: SDK-Managed Mode in Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { MerchantSDK } from 'merchant-sdk';
import 'merchant-sdk/dist/merchant-sdk.css';

const sdk = ref<MerchantSDK | null>(null);
const isConnected = ref(false);

const connect = async () => {
  sdk.value = new MerchantSDK({
    onEvent: (event) => {
      if (event.type === 'verification-completed') {
        isConnected.value = true;
        console.log('User verified:', event.data);
      }
    }
  });

  await sdk.value.initWalletConnect({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    network: 'testnet',
    metadata: {
      name: 'My App',
      description: 'Verify your age',
      url: window.location.origin,
      icons: [`${window.location.origin}/logo.png`]
    }
  });
};
</script>

<template>
  <div>
    <button v-if="!isConnected" @click="connect">
      Verify with Concordium Wallet
    </button>
    <div v-else>
      ✓ Verified!
    </div>
  </div>
</template>
```

## Complete Example: Merchant-Provided Mode in Vue 3

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MerchantSDK } from 'merchant-sdk';
import { SignClient } from '@walletconnect/sign-client';
import 'merchant-sdk/dist/merchant-sdk.css';

const sdk = ref<MerchantSDK | null>(null);
const walletConnect = ref<any>(null);
const isConnected = ref(false);
const session = ref<any>(null);

onMounted(async () => {
  // Initialize your WalletConnect client
  walletConnect.value = await SignClient.init({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: 'My App',
      description: 'Verify your age',
      url: window.location.origin,
      icons: [`${window.location.origin}/logo.png`]
    }
  });

  // Listen for session events
  walletConnect.value.on('session_delete', () => {
    session.value = null;
    isConnected.value = false;
  });

  // Initialize SDK
  sdk.value = new MerchantSDK();
});

const connect = async () => {
  // Create connection
  const { uri, approval } = await walletConnect.value.connect({
    optionalNamespaces: {
      ccd: {
        methods: ['request_verifiable_presentation_v1'],
        chains: ['ccd:testnet'],
        events: ['session_ping', 'chain_changed']
      }
    }
  });

  // Show QR code
  await sdk.value.showWalletConnectPopup(uri);

  // Wait for approval
  session.value = await approval();
  isConnected.value = true;
};

const disconnect = async () => {
  if (session.value) {
    await walletConnect.value.disconnect({
      topic: session.value.topic,
      reason: { code: 6000, message: 'User disconnected' }
    });
  }
};
</script>

<template>
  <div>
    <button v-if="!isConnected" @click="connect">
      Connect Wallet
    </button>
    <div v-else>
      <p>✓ Connected!</p>
      <button @click="disconnect">Disconnect</button>
    </div>
  </div>
</template>
```

## Error Handling

### SDK-Managed Mode
```typescript
try {
  await sdk.initWalletConnect({
    projectId: 'YOUR_PROJECT_ID',
    network: 'testnet'
  });
} catch (error) {
  if (error.message.includes('projectId')) {
    console.error('Invalid WalletConnect Project ID');
  } else if (error.message.includes('network')) {
    console.error('Invalid network specified');
  }
}
```

### Merchant-Provided Mode
```typescript
try {
  const { uri, approval } = await walletConnect.connect({...});
  await sdk.showWalletConnectPopup(uri);
  const session = await approval();
} catch (error) {
  if (error.message.includes('User rejected')) {
    console.error('User cancelled connection');
  } else if (error.message.includes('timeout')) {
    console.error('Connection timed out');
  }
}
```

## Migration Guide

### From Merchant-Provided to SDK-Managed

**Before:**
```typescript
const client = await SignClient.init({...});
const { uri } = await client.connect({...});
await sdk.showWalletConnectPopup(uri);
```

**After:**
```typescript
await sdk.initWalletConnect({
  projectId: 'YOUR_PROJECT_ID',
  network: 'testnet'
});
```

**Changes:**
- ✅ Remove SignClient initialization
- ✅ Remove connection setup code
- ✅ Remove session management code
- ✅ Replace `showWalletConnectPopup()` with `initWalletConnect()`

## Best Practices

### SDK-Managed Mode
1. Store `projectId` in environment variables
2. Use production `projectId` for mainnet
3. Let SDK handle all errors
4. Trust SDK's session management

### Merchant-Provided Mode
1. Implement proper error handling
2. Clean up sessions on disconnect
3. Handle reconnection scenarios
4. Monitor session expiration
5. Implement custom timeout logic

## Troubleshooting

### SDK-Managed Mode Issues

**Problem:** "projectId is required"
**Solution:** Ensure you pass a valid WalletConnect project ID

**Problem:** QR code doesn't appear
**Solution:** Check browser console for errors, verify CSS is imported

### Merchant-Provided Mode Issues

**Problem:** Session doesn't persist
**Solution:** Implement your own session storage/recovery

**Problem:** Multiple connections created
**Solution:** Check existing sessions before creating new ones

## FAQ

**Q: Can I switch between modes?**
A: Yes, but you'll need to disconnect existing sessions first.

**Q: Which mode is faster?**
A: Performance is identical - the difference is only in code complexity.

**Q: Can I use custom QR styling?**
A: SDK-managed uses built-in styling. Merchant-provided gives you full control.

**Q: Does SDK-managed work offline?**
A: No, both modes require internet connectivity.

**Q: Can I use multiple WalletConnect connections?**
A: SDK-managed supports one connection. Merchant-provided can handle multiple.

## Support

- [GitHub Issues](https://github.com/your-org/merchant-sdk/issues)
- [Documentation](https://docs.your-domain.com)
- [Discord Community](https://discord.gg/your-server)
