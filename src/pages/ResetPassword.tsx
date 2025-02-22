import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import authService  from '@/services/api/authService';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: 'Erreur',
        description: 'Token de réinitialisation manquant',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: 'Mot de passe invalide',
        description: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({ token, newPassword: password });
      setIsSuccess(true);
      toast({
        title: 'Succès',
        description: 'Votre mot de passe a été réinitialisé avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la réinitialisation du mot de passe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Mot de passe réinitialisé</h2>
            <p className="text-gray-600 mb-6">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Aller à la page de connexion
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
            Réinitialisation du mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <Alert>
          <AlertDescription>
            Le mot de passe doit contenir au moins :
            <ul className="list-disc list-inside mt-2">
              <li>8 caractères</li>
              <li>Une lettre majuscule</li>
              <li>Une lettre minuscule</li>
              <li>Un chiffre</li>
              <li>Un caractère spécial</li>
            </ul>
          </AlertDescription>
        </Alert>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 pr-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
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

export default ResetPassword;
