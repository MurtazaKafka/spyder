module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-color': '#0a0a0a',        
        'text-color': '#ffffff',       
        'accent-color': '#2b76ed',    
        'secondary-color': '#1a1a1a', 
        'tertiary-color': '#2a2a2a',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
