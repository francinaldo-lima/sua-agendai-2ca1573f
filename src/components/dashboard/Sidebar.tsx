import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Settings,
  BarChart3,
  Clock,
  Briefcase,
  LogOut,
  Home,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
  { icon: Briefcase, label: 'Serviços', href: '/dashboard/servicos' },
  { icon: Users, label: 'Clientes', href: '/dashboard/clientes' },
  { icon: Clock, label: 'Horários', href: '/dashboard/horarios' },
  { icon: BarChart3, label: 'Relatórios', href: '/dashboard/relatorios' },
  { icon: CreditCard, label: 'Assinatura', href: '/dashboard/assinatura' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/configuracoes' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AgendAI</span>
          </Link>
        </div>

        {/* User info */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-foreground">
                {profile?.full_name || 'Usuário'}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                Plano {profile?.subscription_plan === 'free' ? 'Gratuito' : profile?.subscription_plan === 'pro' ? 'Pro' : 'Premium'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-primary-foreground rounded-r-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
};
