"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, CheckCircle, XCircle, Package, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showInfoToast, showErrorToast } from '@/lib/toast';
import { supabase } from '@/lib/supabase'; // Assuming supabase is used to fetch analysis results

interface OverstockedItem {
  productId: string;
  productName: string;
  shopName: string;
  currentStock: number;
  maxStock: number;
  excessQuantity: number;
}

interface UnderstockedItem {
  productId: string;
  productName: string;
  shopName: string;
  currentStock: number;
  minStock: number;
  neededQuantity: number;
}

interface TransferProposal {
  proposalId: string;
  productId: string;
  productName: string;
  sourceShopId: string;
  sourceShopName: string;
  destinationShopId: string;
  destinationShopName: string;
  transferQuantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected'; // Status of the proposal
}

const WeeklyAnalysisDisplay: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<{
    overstockedItems: OverstockedItem[];
    understockedItems: UnderstockedItem[];
    transferProposals: TransferProposal[];
  } | null>(null);

  useEffect(() => {
    fetchAnalysisResults();
  }, []);

  const fetchAnalysisResults = async () => {
    setLoading(true);
    // In a real application, you would fetch this data from your backend.
    // For now, we'll use mock data.
    try {
      // Example of fetching from a Supabase table if you store analysis results there
      // const { data, error } = await supabase.from('weekly_analysis_results').select('*').limit(1);
      // if (error) throw error;
      // setAnalysisResults(data[0] || mockAnalysisData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisResults(mockAnalysisData);
      showInfoToast("Données d'analyse hebdomadaire chargées.");
    } catch (error: any) {
      showErrorToast(`Erreur lors du chargement des résultats d'analyse : ${error.message}`);
      console.error('Error fetching analysis results:', error);
      setAnalysisResults(mockAnalysisData); // Fallback to mock data on error
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransfer = async (proposalId: string) => {
    showInfoToast(`Approbation du transfert ${proposalId} (simulé)`);
    // Here you would call your backend to approve the transfer
    // e.g., await supabase.from('transfer_proposals').update({ status: 'approved' }).eq('id', proposalId);
    // Then refetch or update local state
    setAnalysisResults(prev => {
      if (!prev) return null;
      const updatedProposals = prev.transferProposals.map(p =>
        p.proposalId === proposalId ? { ...p, status: 'approved' } : p
      );
      return { ...prev, transferProposals: updatedProposals };
    });
  };

  const handleRejectTransfer = async (proposalId: string) => {
    showInfoToast(`Rejet du transfert ${proposalId} (simulé)`);
    // Here you would call your backend to reject the transfer
    // e.g., await supabase.from('transfer_proposals').update({ status: 'rejected' }).eq('id', proposalId);
    // Then refetch or update local state
    setAnalysisResults(prev => {
      if (!prev) return null;
      const updatedProposals = prev.transferProposals.map(p =>
        p.proposalId === proposalId ? { ...p, status: 'rejected' } : p
      );
      return { ...prev, transferProposals: updatedProposals };
    });
  };

  if (loading) {
    return <div className="text-center p-8">Chargement de l'analyse hebdomadaire...</div>;
  }

  if (!analysisResults) {
    return <div className="text-center p-8 text-muted-foreground">Aucun résultat d'analyse disponible.</div>;
  }

  const { overstockedItems, understockedItems, transferProposals } = analysisResults;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Analyse Hebdomadaire du Stock</h2>
      <p className="text-muted-foreground">Dernière mise à jour : Lundi, 1er Janvier 2024 (simulé)</p>

      {/* Overstocked Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" /> Articles en Surstock
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overstockedItems.length === 0 ? (
            <p className="text-muted-foreground">Aucun article en surstock identifié.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Stock Actuel</TableHead>
                  <TableHead>Stock Max</TableHead>
                  <TableHead>Excédent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overstockedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.shopName}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>{item.maxStock}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        +{item.excessQuantity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Understocked Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" /> Articles en Rupture / Bas Niveau
          </CardTitle>
        </CardHeader>
        <CardContent>
          {understockedItems.length === 0 ? (
            <p className="text-muted-foreground">Aucun article en rupture ou bas niveau identifié.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Stock Actuel</TableHead>
                  <TableHead>Stock Min</TableHead>
                  <TableHead>Manquant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {understockedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.shopName}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>{item.minStock}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        -{item.neededQuantity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transfer Proposals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-500" /> Propositions de Transfert
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transferProposals.length === 0 ? (
            <p className="text-muted-foreground">Aucune proposition de transfert pour le moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferProposals.map((proposal) => (
                  <TableRow key={proposal.proposalId}>
                    <TableCell className="font-medium">{proposal.productName}</TableCell>
                    <TableCell>{proposal.sourceShopName}</TableCell>
                    <TableCell>{proposal.destinationShopName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{proposal.transferQuantity}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{proposal.reason}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          proposal.status === 'approved'
                            ? 'bg-green-500 text-green-50-foreground'
                            : proposal.status === 'rejected'
                            ? 'bg-red-500 text-red-50-foreground'
                            : 'bg-blue-500 text-blue-50-foreground'
                        }
                      >
                        {proposal.status === 'pending' && 'En attente'}
                        {proposal.status === 'approved' && 'Approuvé'}
                        {proposal.status === 'rejected' && 'Rejeté'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {proposal.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveTransfer(proposal.proposalId)}
                            className="mr-2"
                          >
                            Approuver
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectTransfer(proposal.proposalId)}
                          >
                            Rejeter
                          </Button>
                        </>
                      )}
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

export default WeeklyAnalysisDisplay;

// Mock Data for demonstration purposes
const mockAnalysisData = {
  overstockedItems: [
    {
      productId: 'prod_1',
      productName: 'T-shirt Coton Bleu',
      shopName: 'Boutique Paris',
      currentStock: 150,
      maxStock: 100,
      excessQuantity: 50,
    },
    {
      productId: 'prod_3',
      productName: 'Jean Slim Noir',
      shopName: 'Boutique Lyon',
      currentStock: 80,
      maxStock: 60,
      excessQuantity: 20,
    },
  ],
  understockedItems: [
    {
      productId: 'prod_1',
      productName: 'T-shirt Coton Bleu',
      shopName: 'Boutique Marseille',
      currentStock: 10,
      minStock: 30,
      neededQuantity: 20,
    },
    {
      productId: 'prod_2',
      productName: 'Robe Été Fleurie',
      shopName: 'Boutique Nice',
      currentStock: 5,
      minStock: 15,
      neededQuantity: 10,
    },
  ],
  transferProposals: [
    {
      proposalId: 'trans_001',
      productId: 'prod_1',
      productName: 'T-shirt Coton Bleu',
      sourceShopId: 'shop_paris',
      sourceShopName: 'Boutique Paris',
      destinationShopId: 'shop_marseille',
      destinationShopName: 'Boutique Marseille',
      transferQuantity: 20,
      reason: 'Surstock à Paris, rupture à Marseille',
      status: 'pending',
    },
    {
      proposalId: 'trans_002',
      productId: 'prod_3',
      productName: 'Jean Slim Noir',
      sourceShopId: 'shop_lyon',
      sourceShopName: 'Boutique Lyon',
      destinationShopId: 'shop_nice',
      destinationShopName: 'Boutique Nice',
      transferQuantity: 10,
      reason: 'Surstock à Lyon, bas niveau à Nice',
      status: 'pending',
    },
  ],
};