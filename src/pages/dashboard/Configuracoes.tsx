import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Bell, Globe, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Settings {
  cancellation_policy: string;
  min_advance_hours: number;
  max_advance_days: number;
  public_page_title: string;
  public_page_description: string;
  public_page_theme: string;
  notification_email: boolean;
  notification_sms: boolean;
}

const Configuracoes = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
  });

  const [settings, setSettings] = useState<Settings>({
    cancellation_policy: '',
    min_advance_hours: 2,
    max_advance_days: 30,
    public_page_title: '',
    public_page_description: '',
    public_page_theme: 'default',
    notification_email: true,
    notification_sms: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !profile) return;

      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        company_name: profile.company_name || '',
      });

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData) {
        setSettings({
          cancellation_policy: settingsData.cancellation_policy || '',
          min_advance_hours: settingsData.min_advance_hours,
          max_advance_days: settingsData.max_advance_days,
          public_page_title: settingsData.public_page_title || '',
          public_page_description: settingsData.public_page_description || '',
          public_page_theme: settingsData.public_page_theme || 'default',
          notification_email: settingsData.notification_email,
          notification_sms: settingsData.notification_sms,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [user?.id, profile]);

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        company_name: profileData.company_name,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao salvar perfil');
    } else {
      toast.success('Perfil atualizado!');
      refreshProfile();
    }
    setSaving(false);
  };

  const saveSettings = async () => {
    if (!user?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        ...settings,
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Erro ao salvar configurações');
    } else {
      toast.success('Configurações salvas!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">
          Carregando...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-foreground"
        >
          Configurações
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1"
        >
          Personalize sua conta e preferências
        </motion.p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Agendamento</span>
          </TabsTrigger>
          <TabsTrigger value="public" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Página Pública</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold text-foreground mb-6">Informações do Perfil</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="company_name">Nome da Empresa</Label>
                <Input
                  id="company_name"
                  value={profileData.company_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, company_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Perfil
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="scheduling">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold text-foreground mb-6">Regras de Agendamento</h3>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="min_advance">Antecedência Mínima (horas)</Label>
                  <Input
                    id="min_advance"
                    type="number"
                    min="1"
                    value={settings.min_advance_hours}
                    onChange={(e) =>
                      setSettings({ ...settings, min_advance_hours: parseInt(e.target.value) || 2 })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tempo mínimo antes do horário para permitir agendamento
                  </p>
                </div>
                <div>
                  <Label htmlFor="max_advance">Antecedência Máxima (dias)</Label>
                  <Input
                    id="max_advance"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.max_advance_days}
                    onChange={(e) =>
                      setSettings({ ...settings, max_advance_days: parseInt(e.target.value) || 30 })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Quantos dias no futuro podem ser agendados
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="cancellation_policy">Política de Cancelamento</Label>
                <Textarea
                  id="cancellation_policy"
                  value={settings.cancellation_policy}
                  onChange={(e) =>
                    setSettings({ ...settings, cancellation_policy: e.target.value })
                  }
                  rows={4}
                  placeholder="Descreva sua política de cancelamento..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Public Page Tab */}
        <TabsContent value="public">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold text-foreground mb-6">Página Pública de Agendamento</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="public_title">Título da Página</Label>
                <Input
                  id="public_title"
                  value={settings.public_page_title}
                  onChange={(e) =>
                    setSettings({ ...settings, public_page_title: e.target.value })
                  }
                  placeholder="Agende seu horário"
                />
              </div>
              <div>
                <Label htmlFor="public_description">Descrição</Label>
                <Textarea
                  id="public_description"
                  value={settings.public_page_description}
                  onChange={(e) =>
                    setSettings({ ...settings, public_page_description: e.target.value })
                  }
                  rows={3}
                  placeholder="Escolha o melhor horário para você..."
                />
              </div>
              <div>
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={settings.public_page_theme}
                  onValueChange={(value) =>
                    setSettings({ ...settings, public_page_theme: value })
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="minimal">Minimalista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profile?.id && (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-2">Link da sua página pública:</p>
                  <code className="text-sm text-primary break-all">
                    {window.location.origin}/agendar/{profile.id}
                  </code>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold text-foreground mb-6">Preferências de Notificação</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Notificações por Email</p>
                  <p className="text-sm text-muted-foreground">
                    Receba emails sobre novos agendamentos e cancelamentos
                  </p>
                </div>
                <Switch
                  checked={settings.notification_email}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notification_email: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Notificações por SMS</p>
                  <p className="text-sm text-muted-foreground">
                    Receba SMS sobre novos agendamentos (em breve)
                  </p>
                </div>
                <Switch
                  checked={settings.notification_sms}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notification_sms: checked })
                  }
                  disabled
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Configuracoes;
