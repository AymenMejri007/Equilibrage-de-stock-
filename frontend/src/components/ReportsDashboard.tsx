"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { showInfoToast, showErrorToast, showSuccessToast } from '@/lib/toast';
import { FileText, Download, TrendingUp, History, Store, BarChart2, Filter } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input'; // For date range or search

// --- Interfaces pour les données de rapport ---
interface BalancingRateData {
  month: string;
  rupture: number;
  overstock: number;
  normal: number;
}

interface TransferHistoryEntry {
  id: string;
  date: string;
  productName: string;
  sourceShop: string;
  destinationShop: string;
  quantity: number;
  status: 'validated' | 'in_transit' | 'received' | 'rejected';
  category: string; // Added for filtering
}

interface ShopPerformance {
  shopName: string;
  ruptureRate: number; // Percentage
  overstockRate: number; // Percentage
  normalRate: number; // Percentage
}

const ReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [balancingRateHistory, setBalancingRateHistory] = useState<BalancingRateData[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryEntry[]>([]);
  const [shopPerformance, setShopPerformance] = useState<ShopPerformance[]>([]);

  // Filter states for Transfer History
  const [filterPeriod, setFilterPeriod] = useState<string>('all'); // e.g., 'all', 'last_month', 'last_3_months'
  const [filterStatus, setFilterStatus] = useState<string>('all'); // e.g., 'all', 'validated', 'in_transit', 'received', 'rejected'
  const [filterCategory, setFilterCategory] = useState<string>('all'); // e.g., 'all', 'Vêtements', 'Chaussures'

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBalancingRateHistory(mockBalancingRateHistory);
      setTransferHistory(mockTransferHistory);
      setShopPerformance(mockShopPerformance);
      showInfoToast("Données de rapport chargées.");
    } catch (error: any) {
      showErrorToast(`Erreur lors du chargement des rapports : ${error.message}`);
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    showInfoToast(`Génération du rapport en ${format.toUpperCase()} (simulé)...`);
    // In a real application, this would trigger a backend function
    // to generate and download the file.
    // Example: window.open(`/api/reports/export?format=${format}`, '_blank');
    setTimeout(() => {
      showSuccessToast(`Rapport exporté en ${format.toUpperCase()} avec succès !`);
    }, 1500);
  };

  const getStatusBadge = (status: TransferHistoryEntry['status']) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-500 text-green-50-foreground">Validé</Badge>;
      case 'in_transit':
        return <Badge className="bg-orange-500 text-orange-50-foreground">En transit</Badge>;
      case 'received':
        return <Badge className="bg-purple-500 text-purple-50-foreground">Reçu</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-red-50-foreground">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const allTransferCategories = Array.from(new Set(mockTransferHistory.map(t => t.category))).sort();

  const filteredTransferHistory = transferHistory.filter(transfer => {
    const transferDate = new Date(transfer.date);
    const now = new Date();

    // Filter by period
    let matchesPeriod = true;
    if (filterPeriod === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      matchesPeriod = transferDate >= lastMonth;
    } else if (filterPeriod === 'last_3_months') {
      const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      matchesPeriod = transferDate >= last3Months;
    }

    // Filter by status
    const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus;

    // Filter by category
    const matchesCategory = filterCategory === 'all' || transfer.category === filterCategory;

    return matchesPeriod && matchesStatus && matchesCategory;
  });

  if (loading) {
    return <div className="text-center p-8">Chargement des rapports...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart2 className="h-6 w-6" /> Rapports & Historique
        </h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" /> Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Évolution du taux d’équilibrage (% RAS) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" /> Évolution du Taux d'Équilibrage
          </CardTitle>
          <CardDescription>Pourcentage d'articles en rupture, surstock et normal sur les derniers mois.</CardDescription>
        </CardHeader>
        <CardContent>
          {balancingRateHistory.length === 0 ? (
            <p className="text-muted-foreground text-center">Aucune donnée d'évolution disponible.</p>
          ) : (
            <ChartContainer
              config={{
                rupture: { label: 'Rupture', color: 'hsl(var(--chart-1))' },
                overstock: { label: 'Surstock', color: 'hsl(var(--chart-2))' },
                normal: { label: 'Normal', color: 'hsl(var(--chart-3))' },
              }}
              className="min-h-[300px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={balancingRateHistory}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  // tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="rupture"
                  type="monotone"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="overstock"
                  type="monotone"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="normal"
                  type="monotone"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Historique des transferts effectués */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-purple-500" /> Historique des Transferts
          </CardTitle>
          <CardDescription>Liste de tous les transferts de stock effectués ou en cours.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="last_month">Dernier mois</SelectItem>
                <SelectItem value="last_3_months">3 derniers mois</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="validated">Validé</SelectItem>
                <SelectItem value="in_transit">En transit</SelectItem>
                <SelectItem value="received">Reçu</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {allTransferCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setFilterPeriod('all');
              setFilterStatus('all');
              setFilterCategory('all');
            }}>
              <Filter className="h-4 w-4 mr-2" /> Réinitialiser les filtres
            </Button>
          </div>

          {filteredTransferHistory.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucun transfert enregistré avec les filtres appliqués.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransferHistory.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{transfer.date}</TableCell>
                    <TableCell className="font-medium">{transfer.productName}</TableCell>
                    <TableCell>{transfer.category}</TableCell>
                    <TableCell>{transfer.sourceShop}</TableCell>
                    <TableCell>{transfer.destinationShop}</TableCell>
                    <TableCell>{transfer.quantity}</TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Performance par boutique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-green-500" /> Performance par Boutique
          </CardTitle>
          <CardDescription>Taux de rupture et de surstock par boutique.</CardDescription>
        </CardHeader>
        <CardContent>
          {shopPerformance.length === 0 ? (
            <p className="text-muted-foreground text-center">Aucune donnée de performance par boutique disponible.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Taux de Rupture</TableHead>
                  <TableHead>Taux de Surstock</TableHead>
                  <TableHead>Taux Normal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopPerformance.map((shop) => (
                  <TableRow key={shop.shopName}>
                    <TableCell className="font-medium">{shop.shopName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {shop.ruptureRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {shop.overstockRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {shop.normalRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
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

export default ReportsDashboard;

// --- Mock Data for demonstration purposes ---
const mockBalancingRateHistory: BalancingRateData[] = [
  { month: 'Jan 24', rupture: 15, overstock: 20, normal: 65 },
  { month: 'Fev 24', rupture: 12, overstock: 18, normal: 70 },
  { month: 'Mar 24', rupture: 10, overstock: 15, normal: 75 },
  { month: 'Avr 24', rupture: 8, overstock: 12, normal: 80 },
  { month: 'Mai 24', rupture: 7, overstock: 10, normal: 83 },
  { month: 'Juin 24', rupture: 6, overstock: 9, normal: 85 },
];

const mockTransferHistory: TransferHistoryEntry[] = [
  {
    id: 'th_001',
    date: '2024-05-20',
    productName: 'T-shirt Coton Bleu',
    category: 'Vêtements',
    sourceShop: 'Boutique Paris',
    destinationShop: 'Boutique Marseille',
    quantity: 20,
    status: 'received',
  },
  {
    id: 'th_002',
    date: '2024-05-22',
    productName: 'Jean Slim Noir',
    category: 'Vêtements',
    sourceShop: 'Boutique Lyon',
    destinationShop: 'Boutique Nice',
    quantity: 10,
    status: 'in_transit',
  },
  {
    id: 'th_003',
    date: '2024-05-18',
    productName: 'Robe Été Fleurie',
    category: 'Vêtements',
    sourceShop: 'Boutique Toulouse',
    destinationShop: 'Boutique Bordeaux',
    quantity: 15,
    status: 'rejected',
  },
  {
    id: 'th_004',
    date: '2024-05-25',
    productName: 'Chaussures de Sport',
    category: 'Chaussures',
    sourceShop: 'Boutique Lille',
    destinationShop: 'Boutique Rennes',
    quantity: 5,
    status: 'validated',
  },
  {
    id: 'th_005',
    date: '2024-04-10',
    productName: 'Sac à Main Cuir',
    category: 'Accessoires',
    sourceShop: 'Boutique Paris',
    destinationShop: 'Boutique Lyon',
    quantity: 2,
    status: 'received',
  },
  {
    id: 'th_006',
    date: '2024-03-01',
    productName: 'Écharpe en Laine',
    category: 'Accessoires',
    sourceShop: 'Boutique Marseille',
    destinationShop: 'Boutique Nice',
    quantity: 7,
    status: 'received',
  },
];

const mockShopPerformance: ShopPerformance[] = [
  { shopName: 'Boutique Paris', ruptureRate: 5.2, overstockRate: 10.5, normalRate: 84.3 },
  { shopName: 'Boutique Lyon', ruptureRate: 8.1, overstockRate: 7.3, normalRate: 84.6 },
  { shopName: 'Boutique Marseille', ruptureRate: 12.0, overstockRate: 4.0, normalRate: 84.0 },
  { shopName: 'Boutique Nice', ruptureRate: 3.5, overstockRate: 15.0, normalRate: 81.5 },
];