# Secure Smart Contract Deployments with Foundry

This guide outlines the best practices for securely managing private keys and deploying smart contracts using the Foundry toolkit. Following these steps will help protect your assets and maintain a secure development workflow.

## 1. Understanding the Risks

Storing private keys in plaintext (e.g., directly in scripts, environment variables committed to repositories, or unprotected `.env` files) poses significant security risks:

- **Accidental Commits:** Plaintext keys can easily be committed to version control systems like Git, potentially exposing them publicly.
- **Shell History Leaks:** Typing private keys directly into the terminal can leave them in your shell history.
- **Malware:** Malicious software on your machine could scan for and steal unprotected private keys.
- **Unauthorized Access:** If your development environment is compromised, plaintext keys are immediately accessible.

Foundry provides tools to mitigate these risks by allowing you to encrypt your private keys.

## 2. Secure Private Key Management with Foundry Keystore

Foundry's `cast wallet import` command allows you to import your private key into an encrypted keystore. This is the recommended method for handling private keys for development and deployment.

### Steps:

#### a. Install Foundry

If you haven't already, install Foundry and make sure it's up to date:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

#### b. Import Your Private Key

Use the `cast wallet import` command to securely import your private key. You'll give your key an alias (e.g., `deployer_mainnet`, `testnet_admin`) and set a password to encrypt it.

```bash
cast wallet import <YOUR_WALLET_ALIAS> --interactive
```

- **`<YOUR_WALLET_ALIAS>`**: Choose a descriptive alias for your key (e.g., `deployer`, `sepolia_deployer`).
- **`--interactive`**: This crucial flag prevents your private key from being saved in your terminal's command history.

You will be prompted to:

1.  Paste your private key.
2.  Enter and confirm a strong password. **Do not lose this password!** It's required to decrypt and use your key. If lost, the encrypted key cannot be recovered.

Foundry stores the encrypted key in its keystore, typically located at `~/.foundry/keystore` (this path might vary based on your OS and Foundry configuration).

#### c. Verify Import (Optional)

You can list all imported wallet aliases to confirm your key was added:

```bash
cast wallet list
```

Your chosen alias should appear in the list.

## 3. Configuring RPC URLs and API Keys

While your private key is now encrypted, your deployment scripts still need an RPC URL to connect to the desired blockchain network (e.g., Ethereum Mainnet, Sepolia testnet) and potentially an Etherscan (or equivalent) API key for contract verification.

- **Use `.env` Files:** Store RPC URLs and API keys in a `.env` file at the root of your project.

    ```env
    # .env example
    MAINNET_RPC_URL="https://your_mainnet_rpc_provider_url/your_api_key"
    SEPOLIA_RPC_URL="https://your_sepolia_rpc_provider_url/your_api_key"
    ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
    # For BaseScan, Foundry still expects ETHERSCAN_API_KEY variable name
    # BASESCAN_API_KEY="YOUR_BASESCAN_API_KEY"
    ```

- **`.gitignore` is Essential:** **Crucially, add your `.env` file to your project's `.gitignore` file** to prevent it from ever being committed to your repository.

    ```gitignore
    # .gitignore
    .env
    *.env
    .env.*
    !/.env.example
    # Consider adding foundry keystore if it's within project, though default is usually outside
    # foundry.keystore
    ```

    It's good practice to include an `.env.example` file (committed to the repo) that shows the required variables without their actual values.

- **Loading Environment Variables:** Before running deployment scripts, load these variables into your shell session:
    ```bash
    source .env
    ```
    Alternatively, some Foundry configurations allow setting these directly in `foundry.toml`, or you can pass them as command-line arguments (though be careful with sensitive API keys in CLI history).

## 4. Using Encrypted Keys in Deployments

When deploying your contracts using `forge script` or `forge create`, you'll use the `--account` flag to specify the alias of the encrypted key you want to use.

#### Example with `forge script`:

```bash
# Make sure environment variables (like RPC_URL) are loaded (e.g., via 'source .env')
forge script script/YourDeploymentScript.s.sol:YourScript \
    --rpc-url $SEPOLIA_RPC_URL \
    --account <YOUR_WALLET_ALIAS> \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY # or $BASESCAN_API_KEY if on Base and configured
```

Foundry will prompt you for the password you set when importing `<YOUR_WALLET_ALIAS>`.

#### Example with `forge create`:

```bash
# Make sure environment variables are loaded
forge create src/YourContract.sol:YourContract \
    --rpc-url $SEPOLIA_RPC_URL \
    --account <YOUR_WALLET_ALIAS> \
    --constructor-args <arg1> <arg2> \ # If your contract has constructor arguments
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY
```

Again, you will be prompted for the password for `<YOUR_WALLET_ALIAS>`.

## 5. Best Practices for Secure Deployments

- **Never Hardcode Keys:** Do not write private keys directly into your scripts, configuration files, or any file that might be version controlled.
- **Strong Passwords:** Use strong, unique passwords for your Foundry keystore aliases. Consider a password manager.
- **Limit Key Usage:** Use different private keys for different purposes or environments (e.g., a separate key for mainnet deployments versus testnet experimentation).
- **Clear Shell History:** If you ever accidentally type or paste a private key into your terminal, clear your shell history immediately:
    ```bash
    history -c && history -w  # For Bash and Zsh
    ```
- **Secure Your Machine:** Keep your operating system, Foundry, and other development tools updated. Be cautious about installing software from untrusted sources.
- **Regular Audits:** For high-value contracts, consider professional security audits.
- **Review `.gitignore`:** Double-check that `.env` files, local keystore files (if you ever move them into the project), and other sensitive files are properly ignored by Git.
- **Test Thoroughly:** Always test your deployment scripts and contract interactions extensively on testnets before deploying to mainnet.

By following this guide, you can significantly improve the security of your smart contract deployment process with Foundry.
