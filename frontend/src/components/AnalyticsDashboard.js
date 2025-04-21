// AnalyticsDashboard.js
// Dashboard for hosts to view analytics (placeholder)
import React from 'react';

function AnalyticsDashboard({ data }) {
  return (
    <div>
      <h3>Analytics Dashboard</h3>
      {/* TODO: Display analytics data (charts, tables, etc.) */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* Future: Add charts for booking rates, revenue, enhancement usage, etc. */}
    </div>
  );
}

export default AnalyticsDashboard;
