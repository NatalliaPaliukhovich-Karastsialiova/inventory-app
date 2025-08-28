import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useSearchParams, Link } from "react-router-dom";
import { searchAll } from "@/services/api";
import { useTranslation } from "react-i18next";
import rehypeSanitize from "rehype-sanitize";
import ReactMarkdown from "react-markdown";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Heart, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [params] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ inventories: any[]; items: any[] }>({
    inventories: [],
    items: []
  });
  const { t } = useTranslation();

  const highlightQuery = useMemo(() => {
    const raw = initialQ || "";
    if (raw.startsWith("tag:")) return (raw.slice(4).trim() || "");
    return raw.trim();
  }, [initialQ]);

  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlightText(text: string, q: string) {
    if (!q) return text;
    try {
      const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
      const parts = text.split(re);
      return parts.map((part, idx) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={idx} className="bg-yellow-200 px-0.5 rounded-sm">
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      );
    } catch {
      return text;
    }
  }

  async function runSearch(search: string) {
    if (!search.trim()) {
      setResults({ inventories: [], items: [] });
      return;
    }
    setLoading(true);
    try {
      const data = await searchAll(search);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(initialQ);
  }, [initialQ]);

  return (
    <DashboardLayout>
      <div className="container mx-auto pt-1 space-y-4">
        <div className="flex items-center gap-2">
          <Label className="shrink-0">
            {t("search.resultsFor")}:{" "}
            <span className="font-bold">{initialQ}</span>
          </Label>
        </div>
        <Separator orientation="horizontal" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <ul className="space-y-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <li key={idx} className="p-3 rounded-md border flex items-center gap-2">
                    <Skeleton className="h-5 w-48" />
                    <Loader2 className="animate-spin" />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <ul className="space-y-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <li key={idx} className="p-3 rounded-md border flex items-center gap-2">
                    <Skeleton className="h-5 w-56" />
                    <Loader2 className="animate-spin" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                {t("search.inventories")}
              </h2>
              <ul className="space-y-2">
                {results.inventories.map((inv) => (
                  <li key={inv.id} className="p-3 rounded-md border">
                    <Link to={`/inventories/${inv.id}`} className="font-medium">
                      {highlightText(inv.title, highlightQuery)}
                    </Link>
                    {inv.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        <div className="prose prose-sm prose-stone dark:prose-invert max-w-none p-4 border rounded-md bg-muted/30 overflow-y-auto max-h-[200px]">
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                            {inv.description}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                {!results.inventories.length && (
                  <p className="text-sm">{t("search.noResults")}</p>
                )}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">
                {t("search.items")}
              </h2>
              <ul className="space-y-2">
                {results.items.map((it) => (
                  <li key={it.id} className="p-3 rounded-md border">
                    <Link
                      to={`/inventories/${it.inventoryId}/items/${it.id}`}
                      className="font-medium"
                    >
                      {highlightText(String(it.customId || it.id), highlightQuery)}
                    </Link>
                    {typeof it._count.likes !== "undefined" && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        {it._count.likes}
                      </p>
                    )}
                  </li>
                ))}
                {!results.items.length && (
                  <p className="text-sm">{t("search.noResults")}</p>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
