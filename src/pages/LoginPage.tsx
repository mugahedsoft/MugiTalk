import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    LogIn,
    UserPlus,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Mail,
    Lock,
    User
} from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await authService.signIn(email, password);
                toast.success('Welcome back!');
                navigate('/dashboard');
            } else {
                await authService.signUp(email, password, fullName);
                toast.success('Account created successfully!');
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        x: [0, -100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-6 shadow-xl shadow-primary/20"
                    >
                        <Sparkles className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-display font-black tracking-tight mb-2">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-muted-foreground">
                        {mode === 'login' ? 'Enter your details to continue learning' : 'Start your language learning journey today'}
                    </p>
                </div>

                <div className="glass p-8 rounded-[40px] border-2 border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Mode Toggle Tabs */}
                    <div className="flex p-1 bg-secondary/50 rounded-2xl mb-8 relative">
                        <motion.div
                            className="absolute inset-y-1 bg-background rounded-xl shadow-sm z-0"
                            initial={false}
                            animate={{
                                x: mode === 'login' ? '0%' : '100%',
                                width: '50%'
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold relative z-10 transition-colors ${mode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Login
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold relative z-10 transition-colors ${mode === 'register' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {mode === 'register' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="fullName"
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="pl-10 h-12 rounded-xl bg-secondary/30"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-12 rounded-xl bg-secondary/30"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 h-12 rounded-xl bg-secondary/30"
                                            required
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {mode === 'login' ? 'Continue Learning' : 'Start Free Now'}
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
