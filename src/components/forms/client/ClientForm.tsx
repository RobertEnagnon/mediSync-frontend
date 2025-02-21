import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Grid, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
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
  const { control, handleSubmit, formState: { errors } } = useForm<CreateClientDto>({
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="firstName"
            control={control}
            rules={{ required: 'Le prénom est requis' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Prénom"
                fullWidth
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="lastName"
            control={control}
            rules={{ required: 'Le nom est requis' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nom"
                fullWidth
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'L\'email est requis',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Le téléphone est requis' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Téléphone"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Date de naissance"
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.birthDate,
                    helperText: errors.birthDate?.message
                  }
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Adresse"
                fullWidth
                multiline
                rows={2}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notes"
                fullWidth
                multiline
                rows={3}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            {onCancel && (
              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
              >
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              {initialData._id ? 'Modifier' : 'Créer'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};
