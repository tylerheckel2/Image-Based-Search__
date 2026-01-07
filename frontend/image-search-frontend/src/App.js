
// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

function App() {
  const [file, setFile] = useState(null);
  const [topK, setTopK] = useState(5);
  const [metric, setMetric] = useState('l2'); // 'l2' or 'cosine'
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
      const url = `${API_BASE}/search?k=${topK}&metric=${metric}`;
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

        <label className="metric-label">
          Metric:
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="l2">L2</option>
            <option value="cosine">Cosine</option>
          </select>

          {/* Small help icon / tooltip */}
          {/* <span className="help-icon" title="Click to learn more">?</span> */}
          {/* <div className="help-popover">
            <strong>What’s the difference?</strong>
            <ul>
              <li>
                <strong>L2 (Euclidean distance)</strong> measures the straight‑line distance
                between feature vectors. Good when the <em>magnitude</em> of features matters.
              </li>
              <li>
                <strong>Cosine</strong> measures the <em>angle</em> between feature vectors (orientation),
                ignoring magnitude. Good for comparing overall <em>pattern/shape</em> of features.
              </li>
            </ul>
            <p style={{ marginTop: 8 }}>
              <strong>Rule of thumb:</strong> Try <code>cosine</code> for general image similarity (robust to lighting/scale).  
              Use <code>L2</code> if absolute feature values are meaningful for your dataset.
            </p>
          </div> */}
        </label>

        <button onClick={onSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="info-box">
        <strong>Metric guide:</strong> L2 compares raw distances between embeddings; Cosine compares their orientation.  
        Cosine is often more stable for images because it focuses on feature direction, not magnitude.
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
