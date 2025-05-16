# Deployment Documentation

## Latest Deployments

### Base Mainnet

**Date**: `2025-05-16`

#### Deployed Contracts

| Contract | Address                                      | Transaction                                                                                                    | Verification                                                                                | Commit                                     |
| -------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Pool     | `0xA2cD9Ccd89C3c8760A701DaDD11174393443E495` | [0x459c5e...8ab3c](https://basescan.org/tx/0x459c5edad5565daff505f23d3de8c362d7009566fbfa81ecae9eb011a938ab3c) | [View on Basescan](https://basescan.org/address/0xa2cd9ccd89c3c8760a701dadd11174393443e495) | `422b7af9b50609e25ce498d85a73b919b43f447f` |
| Droplet  | `0xbCEa52D097ae1189A22bdFbf67303082E7b8b07E` | [0xc5ab08...478c](https://basescan.org/tx/0xc5ab0857c5f2e6ebcdbaa3fe5ad46095299d1d41b43e2c1d94963bce669b478c)  | [View on Basescan](https://basescan.org/address/0xbcea52d097ae1189a22bdfbf67303082e7b8b07e) | `422b7af9b50609e25ce498d85a73b919b43f447f` |

#### Deployment Details

**Environment Setup**:

- Network: Base Mainnet
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- Compiler Version: 0.8.30
- EVM Version: cancun

**Gas Information (Pool)**:

- Total Gas Used: 5,273,604 gas
- Gas Price: ~0.001641002 gwei
- Total Cost: 0.000009042070351182 ETH
- Block Number: 30314301

**Gas Information (Droplet)**:

- Total Gas Used: 1,012,815 gas
- Gas Price: ~0.002015584 gwei
- Total Cost: 0.00000204141370896 ETH
- Block Number: 30314589

**Contract Integration**:

- USDC Address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Initial Droplet Supply: 1,000,000e18 tokens (minted to deployer)

### Base Sepolia Testnet (Previous Deployment)

**Date**: `2025-05-16`

#### Deployed Contracts

| Contract            | Address                                      | Transaction                                                                                                             | Verification                                                                                        | Commit                                     |
| ------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Pool                | `0xD571c6e319D13637A1DfF6F6e9fdb8d2803af3aE` | [0x80bc0b...590da3](https://sepolia.basescan.org/tx/0x80bc0b1b14bbf4b40c29c37c8e232dccd507d150ad8515e9cd74d53f13590da3) | [View on Basescan](https://sepolia.basescan.org/address/0xd571c6e319d13637a1dff6f6e9fdb8d2803af3ae) | `422b7af9b50609e25ce498d85a73b919b43f447f` |
| Mock USDC (Droplet) | `0x1bdffEBF62E16660d01e805F3529eBA1B982a864` | [0xa9f34f...1f5ba](https://sepolia.basescan.org/tx/0xa9f34fa9fbc3c513e9e280e66d2aa451fa9e75e8723d22619bb4df766bc1f5ba)  | [View on Basescan](https://sepolia.basescan.org/address/0x1bdffebf62e16660d01e805f3529eba1b982a864) | `422b7af9b50609e25ce498d85a73b919b43f447f` |

#### Deployment Details

**Environment Setup**:

- Network: Base Sepolia Testnet
- Chain ID: 84532
- RPC URL: https://sepolia-preconf.base.org
- Compiler Version: 0.8.30
- EVM Version: cancun

**Gas Information**:

- Total Gas Used: 6,522,906 gas
- Gas Price: ~0.0009845 gwei
- Total Cost: 0.000006421800957 ETH

**Initial Pool Configuration**:

- Start Time: deployment timestamp + 2 days
- End Time: deployment timestamp + 2 days + 6 hours
- Name: "Test pool"
- Initial Amount: 1000
- Token: Mock USDC (Droplet)
- Additional Parameters: 1, 1000

**Mock Token (Droplet) Setup**:

- Initial Mint: 1,000,000e18 tokens
- Recipient: Deployer address

#### Deployment Process

1. **Contract Deployments**:

    ```plaintext
    1. Initial setup transaction (236,487 gas)
    2. Deploy Mock USDC (Droplet) (978,080 gas)
    3. Token setup transaction (34,735 gas)
    4. Deploy Pool contract (5,273,604 gas)
    ```

2. **Contract Verification**:
    - Both contracts were successfully verified on Basescan
    - Verification was automatic through the deployment script
    - Source code and constructor arguments are publicly viewable

#### Deployment Artifacts

Important files generated during deployment:

- Transactions Record: `contracts/broadcast/Pool.s.sol/84532/run-latest.json`
- Sensitive Data Cache: `contracts/cache/Pool.s.sol/84532/run-latest.json`

## Environment Variables

Required environment variables for deployment (in `contracts/.env`):

```plaintext
BASE_MAINNET_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia-preconf.base.org"
BASESCAN_API_KEY="your_api_key"
PRIVATE_KEY="your_private_key"
```

## Deployment Scripts

The deployment process uses several main files:

1. **Pool Shell Script** (`scripts/deploy_pool.sh`):

    - Handles environment setup
    - Manages network selection
    - Executes the Solidity deployment script
    - Handles contract verification

2. **Pool Solidity Script** (`contracts/script/Pool.s.sol`):

    - Deploys the Pool contract
    - Deploys Mock USDC on test networks
    - Sets up initial pool configuration
    - Handles network-specific token addresses

3. **Droplet Shell Script** (`scripts/deploy_droplet.sh`):

    - Dedicated script for Droplet token deployment
    - Handles mainnet deployment with safety checks
    - Manages environment setup and verification
    - Provides clear deployment status output

4. **Droplet Solidity Script** (`contracts/script/Droplet.s.sol`):
    - Deploys the Droplet token contract
    - Mints initial supply to deployer
    - Configures token parameters
    - Handles verification setup

## Droplet Deployment Process

The Droplet token deployment follows a specific process designed for secure mainnet deployment:

1. **Pre-deployment Setup**:

    - Environment variables loaded from `contracts/.env`
    - Git repository initialized if needed
    - Foundry dependencies checked and installed
    - Network configuration validated

2. **Safety Measures**:

    - Explicit mainnet deployment confirmation required
    - Keystore alias verification
    - Environment variable validation
    - Clear deployment parameter display

3. **Deployment Steps**:

    ```plaintext
    1. Initial setup transaction (34,735 gas)
    2. Deploy Droplet contract (978,080 gas)
    3. Mint initial supply to deployer
    ```

4. **Verification Process**:

    - Automatic verification on Basescan
    - Contract source code published
    - Constructor arguments verified
    - Deployment artifacts saved

5. **Deployment Artifacts**:
    - Transactions: `contracts/broadcast/Droplet.s.sol/8453/run-latest.json`
    - Sensitive Data: `contracts/cache/Droplet.s.sol/8453/run-latest.json`

## Network-Specific Configurations

### Base Mainnet

- USDC Address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Uses existing USDC contract

### Base Sepolia

- Deploys Mock USDC (Droplet)
- Mints initial tokens to deployer
- Suitable for testing and development

### Local Development

- Uses Anvil for local blockchain
- Forks Base mainnet for USDC integration
- Default test account with known private key
