
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users2, Shield, Activity } from "lucide-react";
import { User, Role, PermissionLevel } from '@/lib/types';
import UserList from '@/components/users/user-list';
import UserFormModal from '@/components/users/user-form-modal';
import RoleFormModal from '@/components/users/role-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp, onSnapshot, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import KpiCard from '@/components/kpi-card';
import RolesPermissions from '@/components/users/roles-permissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { navGroups } from '@/app/layout';
import UserDetailsModal from '@/components/users/user-details-modal';
import RoleDetailsModal from '@/components/users/role-details-modal';
import { useAuth } from '@/context/auth-context';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [isRoleDetailsModalOpen, setIsRoleDetailsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const { toast } = useToast();
  const { hasWriteAccess } = useAuth();
  const canWrite = hasWriteAccess('Users & Roles');

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const rolesRef = collection(db, 'roles');
    
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
    });
    
    const unsubscribeRoles = onSnapshot(rolesRef, (snapshot) => {
        setRoles(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Role)));
    });

    return () => {
        unsubscribeUsers();
        unsubscribeRoles();
    };
  }, []);

  const handleOpenUserModal = (user: User | null) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
    setIsUserDetailsModalOpen(false);
  };
  
  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  }
  
  const handleOpenRoleModal = (role: Role | null) => {
      setEditingRole(role);
      setIsRoleModalOpen(true);
  }

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
  }

  const handleOpenUserDetailsModal = (user: User) => {
    setViewingUser(user);
    setIsUserDetailsModalOpen(true);
  };

  const handleCloseUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false);
    setViewingUser(null);
  };

  const handleOpenRoleDetailsModal = (role: Role) => {
    setViewingRole(role);
    setIsRoleDetailsModalOpen(true);
  }

  const handleCloseRoleDetailsModal = () => {
    setIsRoleDetailsModalOpen(false);
    setViewingRole(null);
  }

  const handleSaveUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string, password?: string }) => {
    const { id, password, ...dataToSave } = userData;
    try {
        if (id) { // Editing existing user
            const userRef = doc(db, "users", id);
            // We only update fields that can be changed in the modal
            await updateDoc(userRef, {
                name: dataToSave.name,
                role: dataToSave.role,
                status: dataToSave.status,
                modifiedAt: serverTimestamp(),
            });
            toast({ title: "Success", description: "User updated successfully.", variant: "success" });
        } else { // Adding new user
            if (!password) {
                toast({ title: "Error", description: "Password is required for new users.", variant: "destructive" });
                return;
            }
            // Note: This only creates the user in Firebase Auth.
            // A corresponding Firestore document needs to be created, ideally with a Cloud Function trigger.
            // For this client-side solution, we'll create it directly.
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
            const firestoreId = userCredential.user.uid;
            
            const userRef = doc(db, "users", firestoreId);
            await setDoc(userRef, { 
                ...dataToSave, 
                createdAt: serverTimestamp(),
                modifiedAt: serverTimestamp(),
                lastLoginAt: null,
            });
            
            toast({ title: "Success", description: "User added successfully.", variant: "success" });
        }
        handleCloseUserModal();
    } catch (error: any) {
        console.error("Error saving user: ", error);
        toast({ title: "Error", description: `Failed to save user: ${error.message}`, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Note: This deletes the Firestore document, but not the Firebase Auth user.
      // Deleting the Auth user requires admin privileges and is best handled server-side.
      await deleteDoc(doc(db, "users", userId));
      toast({ title: "Success", description: "User record deleted successfully.", variant: "success" });
    } catch (error) {
       toast({ title: "Error", description: "Failed to delete user record.", variant: "destructive" });
    }
  };

  const handleSaveRole = async (roleData: Omit<Role, 'id'> & {id?: string}) => {
    const { id, ...dataToSave } = roleData;
    try {
      const docId = id || dataToSave.name.toLowerCase().replace(/\s+/g, '-');
      const roleRef = doc(db, 'roles', docId);
      await setDoc(roleRef, dataToSave, { merge: true });
      toast({ title: "Success", description: "Role saved successfully.", variant: "success" });
      handleCloseRoleModal();
    } catch (error) {
      console.error("Error saving role:", error);
      toast({ title: "Error", description: "Failed to save role.", variant: "destructive" });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    // Before deleting a role, check if any user is assigned to it.
    const isRoleInUse = users.some(user => user.role === roles.find(r => r.id === roleId)?.name);
    if(isRoleInUse){
        toast({ title: "Cannot Delete Role", description: "This role is currently assigned to one or more users.", variant: "destructive" });
        return;
    }
    try {
      await deleteDoc(doc(db, 'roles', roleId));
      toast({ title: "Success", description: "Role deleted successfully.", variant: "success" });
    } catch(error) {
       toast({ title: "Error", description: "Failed to delete role.", variant: "destructive" });
    }
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'Admin').length;

  const kpis = [
      { title: "Total Users", value: totalUsers, icon: Users2, color: "indigo" as const },
      { title: "Active Users", value: activeUsers, icon: Activity, color: "green" as const },
      { title: "Admins", value: adminUsers, icon: Shield, color: "red" as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Users & Roles" 
        description="Manage system users and their permissions." 
        icon={<Users2 className="h-6 w-6 text-indigo-500" />}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value as string}
            icon={kpi.icon}
            color={kpi.color}
            style={{ animationDelay: `${index * 100}ms` }}
            className="fade-in-up"
          />
        ))}
      </div>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <UserList 
            users={users} 
            onEdit={handleOpenUserModal} 
            onDelete={handleDeleteUser}
            onAddUser={() => handleOpenUserModal(null)}
            onView={handleOpenUserDetailsModal}
          />
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <RolesPermissions 
            roles={roles}
            users={users}
            onAddRole={() => handleOpenRoleModal(null)}
            onEditRole={handleOpenRoleModal}
            onDeleteRole={handleDeleteRole}
            onViewRole={handleOpenRoleDetailsModal}
          />
        </TabsContent>
      </Tabs>
      
      {isUserModalOpen && (
        <UserFormModal 
            isOpen={isUserModalOpen}
            onClose={handleCloseUserModal}
            onSave={handleSaveUser}
            user={editingUser}
            roles={roles}
        />
      )}
      {isRoleModalOpen && (
          <RoleFormModal
            isOpen={isRoleModalOpen}
            onClose={handleCloseRoleModal}
            onSave={handleSaveRole}
            role={editingRole}
            navGroups={navGroups}
          />
      )}
      {viewingUser && (
        <UserDetailsModal
            isOpen={isUserDetailsModalOpen}
            onClose={handleCloseUserDetailsModal}
            user={viewingUser}
            onEdit={handleOpenUserModal}
        />
      )}
      {viewingRole && (
        <RoleDetailsModal
          isOpen={isRoleDetailsModalOpen}
          onClose={handleCloseRoleDetailsModal}
          role={viewingRole}
        />
      )}
    </div>
  );
}
