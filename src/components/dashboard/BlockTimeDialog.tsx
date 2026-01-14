import { useState } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockTimeDialogProps {
  professionalId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  defaultDate?: string;
}

export const BlockTimeDialog = ({
  professionalId,
  onSuccess,
  trigger,
  defaultDate,
}: BlockTimeDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    block_date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '10:00',
    reason: '',
    is_all_day: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId) return;

    if (!formData.is_all_day && formData.start_time >= formData.end_time) {
      toast.error('O horário final deve ser maior que o inicial');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('time_blocks').insert({
      professional_id: professionalId,
      block_date: formData.block_date,
      start_time: formData.is_all_day ? '00:00:00' : `${formData.start_time}:00`,
      end_time: formData.is_all_day ? '23:59:59' : `${formData.end_time}:00`,
      reason: formData.reason || null,
      is_all_day: formData.is_all_day,
    });

    setLoading(false);

    if (error) {
      toast.error('Erro ao bloquear horário');
      console.error(error);
    } else {
      toast.success('Horário bloqueado com sucesso!');
      setIsOpen(false);
      setFormData({
        block_date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '10:00',
        reason: '',
        is_all_day: false,
      });
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Bloquear Horário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear Horário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="block_date">Data</Label>
            <Input
              id="block_date"
              type="date"
              value={formData.block_date}
              onChange={e => setFormData({ ...formData, block_date: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_all_day">Dia inteiro</Label>
            <Switch
              id="is_all_day"
              checked={formData.is_all_day}
              onCheckedChange={checked => setFormData({ ...formData, is_all_day: checked })}
            />
          </div>

          {!formData.is_all_day && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Início</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">Fim</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ex: Feriado, reunião, folga..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Bloqueando...' : 'Bloquear Horário'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
