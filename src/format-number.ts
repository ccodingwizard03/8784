export const convertFormattedNumber = async (number: string): Promise<number> => {
  if (number.includes('K')) {
    return parseFloat(number.replace('K', '')) * 1000;
  }

  return parseInt(number.replace(/,/g, ''), 10);
};
