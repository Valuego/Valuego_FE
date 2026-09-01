export const parseGroupId = (tripId: string): number | null => {
  if (!/^\d+$/.test(tripId)) {
    return null;
  }
  const groupId = Number(tripId);
  return Number.isSafeInteger(groupId) ? groupId : null;
};

export const findWinnerName = (results: { nickname: string; result: string }[]) => {
  const winner = results.find((item) => item.result === '당첨') ?? results[0];
  return winner?.nickname ?? null;
};
