import React from 'react';
import SupervisorDashboard from '../../workforce/SupervisorDashboard';

const WorkersTab = ({ plantation, onUpdateWorkers }) => {
  const p = plantation;

  return (
    <div className="space-y-6">
      <SupervisorDashboard plantationId={p?._id || 'default_plantation_id'} />
    </div>
  );
};

export default WorkersTab;
