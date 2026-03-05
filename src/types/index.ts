// Types pour les tournois d'échecs

export type TournamentType = 'swiss' | 'round-robin' | 'knockout';
export type TournamentStatus = 'draft' | 'ongoing' | 'finished';
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*'; // * = non joué

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  rating?: number;
  federation?: string;
  title?: string;
  club?: string;
}

export interface Game {
  id: string;
  roundId: string;
  whiteId: string;
  blackId: string;
  result: GameResult;
  boardNumber: number;
}

export interface Round {
  id: string;
  tournamentId: string;
  roundNumber: number;
  games: Game[];
  status: 'pending' | 'ongoing' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}

export interface Tournament {
  id: string;
  name: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  type: TournamentType;
  rounds: number;
  status: TournamentStatus;
  players: Player[];
  roundsData: Round[];
  currentRound: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerStanding {
  player: Player;
  rank: number;
  points: number;
  // Départages standards
  buchholz: number; // Somme des points de tous les adversaires
  buchholzCut1: number; // Buchholz sans le pire score
  sonnebornBerger: number; // Points des adversaires battus + 1/2 des nuls
  cumulative: number; // Somme des points cumulés après chaque ronde
  // Statistiques
  wins: number;
  winsBlack: number; // Victoires avec les noirs
  draws: number;
  losses: number;
  performanceRating?: number;
  opponents: string[]; // IDs des adversaires
  colors: ('white' | 'black' | 'bye')[]; // Historique des couleurs
}

export interface TournamentSettings {
  byeScore: number; // Points pour un bye (généralement 1)
  forfeitWin: number; // Points pour victoire par forfait (généralement 1)
  forfeitLoss: number; // Points pour défaite par forfait (généralement 0)
}
