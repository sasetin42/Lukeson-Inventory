import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { sales } from '@/lib/data';

export default function RecentSales() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>A list of the most recent sales.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {sales.map((sale) => (
          <div key={sale.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src={`https://placehold.co/40x40.png`} alt="Avatar" data-ai-hint="person avatar"/>
              <AvatarFallback>{sale.customerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{sale.customerName}</p>
              <p className="text-sm text-muted-foreground">{sale.productName}</p>
            </div>
            <div className="ml-auto font-medium">+₱{sale.total.toFixed(2)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
