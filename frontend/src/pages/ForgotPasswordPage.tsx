"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true);
    setEmailSent(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/update-password`, // Redirect to a page where user can set new password
      });

      if (error) throw error;

      showSuccessToast('Un lien de réinitialisation a été envoyé à votre adresse email !');
      setEmailSent(true);
    } catch (error: any) {
      showErrorToast(`Erreur : ${error.message}`);
      console.error('Forgot password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center">Mot de passe oublié ?</h2>
        {emailSent ? (
          <p className="text-center text-muted-foreground">
            Si un compte existe avec cette adresse email, un lien de réinitialisation vous a été envoyé. Veuillez vérifier votre boîte de réception.
          </p>
        ) : (
          <ForgotPasswordForm onSubmit={handleForgotPassword} isSubmitting={isSubmitting} />
        )}
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;