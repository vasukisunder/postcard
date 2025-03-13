import React from 'react';

function Snapshot({ data }) {
  const formattedTime = new Date(data.timestamp).toLocaleString();
  
  return (
    <div className="snapshot receipt">
      <div className="receipt-content">
        {data.earthImage && (
          <div className="earth-image">
            <img 
              src={data.earthImage} 
              alt="Earth from space" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400?text=Earth+Image+Unavailable';
              }}
            />
          </div>
        )}
        
        <pre className="receipt-text">
          {data.receiptText}
        </pre>
        
        <div className="receipt-footer">
          <div className="timestamp">{formattedTime}</div>
          <div className="barcode">||||||||||||||||</div>
        </div>
      </div>
    </div>
  );
}

export default Snapshot; 