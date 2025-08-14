import PageHeader from "@/components/page-header";
import { List } from "lucide-react";

export default function ItemMasterListPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Item Master List" 
        description="Manage the item master list." 
        icon={<List className="h-6 w-6 text-red-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Item Master List Page</h2>
        <p className="text-muted-foreground">Content for the item master list goes here.</p>
      </div>
    </div>
  );
}
