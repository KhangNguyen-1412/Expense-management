/** @type {import('tailwindcss').Config} */
export default {
  // **MỚI: Bật chế độ dark mode dựa trên class 'dark' ở thẻ <html>**
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Quét tất cả các file trong thư mục src
  ],
  theme: {
    extend: {},
  },
  // **MỚI: Thêm plugin typography**
  plugins: [
    require('@tailwindcss/typography'),
  ],
}