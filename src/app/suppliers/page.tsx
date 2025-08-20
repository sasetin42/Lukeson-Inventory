
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck } from "lucide-react";
import SupplierList from "@/components/suppliers/supplier-list";
import { Supplier } from '@/lib/types';
import SupplierFormModal from '@/components/suppliers/supplier-form-modal';
import { useToast } from '@/hooks/use-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedSuppliers = localStorage.getItem('suppliers');
        if(storedSuppliers){
            setSuppliers(JSON.parse(storedSuppliers));
        }
    } catch(error) {
        console.error("Failed to load suppliers from localstorage", error);
        toast({ title: "Error", description: "Failed to load suppliers.", variant: "destructive"});
    }
  }, []);

  const persistSuppliers = (updatedSuppliers: Supplier[]) => {
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      setSuppliers(updatedSuppliers);
  }

  const handleOpenModal = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleAddSupplier = async (newSupplierData: Omit<Supplier, 'id'>) => {
    try {
      const newSupplier = { ...newSupplierData, id: new Date().toISOString() };
      const updatedSuppliers = [...suppliers, newSupplier];
      persistSuppliers(updatedSuppliers);
      toast({ title: "Success", description: "Supplier added successfully.", variant: "success" });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "Failed to add supplier.", variant: "destructive" });
    }
  };

  const handleUpdateSupplier = async (supplierId: string, updatedSupplierData: Partial<Supplier>) => {
    try {
      const updatedSuppliers = suppliers.map(s => s.id === supplierId ? {...s, ...updatedSupplierData, id: supplierId} : s);
      persistSuppliers(updatedSuppliers);
      toast({ title: "Success", description: "Supplier updated successfully.", variant: "success" });
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({ title: "Error", description: "Failed to update supplier.", variant: "destructive" });
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      const updatedSuppliers = suppliers.filter(s => s.id !== supplierId);
      persistSuppliers(updatedSuppliers);
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
