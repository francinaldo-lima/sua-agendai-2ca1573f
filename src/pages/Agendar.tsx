import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { format, addDays, isBefore, startOfDay, parse, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  ArrowLeft,
  ArrowRight,
  Check,
  Building,
  MapPin,
  Instagram,
  Globe,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Professional {
  id: string;
  full_name: string;
  company_name: string;
  avatar_url: string | null;
}

interface BusinessProfile {
  logo_url: string | null;
  business_name: string | null;
  description: string | null;
  opening_hours: any;
  address: string | null;
  google_maps_link: string | null;
  phone: string | null;
  instagram_link: string | null;
  website: string | null;
}

interface Settings {
  public_page_theme: string | null;
}

// Premium theme palette — each theme defines hero gradient, accent ring, button & price colors
type ThemeKey = "default" | "black" | "gold" | "pink" | "brown" | "red";
interface ThemeDef {
  hero: string; // hero background gradient
  heroOverlay: string; // subtle pattern overlay
  pageBg: string; // page background gradient
  badge: string;
  ring: string;
  buttonBg: string;
  buttonHover: string;
  accentText: string;
  accentSoft: string;
  stepActive: string;
  stepLine: string;
}

const themes: Record<ThemeKey, ThemeDef> = {
  default: {
    hero: "bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600",
    heroOverlay: "bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.25),transparent_60%)]",
    pageBg: "bg-gradient-to-b from-blue-50/60 via-background to-background",
    badge: "bg-white/15 text-white border-white/20",
    ring: "ring-blue-500 border-blue-500",
    buttonBg: "bg-blue-600 text-white",
    buttonHover: "hover:bg-blue-700",
    accentText: "text-blue-600",
    accentSoft: "bg-blue-50 text-blue-700",
    stepActive: "bg-blue-600 text-white",
    stepLine: "bg-blue-600",
  },
  black: {
    hero: "bg-gradient-to-br from-neutral-900 via-neutral-800 to-black",
    heroOverlay: "bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),transparent_60%)]",
    pageBg: "bg-gradient-to-b from-neutral-100/70 via-background to-background",
    badge: "bg-white/10 text-white border-white/20",
    ring: "ring-neutral-900 border-neutral-900",
    buttonBg: "bg-neutral-900 text-white",
    buttonHover: "hover:bg-neutral-800",
    accentText: "text-neutral-900",
    accentSoft: "bg-neutral-100 text-neutral-900",
    stepActive: "bg-neutral-900 text-white",
    stepLine: "bg-neutral-900",
  },
  gold: {
    hero: "bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600",
    heroOverlay: "bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.3),transparent_60%)]",
    pageBg: "bg-gradient-to-b from-amber-50/70 via-background to-background",
    badge: "bg-white/20 text-white border-white/30",
    ring: "ring-amber-500 border-amber-500",
    buttonBg: "bg-amber-500 text-white",
    buttonHover: "hover:bg-amber-600",
    accentText: "text-amber-600",
    accentSoft: "bg-amber-50 text-amber-700",
    stepActive: "bg-amber-500 text-white",
    stepLine: "bg-amber-500",
  },
  pink: {
    hero: "bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500",
    heroOverlay: "bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.3),transparent_60%)]",
    pageBg: "bg-gradient-to-b from-pink-50/70 via-background to-background",
    badge: "bg-white/20 text-white border-white/30",
    ring: "ring-pink-500 border-pink-500",
    buttonBg: "bg-pink-500 text-white",
    buttonHover: "hover:bg-pink-600",
    accentText: "text-pink-600",
    accentSoft: "bg-pink-50 text-pink-700",
    stepActive: "bg-pink-500 text-white",
    stepLine: "bg-pink-500",
  },
  brown: {
    hero: "bg-gradient-to-br from-amber-900 via-stone-700 to-amber-800",
    heroOverlay: "bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.18),transparent_60%)]",
    pageBg: "bg-gradient-to-b from-stone-100/70 via-background to-background",
    badge: "bg-white/15 text-white border-white/20",
    ring: "ring-amber-800 border-amber-800",
    buttonBg: "bg-amber-800 text-white",
    buttonHover: "hover:bg-amber-900",
    accentText: "text-amber-800",
    accentSoft: "bg-amber-50 text-amber-900",
    stepActive: "bg-amber-800 text-white",
    stepLine: "bg-amber-800",
  },
  red: {
    hero: "bg-gradient-to-br from-red-600 via-rose-600 to-red-700",
    heroOverlay: "bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.25),transparent_60%)]",
    pageBg: "bg-gradient-to-b from-red-50/70 via-background to-background",
    badge: "bg-white/15 text-white border-white/20",
    ring: "ring-red-600 border-red-600",
    buttonBg: "bg-red-600 text-white",
    buttonHover: "hover:bg-red-700",
    accentText: "text-red-600",
    accentSoft: "bg-red-50 text-red-700",
    stepActive: "bg-red-600 text-white",
    stepLine: "bg-red-600",
  },
};

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

interface WorkingHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Appointment {
  appointment_date: string;
  start_time: string;
  end_time: string;
}

interface TimeBlock {
  block_date: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
}

type Step = "service" | "datetime" | "info" | "confirm";

export default function Agendar() {
  const { professionalId } = useParams<{ professionalId: string }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const themeKey = (settings?.public_page_theme as ThemeKey) || "default";
  const t = themes[themeKey] || themes.default;

  useEffect(() => {
    if (professionalId) fetchProfessionalData();
  }, [professionalId]);

  useEffect(() => {
    if (professionalId && selectedDate) {
      fetchExistingAppointments();
      fetchTimeBlocks();
    }
  }, [professionalId, selectedDate]);

  const fetchProfessionalData = async () => {
    try {
      const profResult = await supabase
        .from("profiles")
        .select("id, full_name, company_name, avatar_url, user_id")
        .eq("id", professionalId)
        .single();
      if (profResult.error) throw profResult.error;
      const userId = profResult.data.user_id;

      const [servicesResult, hoursResult, businessResult, settingsResult] = await Promise.all([
        supabase.from("services").select("*").eq("professional_id", professionalId).eq("is_active", true).order("name"),
        supabase.from("working_hours").select("*").eq("professional_id", professionalId).eq("is_active", true),
        supabase.from("business_profile").select("*").eq("professional_id", professionalId).maybeSingle(),
        supabase.from("settings").select("public_page_theme").eq("user_id", userId).maybeSingle(),
      ]);

      if (servicesResult.error) throw servicesResult.error;
      if (hoursResult.error) throw hoursResult.error;

      setProfessional(profResult.data);
      setServices(servicesResult.data || []);
      setWorkingHours(hoursResult.data || []);
      setBusinessProfile(businessResult.data);
      setSettings(settingsResult.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAppointments = async () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data } = await supabase
      .from("appointments")
      .select("appointment_date, start_time, end_time")
      .eq("professional_id", professionalId)
      .eq("appointment_date", dateStr)
      .neq("status", "canceled");
    if (data) setExistingAppointments(data);
  };

  const fetchTimeBlocks = async () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data } = await supabase
      .from("time_blocks")
      .select("block_date, start_time, end_time, is_all_day")
      .eq("professional_id", professionalId)
      .eq("block_date", dateStr);
    if (data) setTimeBlocks(data);
  };

  const isWorkingDay = (date: Date) => {
    const d = date.getDay();
    return workingHours.some((wh) => wh.day_of_week === d && wh.is_active);
  };

  const getAvailableTimeSlots = (): string[] => {
    if (!selectedDate || !selectedService) return [];
    const dayOfWeek = selectedDate.getDay();
    const dayHours = workingHours.find((wh) => wh.day_of_week === dayOfWeek && wh.is_active);
    if (!dayHours) return [];
    if (timeBlocks.some((b) => b.is_all_day)) return [];

    const slots: string[] = [];
    const startTime = parse(dayHours.start_time, "HH:mm:ss", selectedDate);
    const endTime = parse(dayHours.end_time, "HH:mm:ss", selectedDate);
    let cur = startTime;
    while (
      isBefore(addMinutes(cur, selectedService.duration), endTime) ||
      format(addMinutes(cur, selectedService.duration), "HH:mm") === format(endTime, "HH:mm")
    ) {
      const slotStart = format(cur, "HH:mm");
      const slotEnd = format(addMinutes(cur, selectedService.duration), "HH:mm");
      const isBooked = existingAppointments.some((a) => {
        const s = a.start_time.substring(0, 5);
        const e = a.end_time.substring(0, 5);
        return slotStart < e && slotEnd > s;
      });
      const isBlocked = timeBlocks.some((b) => {
        if (b.is_all_day) return true;
        const s = b.start_time.substring(0, 5);
        const e = b.end_time.substring(0, 5);
        return slotStart < e && slotEnd > s;
      });
      if (!isBooked && !isBlocked) slots.push(slotStart);
      cur = addMinutes(cur, 30);
    }
    return slots;
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const endTime = format(
        addMinutes(parse(selectedTime, "HH:mm", new Date()), selectedService.duration),
        "HH:mm:ss"
      );
      const { error } = await supabase.from("appointments").insert({
        professional_id: professionalId,
        service_id: selectedService.id,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: `${selectedTime}:00`,
        end_time: endTime,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        notes: notes || null,
        status: "scheduled",
      });
      if (error) throw error;
      toast({ title: "Agendamento realizado!", description: "Você receberá uma confirmação em breve." });
      setCurrentStep("confirm");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({ title: "Erro", description: "Não foi possível realizar o agendamento.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Serviço" },
    { key: "datetime", label: "Data e Hora" },
    { key: "info", label: "Seus Dados" },
    { key: "confirm", label: "Confirmação" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case "service":
        return selectedService !== null;
      case "datetime":
        return selectedDate !== undefined && selectedTime !== null;
      case "info":
        return clientName.trim() !== "";
      default:
        return true;
    }
  };

  const nextStep = () => {
    const i = currentStepIndex + 1;
    if (i < steps.length) setCurrentStep(steps[i].key);
  };
  const prevStep = () => {
    const i = currentStepIndex - 1;
    if (i >= 0) setCurrentStep(steps[i].key);
  };

  const formatOpeningHours = () => {
    const hours = businessProfile?.opening_hours;
    if (!hours || typeof hours !== "object") return null;
    return Object.entries(hours).map(([day, time]) => (
      <div key={day} className="flex justify-between text-sm">
        <span className="text-muted-foreground capitalize">{day}</span>
        <span className="text-foreground font-medium">{time as string}</span>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Profissional não encontrado</h1>
        <Button onClick={() => navigate("/")} variant="outline">Voltar ao início</Button>
      </div>
    );
  }

  const availableSlots = getAvailableTimeSlots();
  const displayName = businessProfile?.business_name || professional.company_name || professional.full_name;
  const displayLogo = businessProfile?.logo_url || professional.avatar_url;

  return (
    <div className={`min-h-screen ${t.pageBg}`}>
      {/* PREMIUM HERO */}
      <header className={`relative overflow-hidden ${t.hero}`}>
        <div className={`absolute inset-0 ${t.heroOverlay} pointer-events-none`} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(0,0,0,0.15))] pointer-events-none" />

        <div className="relative container mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-24">
          <div className="flex flex-col items-center text-center gap-5 sm:gap-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-white/30 blur-md" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/95 ring-4 ring-white/40 shadow-2xl overflow-hidden flex items-center justify-center">
                {displayLogo ? (
                  <img src={displayLogo} alt={displayName || ""} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-10 h-10 text-neutral-700" />
                )}
              </div>
            </div>

            <Badge className={`${t.badge} backdrop-blur-sm border px-3 py-1 text-xs font-medium`}>
              <Sparkles className="w-3 h-3 mr-1.5" />
              Agendamento online
            </Badge>

            <div className="space-y-2 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
                {displayName}
              </h1>
              {businessProfile?.description && (
                <p className="text-white/90 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                  {businessProfile.description}
                </p>
              )}
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-2 text-white/90 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Reserva segura</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/40" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Confirmação imediata</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/40" />
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-current" />
                <span>Atendimento de qualidade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full text-background"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M0,32 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </header>

      {/* CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 -mt-2">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* SIDEBAR */}
          <aside className="lg:col-span-1 space-y-4 order-2 lg:order-1">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Building className={`w-4 h-4 ${t.accentText}`} />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {businessProfile?.phone && (
                  <a
                    href={`tel:${businessProfile.phone}`}
                    className="flex items-center gap-3 text-sm hover:bg-muted/60 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${t.accentSoft} flex items-center justify-center flex-shrink-0`}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{businessProfile.phone}</span>
                  </a>
                )}
                {businessProfile?.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg ${t.accentSoft} flex items-center justify-center flex-shrink-0`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="pt-1">{businessProfile.address}</span>
                  </div>
                )}
                {businessProfile?.instagram_link && (
                  <a
                    href={
                      businessProfile.instagram_link.startsWith("http")
                        ? businessProfile.instagram_link
                        : `https://instagram.com/${businessProfile.instagram_link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:bg-muted/60 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${t.accentSoft} flex items-center justify-center flex-shrink-0`}>
                      <Instagram className="w-4 h-4" />
                    </div>
                    <span className="font-medium flex items-center gap-1">
                      Instagram <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                )}
                {businessProfile?.website && (
                  <a
                    href={
                      businessProfile.website.startsWith("http")
                        ? businessProfile.website
                        : `https://${businessProfile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:bg-muted/60 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${t.accentSoft} flex items-center justify-center flex-shrink-0`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="font-medium flex items-center gap-1">
                      Site <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                )}
              </CardContent>
            </Card>

            {businessProfile?.opening_hours &&
              Object.keys(businessProfile.opening_hours).length > 0 && (
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${t.accentText}`} />
                      Horário de Funcionamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">{formatOpeningHours()}</CardContent>
                </Card>
              )}

            {businessProfile?.google_maps_link && (
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <iframe
                    src={businessProfile.google_maps_link}
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </CardContent>
              </Card>
            )}
          </aside>

          {/* MAIN BOOKING */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="border-border/60 shadow-lg">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* PROGRESS */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                  {steps.map((step, index) => (
                    <div key={step.key} className="flex items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                            index <= currentStepIndex
                              ? `${t.stepActive} shadow-md scale-105`
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-medium hidden sm:block transition-colors ${
                            index <= currentStepIndex ? t.accentText : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 rounded transition-colors ${
                            index < currentStepIndex ? t.stepLine : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* SERVICE */}
                    {currentStep === "service" && (
                      <div className="space-y-4">
                        <div className="text-center mb-4 sm:mb-6">
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Escolha o serviço</h2>
                          <p className="text-sm text-muted-foreground mt-1">Selecione o serviço desejado</p>
                        </div>
                        {services.length === 0 ? (
                          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                            Nenhum serviço disponível no momento.
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {services.map((service) => {
                              const isSelected = selectedService?.id === service.id;
                              return (
                                <button
                                  key={service.id}
                                  onClick={() => setSelectedService(service)}
                                  className={`group text-left rounded-xl border-2 bg-card p-4 sm:p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                                    isSelected
                                      ? `${t.ring} ring-2 ring-offset-2 shadow-md`
                                      : "border-border/60"
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-base sm:text-lg text-foreground">
                                        {service.name}
                                      </h3>
                                      {service.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                          {service.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-3">
                                        <span
                                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${t.accentSoft}`}
                                        >
                                          <Clock className="w-3 h-3" />
                                          {service.duration} min
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                        a partir de
                                      </div>
                                      <div className={`text-xl sm:text-2xl font-bold ${t.accentText}`}>
                                        R$ {service.price.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* DATETIME */}
                    {currentStep === "datetime" && (
                      <div className="space-y-4">
                        <div className="text-center mb-4 sm:mb-6">
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Escolha data e horário</h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Selecione um dia disponível e o horário ideal
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <Label className="mb-2 block flex items-center gap-1.5 text-sm font-semibold">
                              <CalendarIcon className="w-4 h-4" /> Data
                            </Label>
                            <div className="rounded-xl border border-border/60 bg-card p-2 flex justify-center">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                  setSelectedDate(date);
                                  setSelectedTime(null);
                                }}
                                disabled={(date) =>
                                  isBefore(date, startOfDay(new Date())) ||
                                  !isWorkingDay(date) ||
                                  isBefore(addDays(new Date(), 60), date)
                                }
                                locale={ptBR}
                                className="rounded-md"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2 block flex items-center gap-1.5 text-sm font-semibold">
                              <Clock className="w-4 h-4" /> Horário
                            </Label>
                            <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 min-h-[200px]">
                              {selectedDate ? (
                                availableSlots.length > 0 ? (
                                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1">
                                    {availableSlots.map((slot) => {
                                      const active = selectedTime === slot;
                                      return (
                                        <button
                                          key={slot}
                                          onClick={() => setSelectedTime(slot)}
                                          className={`h-10 rounded-lg text-sm font-medium border transition-all ${
                                            active
                                              ? `${t.buttonBg} border-transparent shadow-sm scale-[1.02]`
                                              : "bg-background hover:bg-muted border-border"
                                          }`}
                                        >
                                          {slot}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground py-8">
                                    Nenhum horário disponível nesta data.
                                  </div>
                                )
                              ) : (
                                <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground py-8">
                                  Selecione uma data para ver os horários.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* INFO */}
                    {currentStep === "info" && (
                      <div className="space-y-4">
                        <div className="text-center mb-4 sm:mb-6">
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Seus dados</h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Precisamos de algumas informações para confirmar
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="name" className="text-sm font-semibold">
                              Nome completo *
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="name"
                                placeholder="Seu nome"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="pl-10 h-11"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold">E-mail</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="pl-10 h-11"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-semibold">Telefone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="(00) 00000-0000"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="pl-10 h-11"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="notes" className="text-sm font-semibold">Observações</Label>
                            <Textarea
                              id="notes"
                              placeholder="Alguma informação adicional..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Booking summary */}
                        {selectedService && selectedDate && selectedTime && (
                          <div className={`mt-4 rounded-xl p-4 ${t.accentSoft}`}>
                            <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">
                              Resumo do agendamento
                            </div>
                            <div className="grid sm:grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-xs opacity-70">Serviço</div>
                                <div className="font-semibold">{selectedService.name}</div>
                              </div>
                              <div>
                                <div className="text-xs opacity-70">Data</div>
                                <div className="font-semibold">
                                  {format(selectedDate, "dd MMM yyyy", { locale: ptBR })}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs opacity-70">Horário</div>
                                <div className="font-semibold">{selectedTime}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CONFIRM */}
                    {currentStep === "confirm" && (
                      <div className="space-y-6 py-4">
                        <div className="text-center">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
                            <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                            </div>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                            Agendamento Confirmado!
                          </h2>
                          <p className="text-muted-foreground">
                            Seu horário foi reservado com sucesso. 🎉
                          </p>
                        </div>

                        <Card className="border-border/60 max-w-md mx-auto">
                          <CardContent className="p-5 sm:p-6 space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b">
                              <span className="text-muted-foreground text-sm">Serviço</span>
                              <span className="font-semibold">{selectedService?.name}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                              <span className="text-muted-foreground text-sm">Data</span>
                              <span className="font-semibold">
                                {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                              <span className="text-muted-foreground text-sm">Horário</span>
                              <span className="font-semibold">{selectedTime}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-muted-foreground text-sm">Valor</span>
                              <span className={`text-xl font-bold ${t.accentText}`}>
                                R$ {selectedService?.price.toFixed(2)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="text-center">
                          <Button onClick={() => navigate("/")} variant="outline">
                            Voltar ao início
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* NAV BUTTONS */}
                {currentStep !== "confirm" && (
                  <div className="flex justify-between items-center gap-3 mt-6 sm:mt-8 pt-5 border-t border-border/60">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStepIndex === 0}
                      className="gap-2 h-11"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </Button>

                    {currentStep === "info" ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={!canProceed() || submitting}
                        className={`gap-2 h-11 px-5 sm:px-8 ${t.buttonBg} ${t.buttonHover} shadow-md`}
                      >
                        {submitting ? "Agendando..." : "Confirmar Agendamento"}
                        <Check className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className={`gap-2 h-11 px-5 sm:px-8 ${t.buttonBg} ${t.buttonHover} shadow-md`}
                      >
                        Próximo
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer trust */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              Powered by <span className="font-semibold">AgendAI</span> · Agendamento online seguro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
