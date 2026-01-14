import { useState, useEffect } from 'react';
import { format, addMinutes, parse } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface NewAppointmentDialogProps {
  professionalId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  defaultDate?: string;
}

export const NewAppointmentDialog = ({
  professionalId,
  onSuccess,
  trigger,
  defaultDate,
}: NewAppointmentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    service_id: '',
    appointment_date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, professionalId]);

  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({ ...prev, appointment_date: defaultDate }));
    }
  }, [defaultDate]);

  const fetchData = async () => {
    if (!professionalId) return;

    const [servicesResult, clientsResult] = await Promise.all([
      supabase
        .from('services')
        .select('id, name, duration, price')
        .eq('professional_id', professionalId)
        .eq('is_active', true),
      supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('professional_id', professionalId)
        .order('name'),
    ]);

    if (servicesResult.data) setServices(servicesResult.data);
    if (clientsResult.data) setClients(clientsResult.data);
  };

  const validateTimeSlot = async (): Promise<boolean> => {
    // Check for time blocks
    const { data: blocks } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('block_date', formData.appointment_date);

    const selectedService = services.find(s => s.id === formData.service_id);
    if (!selectedService) return false;

    const startTime = formData.start_time;
    const endTime = format(
      addMinutes(parse(startTime, 'HH:mm', new Date()), selectedService.duration),
      'HH:mm'
    );

    // Check if time is blocked
    if (blocks?.some(block => {
      const blockStart = block.start_time.substring(0, 5);
      const blockEnd = block.end_time.substring(0, 5);
      return (startTime < blockEnd && endTime > blockStart) || block.is_all_day;
    })) {
      toast.error('Este horário está bloqueado');
      return false;
    }

    // Check for existing appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('professional_id', professionalId)
      .eq('appointment_date', formData.appointment_date)
      .neq('status', 'canceled');

    if (appointments?.some(apt => {
      const aptStart = apt.start_time.substring(0, 5);
      const aptEnd = apt.end_time.substring(0, 5);
      return startTime < aptEnd && endTime > aptStart;
    })) {
      toast.error('Este horário já está ocupado');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId) return;

    const selectedService = services.find(s => s.id === formData.service_id);
    if (!selectedService) {
      toast.error('Selecione um serviço');
      return;
    }

    setLoading(true);

    // Validate time slot
    const isValid = await validateTimeSlot();
    if (!isValid) {
      setLoading(false);
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
          professional_id: professionalId,
          name: formData.client_name,
          email: formData.client_email || null,
          phone: formData.client_phone || null,
        })
        .select()
        .single();

      if (clientError) {
        toast.error('Erro ao criar cliente');
        setLoading(false);
        return;
      }
      clientId = newClient.id;
    }

    const selectedClient = clients.find(c => c.id === clientId);

    const { error } = await supabase.from('appointments').insert({
      professional_id: professionalId,
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

    setLoading(false);

    if (error) {
      toast.error('Erro ao criar agendamento');
      console.error(error);
    } else {
      toast.success('Agendamento criado com sucesso!');
      setIsOpen(false);
      setFormData({
        client_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        service_id: '',
        appointment_date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        notes: '',
      });
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        )}
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
                  const client = clients.find(c => c.id === value);
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
                {clients.map(client => (
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
                  onChange={e => setFormData({ ...formData, client_name: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="client_phone">Telefone</Label>
                  <Input
                    id="client_phone"
                    value={formData.client_phone}
                    onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Serviço *</Label>
            <Select
              value={formData.service_id}
              onValueChange={value => setFormData({ ...formData, service_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Nenhum serviço cadastrado
                  </div>
                ) : (
                  services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                    </SelectItem>
                  ))
                )}
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
                onChange={e => setFormData({ ...formData, appointment_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Agendamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
