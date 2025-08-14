import PageHeader from "@/components/page-header";
import { FilePlus } from "lucide-react";

export default function InboundOperationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Inbound Operations" 
        description="Manage inbound operations." 
        icon={<FilePlus className="h-6 w-6 text-pink-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Inbound Operations Page</h2>
        <p className="text-muted-foreground">Content for inbound operations goes here.</p>
      </div>
    </div>
  );
}
