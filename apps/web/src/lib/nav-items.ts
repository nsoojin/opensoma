import type { Icon } from '@phosphor-icons/react'
import { CalendarBlank, ChalkboardTeacher, Megaphone, Newspaper, Users } from '@phosphor-icons/react'

export const navItems: Array<{ href: string; label: string; icon: Icon }> = [
  { href: '/mentoring', label: '멘토링/특강', icon: ChalkboardTeacher },
  { href: '/room', label: '회의실', icon: CalendarBlank },
  { href: '/team', label: '팀매칭', icon: Users },
  { href: '/notice', label: '공지사항', icon: Megaphone },
  { href: '/event', label: '행사', icon: Newspaper },
]
