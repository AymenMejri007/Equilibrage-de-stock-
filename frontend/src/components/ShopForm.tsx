"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const shopFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom de la boutique est requis."),
  address: z.string().optional(),
});

export type ShopFormData = z.infer<typeof shopFormSchema>;

interface ShopFormProps {
  initialData?: ShopFormData;
  onSubmit: (values: ShopFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const ShopForm: React.FC<ShopFormProps> = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
  const form = useForm<ShopFormData>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: initialData || {
      name: "",
      address: "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la boutique</FormLabel>
              <FormControl>
                <Input placeholder="Nom de la boutique" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Adresse de la boutique" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} type="button" disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ShopForm;