import PageHeader from "@/components/page-header";
import { BarChart3 } from "lucide-react";

export default function ProcurementReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Reports" 
        description="View procurement reports." 
        icon={<BarChart3 className="h-6 w-6 text-red-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Procurement Reports Page</h2>
        <p className="text-muted-foreground">Content for procurement reports goes here.</p>
      </div>
    </div>
  );
}
