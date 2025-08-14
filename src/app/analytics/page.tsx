import PageHeader from "@/components/page-header";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Analytics" 
        description="Detailed analytics and reports." 
        icon={<BarChart2 className="h-6 w-6 text-green-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Analytics Page</h2>
        <p className="text-muted-foreground">Content for analytics goes here.</p>
      </div>
    </div>
  );
}
