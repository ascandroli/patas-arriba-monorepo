.PHONY: devcontainer-up devcontainer-up-hardened devcontainer-claude devcontainer-down devcontainer-version devcontainer-update-github-meta help test test-server test-client test-watch-server test-watch-client

devcontainer-up: ## Start the dev container (open network)
	devcontainer up --workspace-folder .

devcontainer-up-hardened: .devcontainer/github-meta.json ## Start the dev container (firewall enabled)
	devcontainer up --workspace-folder . --override-config .devcontainer/devcontainer-firewall.json

devcontainer-claude: ## Run Claude Code inside the dev container (skip permissions)
	devcontainer exec --workspace-folder . claude --dangerously-skip-permissions

devcontainer-zsh: ## Open a zsh shell inside the dev container
	devcontainer exec --workspace-folder . zsh

devcontainer-down: ## Stop and remove the devcontainer dev container
	$(call down_by_config,.devcontainer/devcontainer.json)

# -----------------------------------------------------------------------------
# Shared helpers
# -----------------------------------------------------------------------------
# All containers share the same local_folder label (devcontainer root),
# so down targets filter by devcontainer.config_file instead.
# Uses `docker ps -aq` (not `-q`) so Created/Exited containers are also
# caught -- they hold the original port bindings even when not running
# and cause "port already in use" errors on the next `up`.
define down_by_config
	@CONFIG_PATH=$$(pwd)/$1; \
	CONTAINER_IDS=$$(docker ps -aq --filter "label=devcontainer.config_file=$$CONFIG_PATH"); \
	if [ -z "$$CONTAINER_IDS" ]; then \
		echo "No dev container found for $1"; \
		exit 0; \
	fi; \
	for ID in $$CONTAINER_IDS; do \
		VOLUMES=$$(docker inspect "$$ID" --format '{{range .Mounts}}{{if eq .Type "volume"}}{{.Name}} {{end}}{{end}}'); \
		echo "Removing container $$ID (config: $1)..."; \
		docker rm -f "$$ID"; \
		if [ -n "$$VOLUMES" ]; then \
			echo "Removing volumes: $$VOLUMES"; \
			docker volume rm $$VOLUMES 2>/dev/null || true; \
		fi; \
	done; \
	echo "Done."
endef

devcontainer-update-github-meta: ## Download GitHub IP ranges for the firewall
	curl -fsSL https://api.github.com/meta -o .devcontainer/github-meta.json
## 	gh api /meta > .devcontainer/github-meta.json ## RUNS OUTSIDE THE CONTAINER
	@echo "GitHub meta updated: $$(jq -r '.web | length' .devcontainer/github-meta.json) web ranges, $$(jq -r '.api | length' .devcontainer/github-meta.json) API ranges"

.devcontainer/github-meta.json:
	@echo "GitHub meta file not found. Downloading..."
	@$(MAKE) devcontainer-update-github-meta

help:  ## Show this help (default target)
	@echo "Patas Arriba monorepo — available targets:"
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Tests run inside the devcontainer; bring it up first with:"
	@echo "  devcontainer up --workspace-folder ."

test: test-server test-client  ## Run all tests (server then client)

test-server:  ## Run server suite (vitest + supertest, real MongoDB)
	devcontainer exec --workspace-folder . sh -c "cd /workspace/server && $(SERVER_TEST_ENV) npm test"

test-client:  ## Run client suite (vitest + react-testing-library, jsdom)
	devcontainer exec --workspace-folder . sh -c "cd /workspace/client && npm test"

test-watch-server:  ## Server tests in watch mode (re-runs on file change)
	devcontainer exec --workspace-folder . sh -c "cd /workspace/server && $(SERVER_TEST_ENV) npm run test:watch"

test-watch-client:  ## Client tests in watch mode (re-runs on file change)
	devcontainer exec --workspace-folder . sh -c "cd /workspace/client && npm run test:watch"

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-40s %s\n", $$1, $$2}'
