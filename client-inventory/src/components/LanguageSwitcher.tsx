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
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");

    if (!savedLang) {
      i18n.changeLanguage("en");
      setLang("en");
    } else {
      setLang(savedLang);
    }
  }, [i18n]);

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
    setLang(value);
  };

  return (
    <Select onValueChange={handleChange} value={lang} >
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ru">Русский</SelectItem>
      </SelectContent>
  </Select>
  );
}
