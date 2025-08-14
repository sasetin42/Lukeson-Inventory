import PageHeader from "@/components/page-header";
import { Shield } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Security" 
        description="Manage system security." 
        icon={<Shield className="h-6 w-6 text-pink-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Security Page</h2>
        <p className="text-muted-foreground">Content for security goes here.</p>
      </div>
    </div>
  );
}
