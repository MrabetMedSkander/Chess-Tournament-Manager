import { useState } from 'react';
import { useTournamentStore } from '@/store/tournamentStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, Users, Trophy, User, BarChart3 } from 'lucide-react';
import { PlayerManagement } from './PlayerManagement';
import { RoundManagement } from './RoundManagement';
import { Standings } from './Standings';

interface TournamentViewProps {
  tournamentId: string;
  onBack: () => void;
}

const statusLabels = {
  draft: { label: 'Brouillon', variant: 'secondary' as const },
  ongoing: { label: 'En cours', variant: 'default' as const },
  finished: { label: 'Terminé', variant: 'outline' as const },
};

const typeLabels = {
  swiss: 'Système Suisse',
  'round-robin': 'Toutes rondes',
  knockout: 'Élimination directe',
};

export function TournamentView({ tournamentId, onBack }: TournamentViewProps) {
  const { tournaments } = useTournamentStore();
  const tournament = tournaments.find((t) => t.id === tournamentId);
  const [activeTab, setActiveTab] = useState('players');

  if (!tournament) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tournoi non trouvé</p>
        <Button onClick={onBack} className="mt-4">
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux tournois
      </Button>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <Badge variant={statusLabels[tournament.status].variant}>
                {statusLabels[tournament.status].label}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {tournament.city}, {tournament.country}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(tournament.startDate).toLocaleDateString('fr-FR')} -{' '}
                {new Date(tournament.endDate).toLocaleDateString('fr-FR')}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {tournament.players.length} joueurs
              </span>
              <span className="flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                {typeLabels[tournament.type]}
              </span>
              <span>
                {tournament.roundsData.length} / {tournament.rounds} rondes
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="players" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Joueurs</span>
            <span className="sm:hidden">Joueurs</span>
          </TabsTrigger>
          <TabsTrigger value="rounds" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Rondes</span>
            <span className="sm:hidden">Rondes</span>
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Classement</span>
            <span className="sm:hidden">Classement</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-6">
          <PlayerManagement tournamentId={tournamentId} />
        </TabsContent>

        <TabsContent value="rounds" className="space-y-6">
          <RoundManagement tournamentId={tournamentId} />
        </TabsContent>

        <TabsContent value="standings" className="space-y-6">
          <Standings tournamentId={tournamentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
