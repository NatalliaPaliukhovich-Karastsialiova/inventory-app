import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const normalize = (lng?: string) => (lng?.startsWith("ru") ? "ru" : "en");
  const [lang, setLang] = useState(normalize(i18n.language || (i18n as any).resolvedLanguage || "en"));

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");
    const next = normalize(savedLang || "en");
    if (!savedLang || normalize(savedLang) !== normalize(i18n.language)) {
      i18n.changeLanguage(next);
    }
    setLang(next);
  }, [i18n]);

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
    setLang(value);
    try { localStorage.setItem("i18nextLng", value); } catch {}
  };

  return (
    <Select onValueChange={handleChange} value={lang} >
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ru">Русский</SelectItem>
      </SelectContent>
  </Select>
  );
}
