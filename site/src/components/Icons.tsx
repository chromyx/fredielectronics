import React from 'react'
import type { Settings } from '@/lib/getHomeData'

export function Icon({ id }: { id: string }) {
  return <svg aria-hidden="true"><use href={`#${id}`} /></svg>
}

// One inline sprite; icons reference it with <use>.
export function IconSprite() {
  const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="i-arrow" viewBox="0 0 24 24" {...line} strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
      <symbol id="i-out" viewBox="0 0 24 24" {...line} strokeWidth={2.2}><path d="M7 17 17 7M8 7h9v9" /></symbol>
      <symbol id="i-phone" viewBox="0 0 24 24" {...line}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" /></symbol>
      <symbol id="i-mail" viewBox="0 0 24 24" {...line}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></symbol>
      <symbol id="i-pin" viewBox="0 0 24 24" {...line}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></symbol>
      <symbol id="i-ig" viewBox="0 0 24 24" {...line}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></symbol>
      <symbol id="i-fb" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21Z" /></symbol>
      <symbol id="i-in" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2 3.77-2 4.03 0 4.77 2.6 4.77 6V21h-4v-5c0-1.2 0-2.75-1.7-2.75s-1.95 1.3-1.95 2.65V21h-4Z" /></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24" {...line}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></symbol>
      <symbol id="i-wa" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" /></symbol>
    </svg>
  )
}

/** Instagram, Facebook and LinkedIn icon links (used in the top bar and the contact section). */
export function Socials({ settings, className }: { settings: Pick<Settings, 'instagram' | 'facebook' | 'linkedin'>; className?: string }) {
  const links: [string, string, string][] = [
    ...(settings.instagram ? [[`https://instagram.com/${settings.instagram}`, 'i-ig', 'Instagram'] as [string, string, string]] : []),
    ...(settings.facebook ? [[settings.facebook, 'i-fb', 'Facebook'] as [string, string, string]] : []),
    ...(settings.linkedin ? [[settings.linkedin, 'i-in', 'LinkedIn'] as [string, string, string]] : []),
  ]
  return (
    <span className={`socials ${className || ''}`}>
      {links.map(([href, icon, label]) => <a key={label} href={href} target="_blank" rel="noopener" aria-label={label} title={label}><Icon id={icon} /></a>)}
    </span>
  )
}
