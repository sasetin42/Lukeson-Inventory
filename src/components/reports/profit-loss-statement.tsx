
'use client';
import { SalesOrder, Product, PurchaseOrder } from '@/lib/types';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Separator } from '../ui/separator';

interface ProfitLossStatementProps {
    sales: SalesOrder[];
    products: Product[];
    purchases: PurchaseOrder[];
}

export default function ProfitLossStatement({ sales, products, purchases }: ProfitLossStatementProps) {
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    
    const cogs = sales.flatMap(sale => sale.lines).reduce((acc, line) => {
        const product = products.find(p => p.id === line.itemId);
        // Fallback to price if cost is not available
        const cost = ((product as any)?.cost || product?.price || 0) * line.quantity;
        return acc + cost;
    }, 0);
    
    const grossProfit = totalRevenue - cogs;

    // Mock expenses
    const salaries = grossProfit * 0.15;
    const rent = 50000;
    const marketing = grossProfit * 0.05;
    const utilities = 15000;
    const totalOperatingExpenses = salaries + rent + marketing + utilities;

    const operatingIncome = grossProfit - totalOperatingExpenses;

    const interestExpense = 5000;
    const incomeBeforeTax = operatingIncome - interestExpense;
    const taxExpense = incomeBeforeTax > 0 ? incomeBeforeTax * 0.25 : 0;
    const netIncome = incomeBeforeTax - taxExpense;

    const formatCurrency = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Profit & Loss Statement</h3>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-semibold">Total Revenue</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Cost of Goods Sold (COGS)</TableCell>
                        <TableCell className="text-right text-red-600">({formatCurrency(cogs)})</TableCell>
                    </TableRow>
                    <TableRow className="font-bold border-t-2">
                        <TableCell>Gross Profit</TableCell>
                        <TableCell className="text-right">{formatCurrency(grossProfit)}</TableCell>
                    </TableRow>
                    
                    <TableRow>
                        <TableCell colSpan={2} className="font-semibold pt-6">Operating Expenses</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Salaries & Wages</TableCell>
                        <TableCell className="text-right">({formatCurrency(salaries)})</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Rent & Lease</TableCell>
                        <TableCell className="text-right">({formatCurrency(rent)})</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Marketing & Advertising</TableCell>
                        <TableCell className="text-right">({formatCurrency(marketing)})</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Utilities</TableCell>
                        <TableCell className="text-right">({formatCurrency(utilities)})</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pl-8 font-semibold">Total Operating Expenses</TableCell>
                        <TableCell className="text-right text-red-600">({formatCurrency(totalOperatingExpenses)})</TableCell>
                    </TableRow>
                    <TableRow className="font-bold border-t">
                        <TableCell>Operating Income (EBITDA)</TableCell>
                        <TableCell className="text-right">{formatCurrency(operatingIncome)}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell className="pl-8 pt-4">Interest Expense</TableCell>
                        <TableCell className="text-right pt-4">({formatCurrency(interestExpense)})</TableCell>
                    </TableRow>
                     <TableRow className="font-semibold border-t">
                        <TableCell>Income Before Tax</TableCell>
                        <TableCell className="text-right">{formatCurrency(incomeBeforeTax)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pl-8">Tax Expense</TableCell>
                        <TableCell className="text-right">({formatCurrency(taxExpense)})</TableCell>
                    </TableRow>
                    <TableRow className="font-bold text-lg bg-muted/50">
                        <TableCell>Net Income</TableCell>
                        <TableCell className="text-right">{formatCurrency(netIncome)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
