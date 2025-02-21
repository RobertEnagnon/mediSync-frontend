import { useState, useEffect } from 'react';
import { FileText, Download, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface InvoiceManagerProps {
  clientId: string;
  appointmentId?: string;
}

export const InvoiceManager = ({ clientId, appointmentId }: InvoiceManagerProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, [clientId]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/invoices`);
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les factures',
        variant: 'destructive',
      });
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          appointmentId,
          items,
        }),
      });
      const data = await response.json();
      setInvoices([data, ...invoices]);
      setDialogOpen(false);
      toast({
        title: 'Succès',
        description: 'Facture créée avec succès',
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la facture',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger la facture',
        variant: 'destructive',
      });
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Factures</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une facture</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Prix unitaire</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addItem}>
                Ajouter un élément
              </Button>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  Total: {calculateTotal().toFixed(2)} €
                </p>
              </div>
              <Button type="submit" className="w-full">
                Créer la facture
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice._id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-lg font-semibold">{invoice.total.toFixed(2)} €</p>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {invoice.status === 'paid'
                    ? 'Payée'
                    : invoice.status === 'cancelled'
                    ? 'Annulée'
                    : 'En attente'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(invoice._id)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
