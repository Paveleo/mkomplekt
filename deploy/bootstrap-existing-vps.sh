#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/mkomplekt"
REPO_URL="${REPO_URL:-__REPO_URL__}"
REPO_BRANCH="${REPO_BRANCH:-main}"

if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl git gnupg ufw
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /tmp/docker.asc
  gpg --dearmor -o /etc/apt/keyrings/docker.gpg /tmp/docker.asc
  chmod a+r /etc/apt/keyrings/docker.gpg
  . /etc/os-release
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
fi

if ! swapon --show | grep -q "/swapfile"; then
  fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q "^/swapfile " /etc/fstab || echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

ufw allow OpenSSH || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

mkdir -p /opt

if [ ! -d "${APP_DIR}/.git" ]; then
  git clone --branch "${REPO_BRANCH}" "${REPO_URL}" "${APP_DIR}"
else
  git -C "${APP_DIR}" fetch --all
  git -C "${APP_DIR}" checkout "${REPO_BRANCH}"
  git -C "${APP_DIR}" pull --ff-only origin "${REPO_BRANCH}"
fi

if [ ! -f "${APP_DIR}/backend/.env.production" ]; then
  cp "${APP_DIR}/backend/.env.production.example" "${APP_DIR}/backend/.env.production"
  echo "Fill ${APP_DIR}/backend/.env.production and rerun the script."
  exit 1
fi

cd "${APP_DIR}"
docker compose -f docker-compose.prod.yml up -d --build
