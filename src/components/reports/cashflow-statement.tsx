
'use client';
import { SalesOrder, PurchaseOrder } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface CashflowStatementProps {
    sales: SalesOrder[];
    purchases: PurchaseOrder[];
}

export default function CashflowStatement({ sales, purchases }: CashflowStatementProps) {
    // This is a simplified/mocked version. A real cashflow would need detailed accounting data.
    const cashFromSales = sales.filter(s => s.status === 'Fulfilled' || s.status === 'Invoiced').reduce((acc, sale) => acc + sale.totalAmount * 0.8, 0); // Assuming 80% collection
    const cashForPurchases = purchases.filter(p => p.status === 'Received').reduce((acc, purchase) => acc + purchase.totalAmount, 0);
    const cashForExpenses = 100000; // Mock operating expenses
    const netCashFromOps = cashFromSales - cashForPurchases - cashForExpenses;
    
    const cashFromInvesting = -50000; // Mock purchase of equipment
    const cashFromFinancing = 200000; // Mock loan received
    
    const netCashChange = netCashFromOps + cashFromInvesting + cashFromFinancing;
    const beginningCash = 300000; // Mock
    const endingCash = beginningCash + netCashChange;

    const formatCurrency = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Statement of Cash Flows</h3>
            <Table>
                <TableBody>
                    <TableRow><TableCell colSpan={2} className="font-semibold">Cash Flow from Operating Activities</TableCell></TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Cash received from customers</TableCell>
                        <TableCell className="text-right">{formatCurrency(cashFromSales)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Cash paid to suppliers</TableCell>
                        <TableCell className="text-right">({formatCurrency(cashForPurchases)})</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="pl-8">Cash paid for operating expenses</TableCell>
                        <TableCell className="text-right">({formatCurrency(cashForExpenses)})</TableCell>
                    </TableRow>
                    <TableRow className="font-semibold border-t">
                        <TableCell>Net Cash from Operations</TableCell>
                        <TableCell className="text-right">{formatCurrency(netCashFromOps)}</TableCell>
                    </TableRow>

                    <TableRow><TableCell colSpan={2} className="font-semibold pt-6">Cash Flow from Investing Activities</TableCell></TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Purchase of property and equipment</TableCell>
                        <TableCell className="text-right">({formatCurrency(Math.abs(cashFromInvesting))})</TableCell>
                    </TableRow>
                    <TableRow className="font-semibold border-t">
                        <TableCell>Net Cash from Investing</TableCell>
                        <TableCell className="text-right">{formatCurrency(cashFromInvesting)}</TableCell>
                    </TableRow>
                    
                    <TableRow><TableCell colSpan={2} className="font-semibold pt-6">Cash Flow from Financing Activities</TableCell></TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Proceeds from long-term debt</TableCell>
                        <TableCell className="text-right">{formatCurrency(cashFromFinancing)}</TableCell>
                    </TableRow>
                     <TableRow className="font-semibold border-t">
                        <TableCell>Net Cash from Financing</TableCell>
                        <TableCell className="text-right">{formatCurrency(cashFromFinancing)}</TableCell>
                    </TableRow>
                    
                    <TableRow className="font-bold border-t-2">
                        <TableCell>Net Change in Cash</TableCell>
                        <TableCell className="text-right">{formatCurrency(netCashChange)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Beginning Cash Balance</TableCell>
                        <TableCell className="text-right">{formatCurrency(beginningCash)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold text-lg bg-muted/50">
                        <TableCell>Ending Cash Balance</TableCell>
                        <TableCell className="text-right">{formatCurrency(endingCash)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
