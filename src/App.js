import React, { useState } from 'react';
import Snapshot from './components/Snapshot';
import './styles.css';

function App() {
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const captureNewSnapshot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/capture-snapshot');
      const newSnapshot = await response.json();
      setCurrentSnapshot(newSnapshot);
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
    }
    setLoading(false);
  };

  const goHome = () => {
    setCurrentSnapshot(null);
  };
  
  return (
    <div className="app-container">
      {!currentSnapshot ? (
        <div className="homepage">
          <button 
            className="capture-button"
            onClick={captureNewSnapshot} 
            disabled={loading}
          >
            {loading ? 'Capturing...' : 'Capture Moment'}
          </button>
        </div>
      ) : (
        <div className="snapshot-view">
          <Snapshot data={currentSnapshot} />
          <div className="snapshot-actions">
            <button 
              className="home-button"
              onClick={goHome}
            >
              Back Home
            </button>
            <button 
              className="capture-button"
              onClick={captureNewSnapshot} 
              disabled={loading}
            >
              {loading ? 'Capturing...' : 'New Capture'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 