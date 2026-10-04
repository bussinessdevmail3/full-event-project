import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type React from "react";

export type Lang = "he" | "ar";

const dict = {
  appName: { he: "EventPlace", ar: "EventPlace" },
  tagline: { he: "לוח הבקרה לספקים ולמנהלים", ar: "لوحة التحكم للمزوّدين والمدراء" },
  signIn: { he: "התחברות", ar: "تسجيل الدخول" },
  signUp: { he: "הרשמה", ar: "إنشاء حساب" },
  signOut: { he: "התנתקות", ar: "تسجيل الخروج" },
  email: { he: "אימייל", ar: "البريد الإلكتروني" },
  password: { he: "סיסמה", ar: "كلمة المرور" },
  fullName: { he: "שם מלא", ar: "الاسم الكامل" },
  noAccount: { he: "אין לך חשבון? הירשם", ar: "ليس لديك حساب؟ سجّل" },
  haveAccount: { he: "יש לך חשבון? התחבר", ar: "لديك حساب؟ سجّل الدخول" },
  checkEmail: { he: "בדוק את האימייל לאישור החשבון", ar: "تحقق من بريدك لتأكيد الحساب" },
  overview: { he: "סקירה", ar: "نظرة عامة" },
  suppliers: { he: "ספקים", ar: "المزوّدون" },
  bookings: { he: "הזמנות", ar: "الحجوزات" },
  lists: { he: "רשימות", ar: "القوائم" },
  profile: { he: "הפרופיל שלי", ar: "ملفي" },
  packages: { he: "חבילות", ar: "الباقات" },
  availability: { he: "זמינות", ar: "التوفّر" },
  adminArea: { he: "אזור מנהל", ar: "منطقة المدير" },
  supplierArea: { he: "אזור ספק", ar: "منطقة المزوّد" },
  totalSuppliers: { he: "סה״כ ספקים", ar: "إجمالي المزوّدين" },
  pendingApproval: { he: "ממתינים לאישור", ar: "بانتظار الموافقة" },
  totalBookings: { he: "סה״כ הזמנות", ar: "إجمالي الحجوزات" },
  customers: { he: "משתמשים", ar: "المستخدمون" },
  approve: { he: "אשר", ar: "موافقة" },
  reject: { he: "דחה", ar: "رفض" },
  suspend: { he: "השעה", ar: "تعليق" },
  status: { he: "סטטוס", ar: "الحالة" },
  name: { he: "שם", ar: "الاسم" },
  type: { he: "סוג", ar: "النوع" },
  city: { he: "עיר", ar: "المدينة" },
  date: { he: "תאריך", ar: "التاريخ" },
  guests: { he: "אורחים", ar: "الضيوف" },
  price: { he: "מחיר", ar: "السعر" },
  actions: { he: "פעולות", ar: "إجراءات" },
  save: { he: "שמור", ar: "حفظ" },
  add: { he: "הוסף", ar: "إضافة" },
  delete: { he: "מחק", ar: "حذف" },
  saved: { he: "נשמר", ar: "تم الحفظ" },
  empty: { he: "אין נתונים עדיין", ar: "لا توجد بيانات بعد" },
  loading: { he: "טוען…", ar: "جارٍ التحميل…" },
  businessName: { he: "שם העסק", ar: "اسم العمل" },
  description: { he: "תיאור", ar: "الوصف" },
  phone: { he: "טלפון", ar: "الهاتف" },
  venue: { he: "אולם", ar: "قاعة" },
  artist: { he: "זמר / אמן", ar: "مطرب / فنان" },
  createSupplier: { he: "צור פרופיל ספק", ar: "إنشاء ملف مزوّد" },
  createSupplierHint: { he: "מלא את הפרטים — המנהל יאשר את הפרופיל.", ar: "املأ التفاصيل — سيوافق المدير على الملف." },
  noRole: { he: "לחשבון שלך עדיין אין הרשאת מנהל או ספק.", ar: "حسابك لا يملك صلاحية مدير أو مزوّد بعد." },
  becomeSupplier: { he: "הצטרף כספק", ar: "انضم كمزوّد" },
  blockedDates: { he: "לחץ על תאריך כדי לחסום / לשחרר אותו", ar: "اضغط على تاريخ لحجبه / تحريره" },
  confirm: { he: "אשר", ar: "تأكيد" },
  complete: { he: "הושלם", ar: "مكتمل" },
  nameHe: { he: "שם בעברית", ar: "الاسم بالعبرية" },
  nameAr: { he: "שם בערבית", ar: "الاسم بالعربية" },
  cities: { he: "ערים", ar: "المدن" },
  regions: { he: "אזורים", ar: "المناطق" },
  amenities: { he: "מתקנים", ar: "المرافق" },
  genres: { he: "ז׳אנרים", ar: "الأنماط الموسيقية" },
  eventTypes: { he: "סוגי אירועים", ar: "أنواع المناسبات" },
  active: { he: "פעיל", ar: "فعّال" },
  pending: { he: "ממתין", ar: "قيد الانتظار" },
  approved: { he: "מאושר", ar: "موافق عليه" },
  rejected: { he: "נדחה", ar: "مرفوض" },
  suspended: { he: "מושעה", ar: "معلّق" },
  confirmed: { he: "מאושר", ar: "مؤكَّد" },
  cancelled: { he: "בוטל", ar: "ملغى" },
  completed: { he: "הושלם", ar: "مكتمل" },
  requested: { he: "ממתין לתשובה", ar: "بانتظار الرد" },
  quoted: { he: "נשלחה הצעה", ar: "أُرسل عرض سعر" },
  supplier_reviewing: { he: "בבדיקת הספק", ar: "قيد مراجعة المزوّد" },
  offer_sent: { he: "נשלחה הצעה", ar: "أُرسل عرض سعر" },
  customer_accepted: { he: "הלקוח אישר", ar: "وافق الزبون" },
  payment_pending: { he: "ממתין לתשלום", ar: "بانتظار الدفع" },
  booked: { he: "תפוס", ar: "محجوز" },
  blocked: { he: "חסום", ar: "محجوب" },
  customer: { he: "לקוח", ar: "الزبون" },
  message: { he: "הודעה", ar: "رسالة" },
  region: { he: "אזור", ar: "المنطقة" },
} as const;

export type TKey = keyof typeof dict;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string };
// Keep one context instance across hot reloads so the provider and consumers always match.
const g = globalThis as unknown as { __epI18nCtx?: React.Context<Ctx | null> };
const I18nContext = (g.__epI18nCtx ??= createContext<Ctx | null>(null));

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "he" || saved === "ar") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = "rtl";
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("lang", l);
    setLangState(l);
  };
  const t = (k: TKey) => dict[k]?.[lang] ?? k;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}

/** Picks name_he / name_ar from a lookup row. */
export function localName(row: { name_he?: string | null; name_ar?: string | null } | null | undefined, lang: Lang) {
  if (!row) return "—";
  return (lang === "ar" ? row.name_ar : row.name_he) || row.name_he || row.name_ar || "—";
}

/** Picks the Hebrew/Arabic variant of a field pair like business_name_he / business_name_ar. */
export function localField(row: Record<string, unknown> | null | undefined, base: string, lang: Lang): string {
  if (!row) return "—";
  const he = row[`${base}_he`] as string | null | undefined;
  const ar = row[`${base}_ar`] as string | null | undefined;
  return (lang === "ar" ? ar || he : he || ar) || "—";
}
