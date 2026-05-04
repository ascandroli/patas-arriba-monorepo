FROM node:24-trixie

ARG TZ
ENV TZ="$TZ"

# Install basic development tools and iptables/ipset
RUN apt-get update && apt-get install -y --no-install-recommends \
  less \
  git \
  procps \
  sudo \
  fzf \
  zsh \
  man-db \
  unzip \
  gnupg2 \
  gh \
  iptables \
  ipset \
  iproute2 \
  dnsutils \
  aggregate \
  jq \
  nano \
  vim \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure default node user has access to /usr/local/share
RUN mkdir -p /usr/local/share/npm-global && \
  chown -R node:node /usr/local/share

ARG USERNAME=node

# Persist bash history.
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

# Create workspace and config directories and set permissions.
# .cache/mongodb-binaries is pre-created so the named volume mount in
# devcontainer.json (which persists the ~150 MB Mongo binary across
# rebuilds) lands on a node-owned path instead of a root-owned mount point.
RUN mkdir -p /workspace /home/node/.claude /home/node/.cache/mongodb-binaries && \
  chown -R node:node /workspace /home/node/.claude /home/node/.cache

WORKDIR /workspace

ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  sudo dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# Set up non-root user
USER node

# Install global packages
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/zsh

# Set the default editor and visual
ENV EDITOR=nano
ENV VISUAL=nano

# Default powerline10k theme
ARG ZSH_IN_DOCKER_VERSION=1.2.0
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git \
  -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# Native Claude Code binary; installs to ~/.local/bin.
RUN curl -fsSL https://claude.ai/install.sh | bash

ENV PATH="/home/node/.local/bin:$PATH"

# Copy and set up firewall script
COPY init-firewall.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/init-firewall.sh && \
  echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/node-firewall && \
  chmod 0440 /etc/sudoers.d/node-firewall
USER node

# CXXFLAGS: tree-sitter (gitnexus dep) predates Node 24's C++20 V8 headers;
# force C++20 so the native addon compiles.
RUN CXXFLAGS="-std=c++20" npm install -g gitnexus
RUN curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh

# Pre-download the MongoDB binary used by mongodb-memory-server in tests.
# Replaces the named volume mount — binary is baked into the image layer.
# MONGOMS_DISTRO is forced to ubuntu-22.04 because MongoDB CE has no arm64
# binaries for Debian; the ubuntu-22.04 archive works on both arm64 and amd64.
ENV MONGOMS_VERSION=7.0.14 \
    MONGOMS_DISTRO=ubuntu-22.04 \
    MONGOMS_DOWNLOAD_DIR=/home/node/.cache/mongodb-binaries
RUN mkdir -p /tmp/mongo-prefetch && \
    cd /tmp/mongo-prefetch && \
    npm init -y --quiet > /dev/null && \
    npm install --no-save --quiet mongodb-memory-server@^11 && \
    node --input-type=module -e \
      'import {MongoBinary} from "mongodb-memory-server"; const p = await MongoBinary.getPath({version: process.env.MONGOMS_VERSION}); console.log("Cached:", p);' && \
    rm -rf /tmp/mongo-prefetch
