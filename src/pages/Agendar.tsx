import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { format, addDays, isBefore, startOfDay, parse, addMinutes, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, ArrowLeft, ArrowRight, Check, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Professional {
  id: string;
  full_name: string;
  company_name: string;
  avatar_url: string | null;
}

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

type Step = "service" | "datetime" | "info" | "confirm";

export default function Agendar() {
  const { professionalId } = useParams<{ professionalId: string }>();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (professionalId) {
      fetchProfessionalData();
    }
  }, [professionalId]);

  useEffect(() => {
    if (professionalId && selectedDate) {
      fetchExistingAppointments();
    }
  }, [professionalId, selectedDate]);

  const fetchProfessionalData = async () => {
    try {
      const [profResult, servicesResult, hoursResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, company_name, avatar_url")
          .eq("id", professionalId)
          .single(),
        supabase
          .from("services")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("working_hours")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("is_active", true),
      ]);

      if (profResult.error) throw profResult.error;
      if (servicesResult.error) throw servicesResult.error;
      if (hoursResult.error) throw hoursResult.error;

      setProfessional(profResult.data);
      setServices(servicesResult.data || []);
      setWorkingHours(hoursResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do profissional.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAppointments = async () => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_date, start_time, end_time")
      .eq("professional_id", professionalId)
      .eq("appointment_date", dateStr)
      .neq("status", "cancelled");

    if (!error && data) {
      setExistingAppointments(data);
    }
  };

  const isWorkingDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    return workingHours.some(wh => wh.day_of_week === dayOfWeek && wh.is_active);
  };

  const getAvailableTimeSlots = (): string[] => {
    if (!selectedDate || !selectedService) return [];

    const dayOfWeek = selectedDate.getDay();
    const dayHours = workingHours.find(wh => wh.day_of_week === dayOfWeek && wh.is_active);
    
    if (!dayHours) return [];

    const slots: string[] = [];
    const startTime = parse(dayHours.start_time, "HH:mm:ss", selectedDate);
    const endTime = parse(dayHours.end_time, "HH:mm:ss", selectedDate);
    
    let currentSlot = startTime;
    while (isBefore(addMinutes(currentSlot, selectedService.duration), endTime) || 
           format(addMinutes(currentSlot, selectedService.duration), "HH:mm") === format(endTime, "HH:mm")) {
      const slotStart = format(currentSlot, "HH:mm");
      const slotEnd = format(addMinutes(currentSlot, selectedService.duration), "HH:mm");
      
      // Check if slot overlaps with existing appointments
      const isAvailable = !existingAppointments.some(apt => {
        const aptStart = apt.start_time.substring(0, 5);
        const aptEnd = apt.end_time.substring(0, 5);
        return (slotStart < aptEnd && slotEnd > aptStart);
      });

      if (isAvailable) {
        slots.push(slotStart);
      }
      
      currentSlot = addMinutes(currentSlot, 30); // 30 min intervals
    }

    return slots;
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
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
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Agendamento realizado!",
        description: "Você receberá uma confirmação em breve.",
      });

      // Reset form and show success
      setCurrentStep("confirm");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
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

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

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
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Profissional não encontrado</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Voltar ao início
        </Button>
      </div>
    );
  }

  const availableSlots = getAvailableTimeSlots();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {professional.avatar_url ? (
                <img src={professional.avatar_url} alt={professional.full_name || ""} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{professional.company_name || professional.full_name}</h1>
              <p className="text-sm text-muted-foreground">Agendamento online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index < currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : index === currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 mx-1 rounded ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            {/* Service Selection */}
            {currentStep === "service" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                  Escolha o serviço
                </h2>
                {services.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhum serviço disponível no momento.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {services.map((service) => (
                      <Card
                        key={service.id}
                        className={`cursor-pointer transition-all hover:shadow-card-hover ${
                          selectedService?.id === service.id
                            ? "ring-2 ring-primary border-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-foreground">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-primary">
                              R$ {service.price.toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Date & Time Selection */}
            {currentStep === "datetime" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                  Escolha a data e horário
                </h2>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <Label className="mb-2 block">Data</Label>
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
                          className="rounded-md border"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <Label className="mb-2 block">Horário</Label>
                        {selectedDate ? (
                          availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                              {availableSlots.map((slot) => (
                                <Button
                                  key={slot}
                                  variant={selectedTime === slot ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedTime(slot)}
                                  className="w-full"
                                >
                                  {slot}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              Nenhum horário disponível nesta data.
                            </p>
                          )
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Selecione uma data primeiro.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Client Info */}
            {currentStep === "info" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                  Seus dados
                </h2>
                
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="(00) 00000-0000"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        placeholder="Alguma observação para o profissional?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Confirmation */}
            {currentStep === "confirm" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Agendamento Confirmado!
                  </h2>
                  <p className="text-muted-foreground">
                    Seu agendamento foi realizado com sucesso.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo do Agendamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serviço</span>
                      <span className="font-medium text-foreground">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data</span>
                      <span className="font-medium text-foreground">
                        {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horário</span>
                      <span className="font-medium text-foreground">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="font-semibold text-primary">R$ {selectedService?.price.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button onClick={() => navigate("/")} variant="outline">
                    Voltar ao início
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep !== "confirm" && (
          <div className="max-w-2xl mx-auto mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            {currentStep === "info" ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="gap-2"
              >
                {submitting ? "Agendando..." : "Confirmar Agendamento"}
                <Check className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
