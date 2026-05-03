# Monorepo task runner.
#
# Why this file exists: tests for both submodules run inside the devcontainer
# (Linux native bindings, MongoDB-on-the-compose-network), and the exact
# invocation is verbose enough that it would otherwise live in a wiki page
# nobody re-reads. Keeping it here means `make test` is the canonical answer
# to "how do I run the tests" — no docker-exec lore required.
#
# Conventions:
#   - All test targets shell into the devcontainer via `devcontainer exec`,
#     never `docker exec`. The devcontainer CLI handles up/down, mounts, and
#     workspace path translation for us.
#   - The server suite needs MONGODB_URI pointing at the compose network's
#     `mongodb` service; the client suite needs no env override.
#   - `make` with no target prints help — discoverability beats brevity.

DEVCONTAINER_EXEC = devcontainer exec --workspace-folder .
SERVER_TEST_ENV = MONGODB_URI=mongodb://mongodb:27017/patas-arriba-test

.PHONY: help test test-server test-client test-watch-server test-watch-client

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
	$(DEVCONTAINER_EXEC) sh -c "cd /workspace/server && $(SERVER_TEST_ENV) npm test"

test-client:  ## Run client suite (vitest + react-testing-library, jsdom)
	$(DEVCONTAINER_EXEC) sh -c "cd /workspace/client && npm test"

test-watch-server:  ## Server tests in watch mode (re-runs on file change)
	$(DEVCONTAINER_EXEC) sh -c "cd /workspace/server && $(SERVER_TEST_ENV) npm run test:watch"

test-watch-client:  ## Client tests in watch mode (re-runs on file change)
	$(DEVCONTAINER_EXEC) sh -c "cd /workspace/client && npm run test:watch"
