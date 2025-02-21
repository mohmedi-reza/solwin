module.exports = {
  // ...
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatCard: {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        dealCard: {
          '0%': { transform: 'translateY(-100vh) rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(10px)' },
          '50%': { opacity: '1', filter: 'blur(15px)' },
        },
        flipCard: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        progressLine: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(-30%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        progressGlow: {
          '0%': { opacity: '0.3' },
          '50%': { opacity: '0.1' },
          '100%': { opacity: '0.3' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'card-change': {
          '0%': { opacity: '1', transform: 'rotateY(0deg)' },
          '33%': { opacity: '0', transform: 'rotateY(90deg)' },
          '66%': { opacity: '0', transform: 'rotateY(-90deg)' },
          '100%': { opacity: '1', transform: 'rotateY(0deg)' },
        },
        'float-1': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(-15deg)' },
          '50%': { transform: 'translate(-10px, -15px) rotate(-20deg)' },
        },
        'float-2': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(25deg)' },
          '50%': { transform: 'translate(15px, -10px) rotate(30deg)' },
        },
        'float-3': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(-35deg)' },
          '50%': { transform: 'translate(-5px, -20px) rotate(-40deg)' },
        },
        'gradient': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.5s ease-out',
        slideDown: 'slideDown 0.5s ease-out',
        floatCard: 'floatCard 3s ease-in-out infinite',
        dealCard: 'dealCard 0.5s ease-out forwards',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        flipCard: 'flipCard 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        blob: 'blob 7s infinite',
        progressLine: 'progressLine 5s ease-out forwards',
        'bounce-slow': 'bounce-slow 2s infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
        'card-change': 'card-change 0.6s ease-in-out',
        'float-1': 'float-1 6s ease-in-out infinite',
        'float-2': 'float-2 8s ease-in-out infinite',
        'float-3': 'float-3 7s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 4s ease-in-out infinite',
        'float-slower': 'float 5s ease-in-out infinite',
      },
      utilities: {
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
        '.animation-delay-150': {
          'animation-delay': '150ms',
        },
        '.animation-delay-300': {
          'animation-delay': '300ms',
        },
        '.perspective-1000': {
          perspective: '1000px',
        }
      }
    },
  },
}; 