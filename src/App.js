import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [ipAddresses, setIpAddresses] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [proxytype, setType] = useState('http');
  const [isLoading, setIsLoading] = useState(false); // Add state variable for loading

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    //setIpAddresses(null)
    setIsLoading(true); // Set loading to true when fetching data

    try {
      const response = await axios.post("/check-ip", {
        ip: ipAddresses,
        proxytype: proxytype
      });
      const res = [];
      response.data.location.forEach((element, index) => {
        const risk = response.data.risk[index];
        const state = response.data.state.flat()[index];
        res.push({
          ...element,
          ...risk,
          ...state,
        })
      });
      console.log(res);
      setResults(res);
      return;
    } catch (err) {
      setError(
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setIsLoading(false); // Set loading to false when data is fetched
    }
  };

  return (
    <div className="App">
      <h1>IP Checker(AlbertSibiga)</h1>
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
          <button type="submit" disabled={isLoading}>Check IPs</button> {/* Disable button when loading */}
          <select value={proxytype} onChange={e => setType(e.target.value)}>
            <option value={'http'}>HTTP</option>
            <option value={'socks4'}>SOCKS4</option>
            <option value={'socks5'}>SOCKS5</option>
          </select>
        </div>
      </form>
      {isLoading && <p>Loading...</p>} {/* Show loading spinner when loading */}
      {error && <p>{error}</p>}
      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>IP Address</th>
              <th>PORT</th>
              <th>Location</th>
              <th>Type</th>
              <th>Risk</th>
              <th>Score</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.ip}</td>
                <td>{result.port}</td>
                <td width={120}>
                  <img src={result.country_flag} width={14} />
                  {result.country}
                </td>
                <td width={80}>{proxytype}</td>
                <td width={100}>{result.risk}</td>
                <td width={120}>{result.score}</td>
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
