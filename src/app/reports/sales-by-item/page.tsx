
import PageHeader from "@/components/page-header";
import { BarChart3 } from "lucide-react";

export default function SalesByItemPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Sales by Item" 
        description="View sales reports filtered by item." 
        icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Sales by Item Report</h2>
        <p className="text-muted-foreground">Content for this report goes here.</p>
      </div>
    </div>
  );
}
