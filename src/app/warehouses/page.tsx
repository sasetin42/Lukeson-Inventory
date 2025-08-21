
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Warehouse } from "lucide-react";
import WarehouseList from "@/components/warehouses/warehouse-list";
import { Warehouse as WarehouseType } from '@/lib/types';
import WarehouseFormModal from '@/components/warehouses/warehouse-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseType | null>(null);
  const { toast } = useToast();

  const fetchWarehouses = async () => {
    try {
      const warehousesRef = collection(db, 'warehouses');
      const snapshot = await getDocs(warehousesRef);
      const loadedWarehouses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WarehouseType));
      setWarehouses(loadedWarehouses);
    } catch (error) {
      console.error("Error fetching warehouses: ", error);
      toast({
        title: "Error",
        description: "Failed to load warehouses. Please check your connection and permissions.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenModal = (warehouse: WarehouseType | null) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleSaveWarehouse = async (warehouseData: Omit<WarehouseType, 'id' | 'createdAt' | 'modifiedAt'> & {id?: string}) => {
      try {
          if (warehouseData.id) {
              const { id, ...dataToSave } = warehouseData;
              const warehouseRef = doc(db, "warehouses", id);
              await setDoc(warehouseRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Warehouse updated successfully.", variant: "success" });
          } else {
              const { id, ...dataToSave } = warehouseData;
              await addDoc(collection(db, "warehouses"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Warehouse added successfully.", variant: "success" });
          }
          setIsModalOpen(false);
          fetchWarehouses();
      } catch (error) {
          console.error("Error saving warehouse: ", error);
          toast({ title: "Error", description: "Failed to save warehouse.", variant: "destructive" });
      }
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    try {
      await deleteDoc(doc(db, "warehouses", warehouseId));
      toast({ title: "Success", description: "Warehouse deleted successfully.", variant: "success" });
      fetchWarehouses();
    } catch (error) {
      console.error("Error deleting warehouse: ", error);
      toast({ title: "Error", description: "Failed to delete warehouse.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Warehouses"
        description="Manage your warehouse and storage locations."
        icon={<Warehouse className="h-6 w-6 text-green-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        }
      />
      <WarehouseList 
        warehouses={warehouses} 
        onEdit={handleOpenModal}
        onDelete={handleDeleteWarehouse}
      />
      {isModalOpen && (
        <WarehouseFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveWarehouse}
          warehouse={editingWarehouse}
        />
      )}
    </div>
  );
}
