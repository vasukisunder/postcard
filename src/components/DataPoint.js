import React from 'react';

function DataPoint({ type, data }) {
  if (!data) return null;
  
  const getTitle = () => {
    switch(type) {
      case 'weather': return 'Weather';
      case 'news': return 'Latest News';
      case 'webcam': return 'Live Webcam';
      case 'space': return 'Space View';
      case 'earthquake': return 'Latest Earthquake';
      case 'finance': return 'Financial Update';
      case 'radio': return 'Now Playing';
      case 'wikipedia': return 'Wikipedia Activity';
      default: return type;
    }
  };
  
  return (
    <div className={`data-point ${type}`}>
      <h4>{getTitle()}</h4>
      {data.image && (
        <div className="data-image">
          <img src={data.image} alt={getTitle()} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Unavailable';
            }}
          />
        </div>
      )}
      <div className="data-text">
        {data.text}
        {data.source && <div className="data-source">Source: {data.source}</div>}
        {data.location && <div className="data-location">Location: {data.location}</div>}
      </div>
    </div>
  );
}

export default DataPoint; 