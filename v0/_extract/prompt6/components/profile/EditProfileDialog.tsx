'use client'

import { useState } from 'react'
import { Edit } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EditProfileDialogProps {
  user: {
    firstName: string
    lastName: string
    city: string
    bio: string
    country: string
    language: string
  }
  onSave?: (data: EditProfileDialogProps['user']) => void
}

export function EditProfileDialog({ user, onSave }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ ...user })

  const handleSave = () => {
    onSave?.(form)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-border hover:border-accent hover:text-accent transition-colors">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                First Name
              </Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              City
            </Label>
            <Input
              id="city"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="h-9"
              placeholder="e.g. Dubai"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              className="resize-none"
              rows={3}
              placeholder="Tell the community a bit about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Country</Label>
              <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Saudi Arabia', 'UAE', 'Kuwait', 'Egypt', 'Jordan', 'Lebanon', 'Qatar', 'Bahrain', 'Oman'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Language</Label>
              <Select value={form.language} onValueChange={v => setForm(f => ({ ...f, language: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Arabic', 'English', 'French', 'Turkish', 'Urdu'].map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-accent-foreground">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
