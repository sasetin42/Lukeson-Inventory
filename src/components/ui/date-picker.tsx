"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    toDate?: Date;
    fromDate?: Date;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ date, setDate, toDate, fromDate, disabled, placeholder = "Pick a date", className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelectDay = (selectedDay: Date | undefined) => {
    if (selectedDay && !isNaN(selectedDay.getTime())) {
      setDate(selectedDay);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 py-2 bg-background border-input hover:bg-accent hover:text-accent-foreground",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          {date && !isNaN(date.getTime()) ? (
            <span className="truncate">{format(date, "PPP")}</span>
          ) : (
            <span className="text-muted-foreground truncate">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[99999]"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date && !isNaN(date.getTime()) ? date : undefined}
          onSelect={handleSelectDay}
          onDayClick={handleSelectDay}
          toDate={toDate}
          fromDate={fromDate}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
