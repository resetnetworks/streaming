
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" + secs : secs}`;
};


export const getAvatarColor = (name) => {
  if (!name) return "bg-gradient-to-br from-gray-700 to-gray-900";

  const gradients = [
    "bg-gradient-to-br from-red-700 to-red-900",
    "bg-gradient-to-br from-green-700 to-green-900",
    "bg-gradient-to-br from-blue-700 to-blue-900",
    "bg-gradient-to-br from-yellow-700 to-yellow-900",
    "bg-gradient-to-br from-pink-700 to-pink-900",
    "bg-gradient-to-br from-purple-700 to-purple-900",
    "bg-gradient-to-br from-indigo-700 to-indigo-900",
    "bg-gradient-to-br from-teal-700 to-teal-900",
  ];

  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};
