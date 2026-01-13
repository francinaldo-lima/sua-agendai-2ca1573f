import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Building2, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  max_appointments: number;
  max_professionals: number;
  price: number;
  features: string[];
  stripe_price_id: string | null;
}

interface Subscription {
  id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  appointments_used: number;
  plan: Plan;
}

interface Profile {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
}

const PLAN_ICONS: Record<string, typeof Crown> = {
  Gratuito: Zap,
  Básico: Crown,
  Profissional: Crown,
  Empresarial: Building2,
};

const Assinatura = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    // Handle success/cancel from Stripe
    if (searchParams.get('success') === 'true') {
      toast.success('Assinatura realizada com sucesso! 🎉');
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado.');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('stripe_customer_id, stripe_subscription_id, subscription_status')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch all plans
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (plansData) {
        setPlans(plansData.map(p => ({
          ...p,
          features: Array.isArray(p.features) ? p.features.map(String) : []
        })));
      }

      // Fetch user subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plan_id (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subData && subData.plan) {
        setSubscription({
          ...subData,
          plan: {
            ...subData.plan,
            features: Array.isArray(subData.plan.features) 
              ? subData.plan.features.map(String) 
              : []
          }
        } as Subscription);
      }

      setLoading(false);
    };

    fetchData();
  }, [user?.id, searchParams]);

  const handleUpgrade = async (plan: Plan) => {
    if (!plan.stripe_price_id) {
      toast.error('Este plano não está disponível para assinatura.');
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: plan.stripe_price_id,
          planId: plan.id
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar sessão de checkout');
      }

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-portal-session', {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao abrir portal');
      }

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Erro ao abrir portal de gerenciamento. Tente novamente.');
    } finally {
      setOpeningPortal(false);
    }
  };

  const currentPlanId = subscription?.plan?.id;
  const hasActiveStripeSubscription = profile?.stripe_subscription_id && profile?.subscription_status === 'active';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-foreground"
        >
          Assinatura
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1"
        >
          Gerencie seu plano e veja seu uso
        </motion.p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Current Plan */}
          {subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-primary bg-primary/5 p-6 mb-8"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Plano Atual</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{subscription.plan.name}</h2>
                  <p className="text-muted-foreground mt-1">
                    Ativo desde {format(new Date(subscription.start_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground">
                    R$ {subscription.plan.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                  {hasActiveStripeSubscription && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleManageSubscription}
                      disabled={openingPortal}
                    >
                      {openingPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Gerenciar Assinatura
                    </Button>
                  )}
                </div>
              </div>

              {/* Usage */}
              <div className="mt-6 p-4 rounded-lg bg-background">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Agendamentos usados este mês</span>
                  <span className="text-sm font-medium">
                    {subscription.appointments_used} / {subscription.plan.max_appointments === 99999 ? '∞' : subscription.plan.max_appointments}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min((subscription.appointments_used / subscription.plan.max_appointments) * 100, 100)}%`,
                    }}
                  />
                </div>
                {subscription.appointments_used >= subscription.plan.max_appointments * 0.8 && (
                  <p className="mt-2 text-sm text-amber-600">
                    ⚠️ Você está próximo do limite. Considere fazer upgrade!
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Available Plans */}
          <h3 className="text-xl font-semibold text-foreground mb-4">Planos Disponíveis</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, index) => {
              const Icon = PLAN_ICONS[plan.name] || Crown;
              const isCurrent = plan.id === currentPlanId;
              const isPopular = plan.name === 'Profissional';
              const isProcessing = processingPlanId === plan.id;
              const isFree = plan.price === 0;
              const isDowngrade = subscription && plan.price < subscription.plan.price;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl border p-6 ${
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : isPopular
                      ? 'border-primary/50'
                      : 'border-border bg-card'
                  }`}
                >
                  {isPopular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Icon className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h4 className="font-semibold text-foreground">{plan.name}</h4>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">
                      {isFree ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                    </span>
                    {!isFree && <span className="text-muted-foreground">/mês</span>}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? 'secondary' : isPopular ? 'default' : 'outline'}
                    className="w-full"
                    disabled={isCurrent || isFree || isProcessing || isDowngrade}
                    onClick={() => handleUpgrade(plan)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : isCurrent ? (
                      'Plano Atual'
                    ) : isFree ? (
                      'Plano Gratuito'
                    ) : isDowngrade ? (
                      'Gerenciar Plano'
                    ) : (
                      'Fazer Upgrade'
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">Perguntas Frequentes</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground">Posso trocar de plano a qualquer momento?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Sim! Você pode fazer upgrade a qualquer momento. Para downgrade, acesse o portal de gerenciamento.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">O que acontece se eu atingir o limite de agendamentos?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Você receberá um aviso quando estiver próximo do limite. Ao atingir, novos agendamentos não poderão ser criados até o próximo mês ou upgrade do plano.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Como faço para cancelar?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em "Gerenciar Assinatura" para acessar o portal onde você pode cancelar ou alterar seu plano. Seu acesso permanece até o fim do período pago.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Assinatura;
