#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Store the root directory
ROOT_DIR="$(pwd)"
CONTRACTS_DIR="$ROOT_DIR/contracts"

# --- Configuration ---
DEFAULT_KEYSTORE_ALIAS="otto"     # Default `cast wallet import` alias
DEFAULT_SOLIDITY_RUN_FUNCTION="run()" # Default function in Droplet.s.sol to execute
SOLIDITY_SCRIPT_FILE="script/Droplet.s.sol"
SOLIDITY_SCRIPT_OBJECT="DropletScript"

# --- Script Arguments ---
# $1: Keystore alias (optional, defaults to DEFAULT_KEYSTORE_ALIAS)
# $2: Solidity run function (optional, defaults to DEFAULT_SOLIDITY_RUN_FUNCTION)

KEYSTORE_ALIAS="${1:-$DEFAULT_KEYSTORE_ALIAS}"
SOLIDITY_RUN_FUNCTION="${2:-$DEFAULT_SOLIDITY_RUN_FUNCTION}"

SCRIPT_PATH_WITH_OBJECT="${SOLIDITY_SCRIPT_FILE}:${SOLIDITY_SCRIPT_OBJECT}"

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

# --- Network Configuration ---
RPC_URL="$BASE_MAINNET_RPC_URL"
API_KEY_FOR_VERIFICATION="$BASESCAN_API_KEY"
CHAIN_ID=8453

# Validate configuration
if [ -z "$RPC_URL" ]; then 
  echo "Error: BASE_MAINNET_RPC_URL is not set in .env"
  exit 1
fi

if [ -z "$API_KEY_FOR_VERIFICATION" ]; then 
  echo "Warning: BASESCAN_API_KEY is not set in .env. Verification will be skipped."
fi

# Verify the keystore alias exists
if ! cast wallet list | grep -q "$KEYSTORE_ALIAS"; then
  echo "Error: Keystore alias '$KEYSTORE_ALIAS' not found."
  echo "Available accounts:"
  cast wallet list
  exit 1
fi

echo "-------------------------------------------"
echo "Starting Droplet Token Deployment..."
echo "-------------------------------------------"
echo "Target Network     : Base Mainnet"
echo "Keystore Alias     : $KEYSTORE_ALIAS"
echo "Solidity Function  : $SOLIDITY_RUN_FUNCTION"
echo "RPC URL           : $RPC_URL"
echo "Foundry Script Path: $SCRIPT_PATH_WITH_OBJECT"
if [ ! -z "$API_KEY_FOR_VERIFICATION" ]; then
  echo "Verification API Key: Found"
else
  echo "Verification API Key: NOT FOUND (Verification will be skipped)"
fi
echo "-------------------------------------------"

# Confirmation prompt for mainnet deployment
read -p "ATTENTION: You are about to deploy to MAINNET. Continue? (yes/NO): " confirmation
if ! [[ "$confirmation" =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Deployment cancelled by user."
  exit 0
fi

# Store command and arguments in an array
CMD=("forge" "script" "$SCRIPT_PATH_WITH_OBJECT")
CMD+=("--rpc-url" "$RPC_URL")
CMD+=("--account" "$KEYSTORE_ALIAS")
CMD+=("--sig" "$SOLIDITY_RUN_FUNCTION")
CMD+=("--broadcast")

# Add verification flags if API key is available
if [ ! -z "$API_KEY_FOR_VERIFICATION" ]; then
  echo "Contract verification: ENABLED (Chain ID: $CHAIN_ID)"
  CMD+=("--verify")
  CMD+=("--etherscan-api-key" "$API_KEY_FOR_VERIFICATION")
  CMD+=("--chain" "$CHAIN_ID")
else
  echo "Contract verification: SKIPPED (API key missing)"
fi

echo ""
echo "Executing command:"
echo "${CMD[@]}"
echo ""

# Execute the command
"${CMD[@]}"

echo "-------------------------------------------"
echo "Deployment script finished."
echo "-------------------------------------------" 