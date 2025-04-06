"use client"

import Image from 'next/image';
import { useState } from 'react';
import { City } from '@/types/city';

interface CityCardProps {
  city: City;
  showAnswer: boolean;
}

export default function CityCard({ city, showAnswer }: CityCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Fallback image in case the API image fails to load
  const fallbackImage = 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f';
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-64 w-full">
        <Image
          src={imageError ? fallbackImage : city.images[0]}
          alt={showAnswer ? city.name : 'Guess the city'}
          fill
          className="object-cover"
          priority
          onError={() => setImageError(true)}
        />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="text-lg font-medium text-gray-900">
            {showAnswer ? city.name : 'Guess the City'}
          </div>
          <div className="space-y-2">
            {city.hints.map((hint, index) => (
              <p key={index} className="text-gray-600">
                • {hint}
              </p>
            ))}
          </div>
          {showAnswer && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">State/Country: {city.state}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 