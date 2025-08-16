
import PageHeader from "@/components/page-header";
import { Warehouse } from "lucide-react";

export default function BinRackLocationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Bin / Rack Locations" 
        description="This page has been removed." 
        icon={<Warehouse className="h-6 w-6 text-green-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Page Removed</h2>
        <p className="text-muted-foreground">This feature is no longer available.</p>
      </div>
    </div>
  );
}
