export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const formatRank = (rank) => {
  if (rank === null || rank === undefined) return '-';
  const r = Number(rank);
  if (r === 1) return '🥇 1st';
  if (r === 2) return '🥈 2nd';
  if (r === 3) return '🥉 3rd';
  return `#${r}`;
};

export const formatPoints = (points) => {
  const p = Number(points) || 0;
  return `${p.toLocaleString()} pts`;
};

