
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
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      const suppliersRef = collection(db, 'suppliers');
      const snapshot = await getDocs(suppliersRef);
      const loadedSuppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
      setSuppliers(loadedSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers: ", error);
      toast({
        title: "Error",
        description: "Failed to load suppliers. Please check your connection and permissions.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id'> & {id?: string}) => {
      try {
          if (supplierData.id) {
              const { id, ...dataToSave } = supplierData;
              const supplierRef = doc(db, "suppliers", id);
              await setDoc(supplierRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Supplier updated successfully.", variant: "success" });
          } else {
              const { id, ...dataToSave } = supplierData;
              await addDoc(collection(db, "suppliers"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Supplier added successfully.", variant: "success" });
          }
          setIsModalOpen(false);
          fetchSuppliers(); // refetch
      } catch (error) {
          console.error("Error saving supplier: ", error);
          toast({ title: "Error", description: "Failed to save supplier.", variant: "destructive" });
      }
  };


  const handleDeleteSupplier = async (supplierId: string) => {
    await deleteDoc(doc(db, "suppliers", supplierId));
    toast({ title: "Success", description: "Supplier deleted successfully.", variant: "success" });
    fetchSuppliers(); // refetch
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
