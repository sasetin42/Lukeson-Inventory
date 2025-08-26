
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FileCode, PlusCircle } from "lucide-react";
import JournalEntryList from "@/components/journals/journal-entry-list";
import { JournalEntry, Account } from '@/lib/types';
import JournalEntryFormModal from '@/components/journals/journal-entry-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function JournalEntriesPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const entriesQuery = query(collection(db, 'journalEntries'), orderBy('date', 'desc'));
    const unsubscribeEntries = onSnapshot(entriesQuery, (snapshot) => {
      const loadedEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
      setJournalEntries(loadedEntries);
    }, (error) => {
      console.error("Error fetching journal entries:", error);
      toast({ title: "Error", description: "Failed to load journal entries.", variant: "destructive" });
    });

    const accountsRef = collection(db, 'accounts');
    const unsubscribeAccounts = onSnapshot(accountsRef, (snapshot) => {
        const loadedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
        setAccounts(loadedAccounts);
    });

    return () => {
        unsubscribeEntries();
        unsubscribeAccounts();
    }
  }, [toast]);

  const handleOpenModal = (entry: JournalEntry | null) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleSaveEntry = async (entryData: Omit<JournalEntry, 'id'> & {id?: string}) => {
    const totalDebits = entryData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = entryData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.001) {
        toast({ title: "Unbalanced Entry", description: "Total debits must equal total credits.", variant: "destructive" });
        return;
    }

    try {
      if (entryData.id) {
        const { id, ...dataToSave } = entryData;
        const entryRef = doc(db, "journalEntries", id);
        await setDoc(entryRef, { ...dataToSave, modifiedAt: serverTimestamp() }, { merge: true });
        toast({ title: "Success", description: "Journal Entry updated successfully.", variant: "success" });
      } else {
        const { id, ...dataToSave } = entryData;
        await addDoc(collection(db, "journalEntries"), { ...dataToSave, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
        toast({ title: "Success", description: "Journal Entry added successfully.", variant: "success" });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving journal entry: ", error);
      toast({ title: "Error", description: "Failed to save journal entry.", variant: "destructive" });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteDoc(doc(db, "journalEntries", entryId));
    toast({ title: "Success", description: "Journal Entry deleted successfully.", variant: "destructive" });
  };
  
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Journal Entries"
        description="Record and view your company's financial transactions."
        icon={<FileCode className="h-6 w-6 text-red-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Journal Entry
          </Button>
        }
      />
      <JournalEntryList
        entries={journalEntries}
        onEdit={handleOpenModal}
        onDelete={handleDeleteEntry}
      />
      {isModalOpen && (
          <JournalEntryFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveEntry}
            entry={editingEntry}
            accounts={accounts}
          />
      )}
    </div>
  );
}
