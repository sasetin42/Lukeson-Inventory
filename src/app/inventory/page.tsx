import PageHeader from "@/components/page-header";
import { Package } from "lucide-react";
import InventoryTable from "@/components/inventory/inventory-table";
import AddProductDialog from "@/components/inventory/add-product-dialog";
import { Separator } from "@/components/ui/separator";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageHeader 
          title="Inventory" 
          description="Track and manage your products." 
          icon={<Package className="h-6 w-6 text-green-500" />}
          actions={<AddProductDialog />}
        />
        <Separator className="my-4" />
      </div>
      <InventoryTable />
    </div>
  );
}
