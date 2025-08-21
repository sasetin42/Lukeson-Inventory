
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, HelpCircle, Check, Clock, DollarSign } from "lucide-react";
import QuotationList from "@/components/quotations/quotation-list";
import { Quotation } from '@/lib/types';
import QuotationFormModal from '@/components/quotations/quotation-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
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

  const handleOpenModal = (quotation: Quotation | null) => {
    setEditingQuotation(quotation);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuotation(null);
  }

  const handleSaveQuotation = async (quotationData: Omit<Quotation, 'id'> & { id?: string }) => {
    try {
      const { id, ...dataToSave } = quotationData;
      if (id) {
        const docRef = editingQuotation ? doc(db, "quotations", id) : doc(db, "quotations", id);

        if (editingQuotation) { // We are editing
          await setDoc(docRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
          toast({ title: "Success", description: "Quotation updated successfully.", variant: "success" });
        } else { // We are creating
          await setDoc(docRef, { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
          toast({ title: "Success", description: "Quotation added successfully.", variant: "success" });
        }
      } else {
        // Fallback for any case where ID is not provided, though it shouldn't happen with the new logic.
        await addDoc(collection(db, "quotations"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
        toast({ title: "Success", description: "Quotation added successfully.", variant: "success" });
      }

      handleCloseModal();
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
          <Button onClick={() => handleOpenModal(null)}>
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
        onEdit={handleOpenModal}
        onDelete={handleDeleteQuotation}
      />
      {isModalOpen && (
        <QuotationFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveQuotation}
          quotation={editingQuotation}
        />
      )}
    </div>
  );
}
