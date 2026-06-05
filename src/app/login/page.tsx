
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
import Link from 'next/link';

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
    const [footerText, setFooterText] = useState('');
    const [footerLink, setFooterLink] = useState('');

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
                    setFooterText(data.footerText || '');
                    setFooterLink(data.footerLink || '');
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
    } : {
        background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)',
    };

    const showOverlay = !!background;

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-background" style={backgroundStyle}>
             {/* Ambient glow effects */}
             {!background && (
                <>
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#578A00]/15 rounded-full blur-[130px]" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#10A3D8]/15 rounded-full blur-[130px]" />
                </>
             )}
             {showOverlay && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />}
            <Card className="w-full max-w-sm z-10 shadow-2xl border-white/5 bg-slate-900/40 backdrop-blur-md text-white">
                <CardHeader className="text-center">
                    {logo ? (
                        <Image src={logo} alt="Company Logo" width={60} height={60} className="mx-auto" data-ai-hint="logo"/>
                    ) : (
                        <Logo className="mx-auto h-12 w-12 text-[#578A00]" />
                    )}
                    <CardTitle className="mt-4 text-white font-bold tracking-tight">{title}</CardTitle>
                    <CardDescription className="text-slate-400">{description}</CardDescription>
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
                                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
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
                                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-[#578A00] hover:bg-[#578A00]/90" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Log In
                        </Button>
                    </CardFooter>
                </form>
                 <div className="px-6 pb-4 flex justify-center">
                     <a href="https://sasewebsolutions.com/" target="_blank" rel="noopener noreferrer">
                        <Button
                        className="text-xs h-auto px-3 py-1.5"
                        style={{
                            background: 'linear-gradient(to right, #10A3D8, #054B8C)',
                            color: '#FFFFFF'
                        }}
                        >
                        Develop by: SaSe Web Solutions
                        </Button>
                    </a>
                </div>
            </Card>
        </div>
    );
}
