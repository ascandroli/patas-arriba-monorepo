FROM node:24-slim

RUN apt-get update && apt-get install -y \
    curl \
    git \
    procps \
    && rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /workspace
