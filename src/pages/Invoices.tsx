import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceService, Invoice } from '@/services/api/invoiceService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText,
  Download,
  MoreVertical,
  Plus,
  Search,
  Filter,
  CreditCard,
  Ban,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'bg-yellow-500',
  paid: 'bg-green-500',
  cancelled: 'bg-red-500'
};

const statusLabels = {
  pending: 'En attente',
  paid: 'Payée',
  cancelled: 'Annulée'
};

const InvoiceStatusBadge = ({ status }: { status: Invoice['status'] }) => (
  <Badge className={statusColors[status]}>
    {statusLabels[status]}
  </Badge>
);

const Invoices = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<Invoice['status'] | 'all'>('all');

  // Récupération des factures
  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.getAll()
  });

  // Filtrage des factures
  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(invoice => {
      const matchesSearch = (
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.total.toString().includes(searchTerm)
      );
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Gestion du téléchargement
  const handleDownload = async (invoice: Invoice) => {
    try {
      const blob = await invoiceService.downloadPdf(invoice._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${invoice.invoiceNumber}.pdf`;
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

  // Marquer comme payée
  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await invoiceService.markAsPaid(invoice._id, 'card');
      refetch();
      toast({
        title: 'Succès',
        description: 'Facture marquée comme payée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la facture comme payée',
        variant: 'destructive',
      });
    }
  };

  // Annuler une facture
  const handleCancel = async (invoice: Invoice) => {
    try {
      await invoiceService.cancel(invoice._id);
      refetch();
      toast({
        title: 'Succès',
        description: 'Facture annulée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler la facture',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Factures</CardTitle>
              <CardDescription>Gérez vos factures et suivez les paiements</CardDescription>
            </div>
            <Button onClick={() => navigate('/invoices/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une facture..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  Tous
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  En attente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('paid')}>
                  Payées
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                  Annulées
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice._id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    {format(new Date(invoice.createdAt), 'PP', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {/* À implémenter: afficher le nom du client */}
                    Client {invoice.clientId}
                  </TableCell>
                  <TableCell>{invoice.total.toFixed(2)} €</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </DropdownMenuItem>
                        {invoice.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Marquer comme payée
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCancel(invoice)}
                              className="text-red-600"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Annuler
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
