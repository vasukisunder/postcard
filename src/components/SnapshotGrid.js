import React from 'react';
import Snapshot from './Snapshot';

function SnapshotGrid({ snapshots }) {
  if (snapshots.length === 0) {
    return (
      <div className="empty-grid">
        <p>No snapshots captured yet. Click the button above to capture the world right now!</p>
      </div>
    );
  }
  
  return (
    <div className="snapshots-grid">
      {snapshots.map((snapshot) => (
        <Snapshot key={snapshot.id} data={snapshot} />
      ))}
    </div>
  );
}

export default SnapshotGrid; 