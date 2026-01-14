import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewServiceDialogProps {
  professionalId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export const NewServiceDialog = ({
  professionalId,
  onSuccess,
  trigger,
}: NewServiceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId) return;

    if (!formData.name.trim()) {
      toast.error('Nome do serviço é obrigatório');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('services').insert({
      professional_id: professionalId,
      name: formData.name,
      description: formData.description || null,
      duration: formData.duration,
      price: formData.price,
      is_active: formData.is_active,
    });

    setLoading(false);

    if (error) {
      toast.error('Erro ao criar serviço');
      console.error(error);
    } else {
      toast.success('Serviço criado com sucesso!');
      setIsOpen(false);
      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        is_active: true,
      });
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Serviço</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Serviço *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Corte de cabelo"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o serviço..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                step="5"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Serviço ativo</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Serviço'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
