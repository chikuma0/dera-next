export function Header() {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          {/* We'll add navigation items here later */}
        </div>
      </header>
    )
  }