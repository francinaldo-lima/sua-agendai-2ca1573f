import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Bell,
  BarChart3,
  Globe,
  Shield,
  Clock,
  Smartphone,
  Zap,
  CreditCard,
  Settings,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Calendário interativo com visualização diária, semanal e mensal. Bloqueio automático de horários.",
  },
  {
    icon: Users,
    title: "Gestão de Equipe",
    description: "Múltiplos profissionais com agendas individuais e compartilhadas. Perfeito para clínicas e salões.",
  },
  {
    icon: Bell,
    title: "Lembretes Automáticos",
    description: "Notificações por e-mail e SMS para reduzir faltas em até 80%. Templates personalizáveis.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Dashboards com métricas de agendamentos, receita, taxa de cancelamento e muito mais.",
  },
  {
    icon: Globe,
    title: "Página de Agendamento",
    description: "Link público personalizado para seus clientes agendarem 24/7. Integração com seu site.",
  },
  {
    icon: Shield,
    title: "Segurança LGPD",
    description: "Dados protegidos com criptografia. Conformidade total com a Lei Geral de Proteção de Dados.",
  },
  {
    icon: Clock,
    title: "Fuso Horário Automático",
    description: "Detecção automática de timezone para clientes de qualquer lugar do mundo.",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description: "Funciona perfeitamente em desktop, tablet e smartphone. Gerencie de qualquer lugar.",
  },
  {
    icon: Zap,
    title: "Automações",
    description: "Fluxos automáticos de confirmação, follow-up e reagendamento. Economize tempo.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos Online",
    description: "Aceite pagamentos antecipados ou depósitos. Integração com principais gateways.",
  },
  {
    icon: Settings,
    title: "Personalização Total",
    description: "Adapte cores, logo e mensagens à identidade da sua marca. Experiência white-label.",
  },
  {
    icon: MessageSquare,
    title: "Lista de Espera",
    description: "Capture interessados quando não há horários disponíveis. Maximize sua ocupação.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary text-sm font-medium mb-4"
          >
            Recursos
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Tudo que você precisa para{" "}
            <span className="text-gradient">crescer seu negócio</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Ferramentas poderosas e intuitivas para automatizar agendamentos 
            e oferecer uma experiência excepcional aos seus clientes.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
