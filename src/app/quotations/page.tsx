
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, HelpCircle, Check, Clock, DollarSign } from "lucide-react";
import QuotationList from "@/components/quotations/quotation-list";
import { Quotation } from '@/lib/types';
import QuotationFormModal from '@/components/quotations/quotation-form-modal';
import QuotationDetailsModal from '@/components/quotations/quotation-details-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const { toast } = useToast();

  const fetchQuotations = async () => {
    try {
      const quotationsRef = collection(db, 'quotations');
      const snapshot = await getDocs(quotationsRef);
      const loadedQuotations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
      setQuotations(loadedQuotations);
    } catch (error) {
      console.error("Error fetching quotations: ", error);
      toast({
        title: "Error",
        description: "Failed to load quotations. Please check your connection and permissions.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleOpenFormModal = (quotation: Quotation | null) => {
    setEditingQuotation(quotation);
    setIsFormModalOpen(true);
    setIsDetailsModalOpen(false); // Close details modal if open
  };
  
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingQuotation(null);
  }

  const handleOpenDetailsModal = (quotation: Quotation) => {
    setViewingQuotation(quotation);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingQuotation(null);
  }

  const handleSaveQuotation = async (quotationData: Omit<Quotation, 'id'> & { id?: string }) => {
    try {
      if (editingQuotation) { // We are editing
        const { id, ...dataToSave } = quotationData;
        const docRef = doc(db, "quotations", editingQuotation.id);
        await setDoc(docRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
        toast({ title: "Success", description: "Quotation updated successfully.", variant: "success" });
      } else { // We are creating
        const { id, ...dataToSave } = quotationData;
        const docRef = doc(db, "quotations", id as string);
        await setDoc(docRef, { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
        toast({ title: "Success", description: "Quotation added successfully.", variant: "success" });
      }

      handleCloseFormModal();
      fetchQuotations();
    } catch (error) {
      console.error("Error saving quotation: ", error);
      toast({ title: "Error", description: "Failed to save quotation.", variant: "destructive" });
    }
  };


  const handleDeleteQuotation = async (quotationId: string) => {
    await deleteDoc(doc(db, "quotations", quotationId));
    toast({ title: "Success", description: "Quotation deleted successfully.", variant: "success" });
    fetchQuotations();
  };

  const handleApproveQuotation = async (quotation: Quotation) => {
    const docRef = doc(db, "quotations", quotation.id);
    try {
        await setDoc(docRef, { status: 'Accepted', modifiedAt: serverTimestamp() }, { merge: true });
        toast({ title: 'Success', description: `Quotation ${quotation.id} has been approved.`, variant: 'success' });
        fetchQuotations();
    } catch (error) {
        console.error("Error approving quotation: ", error);
        toast({ title: 'Error', description: 'Failed to approve quotation.', variant: 'destructive' });
    }
  }

  const totalQuotations = quotations.length;
  const pendingQuotations = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
  const acceptedQuotations = quotations.filter(q => q.status === 'Accepted').length;
  const acceptanceRate = totalQuotations > 0 ? (acceptedQuotations / totalQuotations) * 100 : 0;
  const totalQuotedValue = quotations.reduce((sum, q) => sum + q.totalAmount, 0);

  const kpis = [
      { title: "Total Quotations", value: totalQuotations, icon: FileText, color: "blue" as const },
      { title: "Pending", value: pendingQuotations, icon: Clock, color: "yellow" as const },
      { title: "Total Quoted Value", value: `₱${totalQuotedValue.toLocaleString()}`, icon: DollarSign, color: "green" as const },
      { title: "Acceptance Rate", value: `${acceptanceRate.toFixed(1)}%`, icon: Check, color: "purple" as const }
  ];


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Quotations"
        description="Create and manage customer quotations."
        icon={<FileText className="h-6 w-6 text-purple-500" />}
        actions={
          <Button onClick={() => handleOpenFormModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quotation
          </Button>
        }
      />
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value as string}
            icon={kpi.icon}
            color={kpi.color}
            style={{ animationDelay: `${index * 100}ms` }}
            className="fade-in-up"
          />
        ))}
      </div>
      <QuotationList
        quotations={quotations}
        onView={handleOpenDetailsModal}
        onEdit={handleOpenFormModal}
        onDelete={handleDeleteQuotation}
        onApprove={handleApproveQuotation}
      />
      {isFormModalOpen && (
        <QuotationFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          onSave={handleSaveQuotation}
          quotation={editingQuotation}
        />
      )}
      {isDetailsModalOpen && (
        <QuotationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          onEdit={handleOpenFormModal}
          quotation={viewingQuotation}
        />
      )}
    </div>
  );
}
