import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function sendingEmailSimulator({ to, subject, text }: { to: string, subject: string, text: string }) {
  console.log(`
    Simulating sending email
    To: ${to}

    Subject: ${subject}
    ${text}
    `)
}

export function sendEmail({ to, subject, text }: { to: string, subject: string, text: string }) {
  sendingEmailSimulator({to, subject, text})
}