import type { LucideIcon } from "lucide-react";
import { Heart, Shield, Sparkles, Users } from "lucide-react";

export type LandingFeature = {
  icon: LucideIcon;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
};

export type LandingStep = {
  number: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
};

export type LandingTestimonial = {
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  story: string;
  storyAr: string;
  match: string;
};

export const LANDING_NAV_LINKS = [
  { href: "/#features", label: "Features", labelAr: "المزايا" },
  { href: "/#how-it-works", label: "How it Works", labelAr: "كيف يعمل" },
  { href: "/#pricing", label: "Pricing", labelAr: "الأسعار" },
] as const;

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: Heart,
    title: "Smart Matching",
    titleAr: "تطابق ذكي",
    description: "Our AI analyzes values, lifestyle, and goals to find your perfect match",
    descriptionAr: "يحلل نظامنا الذكي القيم وأسلوب الحياة والأهداف ليجد لك الشريك المثالي",
  },
  {
    icon: Shield,
    title: "Privacy First",
    titleAr: "الخصوصية أولاً",
    description: "Your journey is private and secure. We protect your data and dignity",
    descriptionAr: "رحلتك خاصة وآمنة. نحن نحمي بياناتك وكرامتك",
  },
  {
    icon: Users,
    title: "Family Support",
    titleAr: "دعم العائلة",
    description: "Involve your wali at your pace. We honor traditional Islamic values",
    descriptionAr: "أشرك وليّك بالوتيرة التي تناسبك. نحن نحترم القيم الإسلامية الأصيلة",
  },
  {
    icon: Sparkles,
    title: "AI Guidance",
    titleAr: "إرشاد ذكي",
    description: "Get personalized advice from our Islamic marriage counseling AI",
    descriptionAr: "احصل على نصائح مخصصة من مرشدنا الذكي للزواج الإسلامي",
  },
];

export const LANDING_STEPS: LandingStep[] = [
  {
    number: "01",
    title: "Create Your Profile",
    titleAr: "أنشئ ملفك الشخصي",
    description: "Share your values, goals, and what you're looking for in a partner",
    descriptionAr: "شارك قيمك وأهدافك وما تبحث عنه في شريك حياتك",
  },
  {
    number: "02",
    title: "Get Matched",
    titleAr: "احصل على تطابق",
    description: "Our algorithm finds compatible matches based on what matters most",
    descriptionAr: "يجد خوارزمنا تطابقات متوافقة بناءً على ما يهمك أكثر",
  },
  {
    number: "03",
    title: "Start Your Journey",
    titleAr: "ابدأ رحلتك",
    description: "Connect respectfully, involve family when ready, and build towards marriage",
    descriptionAr: "تواصل باحترام، وأشرك عائلتك عندما تكون مستعداً، وابنِ نحو الزواج",
  },
];

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    name: "Ahmed & Fatima",
    nameAr: "أحمد وفاطمة",
    location: "London, UK",
    locationAr: "لندن، المملكة المتحدة",
    story:
      "Alhamdulillah, we found each other on Waleef. The family involvement feature made the process so much easier and more respectful.",
    storyAr: "الحمد لله، وجدنا بعضنا البعض على وليف. جعلت ميزة مشاركة العائلة العملية أسهل وأكثر احتراماً بكثير.",
    match: "95% Match",
  },
  {
    name: "Yusuf & Aisha",
    nameAr: "يوسف وعائشة",
    location: "New York, USA",
    locationAr: "نيويورك، الولايات المتحدة",
    story:
      "The AI coach helped us navigate difficult conversations. We're now happily married with a beautiful family.",
    storyAr: "ساعدنا المرشد الذكي على تجاوز المحادثات الصعبة. نحن الآن متزوجان بسعادة ولدينا عائلة جميلة.",
    match: "88% Match",
  },
  {
    name: "Omar & Maryam",
    nameAr: "عمر ومريم",
    location: "Dubai, UAE",
    locationAr: "دبي، الإمارات",
    story:
      "We appreciated how Waleef prioritized our Islamic values. The platform made it easy to find someone truly compatible.",
    storyAr: "قدّرنا كيف أعطى وليف الأولوية لقيمنا الإسلامية. سهّلت المنصة إيجاد شخص متوافق حقاً.",
    match: "92% Match",
  },
];

export type FooterLink = { label: string; labelAr: string; href?: string };
export type FooterColumn = { title: string; titleAr: string; links: FooterLink[] };

export const LANDING_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    titleAr: "المنتج",
    links: [
      { label: "Features", labelAr: "المزايا", href: "/#features" },
      { label: "How it Works", labelAr: "كيف يعمل", href: "/#how-it-works" },
      { label: "Pricing", labelAr: "الأسعار", href: "/#pricing" },
      { label: "Success Stories", labelAr: "قصص نجاح", href: "/#success-stories" },
    ],
  },
  {
    title: "Company",
    titleAr: "الشركة",
    links: [
      { label: "About Us", labelAr: "من نحن", href: "/about" },
      { label: "Islamic Values", labelAr: "القيم الإسلامية", href: "/#trust" },
      { label: "Privacy Policy", labelAr: "سياسة الخصوصية", href: "/privacy" },
      { label: "Terms of Service", labelAr: "شروط الخدمة", href: "/terms" },
    ],
  },
  {
    title: "Support",
    titleAr: "الدعم",
    links: [
      { label: "Help Center", labelAr: "مركز المساعدة", href: "/help" },
      { label: "Contact Us", labelAr: "اتصل بنا", href: "mailto:support@waleef.net" },
      { label: "Safety Tips", labelAr: "نصائح للسلامة", href: "/#trust" },
      { label: "FAQ", labelAr: "الأسئلة الشائعة", href: "/#faq" },
    ],
  },
];
