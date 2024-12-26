# Gator CLI Tool

The Gator CLI tool is a streamlined command-line utility for developers and blockchain enthusiasts to fetch and display recent transaction histories of Solana wallets. With customizable settings for transaction depth and API call delays.

---

## Dependencies

The Gator CLI tool requires the following dependencies to function properly:

- **Node.js**: Ensure you have Node.js installed (preferably version 14 or later).
- **NPM/Yarn**: Installed as part of Node.js for managing dependencies.
- **Dependencies:**
  - `@solana/web3.js`: For interacting with the Solana blockchain.
  - `dotenv`: For securely managing API keys and environment variables.

To install dependencies, run:

```bash
npm install
```

---

## API Key

The CLI tool uses Solana RPC nodes for fetching transaction data. Ensure you have access to an RPC endpoint via a provider such as [QuickNode](https://www.quicknode.com/) or [Alchemy](https://www.alchemy.com/).

1. Obtain your API key from your preferred RPC provider.
2. Create a `.env` file in the root directory and add your API key as follows:

   ```env
   SOLANA_RPC_URL=https://<your_rpc_provider_url>/<your_api_key>
   ```

---

## Usage

Run the CLI tool using the following command:

```bash
node gator-cli <file-path> <depth> <delay>
```

### Parameters

1. `<file-path>`: Path to the file containing wallet addresses (one wallet address per line).  
2. `<depth>`: The maximum number of transactions to fetch for each wallet.  
3. `<delay>`: The delay (in milliseconds) between fetching transactions for each wallet to avoid rate limiting.

### Example Command

```bash
node gator-cli wallets.txt 100 2000
```

This will:
- Read wallet addresses from `wallets.txt`.
- Fetch up to 100 transactions per wallet.
- Introduce a 2000ms (2-second) delay between fetching data for each wallet.

---

## Output

The tool displays transaction details in the following format:

- **Sender Wallet**: Address of the wallet initiating the transaction.
- **Recipient Wallet**: Address of the wallet receiving the transaction.
- **Amount (amt)**: The amount transferred in SOL or SPL tokens.
- **SPL or Native (splOrNative)**: Indicates if the transaction involves SPL tokens (`1`) or native SOL (`0`).
- **Transaction ID (tx)**: The unique identifier of the transaction on the blockchain.

---

## What is Depth?

- **Depth** refers to the maximum number of transactions the CLI tool will retrieve for each wallet.
- Setting a higher depth fetches more transactions but may increase runtime and API usage.

---

## What is Delay?

- **Delay** introduces a pause between API calls for each wallet. This helps in:
  - Avoiding rate-limiting issues with the RPC provider.
  - Ensuring compliance with provider API usage terms.

- **Performance**: For optimal performance, choose an appropriate balance between depth and delay.
- **Error Handling**: Ensure all wallet addresses in the file are valid Solana addresses.
- **Rate Limits**: Check your RPC provider's rate-limiting policy to avoid interruptions during execution.

---

Feel free to reach out for support or contribute to improve this tool! 🚀
