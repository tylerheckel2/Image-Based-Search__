
// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

function App() {
  const [file, setFile] = useState(null);
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setErrorMsg('');
    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const onSearch = async () => {
    if (!file) {
      setErrorMsg('Please choose an image first.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setResults([]);

    try {
      const form = new FormData();
      form.append('file', file);
      const url = `${API_BASE}/search?k=${topK}`;
      const res = await axios.post(url, form);
      setResults(res.data.results || []);
    } catch (err) {
      if (err.response) {
            // Server responded with status code outside 2xx
            setErrorMsg(`HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
            console.error('Axios response error', err.response);
          } else if (err.request) {
            // Request made but no response received (network/CORS)
            setErrorMsg('Network Error (no response). Check CORS/URL/server.');
            console.error('Axios request error', err.request);
          } else {
            // Something else triggered the error
            setErrorMsg(`Error: ${err.message}`);
            console.error('Axios config error', err.message);
          }
        } finally {
          setLoading(false);
        }

        };

  return (
    <div className="container">
      <h1>Image-Based Search</h1>

      <div className="controls">
        <input type="file" accept="image/*" onChange={onFileChange} />
        <label>
          Top-K:
          <input
            type="number"
            min="1"
            max="20"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value, 10))}
          />
        </label>
        <button onClick={onSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {previewUrl && (
        <div className="preview">
          <h3>Query Image</h3>
          <img src={previewUrl} alt="query preview" />
        </div>
      )}

      {errorMsg && <div className="error">{errorMsg}</div>}

      <div className="results">
        {results.map((item) => (
          <div className="card" key={`${item.index}-${item.rank}`}>
            <img src={item.image_url} alt={item.filename || 'match'} />
            <div className="meta">
              <div className="filename">{item.filename || 'Unknown'}</div>
              <div className="distance">Distance: {item.distance.toFixed(4)}</div>
              <div className="rank">Rank #{item.rank}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
