export function Header() {
  return (
    <header className="h-20 border-b border-gray-800/30 bg-[#161616] backdrop-blur-xl sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 32 32">
                {/* Inner circle */}
                <circle cx="16" cy="16" r="8" />
                {/* Horizontal line extending beyond the inner circle */}
                <line x1="4" y1="16" x2="28" y2="16" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">GraphZen</h1>
            </div>
          </div>
          
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
        </div>
      </div>
    </header>
  )
}
