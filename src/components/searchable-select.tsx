"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command as CommandPrimitive } from "cmdk"

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedLabel = React.useMemo(
    () => options.find((opt) => opt.value === value)?.label,
    [value, options]
  )

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) {
      setSearchQuery(selectedLabel || "")
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery("")
    }
  }, [open, selectedLabel])

  return (
    <div className={cn("relative w-full", className)}>
      <CommandPrimitive className="w-full bg-transparent" shouldFilter={true}>
        <div 
          className="flex w-full items-center justify-between bg-white/[0.05] border-white/10 border text-white rounded-xl h-11 px-3 transition-all focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500/60 cursor-text hover:bg-white/[0.08]"
          onClick={() => inputRef.current?.focus()}
        >
          <CommandPrimitive.Input
            ref={inputRef}
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder={selectedLabel || placeholder}
            className="flex-1 bg-transparent outline-none placeholder:text-white/50 text-sm text-white"
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
        
        {open && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50 bg-[#0f1322] border border-white/10 text-white rounded-xl overflow-hidden shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
            <CommandPrimitive.List className="max-h-64 overflow-y-auto custom-scrollbar p-1">
              <CommandPrimitive.Empty className="py-6 text-center text-sm text-white/50">
                No results found.
              </CommandPrimitive.Empty>
              <CommandPrimitive.Group>
                {options.map((opt) => (
                  <CommandPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    keywords={[opt.label]}
                    onSelect={(currentValue) => {
                      // cmdk passes the selected value in lowercase. Let's find the original.
                      const originalValue = options.find(o => o.value.toLowerCase() === currentValue || o.value === currentValue)?.value || currentValue;
                      onChange(originalValue === value ? "" : originalValue)
                      setOpen(false)
                    }}
                    className="text-sm text-white aria-selected:bg-white/10 aria-selected:text-white data-[disabled]:opacity-50 cursor-pointer rounded-md my-0.5 px-2 py-1.5 flex items-center outline-none select-none"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-violet-400",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            </CommandPrimitive.List>
          </div>
        )}
      </CommandPrimitive>
    </div>
  )
}
