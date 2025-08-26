
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Eye, Shield, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Role } from "@/lib/types";

export const permissionsData = [
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

interface RolesPermissionsProps {
    roles: Role[];
    onAddRole: () => void;
    onEditRole: (role: Role) => void;
    onDeleteRole: (roleId: string) => void;
}

export default function RolesPermissions({ roles, onAddRole, onEditRole, onDeleteRole }: RolesPermissionsProps) {
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
            <Button onClick={onAddRole}>
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
                {roles.map(role => (
                    <TableHead key={role.id} className="text-center w-1/4">
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary">{role.name}</Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditRole(role)}><Edit className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteRole(role.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                        </div>
                    </TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {permissionsData.map((data) => (
                <TableRow key={data.module}>
                    <TableCell className="font-medium">{data.module}</TableCell>
                    {roles.map(role => (
                       <TableCell key={`${role.id}-${data.module}`} className="text-center">
                           <PermissionIcon permission={role.permissions[data.module] || 'No Access'} />
                       </TableCell> 
                    ))}
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
