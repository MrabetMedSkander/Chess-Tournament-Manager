import { useState } from 'react';
import { useTournamentStore } from '@/store/tournamentStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Calendar, Users, MapPin, Trash2, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TournamentListProps {
  onCreateTournament: () => void;
  onSelectTournament: (id: string) => void;
}

const statusLabels = {
  draft: { label: 'Brouillon', variant: 'secondary' as const },
  ongoing: { label: 'En cours', variant: 'default' as const },
  finished: { label: 'Terminé', variant: 'outline' as const },
};

const typeLabels = {
  swiss: 'Suisse',
  'round-robin': 'Toutes rondes',
  knockout: 'Élimination directe',
};

export function TournamentList({ onCreateTournament, onSelectTournament }: TournamentListProps) {
  const { tournaments, deleteTournament } = useTournamentStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sortedTournaments = [...tournaments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteTournament(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Tournois</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos tournois d'échecs et suivez les classements
          </p>
        </div>
        <Button onClick={onCreateTournament} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau tournoi
        </Button>
      </div>

      {sortedTournaments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun tournoi</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Commencez par créer votre premier tournoi d'échecs
            </p>
            <Button onClick={onCreateTournament}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un tournoi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedTournaments.map((tournament) => (
            <Card
              key={tournament.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectTournament(tournament.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{tournament.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {tournament.city}, {tournament.country}
                    </p>
                  </div>
                  <Badge variant={statusLabels[tournament.status].variant}>
                    {statusLabels[tournament.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Dates
                    </span>
                    <span>
                      {new Date(tournament.startDate).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(tournament.endDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Joueurs
                    </span>
                    <span>{tournament.players.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span>{typeLabels[tournament.type]}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rondes</span>
                    <span>
                      {tournament.roundsData.length} / {tournament.rounds}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(tournament.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le tournoi ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Le tournoi "{tournament.name}" sera
                          définitivement supprimé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button variant="ghost" size="sm">
                    Gérer
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
