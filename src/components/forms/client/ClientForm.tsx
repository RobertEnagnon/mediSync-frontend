import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { IClient, CreateClientDto } from '../../../types/client';

interface ClientFormProps {
  initialData?: Partial<IClient>;
  onSubmit: (data: CreateClientDto) => void;
  onCancel?: () => void;
}

/**
 * Composant de formulaire pour la création/modification d'un client
 */
export const ClientForm: React.FC<ClientFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel
}) => {
  const form = useForm<CreateClientDto>({
    defaultValues: {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      birthDate: initialData.birthDate ? new Date(initialData.birthDate) : undefined,
      address: initialData.address || '',
      notes: initialData.notes || ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            rules={{ required: 'Le prénom est requis' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            rules={{ required: 'Le nom est requis' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: 'L\'email est requis',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide'
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            rules={{ required: 'Le téléphone est requis' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="birthDate"
          rules={{ required: 'La date de naissance est requise' }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de naissance</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={`w-full pl-3 text-left font-normal ${!field.value && 'text-muted-foreground'}`}
                    >
                      {field.value ? (
                        format(field.value, 'P', { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          rules={{ required: 'L\'adresse est requise' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="123 rue de la Paix, 75000 Paris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes additionnelles sur le client..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit">
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
