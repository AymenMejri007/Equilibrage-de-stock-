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
import { PlusCircle, Edit, Trash2, Package } from 'lucide-react';
import ProductForm, { ProductFormData } from '@/components/ProductForm';

interface Product {
  id: string;
  code_article: string;
  libelle: string;
  marque?: string;
  categorie?: string;
  sous_categorie?: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('articles').select('*');
    if (error) {
      showErrorToast(`Erreur lors du chargement des articles : ${error.message}`);
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleAddProduct = async (values: ProductFormData) => {
    setIsSubmitting(true);
    const { data, error } = await supabase.from('articles').insert(values).select();
    if (error) {
      showErrorToast(`Erreur lors de l'ajout de l'article : ${error.message}`);
      console.error('Error adding product:', error);
    } else {
      showSuccessToast('Article ajouté avec succès !');
      setProducts((prev) => [...prev, data[0]]);
      setIsFormOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleEditProduct = async (values: ProductFormData) => {
    if (!editingProduct?.id) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.from('articles').update(values).eq('id', editingProduct.id).select();
    if (error) {
      showErrorToast(`Erreur lors de la modification de l'article : ${error.message}`);
      console.error('Error updating product:', error);
    } else {
      showSuccessToast('Article modifié avec succès !');
      setProducts((prev) => prev.map((product) => (product.id === editingProduct.id ? data[0] : product)));
      setIsFormOpen(false);
      setEditingProduct(undefined);
    }
    setIsSubmitting(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      showErrorToast(`Erreur lors de la suppression de l'article : ${error.message}`);
      console.error('Error deleting product:', error);
    } else {
      showSuccessToast('Article supprimé avec succès !');
      setProducts((prev) => prev.filter((product) => product.id !== id));
    }
  };

  const openAddForm = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-8 w-8" /> Gestion des Articles
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Modifier l\'article' : 'Ajouter un nouvel article'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Modifiez les détails de l\'article.' : 'Remplissez les informations pour ajouter un nouvel article.'}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              initialData={editingProduct}
              onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
              isSubmitting={isSubmitting}
              onCancel={closeForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Chargement des articles...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucun article trouvé. Ajoutez-en un pour commencer !</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code Article</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Sous-catégorie</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.code_article}</TableCell>
                    <TableCell>{product.libelle}</TableCell>
                    <TableCell>{product.marque || 'N/A'}</TableCell>
                    <TableCell>{product.categorie || 'N/A'}</TableCell>
                    <TableCell>{product.sous_categorie || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditForm(product)} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
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

export default ProductsPage;