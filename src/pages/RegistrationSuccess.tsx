import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Vérifiez votre email</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Pour finaliser votre inscription, veuillez vérifier votre boîte de réception à l'adresse
              {email && <strong className="block mt-1">{email}</strong>}
            </p>
            <p>
              Nous vous avons envoyé un email contenant un lien de vérification.
              Cliquez sur ce lien pour activer votre compte.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Conseil :</strong> Si vous ne trouvez pas l'email dans votre boîte de réception,
                vérifiez votre dossier spam ou courrier indésirable.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://gmail.com', '_blank')}
          >
            Ouvrir Gmail
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://outlook.live.com', '_blank')}
          >
            Ouvrir Outlook
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="text-center text-sm">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-500"
            >
              Retour à la page de connexion
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
