import PageHeader from "@/components/page-header";
import { ShoppingBag } from "lucide-react";

export default function PurchaseRequestsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Purchase Requests" 
        description="Manage purchase requests." 
        icon={<ShoppingBag className="h-6 w-6 text-blue-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Purchase Requests Page</h2>
        <p className="text-muted-foreground">Content for purchase requests goes here.</p>
      </div>
    </div>
  );
}
