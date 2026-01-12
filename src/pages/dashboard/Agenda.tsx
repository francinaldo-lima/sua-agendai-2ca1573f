import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Appointment {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  service: { name: string; duration: number; price: number } | null;
  client: { id: string; name: string } | null;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Agendado', color: 'text-blue-600', bg: 'bg-blue-100' },
  confirmed: { label: 'Confirmado', color: 'text-green-600', bg: 'bg-green-100' },
  completed: { label: 'Concluído', color: 'text-gray-600', bg: 'bg-gray-100' },
  canceled: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100' },
};

const Agenda = () => {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    service_id: '',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    notes: '',
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchData = async () => {
    if (!profile?.id) return;

    // Fetch appointments for the week
    const startDate = format(weekDays[0], 'yyyy-MM-dd');
    const endDate = format(weekDays[6], 'yyyy-MM-dd');

    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(`
        *,
        service:service_id (name, duration, price)
      `)
      .eq('professional_id', profile.id)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('start_time');

    if (appointmentsData) {
      setAppointments(appointmentsData as any);
    }

    // Fetch services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('professional_id', profile.id)
      .eq('is_active', true);

    if (servicesData) {
      setServices(servicesData);
    }

    // Fetch clients
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('professional_id', profile.id)
      .order('name');

    if (clientsData) {
      setClients(clientsData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [profile?.id, currentDate]);

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((a) => a.appointment_date === format(date, 'yyyy-MM-dd'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    const selectedService = services.find((s) => s.id === formData.service_id);
    if (!selectedService) {
      toast.error('Selecione um serviço');
      return;
    }

    // Calculate end time
    const [hours, minutes] = formData.start_time.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + selectedService.duration;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    // Create or get client
    let clientId = formData.client_id;
    if (!clientId && formData.client_name) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          professional_id: profile.id,
          name: formData.client_name,
          email: formData.client_email || null,
          phone: formData.client_phone || null,
        })
        .select()
        .single();

      if (clientError) {
        toast.error('Erro ao criar cliente');
        return;
      }
      clientId = newClient.id;
    }

    const selectedClient = clients.find((c) => c.id === clientId);

    const { error } = await supabase.from('appointments').insert({
      professional_id: profile.id,
      client_id: clientId || null,
      client_name: selectedClient?.name || formData.client_name,
      client_email: selectedClient?.email || formData.client_email || null,
      client_phone: selectedClient?.phone || formData.client_phone || null,
      service_id: formData.service_id,
      appointment_date: formData.appointment_date,
      start_time: formData.start_time,
      end_time: endTime,
      notes: formData.notes || null,
      status: 'scheduled',
    });

    if (error) {
      toast.error('Erro ao criar agendamento');
      console.error(error);
    } else {
      toast.success('Agendamento criado com sucesso!');
      fetchData();
      setIsDialogOpen(false);
      setFormData({
        client_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        service_id: '',
        appointment_date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        notes: '',
      });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Status atualizado!');
      fetchData();
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Agenda
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Gerencie seus agendamentos
          </motion.p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(weekDays[0], "d 'de' MMM", { locale: ptBR })} -{' '}
            {format(weekDays[6], "d 'de' MMM 'de' yyyy", { locale: ptBR })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-4">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => {
                      if (value === 'new') {
                        setFormData({ ...formData, client_id: '' });
                      } else {
                        const client = clients.find((c) => c.id === value);
                        setFormData({
                          ...formData,
                          client_id: value,
                          client_name: client?.name || '',
                          client_email: client?.email || '',
                          client_phone: client?.phone || '',
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione ou crie novo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ Novo Cliente</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!formData.client_id && (
                  <>
                    <div>
                      <Label htmlFor="client_name">Nome do Cliente *</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) =>
                          setFormData({ ...formData, client_name: e.target.value })
                        }
                        required={!formData.client_id}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="client_email">Email</Label>
                        <Input
                          id="client_email"
                          type="email"
                          value={formData.client_email}
                          onChange={(e) =>
                            setFormData({ ...formData, client_email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="client_phone">Telefone</Label>
                        <Input
                          id="client_phone"
                          value={formData.client_phone}
                          onChange={(e) =>
                            setFormData({ ...formData, client_phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label>Serviço *</Label>
                  <Select
                    value={formData.service_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, service_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) =>
                        setFormData({ ...formData, appointment_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Horário</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full">
                  Criar Agendamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`min-h-[400px] rounded-xl border p-3 ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <div className="text-center mb-3">
                  <p className="text-xs text-muted-foreground uppercase">
                    {format(day, 'EEE', { locale: ptBR })}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isToday ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </p>
                </div>

                <div className="space-y-2">
                  {dayAppointments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Sem agendamentos
                    </p>
                  ) : (
                    dayAppointments.map((appointment) => {
                      const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;
                      return (
                        <div
                          key={appointment.id}
                          className={`p-2 rounded-lg ${status.bg} border`}
                        >
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            {appointment.start_time?.slice(0, 5)} - {appointment.end_time?.slice(0, 5)}
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">
                            {appointment.client?.name || appointment.client_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {appointment.service?.name}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {appointment.status === 'scheduled' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateStatus(appointment.id, 'confirmed')}
                                >
                                  <Check className="h-3 w-3 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateStatus(appointment.id, 'canceled')}
                                >
                                  <X className="h-3 w-3 text-red-600" />
                                </Button>
                              </>
                            )}
                            {appointment.status === 'confirmed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => updateStatus(appointment.id, 'completed')}
                              >
                                Concluir
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Agenda;
