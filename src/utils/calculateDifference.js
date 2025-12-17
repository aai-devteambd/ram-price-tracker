export const calculateDifference = (totalPaid, bestMarket) => {
  if (!totalPaid || !bestMarket) {
    return { amount: 0, percentage: 0, isSaving: false };
  }
  
  const difference = totalPaid - bestMarket;
  const percentage = parseFloat(((difference / totalPaid) * 100).toFixed(1));
  
  return {
    amount: Math.abs(difference),
    percentage: Math.abs(percentage),
    isSaving: difference > 0
  };
};
