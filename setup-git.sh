#!/bin/bash

set -e

echo "Configuring Bitbucket access..."

if [ -z "$BITBUCKET_USERNAME" ] || [ -z "$ATLASSIAN_API_TOKEN" ]; then
  echo "ERROR: BITBUCKET_USERNAME or ATLASSIAN_API_TOKEN not set"
  exit 1
fi

# Disable SSH for git to force HTTPS
export GIT_SSH_COMMAND="echo 'SSH disabled, use HTTPS'; exit 1"

# Modify package.json to use authenticated HTTPS URL
echo "Updating package.json with authenticated URL..."
AUTHENTICATED_URL="git+https://${BITBUCKET_USERNAME}:${ATLASSIAN_API_TOKEN}@bitbucket.org/nanocorp/merchant-sdk.git#develop"

# Show current package.json content for merchant-sdk
echo "Current package.json merchant-sdk entry:"
grep -A 1 "merchant-sdk" package.json || echo "Not found"

# Use node to modify package.json safely
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.dependencies['merchant-sdk'] = '$AUTHENTICATED_URL';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo "Updated package.json merchant-sdk entry:"
grep -A 1 "merchant-sdk" package.json

echo "Configuration completed successfully"
