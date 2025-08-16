
import PageHeader from "@/components/page-header";
import { BarChart3 } from "lucide-react";

export default function SalesByCustomerPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Sales by Customer" 
        description="View sales reports filtered by customer." 
        icon={<BarChart3 className="h-6 w-6 text-green-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Sales by Customer Report</h2>
        <p className="text-muted-foreground">Content for this report goes here.</p>
      </div>
    </div>
  );
}
