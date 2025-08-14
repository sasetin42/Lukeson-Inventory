import PageHeader from "@/components/page-header";
import { FileCog } from "lucide-react";

export default function InvoiceTemplatesPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Invoice Templates" 
        description="Manage invoice templates." 
        icon={<FileCog className="h-6 w-6 text-pink-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Invoice Templates Page</h2>
        <p className="text-muted-foreground">Content for invoice templates goes here.</p>
      </div>
    </div>
  );
}
