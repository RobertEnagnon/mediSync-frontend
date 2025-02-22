import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import authService  from '@/services/api/authService';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      setIsSubmitted(true);
      toast({
        title: 'Email envoyé',
        description: 'Si un compte existe avec cet email, vous recevrez les instructions pour réinitialiser votre mot de passe.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de l\'email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Email envoyé</h2>
            <p className="text-gray-600 mb-6">
              Si un compte existe avec l'adresse {email}, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Retour à la connexion
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="exemple@email.com"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Envoi en cours...' : 'Envoyer les instructions'}
          </Button>
          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
