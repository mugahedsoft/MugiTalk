import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const VerifyEmailPage = () => {
    const navigate = useNavigate();

    const handleResendEmail = () => {
        toast.info("Verification email resent. Please check your inbox.");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md text-center"
            >
                <div className="glass p-10 rounded-[40px] border-2 border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Mail className="w-10 h-10" />
                        </div>
                    </motion.div>

                    <h1 className="text-3xl font-display font-black tracking-tight mb-4">
                        Check your email
                    </h1>

                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        We've sent a verification link to your email address.
                        Please click the link to activate your account and start your learning journey.
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Login
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleResendEmail}
                            className="w-full h-14 rounded-2xl text-lg font-bold border-2"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Resend Email
                        </Button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Secure activation by GemiTalk</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmailPage;
