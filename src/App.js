import React, { useState } from 'react';
import Snapshot from './components/Snapshot';
import './styles.css';

function App() {
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const captureNewSnapshot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/server.js/api/capture-snapshot');
      const newSnapshot = await response.json();
      setCurrentSnapshot(newSnapshot);
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
    }
    setLoading(false);
  };
  
  const closeSnapshot = () => {
    setCurrentSnapshot(null);
  };
  
  return (
    <div className="app-container">
      {!currentSnapshot ? (
        // Homepage view
        <div className="homepage">
          <h1>World Snapshot</h1>
          <p>Capture a moment in time from around the world</p>
          <button 
            className="capture-button"
            onClick={captureNewSnapshot} 
            disabled={loading}
          >
            {loading ? 'Generating Receipt...' : 'Print World Receipt'}
          </button>
        </div>
      ) : (
        // Snapshot view
        <div className="snapshot-view">
          <Snapshot data={currentSnapshot} />
          <div className="snapshot-actions">
            <button className="close-button" onClick={closeSnapshot}>
              Return Home
            </button>
            <button 
              className="capture-button"
              onClick={captureNewSnapshot} 
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Take New Snapshot'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 