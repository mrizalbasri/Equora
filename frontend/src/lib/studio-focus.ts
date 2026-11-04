export function focusedWeights(
  indicators: string[],
  focus: string | null | undefined,
): Record<string, number> | null {
  if (!focus || !indicators.includes(focus) || indicators.length === 0)
    return null;
  if (indicators.length === 1) return { [focus]: 100 };

  const others = indicators.filter((indicator) => indicator !== focus);
  const share = Math.floor(30 / others.length);
  let remainder = 30 - share * others.length;
  return Object.fromEntries(
    indicators.map((indicator) => {
      if (indicator === focus) return [indicator, 70];
      const value = share + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      return [indicator, value];
    }),
  );
}
