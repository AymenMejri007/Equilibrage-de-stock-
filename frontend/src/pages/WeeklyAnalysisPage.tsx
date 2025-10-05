"use client";

import React from 'react';
import WeeklyAnalysisDisplay from '@/components/WeeklyAnalysisDisplay';

const WeeklyAnalysisPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-foreground mb-6">Analyse Hebdomadaire</h1>
      <p className="text-muted-foreground mb-8">
        Consultez les résultats de l'analyse automatique de stock et gérez les propositions de transfert.
      </p>
      <WeeklyAnalysisDisplay />
    </div>
  );
};

export default WeeklyAnalysisPage;