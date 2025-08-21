
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck } from "lucide-react";
import SupplierList from "@/components/suppliers/supplier-list";
import { Supplier } from '@/lib/types';
import SupplierFormModal from '@/components/suppliers/supplier-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const suppliersRef = collection(db, 'suppliers');
    const unsubscribe = onSnapshot(suppliersRef, (snapshot) => {
        const loadedSuppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        setSuppliers(loadedSuppliers);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id'> & {id?: string}) => {
      try {
          if (supplierData.id) {
              const supplierRef = doc(db, "suppliers", supplierData.id);
              await setDoc(supplierRef, { ...supplierData, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Supplier updated successfully.", variant: "success" });
          } else {
              await addDoc(collection(db, "suppliers"), { ...supplierData, createdAt: serverTimestamp() });
              toast({ title: "Success", description: "Supplier added successfully.", variant: "success" });
          }
          setIsModalOpen(false);
      } catch (error) {
          toast({ title: "Error", description: "Failed to save supplier.", variant: "destructive" });
      }
  };


  const handleDeleteSupplier = async (supplierId: string) => {
    await deleteDoc(doc(db, "suppliers", supplierId));
    toast({ title: "Success", description: "Supplier deleted successfully.", variant: "success" });
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
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />
    </div>
  );
}
