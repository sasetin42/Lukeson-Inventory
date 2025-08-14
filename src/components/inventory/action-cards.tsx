import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, ShoppingCart, Bell, Zap } from "lucide-react";
import Link from "next/link";

const actionCards = [
    {
        title: "Add Product",
        description: "Create new inventory item",
        icon: Plus,
        color: "blue",
        href: "#"
    },
    {
        title: "Adjust Stock",
        description: "Modify inventory levels",
        icon: RefreshCw,
        color: "green",
        href: "#"
    },
    {
        title: "Create PO",
        description: "New purchase order",
        icon: ShoppingCart,
        color: "purple",
        href: "#"
    },
    {
        title: "Stock Alerts",
        description: "0 active alerts",
        icon: Bell,
        color: "red",
        href: "#"
    }
];

const colorClasses = {
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'text-blue-500',
        link: 'text-blue-600 dark:text-blue-400'
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        icon: 'text-green-500',
        link: 'text-green-600 dark:text-green-400'
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'text-purple-500',
        link: 'text-purple-600 dark:text-purple-400'
    },
    red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        icon: 'text-red-500',
        link: 'text-red-600 dark:text-red-400'
    }
}


export default function ActionCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {actionCards.map((card, index) => {
                const colors = colorClasses[card.color as keyof typeof colorClasses];
                return (
                    <Card key={card.title} className={`${colors.bg} border-0`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <div>
                            <CardTitle>{card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                           </div>
                           <card.icon className={`h-6 w-6 ${colors.icon}`} />
                        </CardHeader>
                        <CardContent>
                            <Link href={card.href} className={`text-sm font-medium ${colors.link} flex items-center`}>
                                <Zap className="mr-2 h-4 w-4"/>
                                Click to {card.title.split(' ')[0].toLowerCase()}
                            </Link>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    )
}
