const fs = require("fs");
const { Connection, PublicKey } = require("@solana/web3.js");
require("dotenv").config(); // Load environment variables from .env file

// Avoid using solana's own RPC nodes for this task as they are heavily rate-limited
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to write logs to a file
function logToFile(filename, data) {
  fs.appendFileSync(filename, data + "\n");
}

// Function to fetch and process transactions
async function fetchAndProcessTransactions(wallet, walletSet, depth, delay) {
  const publicKey = new PublicKey(wallet);
  let signatures = [];
  let lastSignature = null;

  console.log(
    `Fetching transactions for wallet: ${wallet} (up to ${depth} transactions)`
  );

  try {
    for (let i = 0; i < Math.ceil(depth / 1000); i++) {
      const batch = await connection.getSignaturesForAddress(publicKey, {
        before: lastSignature,
        limit: Math.min(1000, depth - signatures.length),
      });

      if (batch.length === 0) break;
      signatures = signatures.concat(batch);
      lastSignature = batch[batch.length - 1].signature;
      await sleep(delay);
    }
  } catch (error) {
    console.error(`Error fetching signatures for wallet ${wallet}:`, error);
    return;
  }

  if (signatures.length === 0) {
    console.log(`No transaction history found for wallet: ${wallet}`);
    return;
  }

  const allTransactions = [];
  for (let sig of signatures) {
    try {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (tx) allTransactions.push(tx);
      await sleep(delay / 10);
    } catch (error) {
      console.error(
        `Error fetching transaction details for signature ${sig.signature}:`,
        error
      );
    }
  }

  // Filter and process transactions
  filterAndSaveTransactions(allTransactions, walletSet);
}

// Function to filter and save relevant transactions
function filterAndSaveTransactions(transactions, walletSet) {
  let filteredCount = 0;

  for (const tx of transactions) {
    const message = tx.transaction.message;
    const instructions = message.instructions;

    for (const instr of instructions) {
      const { parsed, programId } = instr;

      // Only process instructions with parsed data of type 'transfer'
      if (parsed?.type === "transfer") {
        const { source, destination, lamports } = parsed.info;

        // Check if both source and destination are in the wallet set
        if (
          walletSet.has(source) &&
          walletSet.has(destination) &&
          source !== destination
        ) {
          // Determine if it's native SOL or SPL token
          const splOrNative =
            programId.toString() === "11111111111111111111111111111111" ? 1 : 0;

          // Convert lamports to SOL
          const amountInSol = (lamports / 1_000_000_000).toFixed(9);

          // Create the log entry
          const logEntry = `[${source}] => [${destination}] | amt:${amountInSol} splOrNative:${splOrNative} tx:${tx.transaction.signatures[0]}`;

          console.log(logEntry);
          logToFile("filtered_transactions.txt", logEntry);
          filteredCount++;
        }
      }
    }
  }

  if (filteredCount === 0) {
    console.log(`No relevant transactions found.`);
    logToFile("filtered_transactions.txt", `No relevant transactions found.`);
  }
}

// Main function to process wallets
async function main(filePath, depth, delay) {
  const wallets = fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (wallets.length === 0) {
    console.error("No wallet addresses found in the file.");
    process.exit(1);
  }

  const walletSet = new Set(wallets);

  for (const wallet of wallets) {
    await fetchAndProcessTransactions(wallet, walletSet, depth, delay);
  }
}

// Script execution
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(
    "Usage: node gator-cli.js <wallets_file> <depth> [delay_in_ms]"
  );
  process.exit(1);
}

const filePath = args[0];
const depth = parseInt(args[1], 10);
const delay = args.length > 2 ? parseInt(args[2], 10) : 2000;

if (isNaN(depth) || depth <= 0) {
  console.error("Depth must be a positive number.");
  process.exit(1);
}

if (isNaN(delay) || delay < 0) {
  console.error("Delay must be a non-negative number.");
  process.exit(1);
}

main(filePath, depth, delay);
