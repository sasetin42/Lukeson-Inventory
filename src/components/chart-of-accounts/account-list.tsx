
'use client'

import { useState } from 'react';
import { Account, AccountType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface AccountListProps {
    accounts: Account[];
    onEdit: (account: Account) => void;
    onDelete: (accountId: string) => void;
}

const accountTypes: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

export default function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const { toast } = useToast();
  
  const openDeleteAlert = (account: Account) => {
    // Basic check: Don't delete accounts with a balance
    if (account.balance !== 0) {
        toast({ title: "Cannot Delete", description: "Cannot delete an account with a non-zero balance.", variant: "destructive" });
        return;
    }
    setAccountToDelete(account);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
    if (!accountToDelete) return;
    try {
        await onDelete(accountToDelete.id);
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" });
    } finally {
        setIsDeleteAlertOpen(false);
        setAccountToDelete(null);
    }
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    (acc[account.type] = acc[account.type] || []).push(account);
    return acc;
  }, {} as Record<AccountType, Account[]>);

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>A list of all financial accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Sub-type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountTypes.map(type => (
                groupedAccounts[type] && (
                    <>
                        <TableRow key={type} className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={5} className="font-bold text-primary">{type}</TableCell>
                        </TableRow>
                        {groupedAccounts[type].sort((a,b) => a.code.localeCompare(b.code)).map((account) => (
                            <TableRow key={account.id}>
                                <TableCell className="font-mono">{account.code}</TableCell>
                                <TableCell className="font-medium">{account.name}</TableCell>
                                <TableCell>{account.subType}</TableCell>
                                <TableCell className="text-right font-mono">₱{account.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(account)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => openDeleteAlert(account)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </>
                )
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the account.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
