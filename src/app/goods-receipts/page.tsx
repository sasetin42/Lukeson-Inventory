import PageHeader from "@/components/page-header";
import { File } from "lucide-react";

export default function GoodsReceiptsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Goods Receipts" 
        description="Manage goods receipts." 
        icon={<File className="h-6 w-6 text-purple-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Goods Receipts Page</h2>
        <p className="text-muted-foreground">Content for goods receipts goes here.</p>
      </div>
    </div>
  );
}
