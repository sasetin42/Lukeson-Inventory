
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, UserPlus } from "lucide-react";
import CustomerList from "@/components/customers/customer-list";
import { Customer } from '@/lib/types';
import CustomerFormModal from '@/components/customers/customer-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import KpiCard from '@/components/kpi-card';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      const loadedCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(loadedCustomers);
    } catch (error) {
      console.error("Error fetching customers: ", error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please check your connection and permissions.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = (customer: Customer | null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id'> & {id?: string}) => {
      try {
          if (customerData.id) {
              const { id, ...dataToSave } = customerData;
              const customerRef = doc(db, "customers", id);
              await setDoc(customerRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
              toast({ title: "Success", description: "Customer updated successfully.", variant: "success" });
          } else {
              const { id, ...dataToSave } = customerData;
              await addDoc(collection(db, "customers"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
              toast({ title: "Success", description: "Customer added successfully.", variant: "success" });
          }
          setIsModalOpen(false);
          fetchCustomers(); // refetch
      } catch (error) {
          console.error("Error saving customer: ", error);
          toast({ title: "Error", description: "Failed to save customer.", variant: "destructive" });
      }
  };


  const handleDeleteCustomer = async (customerId: string) => {
    await deleteDoc(doc(db, "customers", customerId));
    toast({ title: "Success", description: "Customer deleted successfully.", variant: "success" });
    fetchCustomers(); // refetch
  };

  const totalCustomers = customers.length;
  const newThisMonth = customers.filter(c => {
    const createdAt = (c as any).createdAt?.toDate ? (c as any).createdAt.toDate() : new Date();
    return createdAt > new Date(new Date().setDate(new Date().getDate() - 30));
  }).length;
  
  const kpis = [
      { title: "Total Customers", value: totalCustomers, icon: Users, color: "purple" as const },
      { title: "New This Month", value: newThisMonth, icon: UserPlus, color: "blue" as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Customers"
        description="Manage all your customer profiles."
        icon={<Users className="h-6 w-6 text-purple-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={`${kpi.value}`}
            icon={kpi.icon}
            color={kpi.color}
            style={{ animationDelay: `${index * 100}ms` }}
            className="fade-in-up"
          />
        ))}
      </div>
      <CustomerList 
        customers={customers} 
        onEdit={handleOpenModal}
        onDelete={handleDeleteCustomer}
      />
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />
    </div>
  );
}
