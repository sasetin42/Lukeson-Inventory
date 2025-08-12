import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SupplierList from "@/components/suppliers/supplier-list";

export default function SuppliersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Suppliers"
        description="Maintain detailed profiles for each supplier."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        }
      />
      <SupplierList />
    </div>
  );
}
