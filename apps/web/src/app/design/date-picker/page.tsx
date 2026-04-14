'use client'

import { useState } from 'react'

import { Card } from '@/ui/card'
import { DatePicker } from '@/ui/date-picker'
import { Field, FieldLabel } from '@/ui/field'

export default function DatePickerPage() {
  const [controlled, setControlled] = useState('2025-01-15')

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Date Picker</h1>
        <p className="mt-2 text-foreground-muted">Calendar-based date selection component</p>
      </div>

      <Card className="p-6">
        <div className="grid max-w-md gap-6">
          <Field name="default">
            <FieldLabel>Default (Placeholder)</FieldLabel>
            <DatePicker placeholder="날짜를 선택하세요" />
          </Field>

          <Field name="controlled">
            <FieldLabel>Controlled</FieldLabel>
            <DatePicker value={controlled} onValueChange={setControlled} />
            <p className="mt-1 text-xs text-foreground-muted">Value: {controlled}</p>
          </Field>

          <Field name="with-default">
            <FieldLabel>Default Value</FieldLabel>
            <DatePicker defaultValue="2025-06-01" />
          </Field>

          <Field name="with-name">
            <FieldLabel>With Form Name</FieldLabel>
            <DatePicker name="eventDate" placeholder="Form submission ready" />
          </Field>

          <Field name="disabled">
            <FieldLabel>Disabled</FieldLabel>
            <DatePicker disabled defaultValue="2025-03-20" />
          </Field>
        </div>
      </Card>
    </div>
  )
}
