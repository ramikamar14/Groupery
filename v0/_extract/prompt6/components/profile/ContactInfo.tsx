'use client'

import { Mail, Phone, Globe, Languages, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContactInfoProps {
  email: string
  phone: string
  phoneVerified: boolean
  country: string
  language: string
  onVerifyPhone: () => void
}

interface InfoRowProps {
  icon: React.ElementType
  label: string
  value: string
  badge?: React.ReactNode
}

function InfoRow({ icon: Icon, label, value, badge }: InfoRowProps) {
  return (
    <div className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 border border-border hover:border-accent/30 transition-colors">
      <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg shrink-0">
        <Icon className="w-4 h-4 text-primary dark:text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground truncate">{value}</div>
      </div>
      {badge}
    </div>
  )
}

export function ContactInfo({ email, phone, phoneVerified, country, language, onVerifyPhone }: ContactInfoProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow icon={Mail} label="Email" value={email} />
        <InfoRow
          icon={Phone}
          label="Phone"
          value={phone}
          badge={
            <div className="flex items-center gap-2 shrink-0">
              {phoneVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-3 h-3" />
                    Unverified
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onVerifyPhone}
                    className="h-6 text-[10px] px-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    Verify
                  </Button>
                </div>
              )}
            </div>
          }
        />
        <InfoRow icon={Globe} label="Country" value={country} />
        <InfoRow icon={Languages} label="Language" value={language} />
      </CardContent>
    </Card>
  )
}
