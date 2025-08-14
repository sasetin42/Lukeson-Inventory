import PageHeader from "@/components/page-header";
import { Users } from "lucide-react";

export default function CustomerPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Customer" 
        description="Manage customers." 
        icon={<Users className="h-6 w-6 text-purple-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Customer Page</h2>
        <p className="text-muted-foreground">Content for customers goes here.</p>
      </div>
    </div>
  );
}
