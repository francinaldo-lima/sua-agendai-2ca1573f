import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { AppointmentsList } from '@/components/dashboard/AppointmentsList';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { NewAppointmentDialog } from '@/components/dashboard/NewAppointmentDialog';
import { NewServiceDialog } from '@/components/dashboard/NewServiceDialog';
import { BlockTimeDialog } from '@/components/dashboard/BlockTimeDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const mockRevenueData = [
  { name: 'Seg', value: 450 },
  { name: 'Ter', value: 380 },
  { name: 'Qua', value: 520 },
  { name: 'Qui', value: 610 },
  { name: 'Sex', value: 780 },
  { name: 'Sáb', value: 920 },
  { name: 'Dom', value: 0 },
];

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalClients: 0,
    monthRevenue: 0,
  });

  const fetchData = async () => {
    if (!profile?.id) return;

    // Fetch today's appointments
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(`
        *,
        services:service_id (name)
      `)
      .eq('professional_id', profile.id)
      .eq('appointment_date', today)
      .order('start_time');

    if (appointmentsData) {
      setAppointments(
        appointmentsData.map((a) => ({
          id: a.id,
          client_name: a.client_name,
          service_name: a.services?.name || 'Serviço',
          start_time: a.start_time?.slice(0, 5) || '',
          end_time: a.end_time?.slice(0, 5) || '',
          status: a.status,
        }))
      );
      setStats((prev) => ({ ...prev, todayAppointments: appointmentsData.length }));
    }

    // Fetch total clients
    const { count: clientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', profile.id);

    if (clientsCount !== null) {
      setStats((prev) => ({ ...prev, totalClients: clientsCount }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-foreground"
        >
          Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1"
        >
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </motion.p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Agendamentos Hoje"
          value={stats.todayAppointments}
          change="+12% vs ontem"
          changeType="positive"
          icon={Calendar}
          delay={0}
        />
        <StatsCard
          title="Clientes Ativos"
          value={stats.totalClients}
          change="+3 esta semana"
          changeType="positive"
          icon={Users}
          delay={0.1}
        />
        <StatsCard
          title="Receita do Mês"
          value={`R$ ${(stats.monthRevenue || 4850).toLocaleString('pt-BR')}`}
          change="+18% vs mês anterior"
          changeType="positive"
          icon={DollarSign}
          delay={0.2}
        />
        <StatsCard
          title="Taxa de Ocupação"
          value="78%"
          change="+5% esta semana"
          changeType="positive"
          icon={TrendingUp}
          delay={0.3}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and appointments */}
        <div className="lg:col-span-2 space-y-6">
          <AppointmentsList appointments={appointments} />
          <RevenueChart data={mockRevenueData} />
        </div>

        {/* Sidebar content */}
        <div className="space-y-6">
          <MiniCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            appointmentDates={appointments.map(() => new Date())}
          />

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              {profile?.id && (
                <>
                  <NewAppointmentDialog
                    professionalId={profile.id}
                    onSuccess={handleRefresh}
                    trigger={
                      <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                        + Novo Agendamento
                      </button>
                    }
                  />
                  <NewServiceDialog
                    professionalId={profile.id}
                    trigger={
                      <button className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                        + Novo Serviço
                      </button>
                    }
                  />
                  <BlockTimeDialog
                    professionalId={profile.id}
                    onSuccess={handleRefresh}
                    trigger={
                      <button className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                        Bloquear Horário
                      </button>
                    }
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
