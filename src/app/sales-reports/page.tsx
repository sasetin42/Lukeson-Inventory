import PageHeader from "@/components/page-header";
import { BarChart3 } from "lucide-react";

export default function SalesReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Reports & Analytics" 
        description="View sales reports and analytics." 
        icon={<BarChart3 className="h-6 w-6 text-sky-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Reports & Analytics Page</h2>
        <p className="text-muted-foreground">Content for sales reports and analytics goes here.</p>
      </div>
    </div>
  );
}
