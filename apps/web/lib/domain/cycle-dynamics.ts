export type CycleDynamicsPoint = {
  length: number;
  attention: boolean;
};

export type CycleDynamics = {
  points: CycleDynamicsPoint[];
  baseline?: {
    min: number;
    max: number;
  };
  remainingForChart: number;
};

export function buildCycleDynamics(lengths: number[]): CycleDynamics {
  const recent = lengths.filter((length) => Number.isFinite(length) && length > 0).slice(-6);
  const baselineSource = recent.length >= 4 ? recent.slice(-4, -1) : recent.slice(-3);
  const baseline = baselineSource.length >= 3
    ? {
        min: Math.min(...baselineSource),
        max: Math.max(...baselineSource),
      }
    : undefined;

  return {
    points: recent.map((length, index) => {
      const previous = recent.slice(Math.max(0, index - 3), index);
      const attention = previous.length >= 3
        && (length < Math.min(...previous) || length > Math.max(...previous));
      return { length, attention };
    }),
    baseline,
    remainingForChart: Math.max(0, 3 - recent.length),
  };
}
