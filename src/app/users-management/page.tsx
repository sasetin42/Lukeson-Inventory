
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users2, Shield, Activity } from "lucide-react";
import { User } from '@/lib/types';
import UserList from '@/components/users/user-list';
import UserFormModal from '@/components/users/user-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from "firebase/auth";
import KpiCard from '@/components/kpi-card';
import RolesPermissions from '@/components/users/roles-permissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const loadedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(loadedUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please check your connection and permissions.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: User | null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  }

  const handleSaveUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string, password?: string }) => {
    const { id, password, ...dataToSave } = userData;
    try {
        if (id) { // Editing existing user
            const userRef = doc(db, "users", id);
            await setDoc(userRef, { ...dataToSave, lastLoginAt: serverTimestamp() }, { merge: true });
            toast({ title: "Success", description: "User updated successfully.", variant: "success" });
        } else { // Adding new user
            if (!password) {
                toast({ title: "Error", description: "Password is required for new users.", variant: "destructive" });
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
            const firestoreId = userCredential.user.uid;
            
            const userRef = doc(db, "users", firestoreId);
            await setDoc(userRef, { ...dataToSave, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
            
            toast({ title: "Success", description: "User added successfully.", variant: "success" });
        }
        handleCloseModal();
        fetchUsers(); // refetch
    } catch (error: any) {
        console.error("Error saving user: ", error);
        toast({ title: "Error", description: `Failed to save user: ${error.message}`, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Note: In a real app, you would also delete the user from Firebase Auth.
      // This requires backend logic for security reasons. For now, we only delete from Firestore.
      await deleteDoc(doc(db, "users", userId));
      toast({ title: "Success", description: "User deleted successfully.", variant: "success" });
      fetchUsers(); // refetch
    } catch (error) {
       toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    }
  };

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
            onEdit={handleOpenModal} 
            onDelete={handleDeleteUser}
            onAddUser={() => handleOpenModal(null)}
          />
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <RolesPermissions />
        </TabsContent>
      </Tabs>
      
      {isModalOpen && (
        <UserFormModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveUser}
            user={editingUser}
        />
      )}
    </div>
  );
}
