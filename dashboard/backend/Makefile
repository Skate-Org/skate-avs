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
start-avs-dashboard-backend: ## Services for polymarket
	@echo "Starting AVS Dashboard Backend..."
	@sed -i 's/^ENVIRONMENT=.*/ENVIRONMENT=PRODUCTION/' .env
	@pm2 start pm2/web-server.config.js

start-staging-avs-dashboard-backend: ## Services for polymarket
	@echo "Starting staging AVS indexer services..."
	@sed -i 's/^ENVIRONMENT=.*/ENVIRONMENT=STAGING/' .env
	@pm2 start pm2/web-server.config.js

clean-avs-dashboard-backend: ## 
	@echo "Cleaning AVS Dashboard Backend services..."
	@pm2 flush "SkateAvs.Dashboard.Backend::Web Server"
	@pm2 delete "SkateAvs.Dashboard.Backend::Web Server"

clean-staging-avs-dashboard-backend: ## 
	@echo "Cleaning STAGING AVS indexer services..."
	@pm2 flush "STAGING - SkateAvs.Dashboard.Backend::Web Server"
	@pm2 delete "STAGING - SkateAvs.Dashboard.Backend::Web Server"

stop-avs-dashboard-backend: ## 
	@echo "Stopping AVS indexer services..."
	@pm2 stop "SkateAvs.Dashboard.Backend::Web Server"

stop-staging-avs-dashboard-backend: ## 
	@echo "Stopping STAGING AVS indexer services..."
	@pm2 stop "STAGING - SkateAvs.Dashboard.Backend::Web Server"

-----------------------------: ## 
___GLOBAL___: ## 
format-avs-dashboard-backend: ## Format code with prettier
	@npx prettier --write .
