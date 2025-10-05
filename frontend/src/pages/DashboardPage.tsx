"use client";

import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StockOverviewDashboard from '@/components/StockOverviewDashboard'; // Import the new component

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-foreground mb-6">Tableau de Bord</h1>
      <p className="text-muted-foreground mb-8">Bienvenue sur votre tableau de bord, {user?.email || 'utilisateur'} !</p>

      <StockOverviewDashboard /> {/* Render the new stock overview dashboard */}

      {/* Keep existing cards or remove them if the new dashboard replaces their purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ceci est un aperçu de vos activités récentes.</p>
            <p className="text-sm text-muted-foreground mt-2">Plus de fonctionnalités à venir...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projets en Cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Vous avez 3 projets actifs.</p>
            <p className="text-sm text-muted-foreground mt-2">Gérez vos projets ici.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Aucune nouvelle notification pour le moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Restez informé des mises à jour.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;