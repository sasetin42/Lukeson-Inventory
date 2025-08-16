
import PageHeader from "@/components/page-header";
import { LayoutGrid } from "lucide-react";

export default function CategoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Category"
        description="Manage your product categories."
        icon={<LayoutGrid className="h-6 w-6 text-red-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Category Page</h2>
        <p className="text-muted-foreground">Content for categories goes here.</p>
      </div>
    </div>
  );
}
