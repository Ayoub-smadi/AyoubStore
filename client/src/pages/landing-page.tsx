import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bus, Shield, MapPin, Bell, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: t("features.tracking.title"),
      description: t("features.tracking.desc")
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: t("features.safety.title"),
      description: t("features.safety.desc")
    },
    {
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: t("features.alerts.title"),
      description: t("features.alerts.desc")
    }
  ];

  const steps = [
    {
      number: "01",
      title: t("how.step1.title"),
      description: t("how.step1.desc")
    },
    {
      number: "02",
      title: t("how.step2.title"),
      description: t("how.step2.desc")
    },
    {
      number: "03",
      title: t("how.step3.title"),
      description: t("how.step3.desc")
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-8 w-8 text-[#FACC15]" />
            <span className="text-2xl font-bold text-primary font-display tracking-tight">{t("nav.brand")}</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setLocation("/login")}>{t("nav.signin")}</Button>
            <Button className="bg-[#FACC15] text-black hover:bg-[#EAB308] font-bold" onClick={() => setLocation("/login")}>{t("nav.join")}</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-primary font-display leading-[1.1] mb-6">
              {t("hero.title").split(" ").slice(0, -2).join(" ")} <br />
              <span className="text-[#FACC15]">{t("hero.title").split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-xl shadow-xl shadow-primary/20" onClick={() => setLocation("/login")}>
                {t("hero.getStarted")} <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-xl border-2" onClick={() => setLocation("/login")}>
                {t("hero.createAccount")}
              </Button>
            </div>
          </div>
          <div className="relative lg:h-[600px]">
            <div className="absolute inset-0 bg-[#FACC15]/10 rounded-3xl -rotate-3 scale-105"></div>
            <img 
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
              alt="School Bus" 
              className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">{t("features.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("features.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">{t("how.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("how.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
             {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10"></div>
            {steps.map((s, i) => (
              <div key={i} className="bg-card flex flex-col items-center text-center p-6 rounded-2xl">
                <div className="w-16 h-16 bg-[#FACC15] text-black rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-lg">
                  {s.number}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Bus className="h-8 w-8 text-[#FACC15]" />
            <span className="text-2xl font-bold tracking-tight">{t("nav.brand")}</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-primary-foreground/70 mb-2">{t("footer.rights")}</p>
            <p className="text-primary-foreground/70">123 Education Way, Safety City</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
