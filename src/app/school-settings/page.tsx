'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function SchoolSettingsPage() {
  const [schoolName, setSchoolName] = useState('')
  const [schoolAddress, setSchoolAddress] = useState('')
  const [schoolDescription, setSchoolDescription] = useState('')
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userRole !== 'principal') {
      toast({
        title: "Error",
        description: "Only principals can modify school settings.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('school_settings')
        .upsert({ 
          id: 1, // Assuming there's only one school
          name: schoolName,
          address: schoolAddress,
          description: schoolDescription,
          updated_by: user?.id
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "School settings updated successfully.",
      })
    } catch (error) {
      console.error('Error updating school settings:', error)
      toast({
        title: "Error",
        description: "Failed to update school settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (userRole !== 'principal') {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">School Settings</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">School Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Update School Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolAddress">School Address</Label>
              <Input
                id="schoolAddress"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolDescription">School Description</Label>
              <Textarea
                id="schoolDescription"
                value={schoolDescription}
                onChange={(e) => setSchoolDescription(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Update Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

