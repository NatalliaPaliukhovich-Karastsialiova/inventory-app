import { useEffect, useState } from "react";
import { fetchInventoryStats, fetchInventoryById, fetchItems } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, Area, AreaChart, ResponsiveContainer, Cell } from "recharts";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function InventoryStats({ inventoryId }: { inventoryId: string }) {
  const [stats, setStats] = useState<any>(null);
  const [fields, setFields] = useState<Array<{ id: string; label: string; type: string }>>([]);
  const [exporting, setExporting] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const s = await fetchInventoryStats(inventoryId);
      setStats(s);
      try {
        const inv = await fetchInventoryById(inventoryId);
        const invFields = (inv as any)?.inventoryField ?? [];
        setFields(invFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type })));
      } catch {}
    })();
  }, [inventoryId]);

  if (!stats) return null;

  const booleanFields = stats.perField.filter((f: any) => f.type === 'boolean');
  const numberFields = stats.perField.filter((f: any) => f.type === 'number');
  const textFields = stats.perField.filter((f: any) => f.type !== 'number' && f.type !== 'boolean');

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 min-w-0 items-stretch">
      <Card className="bg-muted/50 flex-1">
        <CardHeader>
          <CardTitle>{t('pieChart.totalItems') || 'Total items'}</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats.totalItems}</CardContent>
      </Card>

      <Card className="bg-muted/50 flex-1">
        <CardHeader>
          <CardTitle>{t('statistics.exportTitle') || 'Export'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () => {
              try {
                setExporting(true);
                const items = await fetchItems(inventoryId);
                const staticHeaders = [
                  'id',
                  'customId',
                  'createdAt',
                  'updatedAt'
                ];
                const dynamicHeaders = fields.map((f) => f.label);
                const headerRow = [...staticHeaders, ...dynamicHeaders];

                const rows = items.map((it: any) => {
                  const valuesMap = new Map<string, string>();
                  for (const fv of it.fieldValues || []) {
                    valuesMap.set(fv.field.id, fv.value ?? '');
                  }
                  const dynamicValues = fields.map((f) => {
                    const v = valuesMap.get(f.id) ?? '';
                    return typeof v === 'string' ? v : String(v);
                  });
                  return [
                    it.id,
                    it.customId ?? '',
                    it.createdAt ?? '',
                    it.updatedAt ?? '',
                    ...dynamicValues,
                  ];
                });

                function escapeCsv(val: any) {
                  const s = val == null ? '' : String(val);
                  if (/[",\n]/.test(s)) {
                    return '"' + s.replace(/"/g, '""') + '"';
                  }
                  return s;
                }

                const csv = [headerRow, ...rows]
                  .map((row) => row.map(escapeCsv).join(','))
                  .join('\n');
                const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `inventory-${inventoryId}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
          >
            {exporting ? t('statistics.exporting') : t('statistics.exportCsv')}
          </Button>
        </CardContent>
      </Card>

      {Array.isArray(stats.itemsByDate) && stats.itemsByDate.length > 0 && (
        <Card className="bg-muted/50 md:col-span-2 flex-1">
          <CardHeader>
            <CardTitle>{t('statistics.itemsByCreationDate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-64">
              <ResponsiveContainer>
                <AreaChart data={stats.itemsByDate}>
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-blue-500)" fill="var(--color-blue-300)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {numberFields.length > 0 && (
        <Card className="bg-muted/50 md:col-span-2 flex-1">
          <CardHeader>
            <CardTitle>{t('statistics.numericRanges')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden md:grid grid-cols-5 gap-4 text-sm font-bold border-b pb-2 mb-2">
              <div>{t('common.field')}</div>
              <div>{t('common.count')}</div>
              <div>{t('common.average')}</div>
              <div>{t('common.min')}</div>
              <div>{t('common.max')}</div>
            </div>

            <div className="space-y-2">
              {numberFields.map((f: any) => (
                <div
                  key={f.fieldId}
                  className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 text-sm p-2 border rounded-lg"
                >
                  <div className="flex md:block justify-between">
                    <span className="font-bold md:hidden">{t('common.field')}:</span>
                    <span>{f.label}</span>
                  </div>
                  <div className="flex md:block justify-between">
                    <span className="font-bold md:hidden">{t('common.count')}:</span>
                    <span>{f.stats.count}</span>
                  </div>
                  <div className="flex md:block justify-between">
                    <span className="font-bold md:hidden">{t('common.average')}:</span>
                    <span>{f.stats.avg ?? '—'}</span>
                  </div>
                  <div className="flex md:block justify-between">
                    <span className="font-bold md:hidden">{t('common.min')}:</span>
                    <span>{f.stats.min ?? '—'}</span>
                  </div>
                  <div className="flex md:block justify-between">
                    <span className="font-bold md:hidden">{t('common.max')}:</span>
                    <span>{f.stats.max ?? '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {booleanFields.map((f: any) => (
        <Card key={f.fieldId} className="bg-muted/50 flex-1">
          <CardHeader>
            <CardTitle>{f.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie dataKey="value" nameKey="name" data={[{ name: 'true', value: f.stats.true }, { name: 'false', value: f.stats.false }]}>
                    <Cell fill="var(--color-blue-500)" />
                    <Cell fill="var(--color-blue-300)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>True: {f.stats.true} ({(f.stats.true / (f.stats.true + f.stats.false) * 100).toFixed(1)}%)</div>
              <div>False: {f.stats.false} ({(f.stats.false / (f.stats.true + f.stats.false) * 100).toFixed(1)}%)</div>
            </div>
          </CardContent>
        </Card>
      ))}

      {numberFields.map((f: any) => (
        <Card key={f.fieldId} className="bg-muted/50 flex-1">
          <CardHeader>
            <CardTitle>{f.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-56">
              <ResponsiveContainer>
                <AreaChart data={f.stats.histogram}>
                  <XAxis dataKey="bucket" hide />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-blue-500)" fill="var(--color-blue-300)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ))}

      {textFields.map((f: any) => (
        <Card key={f.fieldId} className="bg-muted/50 flex-1">
          <CardHeader>
            <CardTitle>{f.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-64">
              <ResponsiveContainer>
                <BarChart data={f.stats.topValues}>
                  <XAxis dataKey="value" tickFormatter={(value) => (typeof value === 'string' && value.length > 15 ? value.substring(0, 15) + '...' : value)} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-blue-500)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="text-xs text-muted-foreground mt-2">
              {t('statistics.topValuesByFrequency')}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


