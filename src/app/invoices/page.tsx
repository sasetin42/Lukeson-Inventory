import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import InvoiceList from "@/components/invoices/invoice-list";

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Manage your invoices and track payments."
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
