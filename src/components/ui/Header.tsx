import { Logo } from './Logo'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
        <div className="flex-1">
          <Logo className="relative -ml-1.5" />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {/* Navigation items will go here */}
        </nav>
      </div>
    </header>
  )
}