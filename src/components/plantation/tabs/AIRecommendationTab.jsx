import React from 'react';
import AiAnalysisModule from '../../ai/AiAnalysisModule';

const AIRecommendationTab = ({ plantation }) => {
  return (
    <div className="space-y-6">
      <AiAnalysisModule plantation={plantation} hideHeader={true} />
    </div>
  );
};

export default AIRecommendationTab;
