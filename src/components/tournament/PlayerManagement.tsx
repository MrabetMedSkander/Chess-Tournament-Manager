import { useState } from 'react';
import { useTournamentStore } from '@/store/tournamentStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, User, Search, Upload, Download } from 'lucide-react';


interface PlayerManagementProps {
  tournamentId: string;
}

export function PlayerManagement({ tournamentId }: PlayerManagementProps) {
  const { tournaments, addPlayer, removePlayer } = useTournamentStore();
  const tournament = tournaments.find((t) => t.id === tournamentId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    lastName: '',
    rating: '',
    federation: '',
    title: '',
    club: '',
  });

  if (!tournament) return null;

  const handleAddPlayer = () => {
    if (!newPlayer.firstName || !newPlayer.lastName) return;

    addPlayer(tournamentId, {
      firstName: newPlayer.firstName,
      lastName: newPlayer.lastName,
      rating: newPlayer.rating ? parseInt(newPlayer.rating) : undefined,
      federation: newPlayer.federation || undefined,
      title: newPlayer.title || undefined,
      club: newPlayer.club || undefined,
    });

    setNewPlayer({
      firstName: '',
      lastName: '',
      rating: '',
      federation: '',
      title: '',
      club: '',
    });
    setIsDialogOpen(false);
  };

  const handleImportPlayers = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          lines.forEach((line, index) => {
            if (index === 0 || !line.trim()) return; // Skip header
            const [firstName, lastName, rating, federation, title, club] = line.split(',');
            if (firstName && lastName) {
              addPlayer(tournamentId, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                rating: rating ? parseInt(rating.trim()) : undefined,
                federation: federation?.trim(),
                title: title?.trim(),
                club: club?.trim(),
              });
            }
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportPlayers = () => {
    let csv = 'Prénom,Nom,Elo,Fédération,Titre,Club\n';
    tournament.players.forEach((player) => {
      csv += `${player.firstName},${player.lastName},${player.rating || ''},${player.federation || ''},${player.title || ''},${player.club || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.name}_joueurs.csv`;
    a.click();
  };

  const filteredPlayers = tournament.players.filter(
    (player) =>
      player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.rating?.toString() || '').includes(searchQuery)
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Joueurs ({tournament.players.length})</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleImportPlayers}>
              <Upload className="h-4 w-4 mr-2" />
              Importer CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPlayers}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un joueur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={newPlayer.firstName}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={newPlayer.lastName}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Elo</Label>
                      <Input
                        id="rating"
                        type="number"
                        placeholder="Ex: 1800"
                        value={newPlayer.rating}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, rating: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="federation">Fédération</Label>
                      <Input
                        id="federation"
                        placeholder="Ex: FRA"
                        value={newPlayer.federation}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, federation: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        placeholder="Ex: FM, IM, GM"
                        value={newPlayer.title}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="club">Club</Label>
                      <Input
                        id="club"
                        placeholder="Ex: Clichy Échecs"
                        value={newPlayer.club}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, club: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddPlayer}
                    className="w-full"
                    disabled={!newPlayer.firstName || !newPlayer.lastName}
                  >
                    Ajouter le joueur
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un joueur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {sortedPlayers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery
              ? 'Aucun joueur trouvé'
              : 'Aucun joueur inscrit. Ajoutez des joueurs pour commencer.'}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Elo</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {player.lastName.toUpperCase()}, {player.firstName}
                    </TableCell>
                    <TableCell>{player.rating || '-'}</TableCell>
                    <TableCell>{player.title || '-'}</TableCell>
                    <TableCell>{player.club || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(tournamentId, player.id)}
                        disabled={tournament.roundsData.length > 0}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
