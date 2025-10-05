"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

interface StockStatus {
  shopName: string;
  productName: string;
  category: string;
  status: 'overstock' | 'rupture' | 'normal';
  quantity: number;
  min: number;
  max: number;
}

const StockOverviewDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<StockStatus[]>([]);
  const [metrics, setMetrics] = useState({
    overstockPercentage: 0,
    rupturePercentage: 0,
    normalPercentage: 0,
  });
  const [stockByCategoryAndShop, setStockByCategoryAndShop] = useState<Record<string, Record<string, StockStatus[]>>>({});

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const { data: shopsData, error: shopsError } = await supabase.from('shops').select('*');
      if (shopsError) throw shopsError;

      const { data: productsData, error: productsError } = await supabase.from('articles').select('*');
      if (productsError) throw productsError;

      const { data: stockEntriesData, error: stockEntriesError } = await supabase.from('stock').select('*');
      if (stockEntriesError) throw stockEntriesError;

      const shopsMap = new Map<string, Shop>(shopsData.map((shop) => [shop.id, shop]));
      const productsMap = new Map<string, Product>(productsData.map((product) => [product.id, product]));

      let totalItems = 0;
      let overstockCount = 0;
      let ruptureCount = 0;
      let normalCount = 0;

      const processedStock: StockStatus[] = [];
      const categoryShopMap: Record<string, Record<string, StockStatus[]>> = {};

      stockEntriesData.forEach((entry: StockEntry) => {
        const shop = shopsMap.get(entry.id_boutique);
        const product = productsMap.get(entry.id_article);

        if (shop && product) {
          totalItems++;
          let status: 'overstock' | 'rupture' | 'normal';
          if (entry.stock_actuel > entry.stock_max) {
            status = 'overstock';
            overstockCount++;
          } else if (entry.stock_actuel < entry.stock_min) {
            status = 'rupture';
            ruptureCount++;
          } else {
            status = 'normal';
            normalCount++;
          }

          const itemStatus: StockStatus = {
            shopName: shop.name,
            productName: product.libelle,
            category: product.categorie || 'Non catégorisé',
            status,
            quantity: entry.stock_actuel,
            min: entry.stock_min,
            max: entry.stock_max,
          };
          processedStock.push(itemStatus);

          if (!categoryShopMap[shop.name]) {
            categoryShopMap[shop.name] = {};
          }
          if (!categoryShopMap[shop.name][itemStatus.category]) {
            categoryShopMap[shop.name][itemStatus.category] = [];
          }
          categoryShopMap[shop.name][itemStatus.category].push(itemStatus);
        }
      });

      setStockData(processedStock);
      setStockByCategoryAndShop(categoryShopMap);

      setMetrics({
        overstockPercentage: totalItems > 0 ? (overstockCount / totalItems) * 100 : 0,
        rupturePercentage: totalItems > 0 ? (ruptureCount / totalItems) * 100 : 0,
        normalPercentage: totalItems > 0 ? (normalCount / totalItems) * 100 : 0,
      });
    } catch (error: any) {
      showErrorToast(`Erreur lors du chargement des données de stock : ${error.message}`);
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: 'overstock' | 'rupture' | 'normal') => {
    switch (status) {
      case 'overstock':
        return 'bg-yellow-500 text-yellow-50-foreground';
      case 'rupture':
        return 'bg-red-500 text-red-50-foreground';
      case 'normal':
      default:
        return 'bg-green-500 text-green-50-foreground';
    }
  };

  const getOverallCategoryStatus = (items: StockStatus[]) => {
    if (items.some(item => item.status === 'rupture')) return 'rupture';
    if (items.some(item => item.status === 'overstock')) return 'overstock';
    return 'normal';
  };

  const allCategories = Array.from(new Set(stockData.map(item => item.category))).sort();
  const allShops = Array.from(new Set(stockData.map(item => item.shopName))).sort();

  if (loading) {
    return <div className="text-center p-8">Chargement des données de stock...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Indicateurs Clés de Stock</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={cn("border-l-4", metrics.rupturePercentage > 0 ? "border-red-500" : "border-muted")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Rupture de Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rupturePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Articles sous le seuil minimum</p>
          </CardContent>
        </Card>
        <Card className={cn("border-l-4", metrics.overstockPercentage > 0 ? "border-yellow-500" : "border-muted")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Surstock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overstockPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Articles au-dessus du seuil maximum</p>
          </CardContent>
        </Card>
        <Card className={cn("border-l-4", metrics.normalPercentage > 0 ? "border-green-500" : "border-muted")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Normal</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.normalPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Articles entre les seuils min/max</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-8">Vue Globale du Stock par Boutique et Catégorie</h2>
      {allShops.length === 0 || allCategories.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucune donnée de stock disponible pour cette vue.</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10">Boutique / Catégorie</TableHead>
                    {allCategories.map((category) => (
                      <TableHead key={category} className="text-center">{category}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allShops.map((shopName) => (
                    <TableRow key={shopName}>
                      <TableCell className="font-medium sticky left-0 bg-card z-10">{shopName}</TableCell>
                      {allCategories.map((category) => {
                        const itemsInCell = stockByCategoryAndShop[shopName]?.[category] || [];
                        const overallStatus = getOverallCategoryStatus(itemsInCell);
                        return (
                          <TableCell key={`${shopName}-${category}`} className="text-center">
                            {itemsInCell.length > 0 ? (
                              <Badge className={getStatusColor(overallStatus)}>
                                {overallStatus === 'rupture' && <XCircle className="h-3 w-3 mr-1" />}
                                {overallStatus === 'overstock' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {overallStatus === 'normal' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {itemsInCell.length} article(s)
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockOverviewDashboard;