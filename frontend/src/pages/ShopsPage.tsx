"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Store } from 'lucide-react';
import ShopForm, { ShopFormData } from '@/components/ShopForm';

interface Shop {
  id: string;
  name: string;
  address?: string;
}

const ShopsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('shops').select('*');
    if (error) {
      showErrorToast(`Erreur lors du chargement des boutiques : ${error.message}`);
      console.error('Error fetching shops:', error);
    } else {
      setShops(data || []);
    }
    setLoading(false);
  };

  const handleAddShop = async (values: ShopFormData) => {
    setIsSubmitting(true);
    const { data, error } = await supabase.from('shops').insert(values).select();
    if (error) {
      showErrorToast(`Erreur lors de l'ajout de la boutique : ${error.message}`);
      console.error('Error adding shop:', error);
    } else {
      showSuccessToast('Boutique ajoutée avec succès !');
      setShops((prev) => [...prev, data[0]]);
      setIsFormOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleEditShop = async (values: ShopFormData) => {
    if (!editingShop?.id) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.from('shops').update(values).eq('id', editingShop.id).select();
    if (error) {
      showErrorToast(`Erreur lors de la modification de la boutique : ${error.message}`);
      console.error('Error updating shop:', error);
    } else {
      showSuccessToast('Boutique modifiée avec succès !');
      setShops((prev) => prev.map((shop) => (shop.id === editingShop.id ? data[0] : shop)));
      setIsFormOpen(false);
      setEditingShop(undefined);
    }
    setIsSubmitting(false);
  };

  const handleDeleteShop = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) return;
    const { error } = await supabase.from('shops').delete().eq('id', id);
    if (error) {
      showErrorToast(`Erreur lors de la suppression de la boutique : ${error.message}`);
      console.error('Error deleting shop:', error);
    } else {
      showSuccessToast('Boutique supprimée avec succès !');
      setShops((prev) => prev.filter((shop) => shop.id !== id));
    }
  };

  const openAddForm = () => {
    setEditingShop(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (shop: Shop) => {
    setEditingShop(shop);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingShop(undefined);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-8 w-8" /> Gestion des Boutiques
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une boutique
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingShop ? 'Modifier la boutique' : 'Ajouter une nouvelle boutique'}</DialogTitle>
              <DialogDescription>
                {editingShop ? 'Modifiez les détails de la boutique.' : 'Remplissez les informations pour ajouter une nouvelle boutique.'}
              </DialogDescription>
            </DialogHeader>
            <ShopForm
              initialData={editingShop}
              onSubmit={editingShop ? handleEditShop : handleAddShop}
              isSubmitting={isSubmitting}
              onCancel={closeForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Chargement des boutiques...</p>
      ) : shops.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucune boutique trouvée. Ajoutez-en une pour commencer !</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des Boutiques</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.address || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditForm(shop)} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteShop(shop.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShopsPage;