
import PageHeader from "@/components/page-header";
import { Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products"
        description="Manage your products and inventory."
        icon={<Package className="h-6 w-6 text-blue-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Products Page</h2>
        <p className="text-muted-foreground">Content for products goes here.</p>
      </div>
    </div>
  );
}
