'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchRandomCity } from '@/utils/apiUtils';
import { City } from '@/types/city';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Trophy, X, Check, MapPin, Users, Info, Image as ImageIcon } from 'lucide-react';

interface PlaceholderImageProps {
  state?: string;
}

const PlaceholderImage = ({ state }: PlaceholderImageProps) => (
  <div className="w-full h-64 bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100 flex flex-col items-center justify-center p-4 animate-fade-in">
    <div className="rounded-full bg-blue-50 p-4 mb-4 shadow-inner animate-bounce-slow">
      <MapPin className="h-12 w-12 text-blue-500" />
    </div>
    <div className="text-center space-y-2 animate-fade-in-up">
      <h3 className="text-xl font-semibold text-gray-800">Discover {state || 'India'}</h3>
      <p className="text-sm text-gray-600">Test your knowledge of Indian cities</p>
      <div className="flex items-center justify-center gap-2 mt-2">
        <Info className="h-4 w-4 text-blue-400 animate-pulse" />
        <p className="text-xs text-gray-500">Use the hints below to guess the city</p>
      </div>
    </div>
  </div>
);

export default function GamePage() {
  const router = useRouter();
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shownCities, setShownCities] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<{
    isGameOver: boolean;
    showAnswer: boolean;
    feedback: { type: 'correct' | 'incorrect' | null; message: string };
    correctAnswer: string | null;
  }>({
    isGameOver: false,
    showAnswer: false,
    feedback: { type: null, message: '' },
    correctAnswer: null
  });

  // Load max score from localStorage on initial render
  useEffect(() => {
    const savedMaxScore = localStorage.getItem('maxScore');
    if (savedMaxScore) {
      setMaxScore(parseInt(savedMaxScore));
    }
  }, []);

  // Load a new city when the component mounts
  useEffect(() => {
    loadNewCity();
  }, []);

  const loadNewCity = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setGameState({
        isGameOver: false,
        showAnswer: false,
        feedback: { type: null, message: '' },
        correctAnswer: null
      });
      
      let city = await fetchRandomCity();
      let attempts = 0;
      const maxAttempts = 10;

      while (shownCities.has(city.id) && attempts < maxAttempts) {
        city = await fetchRandomCity();
        attempts++;
      }

      // Remove sensitive data from the city object in the client
      const sanitizedCity = {
        ...city,
        name: '', // Hide the actual name
        alternateNames: [], // Hide alternate names
        images: city.images,
        hints: city.hints,
        state: city.state,
        difficulty: city.difficulty,
        id: city.id
      };

      // Store the actual city name and alternate names in a closure
      const cityAnswer = {
        name: city.name.toLowerCase(),
        alternateNames: city.alternateNames.map(name => name.toLowerCase())
      };

      // Add the new city to shown cities
      setShownCities(prev => new Set(prev).add(city.id));
      
      setCurrentCity(sanitizedCity);
      
      // Update handleGuess to use the closure
      const checkGuess = (guess: string) => {
        const normalizedGuess = guess.trim().toLowerCase();
        return cityAnswer.name === normalizedGuess || 
               cityAnswer.alternateNames.some(name => name === normalizedGuess);
      };

      // Attach the checker function and correct answer to window for the current session
      (window as any).__checkCityGuess = checkGuess;
      (window as any).__correctCityName = city.name;
      
      setUserGuess('');
      setAttempts(0);
    } catch (err) {
      setError('Failed to load city. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuess = () => {
    if (!currentCity || !userGuess || !(window as any).__checkCityGuess) return;

    const isCorrect = (window as any).__checkCityGuess(userGuess);

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore > maxScore) {
        setMaxScore(newScore);
        localStorage.setItem('maxScore', newScore.toString());
      }
      
      setGameState({
        isGameOver: true,
        showAnswer: true,
        feedback: { 
          type: 'correct', 
          message: `Correct! Moving to next city...` 
        },
        correctAnswer: (window as any).__correctCityName
      });
      
      // Clean up the checker function
      delete (window as any).__checkCityGuess;
      delete (window as any).__correctCityName;
      setTimeout(loadNewCity, 2000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setGameState({
          isGameOver: true,
          showAnswer: true,
          feedback: { 
            type: 'incorrect', 
            message: `Game Over! Your final score: ${score}` 
          },
          correctAnswer: (window as any).__correctCityName
        });
        // Clean up the checker function
        delete (window as any).__checkCityGuess;
        delete (window as any).__correctCityName;
      } else {
        setGameState(prev => ({
          ...prev,
          feedback: { 
            type: 'incorrect', 
            message: 'Incorrect! Try again.' 
          }
        }));
      }
    }
  };

  const handleRestart = () => {
    setScore(0);
    setShownCities(new Set());
    setGameState({
      isGameOver: false,
      showAnswer: false,
      feedback: { type: null, message: '' },
      correctAnswer: null
    });
    // Clean up any existing checker function
    delete (window as any).__checkCityGuess;
    delete (window as any).__correctCityName;
    loadNewCity();
  };

  const handleShowAnswer = () => {
    if (!(window as any).__checkCityGuess) return;
    
    setGameState({
      isGameOver: true,
      showAnswer: true,
      feedback: { 
        type: 'incorrect', 
        message: `Game Over! Your final score: ${score}` 
      },
      correctAnswer: (window as any).__correctCityName
    });
    // Clean up the checker function
    delete (window as any).__checkCityGuess;
    delete (window as any).__correctCityName;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      delete (window as any).__checkCityGuess;
      delete (window as any).__correctCityName;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4">Loading city...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="mb-4">{error}</p>
        <Button onClick={loadNewCity} className="btn-primary">Try Again</Button>
      </div>
    );
  }

  if (!currentCity) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <span>Score: {score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <span>Best: {maxScore}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="w-full rounded-lg overflow-hidden border">
              {currentCity?.images?.[0] ? (
                <div className="relative w-full h-64 animate-fade-in">
                  <Image
                    src={currentCity.images[0]}
                    alt={gameState.showAnswer ? gameState.correctAnswer || 'City' : 'City'}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    className="transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    onLoadingComplete={(image) => {
                      image.classList.remove('opacity-0');
                    }}
                  />
                </div>
              ) : (
                <PlaceholderImage state={currentCity?.state} />
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {gameState.showAnswer ? `The city is: ${gameState.correctAnswer}` : "Here's what we know about this city:"}
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                {currentCity.hints.map((hint, index) => (
                  <li key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                    {hint}
                  </li>
                ))}
              </ul>
            </div>

            {!gameState.showAnswer && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter city name..."
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                    className="flex-1"
                  />
                  <Button onClick={handleGuess} className="btn-primary animate-pulse">
                    Guess
                  </Button>
                </div>
                <button
                  onClick={handleShowAnswer}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 text-center mt-2 transition-colors duration-200"
                >
                  Give Up & Show Answer
                </button>
              </div>
            )}

            {gameState.showAnswer && (
              <div className="p-4 rounded-lg border animate-fade-in">
                {gameState.feedback.message}
                {gameState.isGameOver && gameState.feedback.type === 'incorrect' && (
                  <div className="mt-4 flex justify-center animate-bounce-slow">
                    <Button onClick={handleRestart} className="btn-primary">
                      Play Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between animate-fade-in">
            <div>
              Attempts: {attempts}/5
            </div>
            <div>
              Difficulty: {currentCity.difficulty === 1 ? 'Easy' : currentCity.difficulty === 2 ? 'Medium' : 'Hard'}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 