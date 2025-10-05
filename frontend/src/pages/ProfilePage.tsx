"use client";

import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccessToast('Déconnexion réussie !');
      navigate('/login');
    } catch (error: any) {
      showErrorToast(`Erreur de déconnexion : ${error.message}`);
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Chargement du profil...</div>;
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-destructive">Vous n'êtes pas connecté.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center">Mon Profil</h2>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          {/* Vous pouvez ajouter d'autres informations utilisateur ici */}
        </div>
        <Button onClick={handleLogout} className="w-full" variant="destructive">
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;