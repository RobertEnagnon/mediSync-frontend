"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

interface TimeInputProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function TimeInput({ value, onChange, className }: TimeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <Input
      type="time"
      value={value}
      onChange={handleChange}
      className={className}
    />
  )
}
