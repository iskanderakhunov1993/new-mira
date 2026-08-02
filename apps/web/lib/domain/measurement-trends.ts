import type { DomainEntry } from "./types";

export type MeasurementMetric = "weightKg" | "basalTemperature";

export type MeasurementTrend = {
  metric: MeasurementMetric;
  points: { date: string; value: number }[];
  latest?: number;
  previous?: number;
  change?: number;
};

export function buildMeasurementTrend(entries: DomainEntry[], metric: MeasurementMetric, limit = 10): MeasurementTrend {
  const points = entries
    .filter((entry) => typeof entry[metric] === "number")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-limit)
    .map((entry) => ({ date: entry.date, value: entry[metric] as number }));
  const latest = points.at(-1)?.value;
  const previous = points.at(-2)?.value;
  return {
    metric,
    points,
    latest,
    previous,
    change: latest !== undefined && previous !== undefined ? latest - previous : undefined,
  };
}
