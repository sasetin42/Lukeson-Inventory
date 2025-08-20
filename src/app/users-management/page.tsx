
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
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
              id: doc.id, 
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              lastLoginAt: data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : undefined,
            } as User
        });
      setUsers(usersData);
    }, (error) => {
      console.error("Failed to load users from Firestore", error);
      toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [toast]);

  const handleOpenModal = (user: User | null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  }

  const handleSaveUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string }) => {
    const { id, ...dataToSave } = userData;
    try {
        if (id) {
            const userRef = doc(db, 'users', id);
            await setDoc(userRef, dataToSave, { merge: true });
            toast({ title: "Success", description: "User updated successfully.", variant: "success" });
        } else {
            await addDoc(collection(db, 'users'), {
                ...dataToSave,
                createdAt: serverTimestamp(),
            });
            toast({ title: "Success", description: "User added successfully.", variant: "success" });
        }
        handleCloseModal();
    } catch (error) {
        console.error("Error saving user: ", error);
        toast({ title: "Error", description: "Failed to save user.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
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
