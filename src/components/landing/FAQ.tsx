import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Posso testar o AgendAI gratuitamente?",
    answer:
      "Sim! Oferecemos um plano gratuito para sempre com recursos básicos. Além disso, os planos Pro e Premium têm 14 dias de teste grátis, sem necessidade de cartão de crédito.",
  },
  {
    question: "Meus clientes precisam criar conta para agendar?",
    answer:
      "Não! Seus clientes podem agendar diretamente pela sua página pública, sem precisar criar conta. Eles só precisam informar nome, e-mail e telefone.",
  },
  {
    question: "Posso personalizar a página de agendamento?",
    answer:
      "Sim! Você pode adicionar seu logo, escolher cores que combinam com sua marca, personalizar mensagens e muito mais. Nos planos premium, oferecemos white-label completo.",
  },
  {
    question: "O AgendAI funciona para múltiplos profissionais?",
    answer:
      "Sim! O plano Pro suporta até 5 profissionais e o Premium oferece profissionais ilimitados. Cada um pode ter sua própria agenda e disponibilidade.",
  },
  {
    question: "Vocês oferecem integração com outros sistemas?",
    answer:
      "Sim! Integramos com Google Calendar, Outlook, WhatsApp Business, além de oferecer API completa para integrações personalizadas nos planos Pro e Premium.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Absolutamente! Utilizamos criptografia de ponta a ponta, backups diários e estamos em conformidade total com a LGPD. Seus dados e os de seus clientes estão protegidos.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim! Não temos fidelidade. Você pode fazer upgrade, downgrade ou cancelar sua assinatura quando quiser, sem multas ou complicações.",
  },
  {
    question: "Vocês oferecem suporte em português?",
    answer:
      "Sim! Todo nosso suporte é em português, com equipe brasileira. Oferecemos atendimento por e-mail, chat e, nos planos premium, suporte prioritário com gerente dedicado.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary text-sm font-medium mb-4"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Perguntas{" "}
            <span className="text-gradient">Frequentes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Tire suas dúvidas sobre o AgendAI. Não encontrou o que procura?
            <br />
            Entre em contato com nosso suporte.
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 shadow-card data-[state=open]:shadow-card-hover transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
