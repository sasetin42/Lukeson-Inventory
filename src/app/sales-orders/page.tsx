import PageHeader from "@/components/page-header";
import { ShoppingCart } from "lucide-react";

export default function SalesOrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Sales Orders" 
        description="Manage sales orders." 
        icon={<ShoppingCart className="h-6 w-6 text-red-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Sales Orders Page</h2>
        <p className="text-muted-foreground">Content for sales orders goes here.</p>
      </div>
    </div>
  );
}
