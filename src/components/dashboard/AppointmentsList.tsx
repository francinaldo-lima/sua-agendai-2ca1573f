import { motion } from 'framer-motion';
import { Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  client_name: string;
  service_name: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  title?: string;
}

const statusConfig = {
  scheduled: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Agendado' },
  confirmed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Confirmado' },
  completed: { icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Concluído' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelado' },
  no_show: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Não compareceu' },
};

export const AppointmentsList = ({ appointments, title = 'Agendamentos de Hoje' }: AppointmentsListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {appointments.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Nenhum agendamento para hoje</p>
          </div>
        ) : (
          appointments.map((appointment, index) => {
            const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.scheduled;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.client_name}</p>
                    <p className="text-sm text-muted-foreground">{appointment.service_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {appointment.start_time} - {appointment.end_time}
                    </p>
                    <div className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', status.bg, status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
