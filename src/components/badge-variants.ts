'use client';

import { JobOrder, PurchaseOrder, Quotation, SalesOrder, Invoice } from "@/lib/types";

export const getQuotationStatusVariant = (status?: Quotation['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    if (!status) return 'outline';
    switch (status) {
        case 'Accepted': return 'success';
        case 'Sent': return 'secondary';
        case 'Draft': return 'outline';
        case 'Expired': return 'destructive';
        default: return 'outline';
    }
};

export const getSalesOrderStatusVariant = (status?: SalesOrder['status']): "fulfilled" | "secondary" | "destructive" | "outline" | "success" | "confirmed" | "draft" | "invoiced" => {
    if (!status) return 'outline';
    switch (status) {
        case 'Fulfilled': return 'fulfilled';
        case 'Confirmed': return 'confirmed';
        case 'Draft': return 'draft';
        case 'Cancelled': return 'destructive';
        case 'Invoiced': return 'invoiced';
        default: return 'outline';
    }
};

export const getJobOrderStatusVariant = (status: JobOrder['status']): "completed" | "secondary" | "destructive" | "outline" | "inProgress" | "draft" => {
    switch (status) {
        case 'Completed': return 'completed';
        case 'In Progress': return 'inProgress';
        case 'Scheduled': return 'secondary';
        case 'Draft': return 'draft';
        case 'On Hold': return 'outline';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
};

export const getPurchaseOrderStatusVariant = (status: PurchaseOrder['status']): "received" | "sent" | "draft" | "destructive" | "outline" => {
    switch (status) {
        case 'Received': return 'received';
        case 'Sent': return 'sent';
        case 'Draft': return 'draft';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
};

export const getInvoiceStatusVariant = (status: string): "success" | "secondary" | "destructive" | "outline" | "posted" => {
    switch (status) {
        case 'Paid': return 'success';
        case 'Posted': return 'posted';
        case 'Pending': return 'secondary';
        case 'Overdue': return 'destructive';
        default: return 'outline';
    }
};
