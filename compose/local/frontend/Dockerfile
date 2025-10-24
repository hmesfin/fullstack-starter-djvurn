FROM node:20-alpine

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

# Force rebuild to invalidate cache - TODO: remove after tsconfig fix is deployed
# Last updated: 2025-10-24

# Install system dependencies
RUN apk add --no-cache \
  bash \
  git \
  sudo

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies (use npm ci for faster, reliable, reproducible builds)
RUN npm ci

# Copy application code
COPY frontend/ .

# Copy and prepare start script
COPY ./compose/local/frontend/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

# Create dev-user with same UID/GID as Django container and add to sudoers
# First remove the existing node user and group to avoid conflicts
RUN deluser node \
  && addgroup -g 1000 dev-user \
  && adduser -u 1000 -G dev-user -s /bin/bash -D dev-user \
  && echo dev-user ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/dev-user \
  && chmod 0440 /etc/sudoers.d/dev-user

# Expose Vite port
EXPOSE 5173
