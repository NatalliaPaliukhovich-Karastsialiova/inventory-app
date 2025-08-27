import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function GlobalSearch() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="w-full max-w-xl">
      <Input
        ref={ref}
        placeholder={t("search.placeholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) {
            nav(`/search?q=${encodeURIComponent(q.trim())}`);
          }
        }}
      />
    </div>
  );
}


