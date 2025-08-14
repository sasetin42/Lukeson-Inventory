import PageHeader from "@/components/page-header";
import { FileText } from "lucide-react";

export default function VariationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Variations" 
        description="Manage product variations." 
        icon={<FileText className="h-6 w-6 text-purple-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Variations Page</h2>
        <p className="text-muted-foreground">Content for variations goes here.</p>
      </div>
    </div>
  );
}
