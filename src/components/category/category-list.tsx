import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, LayoutGrid, List, Tag } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function CategoryList() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search categories..." className="pl-9 w-64" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="show-inactive" />
                        <Label htmlFor="show-inactive">Show inactive</Label>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <AlertTriangle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <List className="h-4 w-4" />
                    </Button>
                    <div className="h-6 border-l mx-2"></div>
                    <Button variant="outline">Expand All</Button>
                    <Button variant="outline">Collapse All</Button>
                    <Button variant="outline">Select All</Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Categories (0)</CardTitle>
                    <CardDescription>Hierarchical view showing parent-child relationships</CardDescription>
                </CardHeader>
                <CardContent>
                    
                </CardContent>
            </Card>
        </div>
    )
}
