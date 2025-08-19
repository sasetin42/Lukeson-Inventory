
'use client';

import { useRouter } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { PlusCircle } from "lucide-react";
import ProductForm from '@/components/products/product-form';
import { Card, CardContent } from '@/components/ui/card';

export default function NewProductPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/products');
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Add New Product"
                description="Fill in the details below to add a new product to your inventory."
                icon={<PlusCircle className="h-6 w-6 text-pink-500" />}
            />
            <Card>
                <CardContent className="p-6">
                    <ProductForm product={null} onSuccess={handleSuccess} onCancel={handleCancel} />
                </CardContent>
            </Card>
        </div>
    );
}
