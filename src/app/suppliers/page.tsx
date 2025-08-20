
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck } from "lucide-react";
import SupplierList from "@/components/suppliers/supplier-list";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Supplier } from '@/lib/types';
import SupplierFormModal from '@/components/suppliers/supplier-form-modal';
import { useToast } from '@/hooks/use-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "suppliers"), (snapshot) => {
      const suppliersData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Supplier, 'id'>) }));
      setSuppliers(suppliersData);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleAddSupplier = async (newSupplierData: Omit<Supplier, 'id'>) => {
    try {
      await addDoc(collection(db, "suppliers"), {
        ...newSupplierData,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success", description: "Supplier added successfully.", variant: "success" });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "Failed to add supplier.", variant: "destructive" });
    }
  };

  const handleUpdateSupplier = async (supplierId: string, updatedSupplierData: Partial<Supplier>) => {
    try {
      const supplierRef = doc(db, "suppliers", supplierId);
      await updateDoc(supplierRef, updatedSupplierData);
      toast({ title: "Success", description: "Supplier updated successfully.", variant: "success" });
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({ title: "Error", description: "Failed to update supplier.", variant: "destructive" });
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      await deleteDoc(doc(db, `suppliers/${supplierId}`));
      toast({ title: "Success", description: "Supplier deleted successfully.", variant: "success" });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({ title: "Error", description: "Failed to delete supplier.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Suppliers"
        description="Maintain detailed profiles for each supplier."
        icon={<Truck className="h-6 w-6 text-orange-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        }
      />
      <SupplierList 
        suppliers={suppliers} 
        onEdit={handleOpenModal}
        onDelete={handleDeleteSupplier}
      />
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSupplier={handleAddSupplier}
        onUpdateSupplier={handleUpdateSupplier}
        supplier={editingSupplier}
      />
    </div>
  );
}
