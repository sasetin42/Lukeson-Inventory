
import PageHeader from "@/components/page-header";
import { FileText } from "lucide-react";

export default function VariationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Variations" 
        description="This page has been removed." 
        icon={<FileText className="h-6 w-6 text-purple-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Page Removed</h2>
        <p className="text-muted-foreground">This feature is no longer available.</p>
      </div>
    </div>
  );
}
