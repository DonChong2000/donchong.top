/** @type {import('prettier').Options} */
module.exports = {
  singleQuote: true,
  semi: true,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/tailwind.css',
};
