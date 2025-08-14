import PageHeader from "@/components/page-header";
import { Users2 } from "lucide-react";

export default function UsersManagementPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Users Management" 
        description="Manage system users." 
        icon={<Users2 className="h-6 w-6 text-indigo-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Users Management Page</h2>
        <p className="text-muted-foreground">Content for users management goes here.</p>
      </div>
    </div>
  );
}
