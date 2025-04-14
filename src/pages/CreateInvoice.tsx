import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { invoiceService } from '@/services/api/invoiceService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InvoiceForm from '@/components/Invoices/InvoiceForm';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mutation pour créer une facture
  const createMutation = useMutation({
    mutationFn: (data: any) => invoiceService.create(data),
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Facture créée avec succès',
      });
      navigate('/invoices');
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la facture',
        variant: 'destructive',
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/invoices')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux factures
          </Button>
        </div>
      </div>

      {/* Titre */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Créer une facture</h2>
        <p className="text-muted-foreground">
          Remplissez les informations ci-dessous pour créer une nouvelle facture.
        </p>
      </div>

      {/* Formulaire */}
      <InvoiceForm
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isLoading}
      />
    </div>
  );
}
