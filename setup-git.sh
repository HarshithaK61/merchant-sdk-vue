#!/bin/bash

# Configure git to use HTTPS instead of SSH for Bitbucket
git config --global url."https://bitbucket.org/".insteadOf "ssh://git@bitbucket.org/"
git config --global url."https://".insteadOf "git://"

# If credentials are provided, configure them
# Use Atlassian API Token from: https://id.atlassian.com/manage-profile/security/api-tokens
if [ ! -z "$BITBUCKET_USERNAME" ] && [ ! -z "$ATLASSIAN_API_TOKEN" ]; then
  git config --global url."https://${BITBUCKET_USERNAME}:${ATLASSIAN_API_TOKEN}@bitbucket.org/".insteadOf "https://bitbucket.org/"
fi

echo "Git configuration completed"
