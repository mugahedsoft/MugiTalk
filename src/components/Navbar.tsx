import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="glass rounded-2xl shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <a href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl">
                  Mugi<span className="text-primary">Talk</span>
                </span>
              </a>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  How it Works
                </a>
                <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard'}>
                  Dashboard
                </Button>
                <Button variant="default" size="sm" onClick={() => window.location.href = '/lessons'}>
                  Get Started Free
                </Button>
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
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pt-4 pb-2"
              >
                <div className="flex flex-col gap-4">
                  <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                    How it Works
                  </a>
                  <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                    Pricing
                  </a>
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    <Button variant="ghost" className="justify-start">
                      Log In
                    </Button>
                    <Button variant="default">
                      Get Started Free
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
