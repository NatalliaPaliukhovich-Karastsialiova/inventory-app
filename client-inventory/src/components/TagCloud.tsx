import { useEffect, useState } from "react";
import { fetchTagCloud } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function TagCloud() {
  const [tags, setTags] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await fetchTagCloud();
      setTags(data);
    })();
  }, []);

  if (!tags.length) return null;

  const max = Math.max(...tags.map((t) => t.count));
  const min = Math.min(...tags.map((t) => t.count));

  function fontSizeFor(count: number) {
    if (max === min) return 18;
    const ratio = (count - min) / (max - min);
    return 12 + ratio * 20;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((t) => (
        <Badge
          key={t.id}
          style={{ fontSize: `${fontSizeFor(t.count)}px` }}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => navigate(`/search?q=tag:${encodeURIComponent(t.name)}`)}
        >
          {t.name}
        </Badge>
      ))}
    </div>
  );
}


