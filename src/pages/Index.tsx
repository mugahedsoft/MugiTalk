import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { LearningDemo } from "@/components/LearningDemo";
import { ConversationArena } from "@/components/ConversationArena";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LearningDemo />
        <ConversationArena />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
