#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Store the root directory
ROOT_DIR="$(pwd)"
CONTRACTS_DIR="$ROOT_DIR/contracts"

# --- Configuration ---
DEFAULT_KEYSTORE_ALIAS="otto"     # Default `cast wallet import` alias
DEFAULT_SOLIDITY_RUN_FUNCTION="run()" # Default function in Pool.s.sol to execute
SOLIDITY_SCRIPT_FILE="script/Pool.s.sol"
SOLIDITY_SCRIPT_OBJECT="PoolScript"
LOCAL_PORT=8545
ANVIL_PID=""

# --- Script Arguments ---
# $1: Target network (required: "mainnet", "sepolia", "local")
# $2: Keystore alias (optional, defaults to DEFAULT_KEYSTORE_ALIAS)
# $3: Solidity run function (optional, defaults to DEFAULT_SOLIDITY_RUN_FUNCTION)

TARGET_NETWORK="${1}"
KEYSTORE_ALIAS="${2:-$DEFAULT_KEYSTORE_ALIAS}"
SOLIDITY_RUN_FUNCTION="${3:-$DEFAULT_SOLIDITY_RUN_FUNCTION}"

SCRIPT_PATH_WITH_OBJECT="${SOLIDITY_SCRIPT_FILE}:${SOLIDITY_SCRIPT_OBJECT}"

# --- Validate Target Network ---
if [ -z "$TARGET_NETWORK" ]; then
  echo "Error: Target network argument is required."
  echo "Usage: ./deploy_pool.sh <mainnet|sepolia|local> [keystore_alias] [solidity_function]"
  exit 1
fi

# --- Function to cleanup Anvil when script exits ---
cleanup() {
  # If Anvil is running, terminate it
  if [ ! -z "$ANVIL_PID" ]; then
    echo "Shutting down Anvil (PID: $ANVIL_PID)..."
    kill $ANVIL_PID 2>/dev/null || true
    wait $ANVIL_PID 2>/dev/null || true
    echo "Anvil terminated."
  fi
  
  # Return to root directory
  cd "$ROOT_DIR"
}

# Register the cleanup function to be called on script exit
trap cleanup EXIT

# --- Load Environment Variables ---
ENV_FILE="$CONTRACTS_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  echo "Loading environment variables from $ENV_FILE..."
  source "$ENV_FILE"
else
  echo "Error: $ENV_FILE not found in contracts directory."
  echo "Please ensure it exists and contains necessary RPC URLs and API keys."
  exit 1
fi

# --- Setup Contracts Directory ---
echo "Setting up contracts environment..."
cd "$CONTRACTS_DIR"

# Initialize git if needed
if [ ! -d ".git" ]; then
  echo "Initializing git repository in contracts directory..."
  git init
fi

# Install Foundry dependencies if needed
if [ ! -d "lib" ] || [ ! "$(ls -A lib)" ]; then
  echo "Installing Foundry dependencies..."
  forge install OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std
fi

# --- Network-specific Configuration & Validation ---
RPC_URL=""
API_KEY_FOR_VERIFICATION="" # For Etherscan/Basescan
CHAIN_ID=""

case "$TARGET_NETWORK" in
  "mainnet")
    RPC_URL="$BASE_MAINNET_RPC_URL"
    API_KEY_FOR_VERIFICATION="$BASESCAN_API_KEY" # Or ETHERSCAN_API_KEY if you use that for Basescan
    CHAIN_ID=8453
    if [ -z "$RPC_URL" ]; then echo "Error: BASE_MAINNET_RPC_URL is not set in .env"; exit 1; fi
    if [ -z "$API_KEY_FOR_VERIFICATION" ]; then echo "Warning: BASESCAN_API_KEY (or ETHERSCAN_API_KEY) is not set in .env. Verification will be skipped."; fi
    ;;
  "sepolia")
    RPC_URL="$BASE_SEPOLIA_RPC_URL"
    API_KEY_FOR_VERIFICATION="$BASESCAN_API_KEY" # Or ETHERSCAN_API_KEY
    CHAIN_ID=84532
    if [ -z "$RPC_URL" ]; then echo "Error: BASE_SEPOLIA_RPC_URL is not set in .env"; exit 1; fi
    if [ -z "$API_KEY_FOR_VERIFICATION" ]; then echo "Warning: BASESCAN_API_KEY (or ETHERSCAN_API_KEY) is not set in .env. Verification will be skipped."; fi
    ;;
  "local")
    # Check if we have the mainnet RPC URL for forking
    if [ -z "$BASE_MAINNET_RPC_URL" ]; then
      echo "Error: BASE_MAINNET_RPC_URL is not set in .env"
      echo "A mainnet RPC URL is required for local forking"
      exit 1
    fi

    # For local deployment, start Anvil with mainnet fork
    echo "Starting Anvil with Base mainnet fork..."
    # Check if port 8545 is already in use
    if netstat -an | grep -q "127.0.0.1.$LOCAL_PORT.*LISTEN"; then
      echo "Warning: Port $LOCAL_PORT is already in use. Another Ethereum node might be running."
      echo "Do you want to continue using the existing node? (yes/no)"
      read -r USE_EXISTING
      if [[ ! "$USE_EXISTING" =~ ^[Yy][Ee][Ss]|[Yy]$ ]]; then
        echo "Deployment cancelled. Stop the existing node or choose a different port."
        exit 1
      fi
    else
      # Start Anvil with mainnet fork and fund the first account
      anvil --fork-url "$BASE_MAINNET_RPC_URL" \
            --port $LOCAL_PORT \
            --chain-id 8453 \
            --balance 100000 \
            > ./anvil.log 2>&1 &
      ANVIL_PID=$!
      echo "Anvil started with PID: $ANVIL_PID (logs at ./anvil.log)"
      
      # Wait a moment for Anvil to initialize
      echo "Waiting for Anvil to initialize..."
      sleep 3
      
      # Verify Anvil is running
      if ! ps -p $ANVIL_PID > /dev/null; then
        echo "Error: Anvil failed to start. Check anvil.log for details."
        exit 1
      fi

      # Get the first Anvil account (this is a well-known test account)
      ANVIL_ACCOUNT="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      ANVIL_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      echo "Using Anvil test account: $ANVIL_ACCOUNT"
    fi
    
    RPC_URL="http://localhost:$LOCAL_PORT"
    # No API key needed for local verification
    ;;
  *)
    echo "Error: Invalid target network: '$TARGET_NETWORK'."
    echo "Supported networks: mainnet, sepolia, local"
    exit 1
    ;;
esac

# Verify the keystore alias exists (skip for local network)
if [ "$TARGET_NETWORK" != "local" ]; then
  if ! cast wallet list | grep -q "$KEYSTORE_ALIAS"; then
    echo "Error: Keystore alias '$KEYSTORE_ALIAS' not found."
    echo "Available accounts:"
    cast wallet list
    exit 1
  fi
fi

echo "-------------------------------------------"
echo "Starting Smart Contract Deployment..."
echo "-------------------------------------------"
echo "Target Network     : $TARGET_NETWORK"
if [ "$TARGET_NETWORK" == "local" ]; then
  echo "Using Local Account : $ANVIL_ACCOUNT"
else
  echo "Keystore Alias     : $KEYSTORE_ALIAS"
fi
echo "Solidity Function  : $SOLIDITY_RUN_FUNCTION"
echo "RPC URL            : $RPC_URL"
echo "Foundry Script Path: $SCRIPT_PATH_WITH_OBJECT"
if [ "$TARGET_NETWORK" != "local" ] && [ ! -z "$API_KEY_FOR_VERIFICATION" ]; then
  echo "Verification API Key: Found"
else
  if [ "$TARGET_NETWORK" != "local" ]; then
    echo "Verification API Key: NOT FOUND (Verification will be skipped)"
  fi
fi
echo "-------------------------------------------"

# Confirmation prompt for mainnet deployments
if [ "$TARGET_NETWORK" == "mainnet" ]; then
  read -p "ATTENTION: You are about to deploy to MAINNET. Continue? (yes/NO): " confirmation
  if ! [[ "$confirmation" =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Deployment to MAINNET cancelled by user."
    exit 0
  fi
fi

# Store command and arguments in an array (much safer than eval)
CMD=("forge" "script" "$SCRIPT_PATH_WITH_OBJECT")
CMD+=("--rpc-url" "$RPC_URL")
if [ "$TARGET_NETWORK" == "local" ]; then
  CMD+=("--private-key" "$ANVIL_PRIVATE_KEY")
else
  CMD+=("--account" "$KEYSTORE_ALIAS")
fi
CMD+=("--sig" "$SOLIDITY_RUN_FUNCTION")
CMD+=("--broadcast")

# Add verification flags if not a local network and API key is available
if [ "$TARGET_NETWORK" != "local" ] && [ ! -z "$API_KEY_FOR_VERIFICATION" ] && [ ! -z "$CHAIN_ID" ]; then
  echo "Contract verification: ENABLED (Chain ID: $CHAIN_ID)"
  CMD+=("--verify")
  CMD+=("--etherscan-api-key" "$API_KEY_FOR_VERIFICATION")
  CMD+=("--chain" "$CHAIN_ID")
else
  if [ "$TARGET_NETWORK" != "local" ]; then
    echo "Contract verification: SKIPPED (API key or Chain ID missing for $TARGET_NETWORK)"
  else
    echo "Contract verification: SKIPPED (local network)"
  fi
fi

echo ""
echo "Executing command:"
echo "${CMD[@]}"
echo ""

# Execute the command directly (no eval)
"${CMD[@]}"

# If we reached here, deployment was successful
if [ "$TARGET_NETWORK" == "local" ] && [ ! -z "$ANVIL_PID" ]; then
  echo ""
  echo "Local deployment successful!"
  echo "Anvil is still running in the background with PID: $ANVIL_PID"
  echo "To manually stop Anvil: kill $ANVIL_PID"
  echo "Anvil will be automatically stopped when this script exits."
  
  # Keep Anvil running for a while to allow interaction
  read -p "Press Enter to stop Anvil and exit..."
fi

echo "-------------------------------------------"
echo "Deployment script finished."
echo "-------------------------------------------" 