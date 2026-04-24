export function SignupIllustration() {
  return (
    <div className="signup-illustration">
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="Welcome illustration">
        <defs>
          <linearGradient id="mint-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B2FCE4" />
            <stop offset="100%" stopColor="#8FE9CC" />
          </linearGradient>
          <linearGradient id="house-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B5D3B" />
            <stop offset="100%" stopColor="#0A2540" />
          </linearGradient>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated background blobs */}
        <circle cx="200" cy="200" r="170" fill="url(#mint-gradient)" className="bg-blob" opacity="0.6" />
        <circle cx="200" cy="200" r="140" fill="url(#mint-gradient)" className="bg-blob-inner" opacity="0.4" />

        {/* House */}
        <g className="house-group" filter="url(#soft-shadow)">
          <polygon points="115,205 200,130 285,205" fill="#0A2540" />
          <polygon points="200,130 285,205 275,205 200,140" fill="#1A3550" />
          <rect x="130" y="200" width="140" height="120" fill="url(#house-gradient)" rx="6" />
          <rect x="182" y="255" width="36" height="65" fill="#B2FCE4" rx="3" />
          <circle cx="210" cy="290" r="2" fill="#0B5D3B" />
          <rect x="145" y="220" width="28" height="28" fill="#B2FCE4" rx="3" />
          <line x1="159" y1="220" x2="159" y2="248" stroke="#0A2540" strokeWidth="1" opacity="0.3" />
          <line x1="145" y1="234" x2="173" y2="234" stroke="#0A2540" strokeWidth="1" opacity="0.3" />
          <rect x="227" y="220" width="28" height="28" fill="#B2FCE4" rx="3" />
          <line x1="241" y1="220" x2="241" y2="248" stroke="#0A2540" strokeWidth="1" opacity="0.3" />
          <line x1="227" y1="234" x2="255" y2="234" stroke="#0A2540" strokeWidth="1" opacity="0.3" />
          <circle cx="245" cy="145" r="3" fill="#B2FCE4" className="smoke smoke-1" opacity="0.6" />
          <circle cx="250" cy="130" r="4" fill="#B2FCE4" className="smoke smoke-2" opacity="0.5" />
          <circle cx="248" cy="115" r="5" fill="#B2FCE4" className="smoke smoke-3" opacity="0.4" />
        </g>

        <g className="floating-key key-1">
          <circle cx="90" cy="160" r="10" fill="none" stroke="#0B5D3B" strokeWidth="3" />
          <rect x="100" y="158" width="30" height="4" fill="#0B5D3B" rx="1" />
          <rect x="122" y="156" width="3" height="8" fill="#0B5D3B" />
          <rect x="128" y="156" width="3" height="8" fill="#0B5D3B" />
        </g>
        <g className="floating-key key-2">
          <circle cx="320" cy="110" r="10" fill="none" stroke="#0B5D3B" strokeWidth="3" />
          <rect x="330" y="108" width="30" height="4" fill="#0B5D3B" rx="1" />
          <rect x="352" y="106" width="3" height="8" fill="#0B5D3B" />
        </g>

        <g className="floating-heart heart-1">
          <path d="M 75,285 C 70,278 75,270 82,272 C 89,270 94,278 89,285 C 89,290 82,296 82,296 C 82,296 75,290 75,285 Z" fill="#D94040" />
        </g>
        <g className="floating-heart heart-2">
          <path d="M 330,305 C 326,299 330,293 336,295 C 342,293 346,299 342,305 C 342,309 336,313 336,313 C 336,313 330,309 330,305 Z" fill="#D94040" />
        </g>

        <g className="star star-1" transform="translate(60, 90)">
          <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="#FFD700" />
        </g>
        <g className="star star-2" transform="translate(340, 330)">
          <polygon points="0,-6 1.5,-1.5 6,-1.5 2,1.5 3.5,6 0,3 -3.5,6 -2,1.5 -6,-1.5 -1.5,-1.5" fill="#FFD700" />
        </g>
        <g className="star star-3" transform="translate(50, 340)">
          <polygon points="0,-5 1,-1 5,-1 2,1 3,5 0,2 -3,5 -2,1 -5,-1 -1,-1" fill="#FFD700" />
        </g>
      </svg>

      <div className="illustration-caption">
        <h3>Welcome home</h3>
        <p>A place that speaks your language — literally.</p>
      </div>
    </div>
  )
}

export default SignupIllustration
