import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [ipAddresses, setIpAddresses] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/check-ip', { ip: ipAddresses });
      setResults(response.data);
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>IP Checker</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="ip">Enter IP Addresses (one per line):</label>
        </div>
        <div>
          <textarea
            id="ip"
            value={ipAddresses}
            onChange={(e) => setIpAddresses(e.target.value)}
            rows="10"
            cols="30"
            required
          ></textarea>
        </div>
        <div>
          <button type="submit">Check IPs</button>
        </div>
      </form>
      {error && <p>{error}</p>}
      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>IP Address</th>
              <th>Risk</th>
              <th>Score</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td width={120}>{result.ip}</td>
                <td width={100}>{result.risk}</td>
                <td width={140}>{result.score}</td>
                <td>{result.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
