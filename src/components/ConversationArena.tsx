import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Briefcase, 
  UtensilsCrossed, 
  Users, 
  Plane,
  ChevronRight,
  Mic,
  Volume2
} from "lucide-react";

const scenarios = [
  {
    icon: Briefcase,
    title: "Job Interview",
    description: "Practice answering common interview questions with confidence",
    level: "B2-C1",
    color: "from-primary to-orange-400",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant Order",
    description: "Navigate complex menus and dietary requirements like a pro",
    level: "A2-B1",
    color: "from-accent to-teal-400",
  },
  {
    icon: Users,
    title: "Networking Event",
    description: "Master small talk and making professional connections",
    level: "B1-B2",
    color: "from-amber-400 to-orange-400",
  },
  {
    icon: Plane,
    title: "Airport Navigation",
    description: "Handle check-in, customs, and travel situations smoothly",
    level: "A2-B1",
    color: "from-blue-400 to-cyan-400",
  },
];

const sampleConversation = [
  { role: "ai", name: "David (Hiring Manager)", text: "Nice to meet you! Please, have a seat. Tell me a little about yourself and why you're interested in this marketing role." },
  { role: "user", text: "Thank you for having me. I'm excited about this opportunity because..." },
  { role: "ai", name: "David (Hiring Manager)", text: "That's great! I noticed you used 'because' perfectly there. Now, can you tell me about a challenging project you've worked on?" },
];

export const ConversationArena = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container relative z-10 mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              AI Conversation Arena
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Practice Real Conversations
              <span className="text-gradient"> with AI Partners</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Move beyond sentence repetition. Have unscripted, realistic conversations 
              with AI characters who adapt to your level and gently correct your mistakes.
            </p>

            {/* Scenario cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {scenarios.map((scenario, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${scenario.color} flex items-center justify-center mb-3`}>
                    <scenario.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{scenario.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    Level {scenario.level}
                  </span>
                </motion.div>
              ))}
            </div>

            <Button variant="hero" size="lg" className="mt-8">
              Start a Conversation
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Right - Demo conversation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="p-6 rounded-3xl bg-card border border-border shadow-lg">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-display font-semibold">Job Interview Practice</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Live session with David
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-4">
                {sampleConversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.2 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md" 
                        : "bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md"
                    } p-4`}>
                      {msg.name && (
                        <div className="text-xs font-semibold opacity-70 mb-1">{msg.name}</div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      {msg.role === "ai" && (
                        <button className="mt-2 flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity">
                          <Volume2 className="w-3 h-3" /> Listen
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input area */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50">
                <button className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors">
                  <Mic className="w-5 h-5 text-white" />
                </button>
                <div className="flex-1 text-sm text-muted-foreground">
                  Tap to respond with your voice...
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -top-4 -right-4 px-4 py-2 rounded-full glass shadow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                Real-time feedback
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
