"use client";

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Shop {
  id: string;
  name: string;
  address?: string;
}

interface Product {
  id: string;
  code_article: string;
  libelle: string;
  marque?: string;
  categorie?: string;
  sous_categorie?: string;
}

interface StockEntry {
  id: string;
  id_boutique: string;
  id_article: string;
  stock_actuel: number;
  stock_min: number;
  stock_max: number;
}

interface ProductWithStock extends Product {
  stock_actuel: number;
  stock_min: number;
  stock_max: number;
  stock_status: 'rupture' | 'overstock' | 'normal';
}

const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [productsWithStock, setProductsWithStock] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');
  const [filterStockLevel, setFilterStockLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (shopId) {
      fetchShopDetails(shopId);
    }
  }, [shopId]);

  const fetchShopDetails = async (id: string) => {
    setLoading(true);
    try {
      // Fetch shop info
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single();
      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch all products
      const { data: productsData, error: productsError } = await supabase
        .from('articles')
        .select('*');
      if (productsError) throw productsError;
      const productsMap = new Map<string, Product>(productsData.map(p => [p.id, p]));

      // Fetch stock for this shop
      const { data: stockData, error: stockError } = await supabase
        .from('stock')
        .select('*')
        .eq('id_boutique', id);
      if (stockError) throw stockError;

      const combinedData: ProductWithStock[] = stockData.map(stockEntry => {
        const product = productsMap.get(stockEntry.id_article);
        if (!product) return null;

        let stock_status: 'rupture' | 'overstock' | 'normal';
        if (stockEntry.stock_actuel < stockEntry.stock_min) {
          stock_status = 'rupture';
        } else if (stockEntry.stock_actuel > stockEntry.stock_max) {
          stock_status = 'overstock';
        } else {
          stock_status = 'normal';
        }

        return {
          ...product,
          stock_actuel: stockEntry.stock_actuel,
          stock_min: stockEntry.stock_min,
          stock_max: stockEntry.stock_max,
          stock_status,
        };
      }).filter(Boolean) as ProductWithStock[];

      setProductsWithStock(combinedData);

    } catch (error: any) {
      showErrorToast(`Erreur lors du chargement des détails de la boutique : ${error.message}`);
      console.error('Error fetching shop details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusBadge = (status: 'rupture' | 'overstock' | 'normal') => {
    switch (status) {
      case 'rupture':
        return <Badge variant="destructive">Rupture</Badge>;
      case 'overstock':
        return <Badge className="bg-yellow-500 text-yellow-50-foreground">Surstock</Badge>;
      case 'normal':
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const allCategories = Array.from(new Set(productsWithStock.map(p => p.categorie || 'Non catégorisé'))).sort();
  const allSubCategories = Array.from(new Set(productsWithStock.map(p => p.sous_categorie || 'Non spécifié'))).sort();

  const filteredProducts = productsWithStock.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.categorie === filterCategory || (filterCategory === 'Non catégorisé' && !product.categorie);
    const matchesSubCategory = filterSubCategory === 'all' || product.sous_categorie === filterSubCategory || (filterSubCategory === 'Non spécifié' && !product.sous_categorie);
    const matchesStockLevel = filterStockLevel === 'all' || product.stock_status === filterStockLevel;
    const matchesSearchTerm = product.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              product.code_article.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (product.marque?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSubCategory && matchesStockLevel && matchesSearchTerm;
  });

  if (loading) {
    return <div className="text-center p-8">Chargement des détails de la boutique...</div>;
  }

  if (!shop) {
    return <div className="text-center p-8 text-destructive">Boutique introuvable.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link to="/shops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Détails de la Boutique : {shop.name}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations sur la boutique</CardTitle>
          <CardDescription>{shop.address || 'Adresse non spécifiée'}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Articles en Stock
          </CardTitle>
          <CardDescription>Liste des articles disponibles dans cette boutique avec leur niveau de stock.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {allCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSubCategory} onValueChange={setFilterSubCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sous-catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sous-catégories</SelectItem>
                {allSubCategories.map(subCat => (
                  <SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStockLevel} onValueChange={setFilterStockLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Niveau de stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="rupture">Rupture</SelectItem>
                <SelectItem value="overstock">Surstock</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterSubCategory('all');
              setFilterStockLevel('all');
            }}>
              <Filter className="h-4 w-4 mr-2" /> Réinitialiser les filtres
            </Button>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucun article trouvé avec les filtres appliqués.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code Article</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Sous-catégorie</TableHead>
                  <TableHead>Stock Actuel</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.code_article}</TableCell>
                    <TableCell>{product.libelle}</TableCell>
                    <TableCell>{product.marque || 'N/A'}</TableCell>
                    <TableCell>{product.categorie || 'N/A'}</TableCell>
                    <TableCell>{product.sous_categorie || 'N/A'}</TableCell>
                    <TableCell>{product.stock_actuel} ({product.stock_min}-{product.stock_max})</TableCell>
                    <TableCell>{getStockStatusBadge(product.stock_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopDetailPage;