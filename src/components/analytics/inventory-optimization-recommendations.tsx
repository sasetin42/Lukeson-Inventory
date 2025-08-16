
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Package, TrendingDown } from "lucide-react";

const recommendations = [
  {
    icon: <TrendingDown className="h-5 w-5 text-red-500" />,
    title: "Slow-Moving Items",
    description: "Consider a promotional campaign or bundle deal for 'RGB LED Controller' and 'Outdoor LED Floodlight 50W' to increase sales velocity. They have been in stock for over 90 days.",
    action: "Create Promotion",
  },
  {
    icon: <Package className="h-5 w-5 text-yellow-500" />,
    title: "Re-order Levels",
    description: "The re-order level for 'Recessed Aluminium Profile 2m' seems high given its sales velocity. Adjust from 20 to 15 to reduce holding costs.",
    action: "Adjust Re-order Point",
  },
  {
    icon: <Lightbulb className="h-5 w-5 text-green-500" />,
    title: "New Product Opportunity",
    description: "High sales of LED Striplights suggest a demand for related accessories. Consider stocking connectors, dimmers, and drivers to increase average order value.",
    action: "Explore New Products",
  },
];


export default function InventoryOptimizationRecommendations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Optimization Recommendations</CardTitle>
        <CardDescription>AI-powered suggestions to improve inventory management.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.title} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0">{rec.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{rec.title}</p>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
            </div>
            <a href="#" className="text-sm font-medium text-primary hover:underline whitespace-nowrap">
              {rec.action} &rarr;
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
