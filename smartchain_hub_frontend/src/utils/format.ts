/** Cap savings at 20% of transaction amount to filter bad test data.
 *  Real AI optimization yields 0.5–4.5%; 20% is a generous ceiling. */
export function capSavings(savings: number, amount: number | null): number {
  const s = Math.max(0, savings);
  if (amount == null || amount <= 0) return s;
  return Math.min(s, amount * 0.2);
}

export function formatSavings(savings: number, amount: number | null): string {
  return `+$${capSavings(savings, amount).toFixed(2)}`;
}
