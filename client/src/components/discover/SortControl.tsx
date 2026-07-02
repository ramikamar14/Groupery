import { useTranslation } from "react-i18next";
import { ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ListingSort } from "./sortListings";

interface Props {
  value: ListingSort;
  onChange: (value: ListingSort) => void;
}

/** Compact sort dropdown for listing grids. */
export function SortControl({ value, onChange }: Props) {
  const { t } = useTranslation();

  const options: { value: ListingSort; label: string }[] = [
    { value: "newest", label: t("discover.sortNewest", "Newest") },
    { value: "endingSoon", label: t("discover.sortEndingSoon", "Ending soon") },
    { value: "almostFull", label: t("discover.sortAlmostFull", "Almost full") },
    { value: "biggestSavings", label: t("discover.sortBiggestSavings", "Biggest savings") },
  ];

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ListingSort)}>
      <SelectTrigger
        className="w-auto h-9 gap-1.5 rounded-full text-xs font-semibold px-3.5"
        aria-label={t("discover.sortBy", "Sort deals by")}
        data-testid="select-sort"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden />
        <SelectValue placeholder={t("discover.sortBy", "Sort deals by")} />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} data-testid={`sort-option-${opt.value}`}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
