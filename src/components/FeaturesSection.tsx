import { motion } from "framer-motion";
import { 
  Mic, 
  Brain, 
  MessageCircle, 
  Sparkles, 
  Target, 
  Zap,
  BookOpen,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Dynamic Content Universe",
    description: "AI generates personalized learning packs tailored to your interests. Want to practice salary negotiation? Just ask!",
    gradient: "from-primary to-orange-400",
  },
  {
    icon: Mic,
    title: "Listen-Speak-Perfect Cycle",
    description: "Record yourself, get instant word-by-word feedback, and see exactly where to improve your pronunciation.",
    gradient: "from-orange-400 to-amber-400",
  },
  {
    icon: MessageCircle,
    title: "AI Conversation Arena",
    description: "Practice real scenarios with an AI partner. Job interviews, restaurant orders, casual small talk – it's all here.",
    gradient: "from-accent to-teal-400",
  },
  {
    icon: Brain,
    title: "Adaptive Learning Engine",
    description: "Our AI analyzes your patterns and creates personalized 'Booster Packs' targeting your specific weaknesses.",
    gradient: "from-teal-400 to-cyan-400",
  },
];

const stats = [
  { icon: BookOpen, value: "3,000+", label: "Curated Sentences" },
  { icon: Target, value: "50+", label: "Real-World Topics" },
  { icon: TrendingUp, value: "6 Levels", label: "A1 to C2 CEFR" },
  { icon: Zap, value: "Real-time", label: "AI Feedback" },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      
      <div className="container relative z-10 mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by Gemini AI
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Not Just Flashcards.
            <span className="text-gradient"> A Fluency Partner.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every feature is intelligently powered by Google's Gemini AI, 
            creating a learning experience that adapts to you in real-time.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div
                className="group h-full p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
                whileHover={{ y: -5, boxShadow: "0 20px 40px -20px hsla(var(--primary), 0.2)" }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 rounded-3xl bg-gradient-to-r from-primary via-orange-500 to-accent relative overflow-hidden"
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <div className="text-3xl font-display font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
