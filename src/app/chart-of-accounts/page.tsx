
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Briefcase, PlusCircle } from "lucide-react";
import AccountList from "@/components/chart-of-accounts/account-list";
import { Account } from '@/lib/types';
import AccountFormModal from '@/components/chart-of-accounts/account-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const accountsRef = collection(db, 'accounts');
    const unsubscribe = onSnapshot(accountsRef, (snapshot) => {
        const loadedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
        setAccounts(loadedAccounts);
    }, (error) => {
        console.error("Error fetching accounts: ", error);
        toast({ title: "Error", description: "Failed to load chart of accounts.", variant: "destructive" });
    });
    return () => unsubscribe();
  }, [toast]);
  
  const handleOpenModal = (account: Account | null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (accountData: Omit<Account, 'id'> & {id?: string}) => {
    try {
      if (accountData.id) {
        const { id, ...dataToSave } = accountData;
        const accountRef = doc(db, "accounts", id);
        await setDoc(accountRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
        toast({ title: "Success", description: "Account updated successfully.", variant: "success" });
      } else {
        const { id, ...dataToSave } = accountData;
        await addDoc(collection(db, "accounts"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
        toast({ title: "Success", description: "Account added successfully.", variant: "success" });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving account: ", error);
      toast({ title: "Error", description: "Failed to save account.", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    // Add logic here to check if account is in use before deleting
    await deleteDoc(doc(db, "accounts", accountId));
    toast({ title: "Success", description: "Account deleted successfully.", variant: "success" });
  };
  
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Chart of Accounts"
        description="Manage your company's financial accounts."
        icon={<Briefcase className="h-6 w-6 text-sky-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        }
      />
      <AccountList
        accounts={accounts}
        onEdit={handleOpenModal}
        onDelete={handleDeleteAccount}
      />
      {isModalOpen && (
          <AccountFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveAccount}
            account={editingAccount}
          />
      )}
    </div>
  );
}
