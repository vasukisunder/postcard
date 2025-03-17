import React from 'react';

function Snapshot({ data }) {
  const formattedTime = new Date(data.timestamp).toLocaleString();
  const imageLocation = data.dataPoints.image.raw.location;
  
  // Add these console logs to see what data we're getting
  console.log('Full data:', data);
  console.log('Image data:', data.dataPoints.image);
  
  const imageCaption = data.dataPoints.image.raw.description;
  
  // Parse the receipt text into separate data points
  const lines = data.receiptText.split('\n').filter(line => line.trim() !== '');
  
  return (
    <div className="snapshot">
      {/* Left side - Image */}
      <div className="earth-image">
        <img 
          src={data.earthImage}
          alt="Featured landscape"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/600x400?text=Image+Unavailable';
          }}
        />
      </div>

      {/* Right side - Information */}
      <div className="postcard-content">
        <div className="postcard-header">
          <div className="current-time">{data.localTime}</div>
          <div className="greeting">Greetings from Earth!</div>
        </div>

        <div className="data-section">
          {lines.map((line, index) => {
            // Skip empty lines and the header/footer lines
            if (
              line.includes("It is") ||
              line.includes("This is what") ||
              line.includes("Captured at") ||
              line.includes("End of Earth snapshot") ||
              line.trim() === ""
            ) {
              return null;
            }

            return (
              <div key={index} className="data-item">
                {line}
              </div>
            );
          })}
        </div>

        <div className="postcard-footer">
          <div className="image-location">Photo location: {imageLocation}</div>
          <div className="timestamp">Captured at {formattedTime}</div>
        </div>
      </div>
    </div>
  );
}

export default Snapshot; 