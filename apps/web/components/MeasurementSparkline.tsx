import type { MeasurementTrend } from "@/lib/domain/measurement-trends";

export function MeasurementSparkline({ trend, large = false }: { trend: MeasurementTrend; large?: boolean }) {
  const values = trend.points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.1);
  const width = large ? 560 : 240;
  const height = large ? 190 : 82;
  const padding = large ? 24 : 10;
  const coordinates = trend.points.map((point, index) => ({
    ...point,
    x: trend.points.length === 1 ? width / 2 : padding + (index / (trend.points.length - 1)) * (width - padding * 2),
    y: padding + ((max - point.value) / span) * (height - padding * 2),
  }));
  const points = coordinates.map((point) => `${point.x},${point.y}`).join(" ");

  return <svg className={large ? "measurement-sparkline large" : "measurement-sparkline"} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`График по ${trend.points.length} ${trend.points.length === 1 ? "записи" : "записям"}`}>
    <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} />
    {coordinates.length > 1 && <polyline points={points} />}
    {coordinates.map((point) => <circle cx={point.x} cy={point.y} r={large ? 5 : 4} key={`${point.date}-${point.value}`}><title>{point.date}: {point.value}</title></circle>)}
  </svg>;
}
