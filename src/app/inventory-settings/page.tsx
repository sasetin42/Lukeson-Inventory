
import PageHeader from "@/components/page-header";
import { Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function InventorySettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inventory Settings"
        description="Configure your inventory management settings."
        icon={<Settings className="h-6 w-6 text-yellow-500" />}
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>
              Configure how you receive notifications for low stock levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="low-stock-alerts" className="text-base">Enable Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications when stock drops below the re-order level.
                </p>
              </div>
              <Switch id="low-stock-alerts" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Units of Measure</CardTitle>
            <CardDescription>
              Manage the units of measure used for your products (e.g., pcs, kg, m).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Manage Units</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
