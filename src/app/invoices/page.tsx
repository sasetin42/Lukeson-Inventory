import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle } from "lucide-react";
import InvoiceList from "@/components/invoices/invoice-list";

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Invoices"
        description="Manage your invoices and track payments."
        icon={<FileText className="h-6 w-6" />}
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />
      <InvoiceList />
    </div>
  );
}
