import PageHeader from "@/components/page-header";
import { DatabaseBackup } from "lucide-react";

export default function SystemBackupPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="System Backup" 
        description="Manage system backups." 
        icon={<DatabaseBackup className="h-6 w-6 text-sky-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">System Backup Page</h2>
        <p className="text-muted-foreground">Content for system backup goes here.</p>
      </div>
    </div>
  );
}
