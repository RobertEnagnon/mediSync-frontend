import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import authService  from '@/services/api/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        toast({
          title: 'Erreur de vérification',
          description: 'Token de vérification manquant',
          variant: 'destructive',
        });
        setIsVerifying(false);
        return;
      }

      try {
        // await authService.verifyEmail({ token });
        await authService.verifyEmail(token );
        setIsSuccess(true);
        toast({
          title: 'Compte vérifié',
          description: 'Votre compte a été vérifié avec succès',
        });
      } catch (error) {
        toast({
          title: 'Erreur de vérification',
          description: 'Le lien de vérification est invalide ou a expiré',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, toast]);

  const handleRedirect = () => {
    navigate('/login');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8 space-y-4">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">
              Vérification de votre compte
            </h2>
            <p className="text-gray-500">
              Veuillez patienter pendant que nous vérifions votre compte...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {isSuccess ? 'Compte vérifié' : 'Erreur de vérification'}
          </h2>
          <p className="text-gray-500">
            {isSuccess
              ? 'Votre compte a été vérifié avec succès. Vous pouvez maintenant vous connecter.'
              : 'Le lien de vérification est invalide ou a expiré. Veuillez réessayer ou contacter le support.'}
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={handleRedirect}>
            {isSuccess ? 'Se connecter' : 'Retour à la connexion'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
