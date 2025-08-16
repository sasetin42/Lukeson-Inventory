
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck } from "lucide-react";
import SupplierList from "@/components/suppliers/supplier-list";
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Supplier } from '@/lib/types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "suppliers"), (snapshot) => {
      const suppliersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
      setSuppliers(suppliersData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Suppliers"
        description="Maintain detailed profiles for each supplier."
        icon={<Truck className="h-6 w-6 text-orange-500" />}
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        }
      />
      <SupplierList suppliers={suppliers} />
    </div>
  );
}
