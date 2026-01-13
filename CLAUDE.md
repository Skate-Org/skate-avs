# Skate AVS - Claude Development Context

This document provides context for Claude (AI assistant) when working with the Skate AVS codebase.

## Project Overview

Skate AVS is an Actively Validated Service built on the Othentic stack. It provides decentralized validation for cross-chain operations through a distributed network of operators.

## Technology Stack

### Languages & Frameworks
- **TypeScript/JavaScript**: Primary language for most services
- **Solidity**: Smart contracts (using Foundry framework)
- **Svelte**: Frontend dashboard framework
- **Node.js**: Backend services runtime

### Key Dependencies
- **Othentic CLI**: Core AVS framework
- **ethers.js**: Ethereum interaction library
- **Docker**: Containerization and orchestration
- **PM2**: Process management
- **ZeroMQ**: Message queuing
- **Tailwind CSS**: Frontend styling
- **Playwright**: E2E testing

## Project Structure

```
skate-avs/
├── dashboard/          # Operations monitoring dashboard
│   ├── backend/        # Node.js API server
│   └── frontend/       # Svelte web interface
├── extension-contracts/ # Smart contract extensions
│   ├── key-registry/   # Delegate key management
│   └── mockStrategy/   # Testing contracts
├── indexer/           # Event indexing service
├── othentic/          # Othentic CLI configuration
├── performer/         # Task processing engine
├── scripts/           # Deployment and config scripts
└── webapi/           # Validation API service
```

## Development Commands

### Global Commands (from root)
```bash
# Install dependencies for all components
make install-all

# Build all components
make build-all

# Format code in all components
make format-all

# Start/stop staging environment
make start-staging
make stop-staging

# Start/stop production environment
make start-production
make stop-production

# Clean builds
make clean-build-all
```

### Component-Specific Commands
Each component has its own Makefile with specific targets. Common patterns:
- `make build` - Build the component
- `make start-[env]` - Start in specific environment
- `make clean-[env]` - Clean environment
- `make format` - Format code

## Key Configuration Files

### Environment Variables
- `.env` - Main environment configuration
- Required variables:
  - `OTHENTIC_BOOTSTRAP_ID`: P2P network bootstrap ID
  - `PRIVATE_KEY_VALIDATOR[1-4]`: Attester private keys
  - Database and network configurations

### Docker Configuration
- `docker-compose.yml` - Main orchestration
- `docker-compose.aggregator.yml` - Aggregator-specific
- `docker-compose.attesters.yml` - Attesters-specific

## Architecture Components

### 1. Aggregator Node
- **Location**: `/othentic`
- **Purpose**: Consensus coordination and signature aggregation
- **Port**: 8545 (JSON-RPC), 9876 (P2P)
- **Network**: 10.8.0.69

### 2. Attester Nodes (4 default)
- **Location**: `/othentic`
- **Purpose**: Independent task validation
- **Network**: 10.8.0.2-10.8.0.5
- **Connection**: Connect to aggregator via P2P

### 3. Performer Service
- **Location**: `/performer`
- **Purpose**: Task retrieval and preprocessing
- **Features**: ZeroMQ integration, proof generation
- **Protocols**: AMM, Polymarket, Shuffle support

### 4. Indexer Service
- **Location**: `/indexer`
- **Purpose**: Event monitoring and data processing
- **Database**: Task storage and historical data
- **API**: RESTful endpoints for dashboard

### 5. WebAPI Service
- **Location**: `/webapi`
- **Purpose**: Pre-validation for attesters
- **Port**: 4002
- **Network**: 10.8.0.42

### 6. Dashboard
- **Backend Location**: `/dashboard/backend`
- **Frontend Location**: `/dashboard/frontend`
- **Purpose**: Operations monitoring and analytics
- **Technology**: Svelte + Node.js + TypeScript

## Common Development Tasks

### Adding New Features
1. Identify the appropriate component
2. Follow existing patterns and conventions
3. Update tests if applicable
4. Run formatting and build commands
5. Test in staging environment

### Debugging
- Check PM2 logs for process issues
- Use Docker logs for container debugging
- Monitor dashboard for operational status
- Check database connections and queries

### Testing
- Frontend: Playwright for E2E testing
- Contracts: Foundry test suite
- Services: Component-specific test scripts

## Security Considerations

- Private keys stored in environment variables
- Rate limiting implemented in webapi
- CORS configured for cross-origin requests
- BLS signature validation for consensus
- Stake-based security model

## Database Schema

### Task Tables
- `avs.task` - Main task records
- `avs.taskByAttester` - Attester-specific task data
- Indexing by task ID, attester, and timestamps

## Network Configuration

### P2P Network (10.8.0.0/16)
- Gateway: 10.8.0.1
- Aggregator: 10.8.0.69
- Attesters: 10.8.0.2-10.8.0.5
- WebAPI: 10.8.0.42

### Port Mapping
- 8545: Aggregator JSON-RPC
- 9876: Aggregator P2P
- 4002: WebAPI service
- 3000: Dashboard frontend (dev)

## Troubleshooting

### Common Issues
1. **Bootstrap ID not found**: Check `OTHENTIC_BOOTSTRAP_ID` in .env
2. **Attesters not connecting**: Verify P2P network configuration
3. **Database connection failed**: Check database service status
4. **Task processing stuck**: Check performer and webapi logs

### Log Locations
- PM2 logs: Component-specific directories
- Docker logs: `docker-compose logs [service]`
- Application logs: Check src/services directories

## Future Development Notes

- Consider adding more attesters for increased decentralization
- Monitor gas usage and optimize L2 operations
- Implement more sophisticated slashing conditions
- Add metrics and monitoring integration
- Consider WebSocket support for real-time updates