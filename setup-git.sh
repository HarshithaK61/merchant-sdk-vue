#!/bin/bash

set -e

echo "Configuring git for Bitbucket access..."

# Configure git to use HTTPS instead of SSH for Bitbucket
git config --global url."https://bitbucket.org/".insteadOf "ssh://git@bitbucket.org/"
git config --global url."https://bitbucket.org/".insteadOf "git@bitbucket.org:"

# If credentials are provided, configure them
# Use Atlassian API Token from: https://id.atlassian.com/manage-profile/security/api-tokens
if [ ! -z "$BITBUCKET_USERNAME" ] && [ ! -z "$ATLASSIAN_API_TOKEN" ]; then
  echo "Configuring git credentials..."
  git config --global url."https://${BITBUCKET_USERNAME}:${ATLASSIAN_API_TOKEN}@bitbucket.org/".insteadOf "https://bitbucket.org/"
  git config --global url."https://${BITBUCKET_USERNAME}:${ATLASSIAN_API_TOKEN}@bitbucket.org/".insteadOf "ssh://git@bitbucket.org/"
else
  echo "Warning: BITBUCKET_USERNAME or ATLASSIAN_API_TOKEN not set"
fi

echo "Git configuration completed"
echo "Current git url rewrites:"
git config --global --get-regexp url.*
