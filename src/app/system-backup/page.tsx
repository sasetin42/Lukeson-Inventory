
'use client';

import { useState } from 'react';
import PageHeader from "@/components/page-header";
import { DatabaseBackup, Download, History, RotateCcw, Trash2, CheckCircle, XCircle, Loader2, PlayCircle, Settings2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
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


type Backup = {
  id: string;
  date: Date;
  status: 'Successful' | 'Failed' | 'In Progress';
  type: 'Manual' | 'Automatic';
  size: string;
};

const initialBackups: Backup[] = [
  { id: 'bkp_1', date: new Date(2024, 6, 20, 4, 0, 0), status: 'Successful', type: 'Automatic', size: '15.2 MB' },
  { id: 'bkp_2', date: new Date(2024, 6, 19, 10, 30, 0), status: 'Successful', type: 'Manual', size: '14.8 MB' },
  { id: 'bkp_3', date: new Date(2024, 6, 13, 4, 0, 0), status: 'Failed', type: 'Automatic', size: 'N/A' },
];

const dataModules = [
    { id: 'products', label: 'Products & Inventory' },
    { id: 'sales', label: 'Sales & Invoices' },
    { id: 'purchasing', label: 'Purchasing & Suppliers' },
    { id: 'customers', label: 'Customer Data' },
    { id: 'users', label: 'Users & Roles' },
    { id: 'settings', label: 'System Settings' },
];

export default function SystemBackupPage() {
    const { toast } = useToast();
    const [backups, setBackups] = useState<Backup[]>(initialBackups);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupFrequency, setBackupFrequency] = useState('daily');
    const [includedData, setIncludedData] = useState<string[]>(dataModules.map(m => m.id));
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [backupToDelete, setBackupToDelete] = useState<Backup | null>(null);

    const handleBackupNow = () => {
        setIsBackingUp(true);
        const newBackup: Backup = {
            id: `bkp_${Date.now()}`,
            date: new Date(),
            status: 'In Progress',
            type: 'Manual',
            size: 'N/A',
        };
        setBackups([newBackup, ...backups]);

        toast({
            title: "Backup Started",
            description: "Your system data backup is now in progress.",
            icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        });

        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            setBackups(prev => prev.map(b => 
                b.id === newBackup.id 
                ? { ...b, status: success ? 'Successful' : 'Failed', size: success ? `${(Math.random() * 5 + 15).toFixed(1)} MB` : 'N/A' } 
                : b
            ));
            setIsBackingUp(false);
            toast({
                title: success ? "Backup Successful" : "Backup Failed",
                description: success ? "Your data has been successfully backed up." : "An error occurred during the backup process.",
                variant: success ? "success" : "destructive",
                icon: success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />
            });
        }, 3000);
    };
    
    const handleSaveSettings = () => {
        setIsSavingSettings(true);
        toast({ title: 'Saving...', description: 'Applying your backup preferences.', icon: <Loader2 className="h-5 w-5 animate-spin" /> });
        setTimeout(() => {
            setIsSavingSettings(false);
            toast({ title: 'Settings Saved', description: 'Your backup preferences have been updated.', variant: 'success', icon: <CheckCircle className="h-5 w-5" /> });
        }, 1500);
    }
    
    const openDeleteDialog = (backup: Backup) => {
        setBackupToDelete(backup);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteBackup = () => {
        if (!backupToDelete) return;
        setBackups(prev => prev.filter(b => b.id !== backupToDelete.id));
        toast({ title: 'Backup Deleted', description: `Backup from ${format(backupToDelete.date, 'PPp')} has been deleted.`, variant: 'destructive' });
        setIsDeleteAlertOpen(false);
        setBackupToDelete(null);
    };

    const lastSuccessfulBackup = backups.find(b => b.status === 'Successful');

    const handleToggleAllData = (checked: boolean) => {
        if (checked) {
            setIncludedData(dataModules.map(m => m.id));
        } else {
            setIncludedData([]);
        }
    };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="System Backup & Restore" 
        description="Manage and restore your system data to ensure business continuity." 
        icon={<DatabaseBackup className="h-6 w-6 text-sky-500" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Backup Status</CardTitle>
                         <Button onClick={handleBackupNow} disabled={isBackingUp}>
                            {isBackingUp ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> In Progress...</>
                            ) : (
                                <><PlayCircle className="mr-2 h-4 w-4" /> Backup Now</>
                            )}
                        </Button>
                    </div>
                    <CardDescription>
                        Summary of your latest data backup status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {lastSuccessfulBackup ? (
                         <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-200">
                             <CheckCircle className="h-8 w-8 text-green-600" />
                             <div>
                                 <p className="font-semibold">Last successful backup completed on:</p>
                                 <p className="text-lg font-bold text-green-700">{format(lastSuccessfulBackup.date, "PPpp")}</p>
                             </div>
                         </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                             <XCircle className="h-8 w-8 text-yellow-600" />
                             <div>
                                 <p className="font-semibold">No successful backups found.</p>
                                 <p className="text-yellow-700">It's highly recommended to create a backup immediately.</p>
                             </div>
                         </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-gray-500" /> Backup History</CardTitle>
                    <CardDescription>
                    Review your past backups and restore your system if needed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {backups.map(backup => (
                                <TableRow key={backup.id}>
                                    <TableCell className="font-medium">{format(backup.date, 'Pp')}</TableCell>
                                    <TableCell>
                                        <Badge variant={backup.status === 'Successful' ? 'success' : backup.status === 'Failed' ? 'destructive' : 'secondary'}>
                                            {backup.status === 'In Progress' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {backup.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{backup.type}</TableCell>
                                    <TableCell>{backup.size}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" disabled={backup.status !== 'Successful'}>
                                            <Download className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" disabled={backup.status !== 'Successful'}>
                                            <RotateCcw className="h-4 w-4 text-yellow-500" />
                                        </Button>
                                         <Button variant="ghost" size="icon" disabled={backup.status === 'In Progress'} onClick={() => openDeleteDialog(backup)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-gray-500" /> Backup Settings</CardTitle>
                    <CardDescription>
                    Configure your automatic backup preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="frequency">Automatic Backup Frequency</Label>
                        <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                            <SelectTrigger id="frequency">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Included Data Modules</Label>
                            <Button 
                                variant="link" 
                                className="text-xs p-0 h-auto"
                                onClick={() => handleToggleAllData(includedData.length < dataModules.length)}
                            >
                                {includedData.length < dataModules.length ? 'Select All' : 'Deselect All'}
                            </Button>
                        </div>
                        <div className="space-y-2 rounded-md border p-4">
                            {dataModules.map((module) => (
                                <div key={module.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={module.id} 
                                        checked={includedData.includes(module.id)}
                                        onCheckedChange={(checked) => {
                                            setIncludedData(prev => 
                                                checked ? [...prev, module.id] : prev.filter(id => id !== module.id)
                                            );
                                        }}
                                    />
                                    <label
                                        htmlFor={module.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                    {module.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSaveSettings} disabled={isSavingSettings}>
                         {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Settings
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              backup file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBackup}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
