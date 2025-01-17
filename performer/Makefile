############################# GLOBAL COMMANDs #############################

############################# HELP MESSAGE #############################
# Make sure the help command stays first, so that it's printed by default when `make` is called without arguments
.PHONY: help
help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

-----------------------------: ## 
___BUILDs___: ## Build scripts
build: ## build typescript into javascript
	@npx tsc
	@echo "Built to ./dist/"
clean-build: ## Delete all the process and flush the log
	@rm -rf dist
	@echo "Build cleaned"

-----------------------------: ## 
___PROCESS___: ## Processes of the performer node

start-avs-performer: ## Services for polymarket
	@echo "Starting AVS performer services..."
	@sed -i 's/^ENVIRONMENT=.*/ENVIRONMENT=PRODUCTION/' .env
	@pm2 start pm2/consumer.config.js
	@pm2 start pm2/producer.config.js

start-staging-avs-performer: ## Services for polymarket
	@echo "Starting AVS performer services..."
	@sed -i 's/^ENVIRONMENT=.*/ENVIRONMENT=STAGING/' .env
	@pm2 start pm2/consumer.config.js
	@pm2 start pm2/producer.config.js

clean-avs-performer: ## Delete all the process and flush the log
	@pm2 flush "SkateAvs.Performer::Input Handler"
	@pm2 flush "SkateAvs.Performer::Sender"
	@pm2 flush "SkateAvs.Performer::Watcher"

	@pm2 delete "SkateAvs.Performer::Input Handler"
	@pm2 delete "SkateAvs.Performer::Sender"
	@pm2 delete "SkateAvs.Performer::Watcher"

clean-staging-avs-performer: ## Delete all the process and flush the log
	@pm2 flush "STAGING - SkateAvs.Performer::Input Handler"
	@pm2 flush "STAGING - SkateAvs.Performer::Sender"
	@pm2 flush "STAGING - SkateAvs.Performer::Watcher"

	@pm2 delete "STAGING - SkateAvs.Performer::Input Handler"
	@pm2 delete "STAGING - SkateAvs.Performer::Sender"
	@pm2 delete "STAGING - SkateAvs.Performer::Watcher"

stop-avs-performer: ## Delete all the process and flush the log
	@pm2 stop "SkateAvs.Performer::Input Handler"
	@pm2 stop "SkateAvs.Performer::Sender"
	@pm2 stop "SkateAvs.Performer::Watcher"

stop-staging-avs-performer: ## Delete all the process and flush the log
	@pm2 stop "STAGING - SkateAvs.Performer::Input Handler"
	@pm2 stop "STAGING - SkateAvs.Performer::Sender"
	@pm2 stop "STAGING - SkateAvs.Performer::Watcher"

-----------------------------: ## 
___GLOBAL___: ## 
format-avs-performer: ## Format code with prettier
	@npx prettier --write .
