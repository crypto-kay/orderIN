export const formatINR = (amount: number | string) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
};