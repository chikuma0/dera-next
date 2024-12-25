import { Terminal } from 'lucide-react';

export default function NewsLoading() {
  return (
    <main className="min-h-screen bg-black/95 text-green-400">
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center gap-4 animate-pulse">
          <Terminal className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Loading AI News...</h1>
        </div>
      </div>
    </main>
  );
}
