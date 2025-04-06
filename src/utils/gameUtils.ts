import { City } from '@/types/city';
import { fetchRandomCity } from './apiUtils';

// Cache for fetched cities to avoid immediate repetition
let cityCache: City[] = [];
const CACHE_SIZE = 5;

export const getRandomCity = async (excludeId?: string): Promise<City> => {
  try {
    // If we have enough cities in the cache, use one of them
    if (cityCache.length >= CACHE_SIZE) {
      const availableCities = excludeId
        ? cityCache.filter(city => city.id !== excludeId)
        : cityCache;
      
      if (availableCities.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCities.length);
        return availableCities[randomIndex];
      }
    }
    
    // Otherwise, fetch a new city
    const newCity = await fetchRandomCity();
    
    // Add to cache if not already there
    if (!cityCache.some(city => city.id === newCity.id)) {
      cityCache.push(newCity);
      
      // Keep cache size limited
      if (cityCache.length > CACHE_SIZE) {
        cityCache.shift();
      }
    }
    
    return newCity;
  } catch (error) {
    console.error('Error getting random city:', error);
    return fetchRandomCity(); // Let the API utility handle the fallback
  }
};

export const checkAnswer = (guess: string, city: City): boolean => {
  const normalizedGuess = guess.toLowerCase().trim();
  return (
    normalizedGuess === city.name.toLowerCase() ||
    city.alternateNames.some(name => name.toLowerCase() === normalizedGuess)
  );
};

export const loadMaxScore = (): number => {
  if (typeof window === 'undefined') return 0;
  const savedScore = localStorage.getItem('maxScore');
  return savedScore ? parseInt(savedScore, 10) : 0;
};

export const saveMaxScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('maxScore', score.toString());
}; 