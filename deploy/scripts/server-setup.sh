#!/usr/bin/env bash
# One-time preparation of a fresh Ubuntu 22.04/24.04 server for OSDHYAN.
# Run as a sudo user:   sudo bash deploy/scripts/server-setup.sh
# Installs Docker from Docker's official apt repository, opens only
# SSH/HTTP/HTTPS in the firewall, adds swap and turns on security updates.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Run with sudo."; exit 1; }
. /etc/os-release
[ "$ID" = "ubuntu" ] || echo "Warning: written for Ubuntu, found $ID."

echo "== Packages"
apt-get update -y
apt-get install -y ca-certificates curl gnupg git ufw unattended-upgrades openssl

echo "== Docker (official repository)"
if ! command -v docker >/dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
        > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker
if [ -n "${SUDO_USER:-}" ]; then usermod -aG docker "$SUDO_USER"; fi

echo "== Firewall: SSH, HTTP, HTTPS only"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo "== Swap (helps the website build on small servers)"
if ! swapon --show | grep -q .; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== Automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "== Time zone"
timedatectl set-timezone Asia/Kolkata || true

echo
echo "Done. Log out and back in (so 'docker' works without sudo), then:"
echo "  cd <repo>/deploy && bash scripts/first-deploy.sh"
