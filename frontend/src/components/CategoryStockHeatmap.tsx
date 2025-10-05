"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';

interface Shop {
  id: string;
  name: string;
}

interface Product {
  id: string;
  code_article: string;
  libelle: string;
  categorie?: string;
}

interface StockEntry {
  id: string;
  id_boutique: string;
  id_article: string;
  stock_actuel: number;
  stock_min: number;
  stock_max: number;
}

interface CategoryStockStatus {
  category: string;
  ruptureCount: number;
  overstockCount: number;
  normalCount: number;
  totalItems: number;
  overallStatus: 'rupture' | 'overstock' | 'normal' | 'empty';
}

const CategoryStockHeatmap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryStockStatus[]>([]);

  useEffect(() => {
    fetchCategoryStockData();
  }, []);

  const fetchCategoryStockData = async () => {
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase.from('articles').select('*');
      if (productsError) throw productsError;

      const { data: stockEntriesData, error: stockEntriesError } = await supabase.from('stock').select('*');
      if (stockEntriesError) throw stockEntriesError;

      const productsMap = new Map<string, Product>(productsData.map((product) => [product.id, product]));

      const categoryStatusMap = new Map<string, { rupture: number; overstock: number; normal: number; total: number }>();

      stockEntriesData.forEach((entry: StockEntry) => {
        const product = productsMap.get(entry.id_article);
        if (product && product.categorie) {
          const category = product.categorie || 'Non catégorisé';
          if (!categoryStatusMap.has(category)) {
            categoryStatusMap.set(category, { rupture: 0, overstock: 0, normal: 0, total: 0 });
          }
          const currentStatus = categoryStatusMap.get(category)!;
          currentStatus.total++;

          if (entry.stock_actuel < entry.stock_min) {
            currentStatus.rupture++;
          } else if (entry.stock_actuel > entry.stock_max) {
            currentStatus.overstock++;
          } else {
            currentStatus.normal++;
          }
        }
      });

      const processedCategoryData: CategoryStockStatus[] = Array.from(categoryStatusMap.entries()).map(([category, counts]) => {
        let overallStatus: 'rupture' | 'overstock' | 'normal' | 'empty' = 'normal';
        if (counts.total === 0) {
          overallStatus = 'empty';
        } else if (counts.rupture > 0 && counts.rupture / counts.total >= 0.2) { // If 20% or more items are in rupture
          overallStatus = 'rupture';
        } else if (counts.overstock > 0 && counts.overstock / counts.total >= 0.2) { // If 20% or more items are in overstock
          overallStatus = 'overstock';
        }
        // Prioritize rupture over overstock if both are significant
        if (counts.rupture > 0 && counts.rupture / counts.total >= 0.2 && counts.overstock > 0 && counts.overstock / counts.total >= 0.2) {
            overallStatus = 'rupture';
        }


        return {
          category,
          ruptureCount: counts.rupture,
          overstockCount: counts.overstock,
          normalCount: counts.normal,
          totalItems: counts.total,
          overallStatus,
        };
      }).sort((a, b) => a.category.localeCompare(b.category)); // Sort alphabetically

      setCategoryData(processedCategoryData);

    } catch (error: any) {
      showErrorToast(`Erreur lors du chargement des données de stock par catégorie : ${error.message}`);
      console.error('Error fetching category stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardClasses = (status: 'rupture' | 'overstock' | 'normal' | 'empty') => {
    switch (status) {
      case 'rupture':
        return 'border-red-500 bg-red-50/20';
      case 'overstock':
        return 'border-yellow-500 bg-yellow-50/20';
      case 'normal':
        return 'border-green-500 bg-green-50/20';
      case 'empty':
      default:
        return 'border-muted bg-muted/20';
    }
  };

  const getStatusIcon = (status: 'rupture' | 'overstock' | 'normal' | 'empty') => {
    switch (status) {
      case 'rupture':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'overstock':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'empty':
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center p-8">Chargement de la carte thermique des catégories...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="h-5 w-5 bg-red-500 rounded-full" />
          <span className="h-5 w-5 bg-yellow-500 rounded-full" />
          <span className="h-5 w-5 bg-green-500 rounded-full" />
          Carte Thermique des Catégories de Stock
        </CardTitle>
        <CardDescription>Aperçu rapide de l'état du stock par catégorie d'articles.</CardDescription>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <p className="text-center text-muted-foreground">Aucune donnée de catégorie de stock disponible.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryData.map((data) => (
              <Card key={data.category} className={cn("border-l-4", getCardClasses(data.overallStatus))}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{data.category}</CardTitle>
                  {getStatusIcon(data.overallStatus)}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Total articles: {data.totalItems}</p>
                  {data.ruptureCount > 0 && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> {data.ruptureCount} en rupture
                    </p>
                  )}
                  {data.overstockCount > 0 && (
                    <p className="text-sm text-yellow-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {data.overstockCount} en surstock
                    </p>
                  )}
                  {data.normalCount > 0 && (
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> {data.normalCount} normal
                    </p>
                  )}
                  {data.totalItems === 0 && (
                    <p className="text-sm text-muted-foreground">Aucun article dans cette catégorie.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryStockHeatmap;