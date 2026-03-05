import { useState } from 'react';
import { useTournamentStore } from '@/store/tournamentStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Play, Check, RotateCcw, Trophy, Users } from 'lucide-react';
import type { GameResult } from '@/types';

interface RoundManagementProps {
  tournamentId: string;
}

const resultOptions: { value: GameResult; label: string }[] = [
  { value: '*', label: 'Non joué' },
  { value: '1-0', label: 'Blancs gagnent' },
  { value: '0-1', label: 'Noirs gagnent' },
  { value: '1/2-1/2', label: 'Nulle' },
];

export function RoundManagement({ tournamentId }: RoundManagementProps) {
  const {
    tournaments,
    generatePairings,
    updateGameResult,
    startRound,
    completeRound,
  } = useTournamentStore();
  const tournament = tournaments.find((t) => t.id === tournamentId);

  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  if (!tournament) return null;

  const canGeneratePairings =
    tournament.players.length >= 2 &&
    (tournament.roundsData.length === 0 ||
      tournament.roundsData[tournament.roundsData.length - 1]?.status === 'completed');

  const nextRoundNumber = tournament.roundsData.length + 1;

  const handleGeneratePairings = () => {
    if (nextRoundNumber <= tournament.rounds) {
      generatePairings(tournamentId, nextRoundNumber);
      setSelectedRound(nextRoundNumber);
    }
  };

  const getPlayerName = (playerId: string) => {
    if (playerId === 'BYE') return 'BYE';
    const player = tournament.players.find((p) => p.id === playerId);
    return player ? `${player.lastName.toUpperCase()}, ${player.firstName}` : 'Inconnu';
  };

  const getPlayerRating = (playerId: string) => {
    if (playerId === 'BYE') return '';
    const player = tournament.players.find((p) => p.id === playerId);
    return player?.rating ? `(${player.rating})` : '';
  };

  const currentRound = tournament.roundsData.find(
    (r) => r.roundNumber === selectedRound
  );

  const allGamesCompleted = currentRound?.games.every(
    (g) => g.result !== '*' || g.blackId === 'BYE'
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <CardTitle>Rondes</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Ronde {tournament.roundsData.length} / {tournament.rounds}
              </span>
              {canGeneratePairings && nextRoundNumber <= tournament.rounds && (
                <Button onClick={handleGeneratePairings} size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Générer la ronde {nextRoundNumber}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tournament.roundsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune ronde générée. Cliquez sur "Générer la ronde 1" pour commencer.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {tournament.roundsData.map((round) => (
                  <Button
                    key={round.id}
                    variant={selectedRound === round.roundNumber ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRound(round.roundNumber)}
                  >
                    Ronde {round.roundNumber}
                    {round.status === 'completed' && (
                      <Check className="h-3 w-3 ml-2 text-green-500" />
                    )}
                    {round.status === 'ongoing' && (
                      <Play className="h-3 w-3 ml-2 text-blue-500" />
                    )}
                  </Button>
                ))}
              </div>

              {selectedRound && currentRound && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">
                          Ronde {currentRound.roundNumber}
                        </CardTitle>
                        <Badge
                          variant={
                            currentRound.status === 'completed'
                              ? 'default'
                              : currentRound.status === 'ongoing'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {currentRound.status === 'completed'
                            ? 'Terminée'
                            : currentRound.status === 'ongoing'
                            ? 'En cours'
                            : 'En attente'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {currentRound.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => startRound(tournamentId, currentRound.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Démarrer
                          </Button>
                        )}
                        {currentRound.status === 'ongoing' && allGamesCompleted && (
                          <Button
                            size="sm"
                            onClick={() => completeRound(tournamentId, currentRound.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Terminer la ronde
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Ech.</TableHead>
                          <TableHead>Blancs</TableHead>
                          <TableHead className="text-center">Résultat</TableHead>
                          <TableHead>Noirs</TableHead>
                          <TableHead className="w-32"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRound.games.map((game) => (
                          <TableRow key={game.id}>
                            <TableCell className="font-medium">
                              {game.boardNumber}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{getPlayerName(game.whiteId)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {getPlayerRating(game.whiteId)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {game.blackId === 'BYE' ? (
                                <Badge variant="secondary">BYE (+1)</Badge>
                              ) : (
                                <span className="font-mono font-bold">
                                  {game.result === '*'
                                    ? '-'
                                    : game.result}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {game.blackId === 'BYE' ? (
                                <span className="text-muted-foreground">-</span>
                              ) : (
                                <div className="flex flex-col">
                                  <span>{getPlayerName(game.blackId)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {getPlayerRating(game.blackId)}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {game.blackId !== 'BYE' &&
                                currentRound.status !== 'completed' && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Résultat
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Saisir le résultat - Echiquier {game.boardNumber}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                          <div className="text-center">
                                            <p className="font-medium">
                                              {getPlayerName(game.whiteId)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              Blancs
                                            </p>
                                          </div>
                                          <div className="text-2xl font-bold">VS</div>
                                          <div className="text-center">
                                            <p className="font-medium">
                                              {getPlayerName(game.blackId)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              Noirs
                                            </p>
                                          </div>
                                        </div>
                                        <Select
                                          defaultValue={game.result}
                                          onValueChange={(value: GameResult) => {
                                            updateGameResult(
                                              tournamentId,
                                              currentRound.id,
                                              game.id,
                                              value
                                            );
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {resultOptions.map((option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
