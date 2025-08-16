
import PageHeader from "@/components/page-header";
import { BarChart3 } from "lucide-react";

export default function AuditTrailPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Audit Trail" 
        description="Track user activity and system changes." 
        icon={<BarChart3 className="h-6 w-6 text-red-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Audit Trail Report</h2>
        <p className="text-muted-foreground">Content for this report goes here.</p>
      </div>
    </div>
  );
}
