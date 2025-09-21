import React from 'react';

function ProgressBar({ current, total }) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="progress-bar">
      <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
    </div>
  );
}

export default ProgressBar;
