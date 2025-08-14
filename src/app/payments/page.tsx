import PageHeader from "@/components/page-header";
import { FilePlus } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Payments" 
        description="Manage payments." 
        icon={<FilePlus className="h-6 w-6 text-indigo-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Payments Page</h2>
        <p className="text-muted-foreground">Content for payments goes here.</p>
      </div>
    </div>
  );
}
