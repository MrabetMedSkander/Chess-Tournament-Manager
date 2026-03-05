import { useState } from 'react';
import { useTournamentStore } from '@/store/tournamentStore';
import { TournamentList, CreateTournament, TournamentView } from '@/components/tournament';
import { Button } from '@/components/ui/button';
import { Trophy, Users, BarChart3, Shield } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

type View = 'list' | 'create' | 'tournament';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const { tournaments } = useTournamentStore();

  const handleCreateTournament = () => {
    setCurrentView('create');
  };

  const handleTournamentCreated = (id: string) => {
    setSelectedTournamentId(id);
    setCurrentView('tournament');
  };

  const handleSelectTournament = (id: string) => {
    setSelectedTournamentId(id);
    setCurrentView('tournament');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTournamentId(null);
  };

  const handleCancelCreate = () => {
    setCurrentView('list');
  };

  // Page d'accueil si aucun tournoi
  if (currentView === 'list' && tournaments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Chess Tournament Manager</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Organisez vos tournois d'échecs facilement
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Créez, gérez et suivez vos tournois avec un système d'appariement Suisse,
                calcul automatique des scores et départages.
              </p>
              <Button size="lg" onClick={handleCreateTournament}>
                <Trophy className="mr-2 h-5 w-5" />
                Créer mon premier tournoi
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestion des joueurs</h3>
                <p className="text-muted-foreground">
                  Ajoutez facilement vos joueurs avec leurs informations (Elo, titre, club).
                  Importez/Exportez en CSV.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Appariements automatiques</h3>
                <p className="text-muted-foreground">
                  Générez les appariements selon le système Suisse. Alternance des couleurs
                  et évitement des doublons.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Classement en direct</h3>
                <p className="text-muted-foreground">
                  Suivez le classement en temps réel avec calcul des départages
                  (Buchholz, Sonneborn-Berger).
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                Fonctionnalités : Système Suisse • Départages • Export CSV • Gestion des rondes
              </p>
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleBackToList}
          >
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Chess Tournament Manager</h1>
          </div>
          {currentView === 'list' && (
            <Button onClick={handleCreateTournament}>
              <Trophy className="mr-2 h-4 w-4" />
              Nouveau tournoi
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'list' && (
          <TournamentList
            onCreateTournament={handleCreateTournament}
            onSelectTournament={handleSelectTournament}
          />
        )}
        {currentView === 'create' && (
          <CreateTournament
            onCancel={handleCancelCreate}
            onSuccess={handleTournamentCreated}
          />
        )}
        {currentView === 'tournament' && selectedTournamentId && (
          <TournamentView
            tournamentId={selectedTournamentId}
            onBack={handleBackToList}
          />
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
