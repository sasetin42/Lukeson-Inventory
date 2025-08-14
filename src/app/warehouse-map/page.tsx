import PageHeader from "@/components/page-header";
import { Building } from "lucide-react";

export default function WarehouseMapPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Warehouse Map" 
        description="View the warehouse map." 
        icon={<Building className="h-6 w-6 text-blue-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Warehouse Map Page</h2>
        <p className="text-muted-foreground">Content for the warehouse map goes here.</p>
      </div>
    </div>
  );
}
