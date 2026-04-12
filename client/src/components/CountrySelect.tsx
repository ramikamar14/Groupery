import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@shared/countries";
import { useTranslation } from "react-i18next";

interface CountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export function CountrySelect({ value, onValueChange, placeholder, className, "data-testid": testId }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const selectedCountry = useMemo(() => COUNTRIES.find(c => c.value === value), [value]);

  const getLabel = (c: typeof COUNTRIES[0]) => isArabic && c.labelAr ? c.labelAr : c.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
          data-testid={testId}
        >
          <span className="flex items-center gap-2 truncate">
            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            {selectedCountry ? getLabel(selectedCountry) : (placeholder ?? "Select country…")}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country…" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.labelAr ?? ""} ${country.value}`}
                  onSelect={() => {
                    onValueChange(country.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === country.value ? "opacity-100" : "opacity-0")} />
                  {getLabel(country)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
