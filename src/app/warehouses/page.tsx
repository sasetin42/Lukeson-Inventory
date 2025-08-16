
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Warehouse, PlusCircle } from "lucide-react";

export default function WarehousesPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Warehouses"
        description="Manage your warehouse and storage locations."
        icon={<Warehouse className="h-6 w-6 text-green-500" />}
        actions={
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Warehouse
            </Button>
        }
      />
      <Card>
        <CardHeader>
            <CardTitle>Warehouse List</CardTitle>
            <CardDescription>A list of all your warehouses.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Warehouse list content will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
