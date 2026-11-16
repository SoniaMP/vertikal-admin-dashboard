import type { SeasonMetrics } from "@/lib/admin-queries";
import { MEMBERSHIP_STATUS } from "@/types";
import { MetricStrip } from "./metric-strip";
import { Metric } from "./metric";
import { ShareBar } from "./share-bar";

type Props = {
  metrics: SeasonMetrics;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * The season in four figures. Only the federated share is drawn in colour:
 * it is the one proportion here, and federating is the club's own choice.
 */
export function SeasonMetricsCards({ metrics }: Props) {
  const activeCount = metrics.byStatus[MEMBERSHIP_STATUS.ACTIVE] ?? 0;
  const federatedPct =
    metrics.totalMembers > 0
      ? Math.round((metrics.federatedCount / metrics.totalMembers) * 100)
      : 0;

  return (
    <MetricStrip>
      <Metric label="Socios" value={String(metrics.totalMembers)} />
      <Metric
        label="Ingresos cobrados"
        value={formatCurrency(metrics.totalRevenue)}
      />
      <Metric label="Activos" value={String(activeCount)} />
      <Metric
        label="Federados"
        value={String(metrics.federatedCount)}
        suffix={`de ${metrics.totalMembers}`}
      >
        <ShareBar percent={federatedPct} />
        <p className="mt-1 text-xs text-muted-foreground">
          {federatedPct}% federados
        </p>
      </Metric>
    </MetricStrip>
  );
}
