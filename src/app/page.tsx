import GamePage from './game/page';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          GeoGenius India
        </h1>
        <GamePage />
      </div>
    </main>
  );
} 