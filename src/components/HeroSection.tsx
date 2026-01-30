import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, MessageCircle, Brain } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";
import { useNavigate } from "react-router-dom";
import { storageService } from "@/services/storageService";

export const HeroSection = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    const progress = storageService.getProgress();
    if (progress && progress.lessonsCompleted > 0) {
      navigate('/dashboard');
    } else {
      navigate('/placement');
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-30 left-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent my-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium ">Powered by Google Gemini AI</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight my-6"
            >
              Your Personal
              <span className="block text-gradient">AI Language Coach</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Master English with real-time pronunciation feedback,
              adaptive learning, and conversations that feel like talking
              to a brilliant friend.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button variant="hero" size="xl" onClick={handleStart}>
                <Mic className="w-5 h-5" />
                Start Learning Free
              </Button>
              <Button variant="outline" size="xl" onClick={() => window.location.href = '/lessons'}>
                Browse Lessons
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start"
            >
              {[
                { value: "3,000+", label: "Sentences" },
                { value: "50+", label: "Topics" },
                { value: "A1-C2", label: "All Levels" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-display font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Interactive Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative mx-auto max-w-lg">
              {/* Hero illustration */}
              <motion.img
                src={heroIllustration}
                alt="AI Language Learning Visualization"
                className="w-full rounded-3xl shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main card overlay */}
              <motion.div
                className="absolute bottom-8 left-4 right-4 glass rounded-2xl p-6 shadow-lg"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-sm">Today's Practice</div>
                    <div className="text-xs text-muted-foreground">Level B2 • Business English</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 text-sm"
                  >
                    <Mic className="w-4 h-4" />
                    Start Practice
                  </motion.button>
                </div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 p-3 rounded-xl glass shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2 text-success">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-semibold text-sm">98% Accuracy!</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-20 -left-6 p-3 rounded-xl glass shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-accent" />
                  <span className="font-medium text-xs">AI Ready</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
