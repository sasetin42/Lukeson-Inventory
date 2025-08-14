import PageHeader from "@/components/page-header";
import { BarChart3 } from "lucide-react";

export default function BarcodeQrCodePage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Barcode / QR Code" 
        description="Manage barcodes and QR codes." 
        icon={<BarChart3 className="h-6 w-6 text-indigo-500" />}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">Barcode / QR Code Page</h2>
        <p className="text-muted-foreground">Content for barcodes and QR codes goes here.</p>
      </div>
    </div>
  );
}
