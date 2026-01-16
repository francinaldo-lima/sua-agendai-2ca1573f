import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Bell, Globe, Shield, Building, Upload } from 'lucide-react';
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

interface BusinessProfile {
  logo_url: string;
  business_name: string;
  description: string;
  address: string;
  google_maps_link: string;
  phone: string;
  instagram_link: string;
  website: string;
  opening_hours: Record<string, string>;
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

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    logo_url: '',
    business_name: '',
    description: '',
    address: '',
    google_maps_link: '',
    phone: '',
    instagram_link: '',
    website: '',
    opening_hours: {},
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

      // Fetch business profile
      const { data: businessData } = await supabase
        .from('business_profile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (businessData) {
        setBusinessProfile({
          logo_url: businessData.logo_url || '',
          business_name: businessData.business_name || '',
          description: businessData.description || '',
          address: businessData.address || '',
          google_maps_link: businessData.google_maps_link || '',
          phone: businessData.phone || '',
          instagram_link: businessData.instagram_link || '',
          website: businessData.website || '',
          opening_hours: (businessData.opening_hours as Record<string, string>) || {},
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

  const saveBusinessProfile = async () => {
    if (!user?.id || !profile?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from('business_profile')
      .upsert({
        user_id: user.id,
        professional_id: profile.id,
        ...businessProfile,
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Erro ao salvar perfil do negócio');
      console.error(error);
    } else {
      toast.success('Perfil do negócio salvo!');
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
      <div className="mb-6 lg:mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-foreground"
        >
          Configurações
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1 text-sm sm:text-base"
        >
          Personalize sua conta e preferências
        </motion.p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger value="profile" className="gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Negócio</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Agenda</span>
          </TabsTrigger>
          <TabsTrigger value="public" className="gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Página</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
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
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company_name">Nome da Empresa</Label>
                <Input
                  id="company_name"
                  value={profileData.company_name}
                  onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
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

        {/* Business Profile Tab */}
        <TabsContent value="business">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold text-foreground mb-6">Perfil do Negócio</h3>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="business_name">Nome do Negócio</Label>
                  <Input
                    id="business_name"
                    value={businessProfile.business_name}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, business_name: e.target.value })}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <Input
                    id="logo_url"
                    value={businessProfile.logo_url}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={businessProfile.description}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                  placeholder="Descreva seu negócio..."
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={businessProfile.address}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                    placeholder="Rua, número, cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="b_phone">Telefone</Label>
                  <Input
                    id="b_phone"
                    value={businessProfile.phone}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={businessProfile.instagram_link}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, instagram_link: e.target.value })}
                    placeholder="@seu_perfil"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={businessProfile.website}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, website: e.target.value })}
                    placeholder="www.seusite.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="google_maps">Link do Google Maps (embed)</Label>
                <Input
                  id="google_maps"
                  value={businessProfile.google_maps_link}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, google_maps_link: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole o link de incorporação do Google Maps
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveBusinessProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Perfil do Negócio
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
                    onChange={(e) => setSettings({ ...settings, min_advance_hours: parseInt(e.target.value) || 2 })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_advance">Antecedência Máxima (dias)</Label>
                  <Input
                    id="max_advance"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.max_advance_days}
                    onChange={(e) => setSettings({ ...settings, max_advance_days: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cancellation_policy">Política de Cancelamento</Label>
                <Textarea
                  id="cancellation_policy"
                  value={settings.cancellation_policy}
                  onChange={(e) => setSettings({ ...settings, cancellation_policy: e.target.value })}
                  rows={4}
                  placeholder="Descreva sua política de cancelamento..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
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
            <h3 className="font-semibold text-foreground mb-6">Página Pública</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="public_title">Título</Label>
                <Input
                  id="public_title"
                  value={settings.public_page_title}
                  onChange={(e) => setSettings({ ...settings, public_page_title: e.target.value })}
                  placeholder="Agende seu horário"
                />
              </div>
              <div>
                <Label htmlFor="public_description">Descrição</Label>
                <Textarea
                  id="public_description"
                  value={settings.public_page_description}
                  onChange={(e) => setSettings({ ...settings, public_page_description: e.target.value })}
                  rows={3}
                />
              </div>
              
              {/* Theme Color Selector */}
              <div>
                <Label>Tema de Cores</Label>
                <p className="text-sm text-muted-foreground mb-3">Escolha a cor principal da sua página pública</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { value: 'default', label: 'Azul', color: 'bg-blue-500' },
                    { value: 'black', label: 'Preto', color: 'bg-gray-900' },
                    { value: 'gold', label: 'Dourado', color: 'bg-amber-500' },
                    { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
                    { value: 'brown', label: 'Marrom', color: 'bg-amber-800' },
                    { value: 'red', label: 'Vermelho', color: 'bg-red-500' },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setSettings({ ...settings, public_page_theme: theme.value })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        settings.public_page_theme === theme.value
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${theme.color} shadow-md`} />
                      <span className="text-xs font-medium text-foreground">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {profile?.id && (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-2">Link da sua página:</p>
                  <code className="text-sm text-primary break-all">
                    {window.location.origin}/agendar/{profile.id}
                  </code>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
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
            <h3 className="font-semibold text-foreground mb-6">Notificações</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">Receba emails sobre agendamentos</p>
                </div>
                <Switch
                  checked={settings.notification_email}
                  onCheckedChange={(checked) => setSettings({ ...settings, notification_email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">SMS</p>
                  <p className="text-sm text-muted-foreground">Em breve</p>
                </div>
                <Switch checked={settings.notification_sms} disabled />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Configuracoes;
