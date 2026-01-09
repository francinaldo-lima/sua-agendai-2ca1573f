import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8"
          >
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6"
          >
            Pronto para transformar seus agendamentos?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-10"
          >
            Junte-se a milhares de profissionais que já economizam tempo e 
            encantam clientes com o AgendAI. Configure em minutos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/cadastro">
              <Button
                size="xl"
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="ghost"
                size="xl"
                className="text-primary-foreground hover:bg-white/10 border-2 border-primary-foreground/30 hover:border-primary-foreground/50"
              >
                Já tenho conta
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-sm text-primary-foreground/60 mt-6"
          >
            Sem cartão de crédito • Configuração em 5 minutos • Suporte em português
          </motion.p>
        </div>
      </div>
    </section>
  );
};
