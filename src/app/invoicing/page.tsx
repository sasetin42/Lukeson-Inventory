import PageHeader from "@/components/page-header";
import { FileText } from "lucide-react";

export default function InvoicingPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Invoicing" 
        description="Manage invoices." 
        icon={<FileText className="h-6 w-6 text-yellow-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Invoicing Page</h2>
        <p className="text-muted-foreground">Content for invoicing goes here.</p>
      </div>
    </div>
  );
}
