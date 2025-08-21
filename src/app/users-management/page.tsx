
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users2 } from "lucide-react";
import { User } from '@/lib/types';
import UserList from '@/components/users/user-list';
import UserFormModal from '@/components/users/user-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { ref, onValue, set, remove, push, serverTimestamp } from 'firebase/database';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const loadedUsers = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...(value as Omit<User, 'id'>) })) : [];
        setUsers(loadedUsers);
    });
    return () => unsubscribe();
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
    const { id, password, ...dataToSave } = userData; // We don't save password to DB in this example
    try {
        if (id) { // Editing existing user
            const userRef = ref(db, `users/${id}`);
            await set(userRef, { ...(users.find(u => u.id === id)), ...dataToSave, lastLoginAt: new Date().toISOString() });
            toast({ title: "Success", description: "User updated successfully.", variant: "success" });
        } else { // Adding new user
            const usersRef = ref(db, 'users');
            const newUserRef = push(usersRef);
            await set(newUserRef, { ...dataToSave, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
            toast({ title: "Success", description: "User added successfully.", variant: "success" });
        }
        handleCloseModal();
    } catch (error: any) {
        console.error("Error saving user: ", error);
        toast({ title: "Error", description: `Failed to save user: ${error.message}`, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await remove(ref(db, `users/${userId}`));
    toast({ title: "Success", description: "User deleted successfully.", variant: "success" });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Users & Roles" 
        description="Manage system users and their permissions." 
        icon={<Users2 className="h-6 w-6 text-indigo-500" />}
        actions={
            <Button onClick={() => handleOpenModal(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
            </Button>
        }
      />
      <UserList 
        users={users} 
        onEdit={handleOpenModal} 
        onDelete={handleDeleteUser} 
      />
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
