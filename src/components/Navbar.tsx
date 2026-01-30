import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-2 md:mx-4 mt-2 md:mt-4">
        <div className="glass rounded-2xl shadow-md">
          <div className="container mx-auto px-3 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg md:text-xl">
                  Mugi<span className="text-primary">Talk</span>
                </span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-8">
                <Link to="/lessons" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Lessons
                </Link>
                <Link to="/conversation" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Conversations
                </Link>
                <Link to="/review" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Memory Bank
                </Link>
              </div>

              {/* Desktop CTA / User Menu */}
              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="font-bold">
                      Dashboard
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border hover:border-primary/50 transition-all">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {user.email?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-bold leading-none">{user.user_metadata?.full_name || 'Language Learner'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-xl cursor-not-allowed opacity-50">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Profile (Soon)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl cursor-not-allowed opacity-50">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="rounded-xl text-destructive focus:bg-destructive/10 cursor-pointer"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                      Log In
                    </Button>
                    <Button variant="default" size="sm" className="rounded-xl shadow-lg shadow-primary/20" onClick={() => navigate('/login')}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden pt-4 pb-2"
                >
                  <div className="flex flex-col gap-4">
                    {user ? (
                      <>
                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-bold text-foreground py-2 border-b border-border">
                          Dashboard
                        </Link>
                        <Link to="/lessons" onClick={() => setIsOpen(false)} className="text-sm font-medium text-muted-foreground py-2">
                          Lessons
                        </Link>
                        <Link to="/conversation" onClick={() => setIsOpen(false)} className="text-sm font-medium text-muted-foreground py-2">
                          Conversation
                        </Link>
                        <Link to="/review" onClick={() => setIsOpen(false)} className="text-sm font-medium text-muted-foreground py-2">
                          Memory Bank
                        </Link>
                        <Button variant="outline" onClick={handleLogout} className="mt-4 text-destructive border-destructive/20 justify-start">
                          <LogOut className="w-4 h-4 mr-2" />
                          Log Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="/lessons" onClick={() => setIsOpen(false)} className="text-sm font-medium text-muted-foreground py-2">
                          Features
                        </Link>
                        <Link to="/lessons" onClick={() => setIsOpen(false)} className="text-sm font-medium text-muted-foreground py-2">
                          Pricing
                        </Link>
                        <div className="flex flex-col gap-2 pt-4 border-t border-border">
                          <Button variant="ghost" className="justify-start font-bold" onClick={() => { setIsOpen(false); navigate('/login'); }}>
                            Log In
                          </Button>
                          <Button variant="default" className="rounded-xl" onClick={() => { setIsOpen(false); navigate('/login'); }}>
                            Get Started Free
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
