
import PageHeader from "@/components/page-header";
import { Settings } from "lucide-react";

export default function InventorySettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inventory Settings"
        description="Configure your inventory settings."
        icon={<Settings className="h-6 w-6 text-yellow-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Inventory Settings Page</h2>
        <p className="text-muted-foreground">Content for inventory settings goes here.</p>
      </div>
    </div>
  );
}
