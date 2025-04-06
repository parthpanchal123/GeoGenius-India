# Guess the Indian City Game

A fun and educational web application where players guess Indian cities based on images and hints.

## Features

- **Random City Challenges**: Each round presents a random city to guess
- **Progressive Hints**: Get additional hints after multiple incorrect guesses
- **Score Tracking**: Keep track of your current score and personal best
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Visual Feedback**: Clear indicators for correct and incorrect guesses

## How to Play

1. You'll be presented with an image of a city and a hint
2. Type your guess in the input field and press Enter or click "Guess"
3. If correct, your score increases and you move to the next city
4. If incorrect, you'll get another hint after 3 wrong attempts
5. The game continues until you make too many incorrect guesses
6. Try to beat your personal best score!

## Technical Details

- Built with Next.js, TypeScript, and Tailwind CSS
- Uses the Random City API from RapidAPI for city data
- Implements local storage for persisting high scores
- Responsive UI components using shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/guess-india.git
cd guess-india
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your RapidAPI key:
```
RAPIDAPI_KEY=your_api_key_here
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Future Enhancements

- Add difficulty levels (Easy, Medium, Hard)
- Implement themed categories (Coastal Cities, Historical Capitals, etc.)
- Add a timer mode for more challenge
- Include sound effects and background music
- Add a "Learn More" link to Wikipedia for each city

## License

This project is licensed under the MIT License - see the LICENSE file for details. 