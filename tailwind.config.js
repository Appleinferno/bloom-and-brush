/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./about.html"],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['Fredoka', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#E91E63', // Pink
                    50: '#FCE4EC',
                    100: '#F8BBD0',
                    500: '#E91E63',
                    600: '#D81B60',
                    900: '#880E4F',
                },
                secondary: {
                    DEFAULT: '#8BC34A', // Green
                    50: '#F1F8E9',
                    100: '#DCEDC8',
                    500: '#8BC34A',
                    600: '#7CB342',
                    900: '#33691E',
                },
                accent: {
                    yellow: '#FFCA28',
                    blue: '#42A5F5',
                    purple: '#AB47BC',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'float-delayed': 'float 3s ease-in-out infinite 1.5s',
                'wiggle': 'wiggle 2s ease-in-out infinite',
                'blob': 'blob 7s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                }
            }
        }
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
