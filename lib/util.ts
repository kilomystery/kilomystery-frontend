export const euro = (n: number) =>
  n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });