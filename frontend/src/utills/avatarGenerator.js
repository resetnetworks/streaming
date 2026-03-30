// utils/avatarGenerator.js

// 🎯 Generate color based on string (consistent per artist)
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return `hsl(${h}, 70%, 50%)`;
};

// 🎯 Get initials (max 2 letters)
export const getInitials = (name = "") => {
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0]?.toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// 🎯 Gradient generator
export const getGradient = (name) => {
  const color1 = stringToColor(name);
  const color2 = stringToColor(name.split("").reverse().join(""));

  return `linear-gradient(135deg, ${color1}, ${color2})`;
};