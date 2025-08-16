
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quickStats } from "@/lib/dashboard-data";
import { Zap } from "lucide-react";

export default function QuickStats() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle>Quick Stats</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
