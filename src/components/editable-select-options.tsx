
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Settings, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface EditableSelectOptionsProps {
    value: string;
    onValueChange: (value: string) => void;
    optionsType: string;
    placeholder: string;
    label: string;
    unit?: string;
}

export function EditableSelectOptions({ 
    value, 
    onValueChange, 
    optionsType,
    placeholder,
    label,
    unit
}: EditableSelectOptionsProps) {
    const [options, setOptions] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const docRef = doc(db, 'dropdownOptions', optionsType);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setOptions(doc.data().values || []);
            }
        });
        return () => unsubscribe();
    }, [optionsType]);

    return (
        <div className="flex items-center gap-1">
            <Select onValueChange={onValueChange} value={value}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map(opt => <SelectItem key={opt} value={opt}>{opt}{unit}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsModalOpen(true)}>
                <Settings className="h-4 w-4" />
            </Button>
            <OptionsManagerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                options={options}
                optionsType={optionsType}
                label={label}
                unit={unit}
            />
        </div>
    );
}

interface OptionsManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    options: string[];
    optionsType: string;
    label: string;
    unit?: string;
}

function OptionsManagerModal({ isOpen, onClose, options, optionsType, label, unit }: OptionsManagerModalProps) {
    const { toast } = useToast();
    const [newOption, setNewOption] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddOption = async () => {
        if (!newOption.trim()) return;
        setIsSaving(true);
        const docRef = doc(db, 'dropdownOptions', optionsType);
        try {
            await updateDoc(docRef, {
                values: arrayUnion(newOption.trim())
            });
            setNewOption('');
            toast({ title: "Success", description: "Option added." });
        } catch (error) {
            // If doc doesn't exist, create it
            if ((error as any).code === 'not-found') {
                await setDoc(docRef, { values: [newOption.trim()] });
                setNewOption('');
                toast({ title: "Success", description: "Option added." });
            } else {
                console.error("Error adding option:", error);
                toast({ title: "Error", description: "Could not add option.", variant: "destructive" });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOption = async (optionToDelete: string) => {
        setIsSaving(true);
        const docRef = doc(db, 'dropdownOptions', optionsType);
        try {
            await updateDoc(docRef, {
                values: arrayRemove(optionToDelete)
            });
            toast({ title: "Success", description: "Option removed." });
        } catch (error) {
            console.error("Error removing option:", error);
            toast({ title: "Error", description: "Could not remove option.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage {label} Options</DialogTitle>
                    <DialogDescription>Add or remove selectable options for the {label} field.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Existing Options</Label>
                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto">
                            {options.length > 0 ? options.map(opt => (
                                <div key={opt} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <span>{opt}{unit}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteOption(opt)} disabled={isSaving}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )) : <p className="text-sm text-muted-foreground p-2 text-center">No options yet.</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-option">Add New Option</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="new-option"
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                placeholder={`Enter new ${label}`}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                            />
                            <Button onClick={handleAddOption} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                                <span className="ml-2">Add</span>
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
    