
import PageHeader from "@/components/page-header";
import { BarChart3 } from "lucide-react";

export default function PurchaseAnalysisPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Purchase Analysis" 
        description="Analyze purchasing trends." 
        icon={<BarChart3 className="h-6 w-6 text-purple-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Purchase Analysis Report</h2>
        <p className="text-muted-foreground">Content for this report goes here.</p>
      </div>
    </div>
  );
}
