
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users2 } from "lucide-react";
import { User } from '@/lib/types';
import UserList from '@/components/users/user-list';
import UserFormModal from '@/components/users/user-form-modal';
import { useToast } from '@/hooks/use-toast';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = () => {
        try {
            const storedUsers = localStorage.getItem('users');
            if (storedUsers) {
                setUsers(JSON.parse(storedUsers));
            }
        } catch (error) {
            console.error("Failed to load users from local storage", error);
            toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
        }
    };
    loadUsers();

    const handleStorageChange = (e: StorageEvent) => {
        if(e.key === 'users') {
            loadUsers();
        }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [toast]);

  const handleOpenModal = (user: User | null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  }

  const handleSaveUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string, password?: string }) => {
    const { id, ...dataToSave } = userData;
    try {
        let updatedUsers;
        if (id) { // Editing existing user
            updatedUsers = users.map(u => u.id === id ? { ...u, ...dataToSave } : u);
            toast({ title: "Success", description: "User updated successfully.", variant: "success" });
        } else { // Adding new user
            const newUser: User = {
                ...dataToSave,
                id: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                lastLoginAt: undefined,
            };
            updatedUsers = [...users, newUser];
            toast({ title: "Success", description: "User added successfully.", variant: "success" });
        }
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        window.dispatchEvent(new Event('storage'));
        handleCloseModal();
    } catch (error: any) {
        console.error("Error saving user: ", error);
        toast({ title: "Error", description: `Failed to save user: ${error.message}`, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      window.dispatchEvent(new Event('storage'));
      toast({ title: "Success", description: "User deleted successfully.", variant: "success" });
    } catch (error) {
      console.error("Error deleting user: ", error);
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    }
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
