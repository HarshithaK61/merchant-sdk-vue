#!/bin/bash

set -e

echo "🚀 Starting deployment process..."

# Build the merchant-sdk first (if needed)
if [ -d "/opt/homebrew/var/www/merchant-sdk" ]; then
  echo "📦 Building merchant-sdk..."
  cd /opt/homebrew/var/www/merchant-sdk
  npm run build:lib
  echo "✅ merchant-sdk built successfully"
fi

# Return to the vue project
cd /opt/homebrew/var/www/merchant-sdk-vue

# Ensure merchant-sdk is linked
echo "🔗 Linking merchant-sdk..."
npm link /opt/homebrew/var/www/merchant-sdk

# Build the Vue application
echo "🏗️  Building Vue application..."
npm run build

# Deploy to GitHub Pages
echo "📤 Deploying to GitHub Pages..."
npx gh-pages -d dist

echo "✅ Deployment completed successfully!"
echo "🌐 Your site will be available at: https://harshithak61.github.io/merchant-sdk-vue/"
