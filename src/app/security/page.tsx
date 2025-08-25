
import PageHeader from "@/components/page-header";
import { Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="System Security" 
        description="Manage system security settings and monitor activity." 
        icon={<Shield className="h-6 w-6 text-pink-500" />}
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Overview</CardTitle>
            <CardDescription>
              Review your current security configuration and recent activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
                Your application is secured with Firebase Authentication.
                All data access should be controlled via Firestore Security Rules.
                It is critical to configure these rules in the Firebase Console
                to prevent unauthorized data access.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Enable 2FA</Button>
             <p className="text-xs text-muted-foreground mt-2">
                This feature is not yet available.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
