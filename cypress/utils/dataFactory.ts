export const buildOrderData = (overrides: Partial<{ amount: number; reference: string }> = {}) => {
  const timestamp = Date.now();
  return {
    amount: overrides.amount ?? 125,
    reference: overrides.reference ?? `AUTO-${timestamp}`
  };
};
