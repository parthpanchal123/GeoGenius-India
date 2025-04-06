export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  } catch (error) {
    // Silently fail in case of errors
    console.error('Error tracking event:', error);
  }
};

// Game-specific event tracking functions
export const trackGameStart = () => {
  trackEvent('game_start');
};

export const trackGameEnd = (score: number, attempts: number) => {
  trackEvent('game_end', {
    score,
    attempts,
  });
};

export const trackCorrectGuess = (cityName: string, attempts: number) => {
  trackEvent('correct_guess', {
    city_name: cityName,
    attempts,
  });
};

export const trackIncorrectGuess = (guess: string, attempts: number) => {
  trackEvent('incorrect_guess', {
    guess,
    attempts,
  });
};

export const trackGiveUp = (cityName: string, attempts: number) => {
  trackEvent('give_up', {
    city_name: cityName,
    attempts,
  });
}; 