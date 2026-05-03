import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const Horarios = () => {
  const { profile } = useAuth();
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkingHours = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('professional_id', profile.id)
      .order('day_of_week')
      .order('start_time');

    if (error) {
      toast.error('Erro ao carregar horários');
      console.error(error);
    } else {
      setWorkingHours(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkingHours();
  }, [profile?.id]);

  const addWorkingHour = async (dayOfWeek: number) => {
    if (!profile?.id) return;

    const { error } = await supabase.from('working_hours').insert({
      professional_id: profile.id,
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '18:00',
      is_active: true,
    });

    if (error) {
      toast.error('Erro ao adicionar horário');
    } else {
      toast.success('Horário adicionado!');
      fetchWorkingHours();
    }
  };

  const updateWorkingHour = async (id: string, field: string, value: string | boolean) => {
    const { error } = await supabase
      .from('working_hours')
      .update({ [field]: value } as any)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar horário');
    } else {
      fetchWorkingHours();
    }
  };

  const deleteWorkingHour = async (id: string) => {
    const { error } = await supabase.from('working_hours').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir horário');
    } else {
      toast.success('Horário excluído!');
      fetchWorkingHours();
    }
  };

  const getHoursForDay = (dayOfWeek: number) => {
    return workingHours.filter((wh) => wh.day_of_week === dayOfWeek);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 lg:mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-foreground"
        >
          Horários de Atendimento
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1 text-sm sm:text-base"
        >
          Configure seus horários disponíveis para agendamento
        </motion.p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando...
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {DAYS_OF_WEEK.map((day, index) => {
            const hours = getHoursForDay(day.value);
            const hasHours = hours.length > 0;

            return (
              <motion.div
                key={day.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        hasHours && hours.some((h) => h.is_active)
                          ? 'bg-green-500'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">{day.label}</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs sm:text-sm"
                    onClick={() => addWorkingHour(day.value)}
                  >
                    <Plus className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </Button>
                </div>

                {!hasHours ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sem horários configurados
                  </p>
                ) : (
                  <div className="space-y-3">
                    {hours.map((wh) => (
                      <div
                        key={wh.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={wh.start_time.slice(0, 5)}
                              onChange={(e) =>
                                updateWorkingHour(wh.id, 'start_time', e.target.value)
                              }
                              className="w-24 sm:w-28 h-9"
                            />
                            <span className="text-muted-foreground text-sm">até</span>
                            <Input
                              type="time"
                              value={wh.end_time.slice(0, 5)}
                              onChange={(e) =>
                                updateWorkingHour(wh.id, 'end_time', e.target.value)
                              }
                              className="w-24 sm:w-28 h-9"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${wh.id}`} className="text-sm">
                              Ativo
                            </Label>
                            <Switch
                              id={`active-${wh.id}`}
                              checked={wh.is_active}
                              onCheckedChange={(checked) =>
                                updateWorkingHour(wh.id, 'is_active', checked)
                              }
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteWorkingHour(wh.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick Setup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 lg:mt-8 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm"
      >
        <h3 className="font-semibold text-foreground mb-3 sm:mb-4">Configuração Rápida</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure horários padrão para todos os dias úteis de uma vez.
        </p>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={async () => {
            if (!profile?.id) return;
            
            // Delete existing hours
            await supabase
              .from('working_hours')
              .delete()
              .eq('professional_id', profile.id);

            // Add default hours for weekdays (Mon-Fri)
            const defaultHours = [1, 2, 3, 4, 5].map((day) => ({
              professional_id: profile.id,
              day_of_week: day,
              start_time: '09:00',
              end_time: '18:00',
              is_active: true,
            }));

            const { error } = await supabase.from('working_hours').insert(defaultHours);

            if (error) {
              toast.error('Erro ao configurar horários');
            } else {
              toast.success('Horários configurados: Seg-Sex, 09:00-18:00');
              fetchWorkingHours();
            }
          }}
        >
          Aplicar horário comercial (Seg-Sex, 09:00-18:00)
        </Button>
      </motion.div>
    </DashboardLayout>
  );
};

export default Horarios;
