import type { CourseMetrics } from "@/lib/course-metrics";
import { MetricStrip } from "../metric-strip";
import { Metric } from "../metric";
import { ShareBar } from "../share-bar";

type Props = {
  metrics: CourseMetrics;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * The course in four figures, read the same way as the season's strip.
 * Occupancy is the one proportion, so it is the one thing in colour; the
 * pending registrations are counted apart because they hold no place until
 * they are paid.
 */
export function CourseMetricsStrip({ metrics }: Props) {
  const occupancyPct =
    metrics.capacity > 0
      ? Math.round((metrics.enrolled / metrics.capacity) * 100)
      : 0;

  return (
    <MetricStrip>
      <Metric
        label="Inscritos"
        value={String(metrics.enrolled)}
        suffix={`de ${metrics.capacity}`}
      >
        <ShareBar percent={occupancyPct} />
        <p className="mt-1 text-xs text-muted-foreground">
          {occupancyPct}% del aforo
        </p>
      </Metric>
      <Metric
        label="Ingresos cobrados"
        value={formatCurrency(metrics.revenue)}
      />
      <Metric label="Pendientes de pago" value={String(metrics.pending)} />
      <Metric label="Plazas libres" value={String(metrics.free)} />
    </MetricStrip>
  );
}
