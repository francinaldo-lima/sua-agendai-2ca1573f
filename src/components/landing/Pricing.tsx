import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    description: "Para quem está começando",
    price: "0",
    period: "para sempre",
    features: [
      "1 profissional",
      "50 agendamentos/mês",
      "Página de agendamento",
      "Confirmação por e-mail",
      "Calendário básico",
      "Suporte por e-mail",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Pro",
    description: "Para profissionais e pequenas empresas",
    price: "97",
    period: "/mês",
    features: [
      "Até 5 profissionais",
      "Agendamentos ilimitados",
      "Lembretes por SMS",
      "Relatórios avançados",
      "Integração calendário",
      "Personalização de marca",
      "Suporte prioritário",
      "API de integração",
    ],
    cta: "Teste 14 dias grátis",
    popular: true,
  },
  {
    name: "Premium",
    description: "Para empresas em crescimento",
    price: "247",
    period: "/mês",
    features: [
      "Profissionais ilimitados",
      "Múltiplas unidades",
      "Pagamentos online",
      "Automações avançadas",
      "White-label completo",
      "Dashboard executivo",
      "Gerente de sucesso dedicado",
      "SLA garantido",
      "Treinamento personalizado",
    ],
    cta: "Falar com Vendas",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary text-sm font-medium mb-4"
          >
            Preços
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Planos para todos os{" "}
            <span className="text-gradient">tamanhos de negócio</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Comece grátis e faça upgrade conforme seu negócio cresce.
            Sem surpresas, sem taxas ocultas.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl ${
                plan.popular
                  ? "bg-gradient-primary text-primary-foreground shadow-primary scale-105"
                  : "bg-card border border-border shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card text-primary text-sm font-semibold shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    plan.popular ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className={`text-sm ${
                      plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    R$
                  </span>
                  <span
                    className={`text-5xl font-bold ${
                      plan.popular ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular
                          ? "bg-primary-foreground/20"
                          : "bg-primary-50"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.popular ? "text-primary-foreground" : "text-primary"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm ${
                        plan.popular ? "text-primary-foreground/90" : "text-foreground"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to="/cadastro">
                <Button
                  variant={plan.popular ? "hero-outline" : "default"}
                  className={`w-full ${
                    plan.popular
                      ? "border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                      : ""
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-8 mt-16 text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm">Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm">Cancele a qualquer momento</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm">Suporte em português</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
