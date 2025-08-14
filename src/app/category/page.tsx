import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { List, PlusCircle } from "lucide-react";
import CategoryList from "@/components/category/category-list";

export default function CategoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Category Management" 
        description="Organize your products with hierarchical categories" 
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />
      <CategoryList />
    </div>
  );
}
