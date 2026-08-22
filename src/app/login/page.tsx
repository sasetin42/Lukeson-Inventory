
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons/logo';
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [title, setTitle] = useState('LUKESON COMPANY');
    const [description, setDescription] = useState('Inventory Management Information System (IMIS)');
    const [background, setBackground] = useState('');
    const [logo, setLogo] = useState('');
    const [footerText, setFooterText] = useState('Develop by: SaSe Web Solutions');
    const [footerLink, setFooterLink] = useState('https://sasewebsolutions.com/');

    useEffect(() => {
        const fetchLoginSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'loginScreen');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.title) setTitle(data.title);
                    if (data.description) setDescription(data.description);
                    if (data.background) setBackground(data.background);
                    if (data.logo) setLogo(data.logo);
                    if (data.footerText) setFooterText(data.footerText);
                    if (data.footerLink) setFooterLink(data.footerLink);
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
        background: 'radial-gradient(ellipse at 50% 30%, #0c1524 0%, #030712 100%)',
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden bg-slate-950 px-4 py-8 select-none" style={backgroundStyle}>
            {/* Ambient Background Glow Mesh for Glassmorphism */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#578A00]/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#10A3D8]/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

            {/* Backdrop Blur Overlay for Custom Background */}
            {background && <div className="absolute inset-0 bg-black/65 backdrop-blur-md" />}

            {/* Black Glassmorphic Card */}
            <div className="relative w-full max-w-sm sm:max-w-md z-10">
                {/* Glow Border Effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-2xl pointer-events-none" />

                <Card className="relative w-full rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-white overflow-hidden">
                    <CardHeader className="text-center pt-8 pb-4">
                        {logo ? (
                            <div className="flex justify-center mb-3">
                                <div className="p-1 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                    <Image 
                                        src={logo} 
                                        alt="Company Logo" 
                                        width={84} 
                                        height={84} 
                                        className="h-20 w-20 object-contain rounded-xl" 
                                        data-ai-hint="logo"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center mb-3">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                    <Logo className="h-12 w-12 text-[#578A00]" />
                                </div>
                            </div>
                        )}
                        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase drop-shadow-sm">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-slate-400 mt-1">
                            {description}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4 px-6 sm:px-8">
                            {/* Email Field */}
                            <div className="space-y-1.5 group">
                                <Label htmlFor="email" className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                                    Email
                                </Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[#578A00] transition-colors pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="pl-10 h-11 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-black/80 border-white/15 focus:border-[#578A00] text-white placeholder:text-slate-500 rounded-xl transition-all shadow-inner focus-visible:ring-1 focus-visible:ring-[#578A00]"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5 group">
                                <Label htmlFor="password" className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                                    Password
                                </Label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[#578A00] transition-colors pointer-events-none" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="pl-10 pr-11 h-11 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-black/80 border-white/15 focus:border-[#578A00] text-white placeholder:text-slate-500 rounded-xl transition-all shadow-inner focus-visible:ring-1 focus-visible:ring-[#578A00]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white/20"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-2 pb-6 px-6 sm:px-8">
                            <Button 
                                type="submit" 
                                className="w-full h-11 font-semibold text-white bg-gradient-to-r from-[#578A00] to-[#6ba800] hover:from-[#4c7a00] hover:to-[#5e9600] rounded-xl shadow-[0_4px_20px_rgba(87,138,0,0.35)] hover:shadow-[0_6px_25px_rgba(87,138,0,0.5)] active:scale-[0.99] transition-all duration-200 border border-lime-400/20" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    "Log In"
                                )}
                            </Button>
                        </CardFooter>
                    </form>

                    {/* Footer Badge */}
                    <div className="px-6 pb-6 flex justify-center">
                        <a 
                            href={footerLink || "https://sasewebsolutions.com/"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex"
                        >
                            <span className="text-[11px] font-medium px-4 py-1.5 rounded-full text-white bg-gradient-to-r from-[#10A3D8] to-[#054B8C] hover:from-[#0e94c5] hover:to-[#043e74] border border-cyan-400/30 shadow-[0_2px_12px_rgba(16,163,216,0.3)] transition-all hover:scale-105 active:scale-95">
                                {footerText || "Develop by: SaSe Web Solutions"}
                            </span>
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    );
}

