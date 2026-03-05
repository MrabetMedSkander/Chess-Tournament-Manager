import { useState } from 'react';
import { useTournamentStore } from '@/store/tournamentStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Trophy } from 'lucide-react';
import type { TournamentType } from '@/types';

interface CreateTournamentProps {
  onCancel: () => void;
  onSuccess: (id: string) => void;
}

const tournamentTypes: { value: TournamentType; label: string }[] = [
  { value: 'swiss', label: 'Système Suisse' },
  { value: 'round-robin', label: 'Toutes rondes (Round-Robin)' },
  { value: 'knockout', label: 'Élimination directe' },
];

export function CreateTournament({ onCancel, onSuccess }: CreateTournamentProps) {
  const { createTournament } = useTournamentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: 'France',
    startDate: '',
    endDate: '',
    type: 'swiss' as TournamentType,
    rounds: '7',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const id = createTournament({
      name: formData.name,
      city: formData.city,
      country: formData.country,
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type,
      rounds: parseInt(formData.rounds),
    });

    setIsSubmitting(false);
    onSuccess(id);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onCancel} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary" />
            <CardTitle>Nouveau tournoi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du tournoi *</Label>
              <Input
                id="name"
                placeholder="Ex: Open International de Paris"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  placeholder="Ex: Paris"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays *</Label>
                <Input
                  id="country"
                  placeholder="Ex: France"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  min={today}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de tournoi *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: TournamentType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rounds">Nombre de rondes *</Label>
                <Input
                  id="rounds"
                  type="number"
                  min={1}
                  max={20}
                  value={formData.rounds}
                  onChange={(e) => setFormData({ ...formData, rounds: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer le tournoi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
