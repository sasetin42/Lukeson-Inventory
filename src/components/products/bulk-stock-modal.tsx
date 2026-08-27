'use client';

import { useEffect, useState, useMemo } from 'react';
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
import {
  Loader2,
  Layers,
  AlertCircle,
  Plus,
  Minus,
  Equal,
  ArrowRight,
  Search,
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

export interface BulkStockUpdateItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  dimensions?: string;
  currentStock: number;
  newStock: number;
}

interface BulkStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onSave: (updates: { id: string; newStock: number }[], reason: string) => Promise<void>;
}

type AdjustmentMode = 'set' | 'add' | 'subtract';

const adjustmentReasons = [
  "Bulk Stock Count Correction",
  "Shipment Received / Restocked",
  "Physical Inventory Reconciliation",
  "Damaged Goods Write-off",
  "Supplier Return / RTV",
  "Inventory Audit Adjustment",
  "Other",
];

const PRESETS = [5, 10, 20, 50, 100, 250];

export default function BulkStockModal({
  isOpen,
  onClose,
  selectedProducts,
  onSave,
}: BulkStockModalProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<AdjustmentMode>('set');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>(adjustmentReasons[0]);
  const [notes, setNotes] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setMode('set');
      setReason(adjustmentReasons[0]);
      setNotes('');
      setSearchQuery('');
      setIsSaving(false);
    }
  }, [isOpen]);

  const numAmount = Number(amount);

  const previewItems: BulkStockUpdateItem[] = useMemo(() => {
    if (amount === '' || isNaN(numAmount)) {
      return selectedProducts.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        dimensions: (p as any).dimensions,
        currentStock: p.stock || 0,
        newStock: p.stock || 0,
      }));
    }

    return selectedProducts.map(p => {
      const cur = p.stock || 0;
      let next = cur;
      if (mode === 'set') {
        next = Math.max(0, Math.floor(numAmount));
      } else if (mode === 'add') {
        next = Math.max(0, cur + Math.floor(numAmount));
      } else if (mode === 'subtract') {
        next = Math.max(0, cur - Math.floor(numAmount));
      }
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        dimensions: (p as any).dimensions,
        currentStock: cur,
        newStock: next,
      };
    });
  }, [selectedProducts, mode, amount, numAmount]);

  const filteredPreviewItems = useMemo(() => {
    if (!searchQuery.trim()) return previewItems;
    const q = searchQuery.toLowerCase();
    return previewItems.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [previewItems, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalCurrent = selectedProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalNew = previewItems.reduce((acc, p) => acc + p.newStock, 0);
    const netDelta = totalNew - totalCurrent;
    return { totalCurrent, totalNew, netDelta };
  }, [selectedProducts, previewItems]);

  const handleApplyPreset = (presetValue: number) => {
    setAmount(presetValue.toString());
  };

  const handleSubmit = async () => {
    if (amount === '' || isNaN(numAmount) || numAmount < 0) {
      toast({
        title: "Invalid Value",
        description: "Please enter a valid non-negative number for the adjustment quantity.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updates = previewItems.map(item => ({
        id: item.id,
        newStock: item.newStock,
      }));
      const fullReason = notes.trim() ? `${reason} - ${notes.trim()}` : reason;
      await onSave(updates, fullReason);
      onClose();
    } catch (error) {
      console.error("Bulk stock update failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-neutral-900">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span>Bulk Update Stock</span>
                <span className="ml-2 text-sm font-medium text-muted-foreground">({selectedProducts.length} Products)</span>
              </div>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Update inventory levels across all {selectedProducts.length} selected items simultaneously with real-time audit calculation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
          {/* Summary KPI Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-gradient-to-r from-neutral-50 via-slate-50 to-neutral-50 border border-neutral-200/80">
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-neutral-200/60 shadow-xs text-center">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-neutral-500" /> Current Total
              </span>
              <span className="text-base font-bold text-neutral-800 mt-0.5 font-mono">
                {summary.totalCurrent.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">units</span>
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-neutral-200/60 shadow-xs text-center">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Projected Total
              </span>
              <span className="text-base font-bold text-blue-600 mt-0.5 font-mono">
                {summary.totalNew.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">units</span>
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-neutral-200/60 shadow-xs text-center">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                {summary.netDelta >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                )}
                Net Delta
              </span>
              <span
                className={`text-base font-bold mt-0.5 font-mono ${
                  summary.netDelta > 0
                    ? 'text-emerald-600'
                    : summary.netDelta < 0
                    ? 'text-amber-600'
                    : 'text-neutral-600'
                }`}
              >
                {summary.netDelta > 0 ? `+${summary.netDelta.toLocaleString()}` : summary.netDelta.toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">units</span>
              </span>
            </div>
          </div>

          {/* Adjustment Mode Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Adjustment Action</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={mode === 'set' ? 'default' : 'outline'}
                className={`flex items-center justify-center gap-2 text-xs font-semibold h-10 transition-all rounded-lg ${
                  mode === 'set'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm ring-2 ring-blue-600/20'
                    : 'border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                }`}
                onClick={() => setMode('set')}
              >
                <Equal className="h-4 w-4" />
                Set Fixed Value
              </Button>
              <Button
                type="button"
                variant={mode === 'add' ? 'default' : 'outline'}
                className={`flex items-center justify-center gap-2 text-xs font-semibold h-10 transition-all rounded-lg ${
                  mode === 'add'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/20'
                    : 'border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                }`}
                onClick={() => setMode('add')}
              >
                <Plus className="h-4 w-4" />
                Add to Stock (+)
              </Button>
              <Button
                type="button"
                variant={mode === 'subtract' ? 'default' : 'outline'}
                className={`flex items-center justify-center gap-2 text-xs font-semibold h-10 transition-all rounded-lg ${
                  mode === 'subtract'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm ring-2 ring-amber-600/20'
                    : 'border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                }`}
                onClick={() => setMode('subtract')}
              >
                <Minus className="h-4 w-4" />
                Subtract Stock (-)
              </Button>
            </div>
          </div>

          {/* Equal Height Inputs: Quantity & Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div className="space-y-1.5">
              <Label htmlFor="bulk-amount" className="text-xs font-semibold text-neutral-800 flex items-center justify-between h-5">
                <span>
                  {mode === 'set' && 'New Stock Quantity (Units)'}
                  {mode === 'add' && 'Quantity to Add (+ Units)'}
                  {mode === 'subtract' && 'Quantity to Subtract (- Units)'}
                </span>
                {amount && (
                  <button
                    type="button"
                    onClick={() => setAmount('')}
                    className="text-[11px] text-muted-foreground hover:text-neutral-900 flex items-center gap-0.5"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear
                  </button>
                )}
              </Label>
              <Input
                id="bulk-amount"
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 text-sm font-medium border-neutral-300 focus-visible:ring-blue-500 rounded-lg"
              />
              {/* Quick Presets */}
              <div className="flex items-center flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-muted-foreground mr-1">Quick:</span>
                {PRESETS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleApplyPreset(val)}
                    className="px-2 py-0.5 text-[11px] rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono transition-colors"
                  >
                    {mode === 'add' ? `+${val}` : mode === 'subtract' ? `-${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bulk-reason" className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5 h-5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                Adjustment Reason
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="bulk-reason" className="h-10 text-xs border-neutral-300 rounded-lg">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentReasons.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs py-2">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground pt-1">Logged for internal inventory audit trail</p>
            </div>
          </div>

          {/* Optional Audit Notes / Reference */}
          <div className="space-y-1.5">
            <Label htmlFor="bulk-notes" className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              Audit Note / Reference Details <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="bulk-notes"
              type="text"
              placeholder="e.g. Physical inventory count batch #2026-Q3 / PO-9821 reconciliation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-xs border-neutral-300 rounded-lg"
            />
          </div>

          {/* Preview list with live search */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Preview Affected Items</span>
                <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 font-normal">
                  {filteredPreviewItems.length} of {selectedProducts.length}
                </Badge>
              </Label>

              <div className="relative w-48 sm:w-56">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter preview list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-7 pl-7 text-[11px] border-neutral-300 rounded-md"
                />
              </div>
            </div>

            <ScrollArea className="h-48 border border-neutral-200 rounded-xl p-2 bg-neutral-50/50">
              <div className="space-y-1.5">
                {filteredPreviewItems.map((item) => {
                  const isChanged = amount !== '' && !isNaN(numAmount) && item.currentStock !== item.newStock;
                  const itemDelta = item.newStock - item.currentStock;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded-lg bg-white border transition-colors text-xs ${
                        isChanged ? 'border-blue-200/80 shadow-xs' : 'border-neutral-200/60'
                      }`}
                    >
                      <div className="truncate max-w-[280px]">
                        <span className="font-semibold text-neutral-800 block truncate">{item.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.sku && (
                            <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-1 rounded">
                              {item.sku}
                            </span>
                          )}
                          {item.category && (
                            <span className="text-[10px] text-muted-foreground truncate">{item.category}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 font-mono shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">{item.currentStock} units</span>
                          {isChanged && (
                            <span
                              className={`text-[10px] font-bold block ${
                                itemDelta > 0 ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                            >
                              {itemDelta > 0 ? `+${itemDelta}` : itemDelta} units
                            </span>
                          )}
                        </div>

                        <ArrowRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />

                        <Badge
                          variant={isChanged ? 'default' : 'secondary'}
                          className={`text-xs font-mono font-bold px-2.5 py-1 min-w-[75px] justify-center ${
                            isChanged
                              ? item.newStock > item.currentStock
                                ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                                : 'bg-amber-600 hover:bg-amber-600 text-white'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {item.newStock} units
                        </Badge>
                      </div>
                    </div>
                  );
                })}

                {filteredPreviewItems.length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No matching products in preview.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t flex flex-row justify-between items-center sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="h-10 px-4 text-xs font-medium">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || amount === '' || isNaN(numAmount) || numAmount < 0}
            className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply to {selectedProducts.length} Product{selectedProducts.length === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
