#!/bin/bash

set -e

echo "Configuring Bitbucket access..."

if [ -z "$BITBUCKET_USERNAME" ] || [ -z "$ATLASSIAN_API_TOKEN" ]; then
  echo "ERROR: BITBUCKET_USERNAME or ATLASSIAN_API_TOKEN not set"
  exit 1
fi

# Modify package.json to use authenticated HTTPS URL
echo "Updating package.json with authenticated URL..."
AUTHENTICATED_URL="git+https://${BITBUCKET_USERNAME}:${ATLASSIAN_API_TOKEN}@bitbucket.org/nanocorp/merchant-sdk.git#develop"

# Use jq if available, otherwise use sed
if command -v jq &> /dev/null; then
  jq ".dependencies[\"merchant-sdk\"] = \"$AUTHENTICATED_URL\"" package.json > package.json.tmp && mv package.json.tmp package.json
else
  sed -i.bak "s|\"merchant-sdk\": \"git+https://bitbucket.org/nanocorp/merchant-sdk.git#develop\"|\"merchant-sdk\": \"$AUTHENTICATED_URL\"|g" package.json
  rm -f package.json.bak
fi

echo "package.json updated successfully"
echo "merchant-sdk URL configured with authentication"
