############################# GLOBAL COMMANDs #############################

############################# HELP MESSAGE #############################
# Make sure the help command stays first, so that it's printed by default when `make` is called without arguments
.PHONY: help start-all start-dev clean-process
help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

-----------------------------: ## 
___BUILDs___: ## Build scripts
build: ## build typescript into javascript
	@npm run build
	@echo "Built to ./dist/"
clean-build: # Delete all the process and flush the log
	@rm -rf dist
	@echo "Build cleaned"

-----------------------------: ## 
___PROCESS___: ## Processes of the performer node
start-avs-webapi: build ## Boot the validate handler
	@echo "Starting the AVS Task validation server..."
	@pm2 start pm2/web-server.config.js

clean-avs-webapi: # Delete all the process and flush the log
	@pm2 flush "SkateAvs.Web API"
	@pm2 delete "SkateAvs.Web API"

stop-avs-webapi: # Delete all the process and flush the log
	@pm2 stop "SkateAvs.Web API"

-----------------------------: ## 
___GLOBAL___: ## 
format-avs-webapi: # Format code with prettier
	@npx prettier --write .
