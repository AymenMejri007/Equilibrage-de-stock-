"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import UpdatePasswordForm from '@/components/UpdatePasswordForm';
import { z } from 'zod';

const updatePasswordSchema = z.object({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  confirmPassword: z.string().min(6, "Veuillez confirmer votre mot de passe."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const UpdatePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [loadingToken, setLoadingToken] = useState(true);

  useEffect(() => {
    // Supabase automatically handles the session from the URL hash after a password reset email click.
    // We just need to check if a user is currently logged in (which would happen if the token is valid).
    const checkSession = async () => {
      setLoadingToken(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        setIsValidToken(true);
      } else {
        showErrorToast("Lien de réinitialisation invalide ou expiré.");
        navigate('/forgot-password'); // Redirect if token is invalid or expired
      }
      setLoadingToken(false);
    };

    // This page is typically accessed after clicking a link in an email,
    // which will set the session in the client.
    // We don't need to manually parse the access_token from the URL hash here,
    // as Supabase's onAuthStateChange listener in AuthProvider handles it.
    // However, we should ensure the user is actually authenticated to proceed.
    checkSession();
  }, [navigate]);

  const handleUpdatePassword = async (values: z.infer<typeof updatePasswordSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      showSuccessToast('Votre mot de passe a été mis à jour avec succès !');
      navigate('/login'); // Redirect to login after successful password update
    } catch (error: any) {
      showErrorToast(`Erreur lors de la mise à jour du mot de passe : ${error.message}`);
      console.error('Update password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingToken) {
    return <div className="text-center p-8">Vérification du lien de réinitialisation...</div>;
  }

  if (!isValidToken) {
    return null; // Should redirect by now
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center">Définir un nouveau mot de passe</h2>
        <UpdatePasswordForm onSubmit={handleUpdatePassword} isSubmitting={isSubmitting} />
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;