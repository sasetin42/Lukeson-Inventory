
import { Supplier } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SupplierListProps {
    suppliers: Supplier[];
}

export default function SupplierList({ suppliers }: SupplierListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <Card key={supplier.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://placehold.co/48x48.png`} alt={supplier.name} data-ai-hint="company logo"/>
                <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{supplier.name}</CardTitle>
                <CardDescription>Contact: {supplier.contact.name}</CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                <DropdownMenuItem>View Purchase Orders</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{supplier.address}</p>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.contact.phone}</span>
                </div>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                Contract: {supplier.contractTerms}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
