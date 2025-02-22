import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService  from '@/services/api/authService';
import { UserRole } from '@/types/user';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'practitioner' as UserRole,
    specialization: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      toast({
        title: 'Mot de passe invalide',
        description: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await authService.register(registerData);
      setIsSuccess(true);
      toast({
        title: 'Inscription réussie',
        description: 'Un email de vérification a été envoyé à votre adresse email. Veuillez cliquer sur le lien dans l\'email pour activer votre compte.',
      });
      navigate('/registration-success', { state: { email: formData.email } });
    } catch (error) {
      toast({
        title: 'Erreur d\'inscription',
        description: 'Une erreur est survenue lors de l\'inscription',
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
            <h2 className="text-2xl font-bold mb-4">Vérifiez votre email</h2>
            <p className="text-gray-600 mb-6">
              Un email de vérification a été envoyé à <strong>{formData.email}</strong>.
              <br /><br />
              Veuillez cliquer sur le lien dans l'email pour activer votre compte. Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre dossier spam.
            </p>
            <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
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
            Créer un compte
          </h2>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="exemple@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
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
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="••••••••"
            />
          </div>

          <div>
            <Label>Rôle</Label>
            <Select onValueChange={handleRoleChange} value={formData.role}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practitioner">Praticien</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'practitioner' && (
            <div>
              <Label htmlFor="specialization">Spécialisation</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="mt-1"
                placeholder="Ex: Médecin généraliste"
              />
            </div>
          )}

          <div>
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1"
              placeholder="Ex: 06 12 34 56 78"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Se connecter
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Register;