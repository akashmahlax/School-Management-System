'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Announcement = {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching announcements:', error)
    } else {
      setAnnouncements(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        user_id: user.id
      })

    if (error) {
      console.error('Error creating announcement:', error)
      return
    }

    setTitle('')
    setContent('')
    fetchAnnouncements()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Announcements</h1>
      {user && user.user_metadata.role === 'staff' && (
        <Card>
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Create Announcement</Button>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.map((announcement) => (
            <div key={announcement.id} className="mb-4">
              <h3 className="text-lg font-semibold">{announcement.title}</h3>
              <p className="text-sm text-gray-500">{new Date(announcement.created_at).toLocaleString()}</p>
              <p className="mt-2">{announcement.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

