/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          pink: '#E54D60',
          violet: '#A342FF',
        },
        neutral: {
          white: '#FFFFFF',
          black: '#000000',
          gray100: '#F6F6F6',
          gray700: '#4F4F4F',
        },
        accent: {
          coinGold: '#FFD700',
        }
      },
      fontFamily: {
        'figtree': ['Figtree', 'sans-serif'],
      },
      fontSize: {
        'display': '48px',
        'h1': '36px',
        'h2': '28px',
        'body': '16px',
        'small': '14px',
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        'card': '24px',
        'button': '16px',
      },
      boxShadow: {
        'card': '0px 2px 10px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #E54D60, #A342FF)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
