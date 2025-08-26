
'use client';
import { Product, SalesOrder } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface BalanceSheetProps {
    products: Product[];
    sales: SalesOrder[];
}

export default function BalanceSheet({ products, sales }: BalanceSheetProps) {
    const inventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const accountsReceivable = sales.filter(s => s.status === 'Invoiced' || s.status === 'Fulfilled').reduce((acc, sale) => acc + sale.totalAmount, 0); // Simplified
    const cash = 500000;
    const totalCurrentAssets = cash + accountsReceivable + inventoryValue;
    
    const propertyAndEquipment = 2000000;
    const totalAssets = totalCurrentAssets + propertyAndEquipment;

    const accountsPayable = 150000;
    const shortTermLoans = 200000;
    const totalCurrentLiabilities = accountsPayable + shortTermLoans;
    
    const longTermDebt = 500000;
    const totalLiabilities = totalCurrentLiabilities + longTermDebt;
    
    const ownersEquity = totalAssets - totalLiabilities;
    const totalLiabilitiesAndEquity = totalLiabilities + ownersEquity;
    
    const formatCurrency = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Balance Sheet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold text-md mb-2">Assets</h4>
                    <Table>
                        <TableBody>
                            <TableRow><TableCell colSpan={2} className="font-semibold">Current Assets</TableCell></TableRow>
                            <TableRow>
                                <TableCell className="pl-8">Cash & Cash Equivalents</TableCell>
                                <TableCell className="text-right">{formatCurrency(cash)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-8">Accounts Receivable</TableCell>
                                <TableCell className="text-right">{formatCurrency(accountsReceivable)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="pl-8">Inventory</TableCell>
                                <TableCell className="text-right">{formatCurrency(inventoryValue)}</TableCell>
                            </TableRow>
                            <TableRow className="font-semibold border-t">
                                <TableCell>Total Current Assets</TableCell>
                                <TableCell className="text-right">{formatCurrency(totalCurrentAssets)}</TableCell>
                            </TableRow>
                            
                            <TableRow><TableCell colSpan={2} className="font-semibold pt-6">Non-Current Assets</TableCell></TableRow>
                            <TableRow>
                                <TableCell className="pl-8">Property, Plant & Equipment</TableCell>
                                <TableCell className="text-right">{formatCurrency(propertyAndEquipment)}</TableCell>
                            </TableRow>

                            <TableRow className="font-bold text-lg bg-muted/50">
                                <TableCell>Total Assets</TableCell>
                                <TableCell className="text-right">{formatCurrency(totalAssets)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <div>
                    <h4 className="font-bold text-md mb-2">Liabilities & Equity</h4>
                    <Table>
                        <TableBody>
                             <TableRow><TableCell colSpan={2} className="font-semibold">Current Liabilities</TableCell></TableRow>
                            <TableRow>
                                <TableCell className="pl-8">Accounts Payable</TableCell>
                                <TableCell className="text-right">{formatCurrency(accountsPayable)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="pl-8">Short-term Loans</TableCell>
                                <TableCell className="text-right">{formatCurrency(shortTermLoans)}</TableCell>
                            </TableRow>
                            <TableRow className="font-semibold border-t">
                                <TableCell>Total Current Liabilities</TableCell>
                                <TableCell className="text-right">{formatCurrency(totalCurrentLiabilities)}</TableCell>
                            </TableRow>

                             <TableRow><TableCell colSpan={2} className="font-semibold pt-6">Non-Current Liabilities</TableCell></TableRow>
                             <TableRow>
                                <TableCell className="pl-8">Long-term Debt</TableCell>
                                <TableCell className="text-right">{formatCurrency(longTermDebt)}</TableCell>
                            </TableRow>
                            <TableRow className="font-semibold border-t">
                                <TableCell>Total Liabilities</TableCell>
                                <TableCell className="text-right">{formatCurrency(totalLiabilities)}</TableCell>
                            </TableRow>

                            <TableRow><TableCell colSpan={2} className="font-semibold pt-6">Owner's Equity</TableCell></TableRow>
                            <TableRow>
                                <TableCell className="pl-8">Equity</TableCell>
                                <TableCell className="text-right">{formatCurrency(ownersEquity)}</TableCell>
                            </TableRow>
                            
                             <TableRow className="font-bold text-lg bg-muted/50">
                                <TableCell>Total Liabilities & Equity</TableCell>
                                <TableCell className="text-right">{formatCurrency(totalLiabilitiesAndEquity)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
