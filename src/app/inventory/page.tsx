import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload, ListPlus } from "lucide-react";
import InventoryKpiCards from "@/components/inventory/inventory-kpi-cards";
import ActionCards from "@/components/inventory/action-cards";
import ProductsTab from "@/components/inventory/products-tab";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Inventory Overview" 
        description="Complete inventory management with clickable widgets and analytics"
        actions={
          <div className="flex items-center gap-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline">
              <ListPlus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />
      <InventoryKpiCards />
      <ActionCards />
      <ProductsTab />
    </div>
  );
}
