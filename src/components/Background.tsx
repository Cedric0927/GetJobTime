export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-50">
      {/* Decorative gradient meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-purple-400/20 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-pink-400/20 blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '9s', animationDelay: '2s' }} />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />
      
      {/* Fine noise texture for premium feel */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    </div>
  )
}
