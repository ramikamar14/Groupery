'use client'

import { useState } from 'react'
import { Shield, Upload, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VerifyIdentityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UploadZoneProps {
  label: string
  description: string
  uploaded: boolean
  onUpload: () => void
}

function UploadZone({ label, description, uploaded, onUpload }: UploadZoneProps) {
  return (
    <button
      onClick={onUpload}
      className={cn(
        'w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all text-center',
        uploaded
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border hover:border-accent/50 hover:bg-muted/50 text-muted-foreground'
      )}
    >
      {uploaded ? (
        <CheckCircle className="w-8 h-8 text-accent" />
      ) : (
        <Upload className="w-8 h-8" />
      )}
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      {!uploaded && (
        <span className="text-xs font-medium text-accent mt-1">Click to upload</span>
      )}
      {uploaded && (
        <span className="text-xs font-medium text-accent">Uploaded ✓</span>
      )}
    </button>
  )
}

export function VerifyIdentityDialog({ open, onOpenChange }: VerifyIdentityDialogProps) {
  const [idUploaded, setIdUploaded] = useState(false)
  const [selfieUploaded, setSelfieUploaded] = useState(false)

  const canSubmit = idUploaded && selfieUploaded

  const handleSubmit = () => {
    if (canSubmit) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="w-5 h-5 text-accent" />
            Verify Your Identity
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload a government-issued ID and a selfie to get verified. Verified users build more trust and convert better on their listings.
          </p>

          <div className="space-y-3">
            <UploadZone
              label="Government-issued ID"
              description="Passport, National ID or Driver's License"
              uploaded={idUploaded}
              onUpload={() => setIdUploaded(v => !v)}
            />
            <UploadZone
              label="Selfie with ID"
              description="Hold your ID next to your face clearly"
              uploaded={selfieUploaded}
              onUpload={() => setSelfieUploaded(v => !v)}
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            Your documents are encrypted and stored securely. We never share your personal information with third parties.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-40"
          >
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
