import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { clientService } from '@/services/api/clientService';
import appointmentService from '@/services/api/appointmentService';

// Schéma de validation pour les factures
const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  appointmentId: z.string().min(1, 'Rendez-vous requis'),
  items: z.array(z.object({
    description: z.string().min(1, 'Description requise'),
    quantity: z.number().min(1, 'Quantité minimale de 1'),
    unitPrice: z.number().min(0, 'Prix unitaire invalide')
  })).min(1, 'Au moins un élément requis')
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  initialData?: InvoiceFormData;
  onSubmit: (data: InvoiceFormData) => void;
  isLoading?: boolean;
}

export default function InvoiceForm({ initialData, onSubmit, isLoading }: InvoiceFormProps) {
  // Configuration du formulaire
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData || {
      clientId: '',
      appointmentId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }]
    }
  });

  // Configuration du tableau d'éléments
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  // Récupération des clients
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll()
  });

  // Récupération des rendez-vous
  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAll()
  });

  // Calcul du total
  const total = form.watch('items').reduce((sum, item) => {
    return sum + (item.quantity * (item.unitPrice || 0));
  }, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sélection du client */}
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    {clients?.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sélection du rendez-vous */}
          <FormField
            control={form.control}
            name="appointmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rendez-vous</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                 
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rendez-vous" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    {appointments?.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {appointment.startTime ? format(appointment.startTime, 'PPP', { locale: fr }) : 'Date non définie'} - {appointment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Liste des éléments de la facture */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Éléments de la facture</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un élément
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix unitaire (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => remove(index)}
                  disabled={isLoading || fields.length === 1}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="bg-secondary p-4 rounded-lg">
            <span className="font-medium">Total : </span>
            <span className="text-xl font-bold">{total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer la facture'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
