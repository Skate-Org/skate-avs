# Add a phony target to avoid conflicts with actual directories
.PHONY: start-production start-staging clean-staging clean-production stop-staging stop-production

# List of directories with their specific staging targets
STAGING_TARGETS = \
    indexer:-staging-avs-indexer \
    performer:-staging-avs-performer \
    webapi:-avs-webapi \
    othentic:-avs-nodes

start-staging:
	@for target in $(STAGING_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="start$${target##*:}"; \
		echo "Starting $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

clean-staging:
	@for target in $(STAGING_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="clean$${target##*:}"; \
		echo "Cleaning $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

stop-staging:
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
start-production:
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="start$${target##*:}"; \
		echo "Starting $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

# Clean specific production targets
clean-production:
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="clean$${target##*:}"; \
		echo "Cleaning $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

stop-production:
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="stop$${target##*:}"; \
		echo "Stopping $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

format-all:
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="format$${target##*:}"; \
		echo "Formatting $$cmd in $$dir"; \
		$(MAKE) -C $$dir $$cmd; \
	done

build-all:
	@for target in $(PRODUCTION_TARGETS); do \
		dir=$${target%%:*}; \
		cmd="build"; \
		echo -e "\nExecuting '$$cmd' in '/$$dir'"; \
		$(MAKE) -C $$dir $$cmd; \
	done
