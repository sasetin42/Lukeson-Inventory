import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import InventoryTable from "@/components/inventory/inventory-table";
import AddProductDialog from "@/components/inventory/add-product-dialog";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Inventory" 
        description="Track and manage your products." 
        actions={<AddProductDialog />}
      />
      <InventoryTable />
    </div>
  );
}
