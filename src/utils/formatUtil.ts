export const formatCurrencyUSD = (
  value: number | string,
  maximumFractionDigits = 3,
): string => {
  if (typeof value === 'string') value = parseFloat(String(value));
  return value
    .toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: maximumFractionDigits,
      minimumFractionDigits: 0,
    })
    .replace('$', '');
};

export const formatShortAddress = (address: string): string => {
  return (
    address.substr(0, 5) +
    '...' +
    address.substr(address.length - 5, address.length)
  );
};
