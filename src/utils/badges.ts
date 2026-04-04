export function getUpdateBadge(date: string): { text: string; color: string } {
  const today = new Date();
  const updatedDate = new Date(date);
  const diffDays = Math.floor((today.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return { text: 'Updated this week', color: 'bg-green-500 text-white' };
  if (diffDays <= 30) return { text: 'Updated last month', color: 'bg-green-300 text-gray-800' };
  if (diffDays <= 365) return { text: 'Updated this year', color: 'bg-yellow-300 text-gray-800' };
  if (diffDays <= 730) return { text: 'Updated last year', color: 'bg-yellow-500 text-gray-800' };
  if (diffDays <= 1095) return { text: 'Updated 2 years ago', color: 'bg-orange-500 text-gray-800' };
  if (diffDays <= 1460) return { text: 'Updated 3 years ago', color: 'bg-red-400 text-white' };
  if (diffDays <= 1825) return { text: 'Updated 4 years ago', color: 'bg-red-500 text-white' };
  return { text: 'Updated 5+ years ago', color: 'bg-red-600 text-white' };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}
