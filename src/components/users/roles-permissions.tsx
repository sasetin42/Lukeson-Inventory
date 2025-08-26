
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Eye, Shield, PlusCircle } from 'lucide-react';
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const permissionsData = [
  { module: 'Dashboard', admin: 'Full Access', manager: 'Full Access', viewer: 'Read-only' },
  { module: 'Analytics', admin: 'Full Access', manager: 'Full Access', viewer: 'Read-only' },
  { module: 'Products', admin: 'Full Access', manager: 'Full Access', viewer: 'Read-only' },
  { module: 'Warehouses', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Stock Alerts', admin: 'Full Access', manager: 'Full Access', viewer: 'Read-only' },
  { module: 'Inventory Settings', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Quotations', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Sales Orders', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Job Order', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Sales Invoices', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Payments', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Purchase Orders', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Goods Receipts', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Customers', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Suppliers', admin: 'Full Access', manager: 'Full Access', viewer: 'No Access' },
  { module: 'Finance Reports', admin: 'Full Access', manager: 'Full Access', viewer: 'Read-only' },
  { module: 'System Settings', admin: 'Full Access', manager: 'No Access', viewer: 'No Access' },
  { module: 'Users & Roles', admin: 'Full Access', manager: 'No Access', viewer: 'No Access' },
  { module: 'System Security', admin: 'Full Access', manager: 'No Access', viewer: 'No Access' },
  { module: 'System Backup', admin: 'Full Access', manager: 'No Access', viewer: 'No Access' },
];

const PermissionIcon = ({ permission }: { permission: string }) => {
    if (permission === 'Full Access') {
        return <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />;
    }
    if (permission === 'Read-only') {
        return <Eye className="h-5 w-5 text-blue-500 mx-auto" />;
    }
    if (permission === 'No Access') {
        return <XCircle className="h-5 w-5 text-red-500 mx-auto" />;
    }
    return null;
};

export default function RolesPermissions() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-500" />
                <div>
                    <CardTitle>Roles & Permissions Matrix</CardTitle>
                    <CardDescription>
                    An overview of what each user role can access and do in the system.
                    </CardDescription>
                </div>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Role
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-1/4">Module</TableHead>
                <TableHead className="text-center w-1/4">
                    <Badge variant="destructive">Admin</Badge>
                </TableHead>
                <TableHead className="text-center w-1/4">
                    <Badge variant="secondary">Manager</Badge>
                </TableHead>
                <TableHead className="text-center w-1/4">
                    <Badge variant="outline">Viewer</Badge>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {permissionsData.map((row) => (
                <TableRow key={row.module}>
                    <TableCell className="font-medium">{row.module}</TableCell>
                    <TableCell className="text-center">
                        <PermissionIcon permission={row.admin} />
                    </TableCell>
                    <TableCell className="text-center">
                        <PermissionIcon permission={row.manager} />
                    </TableCell>
                    <TableCell className="text-center">
                        <PermissionIcon permission={row.viewer} />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
