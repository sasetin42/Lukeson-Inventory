
import PageHeader from "@/components/page-header";
import { PlusCircle } from "lucide-react";

export default function JobOrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Job Orders" 
        description="Manage job orders." 
        icon={<PlusCircle className="h-6 w-6 text-orange-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Job Orders Page</h2>
        <p className="text-muted-foreground">Content for job orders goes here.</p>
      </div>
    </div>
  );
}
