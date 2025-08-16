#!/bin/bash
set -e

# Update and deps
sudo apt update && sudo apt install -y git curl build-essential

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone your repo - replace with your GitHub URL:
# git clone https://github.com/<username>/ciphercorelink.git
# cd ciphercorelink

# Install deps
npm install

# Ensure public dir exists
mkdir -p public

# Run once (background)
node server.js &

# PM2 (optional reliable process manager)
sudo npm install -g pm2
pm2 start server.js --name ciphercorelink
pm2 startup systemd -u $USER --hp $HOME || true
pm2 save

echo "✅ CipherCorelink should now be running on port 3000"
