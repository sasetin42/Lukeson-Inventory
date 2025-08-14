import PageHeader from "@/components/page-header";
import { Goal } from "lucide-react";

export default function ReplenishmentPlanningPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Replenishment Planning" 
        description="Plan product replenishment." 
        icon={<Goal className="h-6 w-6 text-orange-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Replenishment Planning Page</h2>
        <p className="text-muted-foreground">Content for replenishment planning goes here.</p>
      </div>
    </div>
  );
}
