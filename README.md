# Merchant SDK Vue Demo

This demo application showcases two ways to integrate the Concordium Merchant SDK for identity verification:

## Integration Modes

### 1. **SDK-Managed Mode** (Recommended for simplicity)
The SDK handles all WalletConnect complexity - initialization, QR generation, and session management.

**Use this when:**
- You want the simplest integration
- You don't need custom WalletConnect configuration
- You're building a new application

**Code Example:**
```typescript
const sdk = new MerchantSDK({ network: 'testnet' });

// SDK handles everything - just provide config
await sdk.initWalletConnect({
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  metadata: {
    name: 'My App',
    description: 'My awesome app'
  }
});
```

### 2. **Merchant-Provided Mode** (Advanced)
You manage WalletConnect client creation and just pass the URI to the SDK for display.

**Use this when:**
- You need full control over WalletConnect configuration
- You're integrating into existing WalletConnect infrastructure
- You need custom session management

**Code Example:**
```typescript
import { SignClient } from '@walletconnect/sign-client';

// You create and manage WalletConnect client
const walletConnect = new MerchantWalletConnect();
await walletConnect.initClient();
const uri = await walletConnect.connect();

// SDK just displays the QR code
const sdk = new MerchantSDK({ network: 'testnet' });
await sdk.showWalletConnectPopup(uri);
```

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_NETWORK=testnet
VITE_API_BASE_URL=http://localhost:3000
VITE_API_SECRET=your_api_secret
```

3. **Run the demo:**
```bash
npm run dev
```

4. **Try both modes:**
- Click the mode switcher in the top-left corner
- **SDK-Managed**: Click "Login" - SDK handles everything
- **Merchant-Provided**: Click "Login" - app manages WalletConnect

## Project Structure

```
src/
├── App.vue                    # Main demo showing both modes
├── wallet-connect.ts          # WalletConnect wrapper (for merchant-provided mode)
├── services/
│   └── api.service.ts        # Backend API integration
└── ...
```

## Key Differences

| Feature | SDK-Managed | Merchant-Provided |
|---------|-------------|-------------------|
| Setup Complexity | ⭐ Simple | ⭐⭐⭐ Advanced |
| Code Lines | ~5 lines | ~50+ lines |
| WalletConnect Control | SDK manages | You manage |
| Session Management | Automatic | Manual |
| Best For | New projects | Existing infrastructure |

## Environment Variables

- `VITE_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com)
- `VITE_NETWORK` - `mainnet` or `testnet`
- `VITE_API_BASE_URL` - Your backend API URL
- `VITE_API_SECRET` - API authentication secret

## Learn More

- [Concordium Documentation](https://developer.concordium.software/)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [Merchant SDK GitHub](https://github.com/your-org/merchant-sdk)

