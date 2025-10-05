"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, CheckCircle, XCircle, Package, Store, FileText, Truck, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showInfoToast, showErrorToast, showSuccessToast } from '@/lib/toast';
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
  status: 'proposed' | 'validated' | 'in_transit' | 'received' | 'rejected'; // Updated statuses
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
    try {
      // In a real application, you would fetch this data from your backend.
      // For now, we'll use mock data.
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

  const updateProposalStatus = (proposalId: string, newStatus: TransferProposal['status']) => {
    setAnalysisResults(prev => {
      if (!prev) return null;
      const updatedProposals = prev.transferProposals.map(p =>
        p.proposalId === proposalId ? { ...p, status: newStatus } : p
      );
      return { ...prev, transferProposals: updatedProposals };
    });
  };

  const handleApproveTransfer = async (proposalId: string) => {
    // Simulate backend call to approve transfer
    await new Promise(resolve => setTimeout(resolve, 300));
    updateProposalStatus(proposalId, 'validated');
    showSuccessToast(`Proposition de transfert ${proposalId} validée !`);
    // In a real app, you'd call a backend API here:
    // await supabase.from('transfer_proposals').update({ status: 'validated' }).eq('proposalId', proposalId);
  };

  const handleRejectTransfer = async (proposalId: string) => {
    // Simulate backend call to reject transfer
    await new Promise(resolve => setTimeout(resolve, 300));
    updateProposalStatus(proposalId, 'rejected');
    showInfoToast(`Proposition de transfert ${proposalId} rejetée.`);
    // In a real app, you'd call a backend API here:
    // await supabase.from('transfer_proposals').update({ status: 'rejected' }).eq('proposalId', proposalId);
  };

  const handleGenerateTransferOrder = async (proposalId: string) => {
    showInfoToast(`Génération du bon de transfert pour ${proposalId} (simulé).`);
    // In a real app, this would trigger a backend function to generate a PDF/Excel
    // and potentially download it or send it via email.
    // Example: const response = await fetch(`/api/generate-transfer-order/${proposalId}`);
    // const blob = await response.blob();
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `bon_transfert_${proposalId}.pdf`;
    // document.body.appendChild(a);
    // a.click();
    // a.remove();
    // showSuccessToast('Bon de transfert généré !');
  };

  const handleMarkInTransit = async (proposalId: string) => {
    // Simulate backend call to update status
    await new Promise(resolve => setTimeout(resolve, 300));
    updateProposalStatus(proposalId, 'in_transit');
    showSuccessToast(`Transfert ${proposalId} marqué "En transit".`);
    // In a real app, you'd call a backend API here:
    // await supabase.from('transfer_proposals').update({ status: 'in_transit' }).eq('proposalId', proposalId);
  };

  const handleMarkReceived = async (proposalId: string) => {
    // Simulate backend call to update status
    await new Promise(resolve => setTimeout(resolve, 300));
    updateProposalStatus(proposalId, 'received');
    showSuccessToast(`Transfert ${proposalId} marqué "Reçu".`);
    // In a real app, you'd call a backend API here:
    // await supabase.from('transfer_proposals').update({ status: 'received' }).eq('proposalId', proposalId);
  };

  const getStatusBadge = (status: TransferProposal['status']) => {
    switch (status) {
      case 'proposed':
        return <Badge className="bg-blue-500 text-blue-50-foreground">Proposé</Badge>;
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
                    <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {proposal.status === 'proposed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveTransfer(proposal.proposalId)}
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
                      {proposal.status === 'validated' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleGenerateTransferOrder(proposal.proposalId)}
                          >
                            <FileText className="h-4 w-4 mr-1" /> Bon de Transfert
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkInTransit(proposal.proposalId)}
                          >
                            <Truck className="h-4 w-4 mr-1" /> En Transit
                          </Button>
                        </>
                      )}
                      {proposal.status === 'in_transit' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkReceived(proposal.proposalId)}
                        >
                          <CheckSquare className="h-4 w-4 mr-1" /> Reçu
                        </Button>
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

// Mock Data for demonstration purposes (updated with new statuses)
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
      status: 'proposed', // Initial status
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
      status: 'validated', // Example of a validated transfer
    },
    {
      proposalId: 'trans_003',
      productId: 'prod_4',
      productName: 'Chaussures de Sport',
      sourceShopId: 'shop_bordeaux',
      sourceShopName: 'Boutique Bordeaux',
      destinationShopId: 'shop_lille',
      destinationShopName: 'Boutique Lille',
      transferQuantity: 5,
      reason: 'Surstock à Bordeaux, besoin à Lille',
      status: 'in_transit', // Example of a transfer in transit
    },
    {
      proposalId: 'trans_004',
      productId: 'prod_5',
      productName: 'Sac à Main Cuir',
      sourceShopId: 'shop_toulouse',
      sourceShopName: 'Boutique Toulouse',
      destinationShopId: 'shop_nantes',
      destinationShopName: 'Boutique Nantes',
      transferQuantity: 3,
      reason: 'Surstock à Toulouse, besoin à Nantes',
      status: 'received', // Example of a received transfer
    },
    {
      proposalId: 'trans_005',
      productId: 'prod_6',
      productName: 'Écharpe en Laine',
      sourceShopId: 'shop_strasbourg',
      sourceShopName: 'Boutique Strasbourg',
      destinationShopId: 'shop_rennes',
      destinationShopName: 'Boutique Rennes',
      transferQuantity: 7,
      reason: 'Surstock à Strasbourg, besoin à Rennes',
      status: 'rejected', // Example of a rejected transfer
    },
  ],
};