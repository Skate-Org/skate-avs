############################# GLOBAL COMMANDs #############################

############################# HELP MESSAGE #############################
# Make sure the help command stays first, so that it's printed by default when `make` is called without arguments
.PHONY: help
help: ## Display make config info
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

-----------------------------: ## 
___BUILDs___: ## Build scripts
build: ## build typescript into javascript
	@npx tsc
	@echo "Built to ./dist/"
clean-build: # Delete all the process and flush the log
	@rm -rf dist
	@echo "Build cleaned"

-----------------------------: ## 
___PROCESS___: ## Processes of the performer node
start-avs-indexer: ## Services for polymarket
	@echo "Starting AVS indexer services..."
	@sed -i 's/^ENVIRONMENT=.*/ENVIRONMENT=PRODUCTION/' .env
	@pm2 start pm2/indexer.config.js
	@pm2 start pm2/web-server.config.js

start-staging-avs-indexer: ## Services for polymarket
	@echo "Starting staging AVS indexer services..."
	@sed -i 's/^ENVIRONMENT=.*/ENVIRONMENT=STAGING/' .env
	@pm2 start pm2/indexer.config.js
	@pm2 start pm2/web-server.config.js

clean-avs-indexer: ## 
	@echo "Cleaning AVS indexer services..."
	@pm2 flush "SkateAvs.Indexer::Collector.Avs"
	@pm2 flush "SkateAvs.Indexer::Collector.Kernel"
	@pm2 delete "SkateAvs.Indexer::Collector.Avs" "SkateAvs.Indexer::Collector.Kernel"

	@pm2 flush "SkateAvs.Indexer::Web Server"
	@pm2 delete "SkateAvs.Indexer::Web Server"

clean-staging-avs-indexer: ## 
	@echo "Cleaning STAGING AVS indexer services..."
	@pm2 flush "STAGING - SkateAvs.Indexer::Collector.Avs"
	@pm2 flush "STAGING - SkateAvs.Indexer::Collector.Kernel"
	@pm2 delete "STAGING - SkateAvs.Indexer::Collector.Avs" "STAGING - SkateAvs.Indexer::Collector.Kernel"

	@pm2 flush "STAGING - SkateAvs.Indexer::Web Server"
	@pm2 delete "STAGING - SkateAvs.Indexer::Web Server"

stop-avs-indexer: ## 
	@echo "Stopping AVS indexer services..."
	@pm2 stop "SkateAvs.Indexer::Collector.Avs"
	@pm2 stop "SkateAvs.Indexer::Collector.Kernel"
	@pm2 stop "SkateAvs.Indexer::Web Server"

stop-staging-avs-indexer: ## 
	@echo "Stopping STAGING AVS indexer services..."
	@pm2 stop "STAGING - SkateAvs.Indexer::Collector.Avs"
	@pm2 stop "STAGING - SkateAvs.Indexer::Collector.Kernel"
	@pm2 stop "STAGING - SkateAvs.Indexer::Web Server"


-----------------------------: ## 
___GLOBAL___: ## 
format-avs-indexer: ## Format code with prettier
	@npx prettier --write .
