#!/bin/bash

set -e

echo "Configuring git for Bitbucket access..."

# Create .netrc file for git authentication
if [ ! -z "$BITBUCKET_USERNAME" ] && [ ! -z "$ATLASSIAN_API_TOKEN" ]; then
  echo "Creating .netrc file for authentication..."
  cat > ~/.netrc << EOF
machine bitbucket.org
login ${BITBUCKET_USERNAME}
password ${ATLASSIAN_API_TOKEN}
EOF
  chmod 600 ~/.netrc
  echo ".netrc file created"
fi

# Configure git to use HTTPS instead of SSH
git config --global url."https://bitbucket.org/".insteadOf "ssh://git@bitbucket.org/"
git config --global url."https://bitbucket.org/".insteadOf "git@bitbucket.org:"

echo "Git configuration completed"
git config --global --list | grep url || echo "No URL rewrites found"
