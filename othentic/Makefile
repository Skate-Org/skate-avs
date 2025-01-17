############################# GLOBAL COMMANDs #############################

############################# HELP MESSAGE #############################
# Make sure the help command stays first, so that it's printed by default when `make` is called without arguments
.PHONY: help
help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

-----------------------------: ## 
___PROCESS___: ## Processes of the performer node

start-avs-nodes: ## Boots all services in sequence
	@echo "Starting Skate AVS node services..."
	@pm2 start pm2/aggregator.config.js
	@sleep 3
	@pm2 start pm2/attesters.config.js

clean-avs-nodes: ## Delete all the process and flush the log
	@pm2 flush "SkateAvs.Node::Aggregator"
	@pm2 flush "SkateAvs.Node::Attester 1"
	@pm2 flush "SkateAvs.Node::Attester 2"
	@pm2 flush "SkateAvs.Node::Attester 3"

	@pm2 delete "SkateAvs.Node::Aggregator"
	@pm2 delete "SkateAvs.Node::Attester 1"
	@pm2 delete "SkateAvs.Node::Attester 2"
	@pm2 delete "SkateAvs.Node::Attester 3"

flush-avs-nodes: ## Delete all the process and flush the log
	@pm2 flush "SkateAvs.Node::Aggregator"
	@pm2 flush "SkateAvs.Node::Attester 1"
	@pm2 flush "SkateAvs.Node::Attester 2"
	@pm2 flush "SkateAvs.Node::Attester 3"

stop-avs-nodes: ## Delete all the process and flush the log
	@pm2 stop "SkateAvs.Node::Aggregator"
	@pm2 stop "SkateAvs.Node::Attester 1"
	@pm2 stop "SkateAvs.Node::Attester 2"
	@pm2 stop "SkateAvs.Node::Attester 3"

-----------------------------: ## 
___GLOBAL___: ## 
build:
