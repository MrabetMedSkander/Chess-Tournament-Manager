
import { useTournamentStore } from '@/store/tournamentStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Download, TrendingUp, Users, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StandingsProps {
  tournamentId: string;
}

export function Standings({ tournamentId }: StandingsProps) {
  const { tournaments, getStandings, exportTournament } = useTournamentStore();
  const tournament = tournaments.find((t) => t.id === tournamentId);


  if (!tournament) return null;

  const standings = getStandings(tournamentId);

  const handleExport = () => {
    const csv = exportTournament(tournamentId);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.name}_classement.csv`;
    a.click();
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle>Classement</CardTitle>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Départages
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Système de départages</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold">1. Points</p>
                    <p className="text-muted-foreground">
                      Total des points : 1 pour victoire, ½ pour nulle, 0 pour défaite
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">2. Buchholz (BHC)</p>
                    <p className="text-muted-foreground">
                      Somme des points de tous les adversaires rencontrés
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">3. Sonneborn-Berger (S-B)</p>
                    <p className="text-muted-foreground">
                      Points des adversaires battus + ½ des points des adversaires avec qui nul
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">4. Buchholz Cut 1</p>
                    <p className="text-muted-foreground">
                      Buchholz sans le pire score (meilleure performance contre les bons joueurs)
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">5. Cumulatif</p>
                    <p className="text-muted-foreground">
                      Somme des points cumulés après chaque ronde (performance précoce)
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">6. Victoires</p>
                    <p className="text-muted-foreground">Nombre total de victoires</p>
                  </div>
                  <div>
                    <p className="font-semibold">7. Victoires avec Noirs</p>
                    <p className="text-muted-foreground">
                      Nombre de victoires avec les pièces noires (plus difficile)
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {standings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun classement disponible. Les rondes doivent être jouées pour générer le classement.
          </div>
        ) : (
          <>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 text-center font-bold">Rang</TableHead>
                    <TableHead className="font-bold">Joueur</TableHead>
                    <TableHead className="text-center font-bold">Elo</TableHead>
                    <TableHead className="text-center font-bold bg-primary/10">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline decoration-dotted">Pts</TooltipTrigger>
                          <TooltipContent>
                            <p>Points totaux</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center font-bold bg-yellow-50 dark:bg-yellow-950">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline decoration-dotted">BHC</TooltipTrigger>
                          <TooltipContent>
                            <p>Buchholz - Somme des points adversaires</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center font-bold bg-blue-50 dark:bg-blue-950">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline decoration-dotted">S-B</TooltipTrigger>
                          <TooltipContent>
                            <p>Sonneborn-Berger</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center font-bold bg-green-50 dark:bg-green-950">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline decoration-dotted">BHC1</TooltipTrigger>
                          <TooltipContent>
                            <p>Buchholz Cut 1 (sans pire score)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center font-bold bg-purple-50 dark:bg-purple-950">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline decoration-dotted">Cum</TooltipTrigger>
                          <TooltipContent>
                            <p>Cumulatif</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center font-bold w-10">V</TableHead>
                    <TableHead className="text-center font-bold w-10">N</TableHead>
                    <TableHead className="text-center font-bold w-10">D</TableHead>
                    <TableHead className="text-center font-bold w-12">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline decoration-dotted">VN</TooltipTrigger>
                          <TooltipContent>
                            <p>Victoires avec Noirs</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((standing) => (
                    <TableRow
                      key={standing.player.id}
                      className={standing.rank <= 3 ? 'bg-muted/20' : ''}
                    >
                      <TableCell className="text-center">
                        <Badge
                          variant={standing.rank <= 3 ? 'default' : 'outline'}
                          className={getMedalColor(standing.rank)}
                        >
                          {standing.rank}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {standing.player.title && (
                              <span className="text-muted-foreground mr-1">
                                {standing.player.title}
                              </span>
                            )}
                            {standing.player.lastName.toUpperCase()},{' '}
                            {standing.player.firstName}
                          </span>
                          {standing.player.club && (
                            <span className="text-xs text-muted-foreground">
                              {standing.player.club}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {standing.player.rating || '-'}
                      </TableCell>
                      <TableCell className="text-center bg-primary/5">
                        <span className="font-bold text-lg">{standing.points.toFixed(1)}</span>
                      </TableCell>
                      <TableCell className="text-center font-mono bg-yellow-50/50 dark:bg-yellow-950/30">
                        {standing.buchholz.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center font-mono bg-blue-50/50 dark:bg-blue-950/30">
                        {standing.sonnebornBerger.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center font-mono bg-green-50/50 dark:bg-green-950/30">
                        {standing.buchholzCut1.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center font-mono bg-purple-50/50 dark:bg-purple-950/30">
                        {standing.cumulative.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {standing.wins}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">
                        {standing.draws}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {standing.losses}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {standing.winsBlack > 0 ? (
                          <span className="text-primary">{standing.winsBlack}</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Légende des départages */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-semibold">Pts:</span>
                <span className="text-muted-foreground">Points</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">BHC:</span>
                <span className="text-muted-foreground">Buchholz</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">S-B:</span>
                <span className="text-muted-foreground">Sonneborn-Berger</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">BHC1:</span>
                <span className="text-muted-foreground">Buchholz Cut 1</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">Cum:</span>
                <span className="text-muted-foreground">Cumulatif</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">V/N/D:</span>
                <span className="text-muted-foreground">Victoires/Nulles/Défaites</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">VN:</span>
                <span className="text-muted-foreground">Victoires Noirs</span>
              </div>
            </div>
          </>
        )}

        {standings.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Moyenne Elo</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        standings.reduce(
                          (sum, s) => sum + (s.player.rating || 0),
                          0
                        ) / standings.filter((s) => s.player.rating).length || 1
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joueurs</p>
                    <p className="text-2xl font-bold">{standings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Leader</p>
                    <p className="text-lg font-bold truncate">
                      {standings[0]?.player.lastName || '-'} ({standings[0]?.points.toFixed(1)} pts)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
