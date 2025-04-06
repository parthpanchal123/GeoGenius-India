export interface City {
  id: string;
  name: string;
  alternateNames: string[];
  images: string[];
  hints: string[];
  state: string;
  difficulty: 1 | 2 | 3;
  categories: string[];
  coordinates?: {
    lat: number;
    lon: number;
  };
  population?: number;
}

export interface GameState {
  currentScore: number;
  maxScore: number;
  currentCity: City | null;
  gameOver: boolean;
} 