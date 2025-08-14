import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InventoryTable from "./inventory-table";
import { Filter, Search } from "lucide-react";

export default function ProductsTab() {
  return (
    <Tabs defaultValue="products">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="products">Products (0)</TabsTrigger>
          <TabsTrigger value="categories">Categories (1)</TabsTrigger>
          <TabsTrigger value="orders">Orders (2)</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products by name or SKU..." className="pl-9" />
            </div>
            <Select>
                <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                </SelectContent>
            </Select>
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <TabsContent value="products" className="mt-4">
        <InventoryTable />
      </TabsContent>
      <TabsContent value="categories">
        Categories content
      </TabsContent>
      <TabsContent value="orders">
        Orders content
      </TabsContent>
      <TabsContent value="analytics">
        Analytics content
      </TabsContent>
    </Tabs>
  );
}
