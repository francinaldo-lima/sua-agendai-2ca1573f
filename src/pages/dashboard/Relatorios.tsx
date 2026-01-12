import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportData {
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  totalRevenue: number;
  uniqueClients: number;
  topServices: { name: string; count: number }[];
  dailyRevenue: { name: string; value: number }[];
}

const Relatorios = () => {
  const { profile } = useAuth();
  const [period, setPeriod] = useState('current');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData>({
    totalAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    totalRevenue: 0,
    uniqueClients: 0,
    topServices: [],
    dailyRevenue: [],
  });

  const getPeriodDates = () => {
    const now = new Date();
    if (period === 'current') {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    } else if (period === 'last') {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    } else {
      return { start: subMonths(now, 3), end: now };
    }
  };

  const fetchReportData = async () => {
    if (!profile?.id) return;

    setLoading(true);
    const { start, end } = getPeriodDates();

    // Fetch appointments with services
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services:service_id (name, price),
        clients:client_id (id, name)
      `)
      .eq('professional_id', profile.id)
      .gte('appointment_date', format(start, 'yyyy-MM-dd'))
      .lte('appointment_date', format(end, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
      return;
    }

    // Calculate stats
    const totalAppointments = appointments?.length || 0;
    const completedAppointments = appointments?.filter((a) => a.status === 'completed').length || 0;
    const canceledAppointments = appointments?.filter((a) => a.status === 'canceled').length || 0;

    // Calculate revenue from completed appointments
    const totalRevenue = appointments
      ?.filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + (a.services?.price || 0), 0) || 0;

    // Unique clients
    const uniqueClientIds = new Set(appointments?.map((a) => a.client_id).filter(Boolean));
    const uniqueClients = uniqueClientIds.size;

    // Top services
    const serviceCount: Record<string, number> = {};
    appointments?.forEach((a) => {
      const serviceName = a.services?.name || 'Outro';
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
    });
    const topServices = Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily revenue (simplified - last 7 days)
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dailyRevenue = days.map((name) => ({
      name,
      value: Math.floor(Math.random() * 500) + 100, // Mock for now
    }));

    setData({
      totalAppointments,
      completedAppointments,
      canceledAppointments,
      totalRevenue,
      uniqueClients,
      topServices,
      dailyRevenue,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchReportData();
  }, [profile?.id, period]);

  const { start, end } = getPeriodDates();
  const periodLabel = `${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(end, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Relatórios
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            {periodLabel}
          </motion.p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Este mês</SelectItem>
            <SelectItem value="last">Mês passado</SelectItem>
            <SelectItem value="quarter">Últimos 3 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando relatórios...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total de Agendamentos"
              value={data.totalAppointments}
              icon={Calendar}
              delay={0}
            />
            <StatsCard
              title="Agendamentos Concluídos"
              value={data.completedAppointments}
              change={`${data.canceledAppointments} cancelados`}
              changeType="neutral"
              icon={TrendingUp}
              delay={0.1}
            />
            <StatsCard
              title="Receita Total"
              value={`R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              delay={0.2}
            />
            <StatsCard
              title="Clientes Atendidos"
              value={data.uniqueClients}
              icon={Users}
              delay={0.3}
            />
          </div>

          {/* Charts and details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart data={data.dailyRevenue} />
            </div>

            {/* Top Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Serviços Mais Procurados</h3>
              </div>

              {data.topServices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sem dados para o período selecionado
                </p>
              ) : (
                <div className="space-y-4">
                  {data.topServices.map((service, index) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground">{service.name}</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {service.count} agendamentos
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Completion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <h3 className="font-semibold text-foreground mb-4">Taxa de Conclusão</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${data.totalAppointments > 0 ? (data.completedAppointments / data.totalAppointments) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="font-medium text-foreground">
                {data.totalAppointments > 0
                  ? Math.round((data.completedAppointments / data.totalAppointments) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{data.completedAppointments} concluídos</span>
              <span>{data.canceledAppointments} cancelados</span>
            </div>
          </motion.div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Relatorios;
