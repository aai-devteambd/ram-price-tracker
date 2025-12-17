export const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return "N/A";
  }
  return `${price.toLocaleString()} QAR`;
};
