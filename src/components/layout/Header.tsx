'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <Terminal className="w-6 h-6" />
            <span className="font-bold text-xl">DERA</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm ${pathname === '/' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'} transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/news"
              className={`text-sm ${pathname === '/news' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'} transition-colors`}
            >
              AI News
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
