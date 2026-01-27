import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Play, 
  Check, 
  X, 
  AlertCircle,
  Volume2,
  RotateCcw,
  ChevronRight,
  Sparkles
} from "lucide-react";

const sampleSentence = {
  text: "I'd like to book a flight to Cairo.",
  level: "B1",
  theme: "Travel",
  explanation: "This is a polite way to request a reservation. 'I'd like to' is a contracted form of 'I would like to', which is more formal and polite than 'I want to'."
};

const wordBreakdown = [
  { word: "I'd", status: "success", feedback: "Perfect contraction!" },
  { word: "like", status: "success", feedback: "Great pronunciation" },
  { word: "to", status: "warning", feedback: "A bit weak, try to pronounce it clearly" },
  { word: "book", status: "success", feedback: "Clear and correct" },
  { word: "a", status: "success", feedback: "Good" },
  { word: "flight", status: "error", feedback: "Missing the 'fl' blend, sounds like 'fight'" },
  { word: "to", status: "success", feedback: "Good" },
  { word: "Cairo", status: "success", feedback: "Perfect!" },
];

export const LearningDemo = () => {
  const [step, setStep] = useState<"learn" | "practice" | "feedback">("learn");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-status-perfect text-white";
      case "warning": return "bg-status-needsWork text-white";
      case "error": return "bg-status-error text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <Check className="w-3 h-3" />;
      case "warning": return <AlertCircle className="w-3 h-3" />;
      case "error": return <X className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      
      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <Mic className="w-4 h-4" />
            Listen • Speak • Perfect
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Experience the
            <span className="text-gradient-reverse"> Learning Cycle</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how our AI-powered system provides real-time feedback on your pronunciation.
          </p>
        </motion.div>

        {/* Step indicators */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { key: "learn", label: "Learn" },
            { key: "practice", label: "Practice" },
            { key: "feedback", label: "Feedback" },
          ].map((s, index) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key as typeof step)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                step === s.key
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Demo card */}
        <motion.div
          className="max-w-2xl mx-auto"
          layout
        >
          <div className="p-8 rounded-3xl bg-card border border-border shadow-lg">
            <AnimatePresence mode="wait">
              {step === "learn" && (
                <motion.div
                  key="learn"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                      {sampleSentence.level}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {sampleSentence.theme}
                    </span>
                  </div>

                  <p className="text-2xl md:text-3xl font-display font-semibold mb-6">
                    "{sampleSentence.text}"
                  </p>

                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors w-full mb-6"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-12 h-12 rounded-full bg-primary flex items-center justify-center ${isPlaying ? "animate-pulse" : ""}`}>
                      {isPlaying ? <Volume2 className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-1" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Listen to native pronunciation</div>
                      <div className="text-sm text-muted-foreground">Click to play audio</div>
                    </div>
                  </motion.button>

                  <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="font-semibold text-accent">Gemini Explains</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sampleSentence.explanation}
                    </p>
                  </div>

                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full mt-6"
                    onClick={() => setStep("practice")}
                  >
                    Ready to Practice
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}

              {step === "practice" && (
                <motion.div
                  key="practice"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <p className="text-lg text-muted-foreground mb-4">Say this sentence:</p>
                  <p className="text-2xl md:text-3xl font-display font-semibold mb-8">
                    "{sampleSentence.text}"
                  </p>

                  <motion.button
                    onClick={() => {
                      setIsRecording(true);
                      setTimeout(() => {
                        setIsRecording(false);
                        setStep("feedback");
                      }, 2000);
                    }}
                    className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording 
                        ? "bg-destructive shadow-lg scale-110" 
                        : "bg-primary hover:bg-primary/90 hover:scale-105"
                    }`}
                    whileTap={{ scale: 0.95 }}
                    disabled={isRecording}
                  >
                    <Mic className={`w-12 h-12 text-white ${isRecording ? "animate-pulse" : ""}`} />
                  </motion.button>

                  <p className="mt-6 text-muted-foreground">
                    {isRecording ? "Recording... speak now!" : "Tap to start recording"}
                  </p>

                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center gap-1 mt-4"
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary rounded-full"
                          animate={{
                            height: [16, 32, 16],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === "feedback" && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Score */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-status-good to-accent text-white mb-4"
                    >
                      <span className="text-3xl font-display font-bold">87%</span>
                    </motion.div>
                    <p className="text-lg font-semibold">Great job! Almost perfect.</p>
                  </div>

                  {/* Word breakdown */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {wordBreakdown.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="group relative"
                      >
                        <div className={`px-4 py-2 rounded-xl ${getStatusColor(item.status)} font-medium flex items-center gap-1`}>
                          {item.word}
                          {getStatusIcon(item.status)}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {item.feedback}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* AI Tip */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-primary">Gemini's Tip</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Focus on the "fl" blend in "flight". Try saying "fl-fl-flight" slowly 
                      a few times before attempting the full word. Great work on the contraction "I'd"!
                    </p>
                  </motion.div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex-1"
                      onClick={() => setStep("practice")}
                    >
                      <RotateCcw className="w-5 h-5" />
                      Try Again
                    </Button>
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="flex-1"
                      onClick={() => setStep("learn")}
                    >
                      Next Sentence
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
