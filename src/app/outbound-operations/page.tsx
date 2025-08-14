import PageHeader from "@/components/page-header";
import { FileMinus } from "lucide-react";

export default function OutboundOperationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Outbound Operations" 
        description="Manage outbound operations." 
        icon={<FileMinus className="h-6 w-6 text-sky-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Outbound Operations Page</h2>
        <p className="text-muted-foreground">Content for outbound operations goes here.</p>
      </div>
    </div>
  );
}
