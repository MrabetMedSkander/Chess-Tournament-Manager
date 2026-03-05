import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tournament, Player, Round, Game, PlayerStanding, GameResult } from '@/types';

interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  
  // Actions
  createTournament: (tournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt' | 'players' | 'roundsData' | 'currentRound' | 'status'>) => string;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  setCurrentTournament: (tournament: Tournament | null) => void;
  loadTournament: (id: string) => void;
  
  // Gestion des joueurs
  addPlayer: (tournamentId: string, player: Omit<Player, 'id'>) => void;
  updatePlayer: (tournamentId: string, playerId: string, updates: Partial<Player>) => void;
  removePlayer: (tournamentId: string, playerId: string) => void;
  
  // Gestion des rondes
  generatePairings: (tournamentId: string, roundNumber: number) => void;
  updateGameResult: (tournamentId: string, roundId: string, gameId: string, result: GameResult) => void;
  startRound: (tournamentId: string, roundId: string) => void;
  completeRound: (tournamentId: string, roundId: string) => void;
  
  // Calcul du classement
  getStandings: (tournamentId: string) => PlayerStanding[];
  
  // Export
  exportTournament: (tournamentId: string) => string;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournaments: [],
      currentTournament: null,

      createTournament: (tournamentData) => {
        const id = generateId();
        const newTournament: Tournament = {
          ...tournamentData,
          id,
          players: [],
          roundsData: [],
          currentRound: 0,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          tournaments: [...state.tournaments, newTournament],
          currentTournament: newTournament,
        }));
        return id;
      },

      updateTournament: (id, updates) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
          currentTournament:
            state.currentTournament?.id === id
              ? { ...state.currentTournament, ...updates, updatedAt: new Date() }
              : state.currentTournament,
        }));
      },

      deleteTournament: (id) => {
        set((state) => ({
          tournaments: state.tournaments.filter((t) => t.id !== id),
          currentTournament:
            state.currentTournament?.id === id ? null : state.currentTournament,
        }));
      },

      setCurrentTournament: (tournament) => {
        set({ currentTournament: tournament });
      },

      loadTournament: (id) => {
        const tournament = get().tournaments.find((t) => t.id === id);
        if (tournament) {
          set({ currentTournament: tournament });
        }
      },

      addPlayer: (tournamentId, playerData) => {
        const player: Player = { ...playerData, id: generateId() };
        set((state) => {
          const updatedTournaments = state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, players: [...t.players, player], updatedAt: new Date() }
              : t
          );
          const updatedCurrent =
            state.currentTournament?.id === tournamentId
              ? {
                  ...state.currentTournament,
                  players: [...state.currentTournament.players, player],
                  updatedAt: new Date(),
                }
              : state.currentTournament;
          return { tournaments: updatedTournaments, currentTournament: updatedCurrent };
        });
      },

      updatePlayer: (tournamentId, playerId, updates) => {
        set((state) => {
          const updatedTournaments = state.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  players: t.players.map((p) =>
                    p.id === playerId ? { ...p, ...updates } : p
                  ),
                  updatedAt: new Date(),
                }
              : t
          );
          const updatedCurrent =
            state.currentTournament?.id === tournamentId
              ? {
                  ...state.currentTournament,
                  players: state.currentTournament.players.map((p) =>
                    p.id === playerId ? { ...p, ...updates } : p
                  ),
                  updatedAt: new Date(),
                }
              : state.currentTournament;
          return { tournaments: updatedTournaments, currentTournament: updatedCurrent };
        });
      },

      removePlayer: (tournamentId, playerId) => {
        set((state) => {
          const updatedTournaments = state.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  players: t.players.filter((p) => p.id !== playerId),
                  updatedAt: new Date(),
                }
              : t
          );
          const updatedCurrent =
            state.currentTournament?.id === tournamentId
              ? {
                  ...state.currentTournament,
                  players: state.currentTournament.players.filter(
                    (p) => p.id !== playerId
                  ),
                  updatedAt: new Date(),
                }
              : state.currentTournament;
          return { tournaments: updatedTournaments, currentTournament: updatedCurrent };
        });
      },

      generatePairings: (tournamentId, roundNumber) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId);
        if (!tournament) return;

        const players = [...tournament.players];
        const previousRounds = tournament.roundsData.filter(
          (r) => r.roundNumber < roundNumber
        );

        // Calculer les points actuels pour chaque joueur
        const playerPoints = new Map<string, number>();
        players.forEach((p) => playerPoints.set(p.id, 0));

        previousRounds.forEach((round) => {
          round.games.forEach((game) => {
            if (game.result === '1-0') {
              playerPoints.set(game.whiteId, (playerPoints.get(game.whiteId) || 0) + 1);
            } else if (game.result === '0-1') {
              playerPoints.set(game.blackId, (playerPoints.get(game.blackId) || 0) + 1);
            } else if (game.result === '1/2-1/2') {
              playerPoints.set(game.whiteId, (playerPoints.get(game.whiteId) || 0) + 0.5);
              playerPoints.set(game.blackId, (playerPoints.get(game.blackId) || 0) + 0.5);
            }
          });
        });

        // Trier les joueurs par points (descendant)
        players.sort((a, b) => (playerPoints.get(b.id) || 0) - (playerPoints.get(a.id) || 0));

        // Algorithme d'appariement Suisse simplifié
        const games: Game[] = [];
        const paired = new Set<string>();
        const playedOpponents = new Map<string, Set<string>>();

        // Construire l'historique des adversaires
        players.forEach((p) => playedOpponents.set(p.id, new Set()));
        previousRounds.forEach((round) => {
          round.games.forEach((game) => {
            playedOpponents.get(game.whiteId)?.add(game.blackId);
            playedOpponents.get(game.blackId)?.add(game.whiteId);
          });
        });

        let boardNumber = 1;

        for (let i = 0; i < players.length; i++) {
          if (paired.has(players[i].id)) continue;

          let opponent: Player | null = null;

          // Chercher un adversaire non apparié qui n'a pas encore joué contre ce joueur
          for (let j = i + 1; j < players.length; j++) {
            if (
              !paired.has(players[j].id) &&
              !playedOpponents.get(players[i].id)?.has(players[j].id)
            ) {
              opponent = players[j];
              break;
            }
          }

          // Si aucun adversaire trouvé, prendre le premier non apparié
          if (!opponent) {
            for (let j = i + 1; j < players.length; j++) {
              if (!paired.has(players[j].id)) {
                opponent = players[j];
                break;
              }
            }
          }

          if (opponent) {
            // Alterner les couleurs
            const whiteGames = previousRounds.filter((r) =>
              r.games.some((g) => g.whiteId === players[i].id)
            ).length;
            const blackGames = previousRounds.filter((r) =>
              r.games.some((g) => g.blackId === players[i].id)
            ).length;

            let whiteId = players[i].id;
            let blackId = opponent.id;

            if (blackGames < whiteGames) {
              whiteId = opponent.id;
              blackId = players[i].id;
            }

            games.push({
              id: generateId(),
              roundId: '', // Sera mis à jour
              whiteId,
              blackId,
              result: '*',
              boardNumber: boardNumber++,
            });

            paired.add(players[i].id);
            paired.add(opponent.id);
          }
        }

        // Si nombre impair de joueurs, le dernier a un bye
        if (players.length % 2 === 1) {
          const unpairedPlayer = players.find((p) => !paired.has(p.id));
          if (unpairedPlayer) {
            games.push({
              id: generateId(),
              roundId: '',
              whiteId: unpairedPlayer.id,
              blackId: 'BYE',
              result: '1-0', // Bye = victoire
              boardNumber: boardNumber++,
            });
          }
        }

        const roundId = generateId();
        const newRound: Round = {
          id: roundId,
          tournamentId,
          roundNumber,
          games: games.map((g) => ({ ...g, roundId })),
          status: 'pending',
        };

        set((state) => {
          const updatedTournaments = state.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  roundsData: [...t.roundsData, newRound],
                  currentRound: roundNumber,
                  status: roundNumber === 1 ? 'ongoing' : t.status,
                  updatedAt: new Date(),
                }
              : t
          );
          const updatedCurrent =
            state.currentTournament?.id === tournamentId
              ? {
                  ...state.currentTournament,
                  roundsData: [...state.currentTournament.roundsData, newRound],
                  currentRound: roundNumber,
                  status: roundNumber === 1 ? 'ongoing' : state.currentTournament.status,
                  updatedAt: new Date(),
                }
              : state.currentTournament;
          return { tournaments: updatedTournaments, currentTournament: updatedCurrent };
        });
      },

      updateGameResult: (tournamentId, roundId, gameId, result) => {
        set((state) => {
          const updateRounds = (rounds: Round[]) =>
            rounds.map((r) =>
              r.id === roundId
                ? {
                    ...r,
                    games: r.games.map((g) =>
                      g.id === gameId ? { ...g, result } : g
                    ),
                  }
                : r
            );

          const updatedTournaments = state.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  roundsData: updateRounds(t.roundsData),
                  updatedAt: new Date(),
                }
              : t
          );

          const updatedCurrent =
            state.currentTournament?.id === tournamentId
              ? {
                  ...state.currentTournament,
                  roundsData: updateRounds(state.currentTournament.roundsData),
                  updatedAt: new Date(),
                }
              : state.currentTournament;

          return { tournaments: updatedTournaments, currentTournament: updatedCurrent };
        });
      },

      startRound: (tournamentId, roundId) => {
        set((state) => {
          const updateRounds = (rounds: Round[]) =>
            rounds.map((r) =>
              r.id === roundId ? { ...r, status: 'ongoing' as const, startedAt: new Date() } : r
            );

          const updatedTournaments = state.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  roundsData: updateRounds(t.roundsData),
                  updatedAt: new Date(),
                }
              : t
          );

          const updatedCurrent =
            state.currentTournament?.id === tournamentId
              ? {
                  ...state.currentTournament,
                  roundsData: updateRounds(state.currentTournament.roundsData),
                  updatedAt: new Date(),
                }
              : state.currentTournament;

          return { tournaments: updatedTournaments, currentTournament: updatedCurrent };
        });
      },

      completeRound: (tournamentId, roundId) => {
        set((state) => {
          const updateRounds = (rounds: Round[]) =>
            rounds.map((r) =>
              r.id === roundId
                ? { ...r, status: 'completed' as const, completedAt: new Date() }
                : r
            );

          const tournament = state.tournaments.find((t) => t.id === tournamentId);
          const isLastRound = tournament?.rounds === tournament?.roundsData.length;

          const updatedTournaments = state.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  roundsData: updateRounds(t.roundsData),
                  status: isLastRound ? ('finished' as const) : t.status,
                  updatedAt: new Date(),
                }
              : t
          );

          const updatedCurrent =
            state.currentTournament?.id === tournamentId
              ? {
                  ...state.currentTournament,
                  roundsData: updateRounds(state.currentTournament.roundsData),
                  status: isLastRound ? ('finished' as const) : state.currentTournament.status,
                  updatedAt: new Date(),
                }
              : state.currentTournament;

          return { tournaments: updatedTournaments, currentTournament: updatedCurrent };
        });
      },

      getStandings: (tournamentId) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId);
        if (!tournament) return [];

        // Initialiser les standings avec tous les champs
        const standings: PlayerStanding[] = tournament.players.map((player) => ({
          player,
          rank: 0,
          points: 0,
          buchholz: 0,
          buchholzCut1: 0,
          sonnebornBerger: 0,
          cumulative: 0,
          wins: 0,
          winsBlack: 0,
          draws: 0,
          losses: 0,
          opponents: [],
          colors: [],
        }));

        const standingMap = new Map<string, PlayerStanding>();
        standings.forEach((s) => standingMap.set(s.player.id, s));

        // Calculer les points cumulés après chaque ronde (pour le départage cumulatif)
        const cumulativePoints = new Map<string, number[]>();
        tournament.players.forEach((p) => cumulativePoints.set(p.id, [0]));

        // Calculer les points et statistiques ronde par ronde
        tournament.roundsData.forEach((round) => {
          round.games.forEach((game) => {
            if (game.result === '*') return;

            const white = standingMap.get(game.whiteId);
            const black = standingMap.get(game.blackId);

            if (!white) return;

            // Gestion du BYE
            if (game.blackId === 'BYE') {
              white.points += 1;
              white.wins += 1;
              white.colors.push('bye');
              
              // Mettre à jour les points cumulés
              const prevCumul = cumulativePoints.get(game.whiteId) || [0];
              const currentTotal = prevCumul[prevCumul.length - 1] + 1;
              prevCumul.push(currentTotal);
              return;
            }

            if (!black) return;

            // Enregistrer les adversaires et les couleurs
            white.opponents.push(game.blackId);
            black.opponents.push(game.whiteId);
            white.colors.push('white');
            black.colors.push('black');

            // Calculer les points et statistiques
            if (game.result === '1-0') {
              white.points += 1;
              white.wins += 1;
              black.losses += 1;
            } else if (game.result === '0-1') {
              black.points += 1;
              black.wins += 1;
              black.winsBlack += 1; // Victoire avec les noirs
              white.losses += 1;
            } else if (game.result === '1/2-1/2') {
              white.points += 0.5;
              black.points += 0.5;
              white.draws += 1;
              black.draws += 1;
            }

            // Mettre à jour les points cumulés
            const whiteCumul = cumulativePoints.get(game.whiteId) || [0];
            const blackCumul = cumulativePoints.get(game.blackId) || [0];
            
            const whitePrev = whiteCumul[whiteCumul.length - 1];
            const blackPrev = blackCumul[blackCumul.length - 1];
            
            if (game.result === '1-0') {
              whiteCumul.push(whitePrev + 1);
              blackCumul.push(blackPrev);
            } else if (game.result === '0-1') {
              whiteCumul.push(whitePrev);
              blackCumul.push(blackPrev + 1);
            } else if (game.result === '1/2-1/2') {
              whiteCumul.push(whitePrev + 0.5);
              blackCumul.push(blackPrev + 0.5);
            }
          });
        });

        // Calculer le départage cumulatif (somme des points après chaque ronde)
        standings.forEach((standing) => {
          const cumulArray = cumulativePoints.get(standing.player.id) || [0];
          // On somme tous les points cumulés sauf le premier (qui est 0)
          standing.cumulative = cumulArray.slice(1).reduce((sum, val) => sum + val, 0);
        });

        // Calculer le Buchholz (somme des points de tous les adversaires)
        standings.forEach((standing) => {
          standing.buchholz = standing.opponents.reduce((sum, opponentId) => {
            const opponent = standingMap.get(opponentId);
            return sum + (opponent?.points || 0);
          }, 0);
        });

        // Calculer le Buchholz Cut 1 (Buchholz sans le pire score)
        standings.forEach((standing) => {
          const opponentPoints = standing.opponents
            .map((opponentId) => standingMap.get(opponentId)?.points || 0)
            .sort((a, b) => a - b); // Trier du plus petit au plus grand
          
          // Enlever le pire score (premier élément) si on a au moins 2 adversaires
          if (opponentPoints.length > 1) {
            opponentPoints.shift(); // Retirer le minimum
          }
          
          standing.buchholzCut1 = opponentPoints.reduce((sum, val) => sum + val, 0);
        });

        // Calculer le Sonneborn-Berger
        tournament.roundsData.forEach((round) => {
          round.games.forEach((game) => {
            const white = standingMap.get(game.whiteId);
            const black = standingMap.get(game.blackId);
            if (!white || !black) return;

            if (game.result === '1-0') {
              white.sonnebornBerger += black.points;
            } else if (game.result === '0-1') {
              black.sonnebornBerger += white.points;
            } else if (game.result === '1/2-1/2') {
              white.sonnebornBerger += black.points * 0.5;
              black.sonnebornBerger += white.points * 0.5;
            }
          });
        });

        // Trier par points, puis par les départages en cascade
        standings.sort((a, b) => {
          // 1. Points
          if (b.points !== a.points) return b.points - a.points;
          // 2. Buchholz
          if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
          // 3. Sonneborn-Berger
          if (b.sonnebornBerger !== a.sonnebornBerger) return b.sonnebornBerger - a.sonnebornBerger;
          // 4. Buchholz Cut 1
          if (b.buchholzCut1 !== a.buchholzCut1) return b.buchholzCut1 - a.buchholzCut1;
          // 5. Cumulatif
          if (b.cumulative !== a.cumulative) return b.cumulative - a.cumulative;
          // 6. Nombre de victoires
          if (b.wins !== a.wins) return b.wins - a.wins;
          // 7. Victoires avec les noirs
          return b.winsBlack - a.winsBlack;
        });

        // Attribuer les rangs (avec gestion des ex-aequos)
        standings.forEach((standing, index) => {
          if (index === 0) {
            standing.rank = 1;
          } else {
            const prev = standings[index - 1];
            // Si égalité parfaite sur tous les critères, même rang
            if (
              prev.points === standing.points &&
              prev.buchholz === standing.buchholz &&
              prev.sonnebornBerger === standing.sonnebornBerger &&
              prev.buchholzCut1 === standing.buchholzCut1 &&
              prev.cumulative === standing.cumulative
            ) {
              standing.rank = prev.rank;
            } else {
              standing.rank = index + 1;
            }
          }
        });

        return standings;
      },

      exportTournament: (tournamentId) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId);
        if (!tournament) return '';

        const standings = get().getStandings(tournamentId);

        let csv = 'Rang,Nom,Prénom,Elo,Points,Buchholz,Sonneborn-Berger,BuchholzCut1,Cumulatif,Victoires,Nulles,Defaites,VictoiresNoirs\n';
        standings.forEach((s) => {
          csv += `${s.rank},${s.player.lastName},${s.player.firstName},${s.player.rating || ''},${s.points},${s.buchholz.toFixed(1)},${s.sonnebornBerger.toFixed(2)},${s.buchholzCut1.toFixed(1)},${s.cumulative.toFixed(1)},${s.wins},${s.draws},${s.losses},${s.winsBlack}\n`;
        });

        return csv;
      },
    }),
    {
      name: 'chess-tournament-storage',
    }
  )
);
