import React from 'react';
import CardoraFertilizerAdvisor from '../../ai/CardoraFertilizerAdvisor';
import AiAnalysisModule from '../../ai/AiAnalysisModule';

const AIRecommendationTab = ({ plantation }) => {
  return (
    <div className="space-y-6">
      <CardoraFertilizerAdvisor plantation={plantation} />
      <AiAnalysisModule plantation={plantation} hideHeader={true} />
    </div>
  );
};

export default AIRecommendationTab;
