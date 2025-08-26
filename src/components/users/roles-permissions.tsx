
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, XCircle, Eye, Shield, PlusCircle, Edit, Trash2, Users } from 'lucide-react';
import { Button } from "../ui/button";
import { Role } from "@/lib/types";
import { cn } from '@/lib/utils';

interface RolesPermissionsProps {
    roles: Role[];
    onAddRole: () => void;
    onEditRole: (role: Role) => void;
    onDeleteRole: (roleId: string) => void;
    onViewRole: (role: Role) => void;
}

export default function RolesPermissions({ roles, onAddRole, onEditRole, onDeleteRole, onViewRole }: RolesPermissionsProps) {
  
  const countUsersInRole = (roleName: string) => {
    // This is a placeholder. In a real app, you'd fetch user counts.
    if (roleName === 'Admin') return 1;
    if (roleName === 'Manager') return 3;
    if (roleName === 'Viewer') return 5;
    return 0;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-500" />
                <div>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>
                    Manage what each user role can access and do in the system.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => {
                const isAdmin = role.name === 'Admin';
                const userCount = countUsersInRole(role.name);
                return (
                    <Card 
                        key={role.id} 
                        className={cn(
                            "flex flex-col hover:shadow-lg transition-shadow cursor-pointer",
                            isAdmin && "text-white"
                        )}
                        style={isAdmin ? { backgroundColor: '#5F8400' } : {}}
                        onClick={() => onViewRole(role)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{role.name}</span>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" className={cn("h-7 w-7", isAdmin && "hover:bg-white/20")} onClick={(e) => { e.stopPropagation(); onEditRole(role); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className={cn("h-7 w-7", isAdmin && "hover:bg-white/20")} onClick={(e) => { e.stopPropagation(); onDeleteRole(role.id); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardTitle>
                            <CardDescription className={cn(isAdmin && "text-white/80")}>
                                {isAdmin ? "Admins managing communications, maintaining records, and ensuring efficient workflow." : `A short description about the ${role.name} role.`}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto">
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4" />
                                <span>{userCount} {userCount === 1 ? 'user' : 'users'} in this role</span>
                            </div>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}

// Dummy export to keep other files working
export const permissionsDataBackup = [
  { module: 'Dashboard', admin: 'Full Access', manager: 'Full Access', viewer: 'Read-only' },
];
