import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

const translations = {
  en: {
    "nav.brand": "RouteSync",
    "nav.signin": "Sign In",
    "nav.join": "Join Now",
    "hero.title": "Smart & Safe School Bus Tracking",
    "hero.subtitle": "The ultimate solution for schools and parents to ensure student safety during every commute. Real-time updates at your fingertips.",
    "hero.getStarted": "Get Started",
    "hero.createAccount": "Create Account",
    "features.title": "Why Choose RouteSync?",
    "features.subtitle": "Everything you need for efficient transportation management.",
    "features.tracking.title": "Real-time Tracking",
    "features.tracking.desc": "Know exactly where the bus is at any moment with GPS accuracy.",
    "features.safety.title": "Enhanced Safety",
    "features.safety.desc": "Geofence alerts and speed monitoring for a safer journey.",
    "features.alerts.title": "Instant Notifications",
    "features.alerts.desc": "Get alerts when the bus is near your home or the school.",
    "how.title": "How It Works",
    "how.subtitle": "Getting started is quick and easy.",
    "how.step1.title": "Register Account",
    "how.step1.desc": "Sign up as a parent, driver, or school administrator.",
    "how.step2.title": "Connect to Bus",
    "how.step2.desc": "Link students to their assigned bus routes and schedules.",
    "how.step3.title": "Start Tracking",
    "how.step3.desc": "Monitor the journey in real-time through your dashboard.",
    "footer.rights": "© 2026 International School Transport",
    "login.title": "Smart Tracking for Safer Journeys.",
    "login.subtitle": "Real-time GPS tracking, attendance monitoring, and automated alerts for schools and parents.",
    "login.signin": "Sign In",
    "login.register": "Register",
    "login.username": "Username",
    "login.password": "Password",
    "login.fullname": "Full Name",
    "login.role": "Role",
    "login.parent": "Parent",
    "login.driver": "Driver",
    "login.admin": "Admin",
    "login.loggingIn": "Logging in...",
    "login.creating": "Creating account...",
    "login.secure": "Secure and Reliable",
    "sidebar.menu": "Menu",
    "sidebar.dashboard": "Dashboard",
    "sidebar.map": "Live Map",
    "sidebar.students": "Students",
    "sidebar.buses": "Buses",
    "sidebar.settings": "Settings",
    "sidebar.overview": "Overview",
    "sidebar.track": "Track Bus",
    "sidebar.alerts": "Alerts",
    "sidebar.mytrip": "My Trip",
    "sidebar.attendance": "Attendance",
    "sidebar.logout": "Log out",
    "sidebar.portal": "Portal"
  },
  ar: {
    "nav.brand": "روت سينك",
    "nav.signin": "تسجيل الدخول",
    "nav.join": "انضم الآن",
    "hero.title": "تتبع حافلات المدرسة بذكاء وأمان",
    "hero.subtitle": "الحل الأمثل للمدارس وأولياء الأمور لضمان سلامة الطلاب خلال كل رحلة. تحديثات مباشرة في متناول يدك.",
    "hero.getStarted": "ابدأ الآن",
    "hero.createAccount": "إنشاء حساب",
    "features.title": "لماذا تختار روت سينك؟",
    "features.subtitle": "كل ما تحتاجه لإدارة نقل فعالة.",
    "features.tracking.title": "تتبع مباشر",
    "features.tracking.desc": "اعرف مكان الحافلة بالضبط في أي لحظة بدقة عالية.",
    "features.safety.title": "أمان معزز",
    "features.safety.desc": "تنبيهات السياج الجغرافي ومراقبة السرعة لرحلة أكثر أماناً.",
    "features.alerts.title": "تنبيهات فورية",
    "features.alerts.desc": "احصل على تنبيهات عندما تكون الحافلة قريبة من منزلك أو المدرسة.",
    "how.title": "كيف يعمل؟",
    "how.subtitle": "البدء سريع وسهل.",
    "how.step1.title": "سجل حسابك",
    "how.step1.desc": "سجل كولي أمر، سائق، أو مدير مدرسة.",
    "how.step2.title": "اربط بالحافلة",
    "how.step2.desc": "اربط الطلاب بمسارات الحافلات والجداول المخصصة لهم.",
    "how.step3.title": "ابدأ التتبع",
    "how.step3.desc": "راقب الرحلة مباشرة من خلال لوحة التحكم الخاصة بك.",
    "footer.rights": "© 2026 النقل المدرسي الدولي",
    "login.title": "تتبع ذكي لرحلات أكثر أماناً.",
    "login.subtitle": "تتبع مباشر عبر نظام تحديد المواقع، مراقبة الحضور، وتنبيهات تلقائية للمدارس وأولياء الأمور.",
    "login.signin": "تسجيل الدخول",
    "login.register": "إنشاء حساب",
    "login.username": "اسم المستخدم",
    "login.password": "كلمة المرور",
    "login.fullname": "الاسم الكامل",
    "login.role": "الدور",
    "login.parent": "ولي أمر",
    "login.driver": "سائق",
    "login.admin": "مدير",
    "login.loggingIn": "جاري تسجيل الدخول...",
    "login.creating": "جاري إنشاء الحساب...",
    "login.secure": "آمن وموثوق",
    "sidebar.menu": "القائمة",
    "sidebar.dashboard": "لوحة التحكم",
    "sidebar.map": "الخريطة المباشرة",
    "sidebar.students": "الطلاب",
    "sidebar.buses": "الحافلات",
    "sidebar.settings": "الإعدادات",
    "sidebar.overview": "نظرة عامة",
    "sidebar.track": "تتبع الحافلة",
    "sidebar.alerts": "التنبيهات",
    "sidebar.mytrip": "رحلتي",
    "sidebar.attendance": "الحضور",
    "sidebar.logout": "تسجيل الخروج",
    "sidebar.portal": "بوابة"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || key;
  };

  const isRtl = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
}
