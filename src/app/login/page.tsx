
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [title, setTitle] = useState('IMIS Pro');
    const [description, setDescription] = useState('Enter your credentials to access your workspace');
    const [background, setBackground] = useState('');
    const [logo, setLogo] = useState('');

    useEffect(() => {
        const fetchLoginSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'loginScreen');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title || 'IMIS Pro');
                    setDescription(data.description || 'Enter your credentials to access your workspace');
                    setBackground(data.background || '');
                    setLogo(data.logo || '');
                }
            } catch (error) {
                console.error("Error fetching login screen settings:", error);
            }
        };
        fetchLoginSettings();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            toast({
                title: "Login Successful",
                description: "Welcome back!",
                variant: "success",
            });
            router.push('/');
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Please check your credentials and try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const backgroundStyle: React.CSSProperties = background ? {
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } : {};

    return (
        <div className="flex items-center justify-center min-h-screen bg-background" style={backgroundStyle}>
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <Card className="w-full max-w-sm z-10">
                <CardHeader className="text-center">
                    {logo ? (
                        <Image src={logo} alt="Company Logo" width={60} height={60} className="mx-auto" data-ai-hint="logo"/>
                    ) : (
                        <Logo className="mx-auto h-12 w-12 text-primary" />
                    )}
                    <CardTitle className="mt-4">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Log In
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
