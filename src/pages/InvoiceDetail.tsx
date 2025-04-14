import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/api/invoiceService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Download,
  CreditCard,
  Ban,
  ArrowLeft,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des détails de la facture
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getById(id!),
    enabled: !!id
  });

  // Mutation pour marquer comme payée
  const markAsPaidMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceService.markAsPaid(invoiceId, 'card'),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoice', id]);
      toast({
        title: 'Succès',
        description: 'Facture marquée comme payée',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la facture comme payée',
        variant: 'destructive',
      });
    }
  });

  // Mutation pour annuler
  const cancelMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceService.cancel(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoice', id]);
      toast({
        title: 'Succès',
        description: 'Facture annulée',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler la facture',
        variant: 'destructive',
      });
    }
  });

  // Gestion du téléchargement
  const handleDownload = async () => {
    try {
      const blob = await invoiceService.downloadPdf(id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${invoice?.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger la facture',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Facture non trouvée</h2>
            <p className="text-muted-foreground mt-2">
              La facture que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate('/invoices')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux factures
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate('/invoices')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux factures
        </Button>

        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
          
          {invoice.status === 'pending' && (
            <>
              <Button
                variant="default"
                onClick={() => markAsPaidMutation.mutate(invoice.id)}
                disabled={markAsPaidMutation.isLoading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Marquer comme payée
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate(invoice.id)}
                disabled={cancelMutation.isLoading}
              >
                <Ban className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle>Facture #{invoice.invoiceNumber}</CardTitle>
          <CardDescription>
            Créée le {format(new Date(invoice.createdAt), 'PPP', { locale: fr })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {invoice.clientId.firstName} {invoice.clientId.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.clientId.email}
                </p>
                {invoice.clientId.phone && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.clientId.phone}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Informations rendez-vous */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {format(new Date(invoice.appointmentId.date), 'PPP', { locale: fr })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.appointmentId.type}
                </p>
              </CardContent>
            </Card>

            {/* Statut */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Statut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}
                >
                  {invoice.status === 'paid' ? 'Payée' :
                    invoice.status === 'cancelled' ? 'Annulée' :
                    'En attente'}
                </div>
                {invoice.status === 'paid' && invoice.paidAt && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Payée le {format(new Date(invoice.paidAt), 'PPP', { locale: fr })}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Détails des éléments */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unitPrice.toFixed(2)} €</TableCell>
                      <TableCell className="text-right">
                        {(item.quantity * item.unitPrice).toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {invoice.total.toFixed(2)} €
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
