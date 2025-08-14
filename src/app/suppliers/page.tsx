import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck } from "lucide-react";
import SupplierList from "@/components/suppliers/supplier-list";
import { Separator } from "@/components/ui/separator";

export default function SuppliersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageHeader
          title="Suppliers"
          description="Maintain detailed profiles for each supplier."
          icon={<Truck className="h-6 w-6 text-orange-500" />}
          actions={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          }
        />
        <Separator className="my-4" />
      </div>
      <SupplierList />
    </div>
  );
}
