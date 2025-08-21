
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck } from "lucide-react";
import SupplierList from "@/components/suppliers/supplier-list";
import { Supplier } from '@/lib/types';
import SupplierFormModal from '@/components/suppliers/supplier-form-modal';
import { useToast } from '@/hooks/use-toast';
import { suppliers as initialSuppliers } from '@/lib/data';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleAddSupplier = async (newSupplierData: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...newSupplierData, id: `sup-${Date.now()}` };
    setSuppliers([newSupplier, ...suppliers]);
    toast({ title: "Success", description: "Supplier added successfully.", variant: "success" });
  };

  const handleUpdateSupplier = async (supplierId: string, updatedSupplierData: Partial<Supplier>) => {
    setSuppliers(suppliers.map(s => s.id === supplierId ? { ...s, ...updatedSupplierData } : s));
    toast({ title: "Success", description: "Supplier updated successfully.", variant: "success" });
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
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
        onAddSupplier={handleAddSupplier}
        onUpdateSupplier={handleUpdateSupplier}
        supplier={editingSupplier}
      />
    </div>
  );
}
