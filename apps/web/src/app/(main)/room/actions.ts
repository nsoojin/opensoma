'use server'

import { performRoomReservation } from '@/lib/actions/reserve-room'

interface ReserveRoomState {
  error: string
  success: string
}

export async function reserveRoom(_prevState: ReserveRoomState, formData: FormData): Promise<ReserveRoomState> {
  const roomId = Number(formData.get('roomId'))
  const date = String(formData.get('date') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const attendees = String(formData.get('attendees') ?? '')
  const notes = String(formData.get('notes') ?? '').trim()
  const slots = String(formData.get('slots') ?? '')
    .split(',')
    .map((slot) => slot.trim())
    .filter(Boolean)

  return performRoomReservation({
    roomId,
    date,
    slots,
    title,
    attendees: attendees ? Number(attendees) : undefined,
    notes: notes || undefined,
  })
}
