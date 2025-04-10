# Add a phony target to avoid conflicts with actual directories
.PHONY: start-production start-staging clean-staging clean-production stop-staging stop-production

############################# HELP MESSAGE #############################
# Make sure the help command stays first, so that it's printed by default when `make` is called without arguments
.PHONY: help
help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# List of directories with their specific staging targets
STAGING_TARGETS = \
    indexer:-staging-avs-indexer \
    performer:-staging-avs-performer \
    webapi:-avs-webapi \
    othentic:-avs-nodes

start-staging: ## Start staging avs
	@for target in $(STAGING_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="start$${target##*:}"; \
		echo "Starting $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

clean-staging: ## Clean staging avs components
	@for target in $(STAGING_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="clean$${target##*:}"; \
		echo "Cleaning $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

stop-staging: ## Stop staging avs components
	@for target in $(STAGING_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="stop$${target##*:}"; \
		echo "Stopping $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done


###############################################
################# PRODUCTION ##################
PRODUCTION_TARGETS = \
    indexer:-avs-indexer \
    performer:-avs-performer \
    webapi:-avs-webapi \
    othentic:-avs-nodes

# Rule to start specific production targets in subdirectories
start-production: ## Start production avs components
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="start$${target##*:}"; \
		echo "Starting $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

# Clean specific production targets
clean-production: ## Clean production avs components
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="clean$${target##*:}"; \
		echo "Cleaning $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

stop-production: ## Stop production avs components
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="stop$${target##*:}"; \
		echo "Stopping $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

format-all: ## Format code in all components
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="format$${target##*:}"; \
		echo "Formatting $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

build-all: ## Build all components
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="build"; \
		echo -e "\nExecuting '$$cmd' in '/$$dir'"; \
		$(MAKE) -C $$dir $$cmd; \
	done

clean-build-all: ## Clean build artifacts for all components
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="clean-build"; \
		echo -e "\nExecuting '$$cmd' in '/$$dir'"; \
		$(MAKE) -C $$dir $$cmd; \
	done

install-all: ## Install npm dependencies for all components
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		echo -e "\nExecuting 'npm install' in '/$$dir'"; \
		(cd $$dir && npm install); \
	done
