import PageHeader from "@/components/page-header";
import { ShoppingCart } from "lucide-react";

export default function PurchaseOrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Purchase Orders" 
        description="Manage purchase orders." 
        icon={<ShoppingCart className="h-6 w-6 text-orange-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Purchase Orders Page</h2>
        <p className="text-muted-foreground">Content for purchase orders goes here.</p>
      </div>
    </div>
  );
}
