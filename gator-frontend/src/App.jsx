import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [wallet1, setWallet1] = useState("");
  const [wallet2, setWallet2] = useState("");
  const [depth, setDepth] = useState(10);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!wallet1 || !wallet2 || depth <= 0) {
      setError("Please provide valid inputs.");
      return;
    }

    setLoading(true);
    setTransactions([]);
    setError(null);

    try {
      // the fetch function needs the backend server to be running, and the correct API endpoint to fetch the data.
      // make sure to replace the URL with the correct one that you're using.
      const response = await fetch("http://localhost:3000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet1, wallet2, depth }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch transactions.");
      }

      const data = await response.json();
      setTransactions(data.transactions);

      if (data.transactions.length === 0) {
        setError("No relevant transactions found.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="form-box">
        <h2>Check Wallet Transaction History</h2>
        <input
          type="text"
          placeholder="Enter Wallet 1 Address"
          value={wallet1}
          onChange={(e) => setWallet1(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Wallet 2 Address"
          value={wallet2}
          onChange={(e) => setWallet2(e.target.value)}
        />
        <input
          type="number"
          placeholder="Number of Transactions"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          min="1"
        />
        <button onClick={handleSubmit}>Submit</button>
        {loading && <div className="loader"></div>}
      </div>

      <div className="results-box">
        {error && <div className="error-message">{error}</div>}
        {transactions.length > 0 && !error && (
          <ul>
            {transactions.map((tx, index) => (
              <li key={index}>
                {tx.source} → {tx.destination} | Amount: {tx.amount} | Type:{" "}
                {tx.type} | TX ID: {tx.txId}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
