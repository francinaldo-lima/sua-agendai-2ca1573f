import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, Calendar, Users, Clock, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary-700">
              Plataforma #1 de Agendamentos no Brasil
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            Simplifique seus agendamentos com{" "}
            <span className="text-gradient">inteligência</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            O AgendAI transforma a gestão de horários do seu negócio. 
            Automatize agendamentos, reduza faltas e encante seus clientes 
            com uma experiência premium.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/cadastro">
              <Button variant="hero" size="xl">
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="hero-outline" size="xl">
              <Play className="w-5 h-5" />
              Ver Demonstração
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: "50k+", label: "Agendamentos/mês", icon: Calendar },
              { value: "5k+", label: "Empresas Ativas", icon: Users },
              { value: "98%", label: "Satisfação", icon: Clock },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
            <div className="bg-card p-2">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
                    app.agendai.com.br
                  </div>
                </div>
              </div>
              {/* Dashboard Preview */}
              <div className="aspect-[16/9] bg-gradient-to-br from-primary-50 to-background p-8">
                <div className="grid grid-cols-4 gap-4 h-full">
                  {/* Sidebar */}
                  <div className="bg-card rounded-xl p-4 shadow-card">
                    <div className="w-20 h-3 bg-primary/20 rounded mb-6" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-8 rounded-lg ${i === 1 ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Main Content */}
                  <div className="col-span-3 space-y-4">
                    <div className="bg-card rounded-xl p-6 shadow-card">
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-32 h-4 bg-foreground/10 rounded" />
                        <div className="w-24 h-8 bg-primary rounded-lg" />
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-muted rounded-lg p-4">
                            <div className="w-8 h-8 bg-primary/20 rounded-lg mb-2" />
                            <div className="w-12 h-3 bg-foreground/10 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card rounded-xl p-4 shadow-card">
                        <div className="w-20 h-3 bg-foreground/10 rounded mb-4" />
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 35 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-6 rounded ${
                                i === 15 || i === 22 ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="bg-card rounded-xl p-4 shadow-card">
                        <div className="w-20 h-3 bg-foreground/10 rounded mb-4" />
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/20 rounded-full" />
                              <div className="flex-1">
                                <div className="w-20 h-2 bg-foreground/10 rounded mb-1" />
                                <div className="w-12 h-2 bg-muted rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -left-4 top-1/4 bg-card rounded-xl p-4 shadow-xl border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Agendamento confirmado!</p>
                <p className="text-xs text-muted-foreground">Há 2 minutos</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute -right-4 bottom-1/4 bg-card rounded-xl p-4 shadow-xl border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">+23 agendamentos</p>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
