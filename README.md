# Skate AVS

Skate AVS (Actively Validated Service) is a decentralized validation system built on the Othentic stack. This AVS provides secure and efficient validation of cross-chain operations and maintains consensus across distributed operators.

## Architecture Overview

Skate AVS utilizes the [Othentic stack](https://docs.othentic.xyz/main/avs-framework/abstract) to provide a robust validation framework with the following components:

### Core Components

#### 1. `/dashboard` - Operations Dashboard
- **Backend**: Node.js/TypeScript service with database integration
- **Frontend**: Svelte-based web interface with Tailwind CSS
- **Features**: 
  - Real-time operator activity monitoring
  - AVS metrics and analytics
  - Task validation status tracking
  - Storybook component library integration

#### 2. `/extension-contracts` - Smart Contract Extensions
- **Key Registry**: Delegate key management system
- **Mock Strategy**: Testing and development contracts
- **Integration**: Hooks to base `AttestationCenter` and `AvsGovernance` contracts
- **Built with**: Solidity, Foundry framework

#### 3. `/indexer` - Data Indexer Service
- **Purpose**: Monitors AVS operational status and processes verified data
- **Features**:
  - Real-time event indexing from AttestationCenter
  - Task aggregation and processing
  - Database persistence for historical data
  - RESTful API endpoints

#### 4. `/othentic` - Node Infrastructure
- **Aggregator Node**: Consensus coordination and finalization
- **Attester Nodes**: Distributed validation nodes (4 default attesters)
- **Network**: P2P communication with libp2p
- **Deployment**: Docker Compose orchestration

#### 5. `/performer` - Task Processing Engine
- **Responsibility**: Retrieves and pre-processes tasks from Skate MessageBox
- **Features**:
  - ZeroMQ message queue integration
  - Multi-protocol support (AMM, Polymarket, Shuffle)
  - AVS proof generation and verification
  - Task watcher and sender services

#### 6. `/scripts` - Configuration Scripts
- **Deployment**: Automated deployment scripts
- **Configuration**: AVS parameter management
- **Utilities**: Operator management and strategy configuration
- **Built with**: TypeScript, ethers.js

#### 7. `/webapi` - Validation API
- **Purpose**: Pre-validation services for attesters
- **Features**:
  - Task validation before aggregation
  - Health monitoring endpoints
  - Rate limiting and security middleware
  - CORS configuration for cross-origin requests

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Foundry (for smart contracts)

### Installation
```bash
# Install all dependencies
make install-all

# Build all components
make build-all
```

### Development Environment
```bash
# Start staging environment
make start-staging

# Stop staging environment
make stop-staging
```

### Production Deployment
```bash
# Start production environment
make start-production

# Stop production environment
make stop-production
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:
```bash
# Othentic Configuration
OTHENTIC_BOOTSTRAP_ID=your_bootstrap_id

# Validator Private Keys
PRIVATE_KEY_VALIDATOR1=your_validator1_key
PRIVATE_KEY_VALIDATOR2=your_validator2_key
PRIVATE_KEY_VALIDATOR3=your_validator3_key
PRIVATE_KEY_VALIDATOR4=your_validator4_key

# Additional configuration variables...
```

## Development Workflow

### Code Formatting
```bash
# Format all components
make format-all
```

### Testing
```bash
# Run tests for specific components
cd dashboard/frontend && npm test
cd extension-contracts/key-registry && forge test
```

### Monitoring
- Dashboard: `http://localhost:3000`
- API Endpoints: `http://localhost:4002`
- Aggregator RPC: `http://localhost:8545`

## Architecture Details

### Consensus Mechanism
- Uses Othentic's BLS signature aggregation
- Minimum 3/4 attesters required for consensus
- Automatic slashing for malicious behavior

### Data Flow
1. **Task Generation**: Performer watches MessageBox for new tasks
2. **Pre-processing**: Tasks are validated and prepared
3. **Distribution**: Tasks sent to attester nodes
4. **Validation**: Each attester validates independently
5. **Aggregation**: Aggregator collects and verifies signatures
6. **Finalization**: Consensus reached and data committed
7. **Indexing**: Results indexed for dashboard and APIs

### Security Features
- Multi-signature validation
- Stake-based security model
- Automatic slashing conditions
- Rate limiting and DDoS protection
- Secure key management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and formatting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support and questions:
- Documentation: [Othentic Docs](https://docs.othentic.xyz)
- Issues: Create an issue in this repository
- Community: Join our Discord/Telegram channels
