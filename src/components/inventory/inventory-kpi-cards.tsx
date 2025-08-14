import KpiCard from "@/components/kpi-card";
import { inventoryKpis } from "@/lib/data";

export default function InventoryKpiCards() {
  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
      {inventoryKpis.map((kpi, index) => (
        <KpiCard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color}
          subtext={kpi.subtext}
          style={{ animationDelay: `${index * 100}ms` }}
          className="fade-in-up"
        />
      ))}
    </div>
  );
}
