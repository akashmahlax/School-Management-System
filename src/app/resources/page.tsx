'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThumbsUp, MessageSquare, Share2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type Resource = {
  id: string
  title: string
  description: string
  url: string
  user_id: string
  created_at: string
  likes: number
  comments: Comment[]
}

type Comment = {
  id: string
  resource_id: string
  user_id: string
  content: string
  created_at: string
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          comments (
            id,
            resource_id,
            user_id,
            content,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setResources(data)
    } catch (error) {
      console.error('Error fetching resources:', error)
      setError('Failed to load resources. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath)

      const { error: insertError } = await supabase
        .from('resources')
        .insert({
          title,
          description,
          url: publicUrl,
          user_id: user.id
        })

      if (insertError) throw insertError

      setTitle('')
      setDescription('')
      setFile(null)
      fetchResources()
      toast({
        title: "Success",
        description: "Resource uploaded successfully",
      })
    } catch (error) {
      console.error('Error uploading resource:', error)
      toast({
        title: "Error",
        description: "Failed to upload resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleLike = async (resourceId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.rpc('increment_likes', { resource_id: resourceId })

      if (error) throw error

      fetchResources()
      toast({
        title: "Success",
        description: "Resource liked successfully",
      })
    } catch (error) {
      console.error('Error liking resource:', error)
      toast({
        title: "Error",
        description: "Failed to like resource. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleComment = async (resourceId: string) => {
    if (!user || !comment.trim()) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          resource_id: resourceId,
          user_id: user.id,
          content: comment
        })

      if (error) throw error

      setComment('')
      fetchResources()
      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = (resourceId: string) => {
    const resourceUrl = `${window.location.origin}/resources/${resourceId}`
    navigator.clipboard.writeText(resourceUrl)
    toast({
      title: "Success",
      description: "Resource link copied to clipboard!",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Resources</h1>
        <Card>
          <CardHeader>
            <CardTitle>Shared Resources</CardTitle>
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-6 p-4 border rounded">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex space-x-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Resources</h1>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Resources</h1>
      {userRole === 'staff' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Shared Resources</CardTitle>
        </CardHeader>
        <CardContent>
          {resources.map((resource) => (
            <div key={resource.id} className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold">
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {resource.title}
                </a>
              </h3>
              <p className="mt-2">{resource.description}</p>
              <div className="flex space-x-4 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleLike(resource.id)}>
                  <ThumbsUp className="mr-2 h-4 w-4" /> {resource.likes || 0}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare(resource.id)}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Comments</h4>
                {resource.comments && resource.comments.map((comment) => (
                  <div key={comment.id} className="mt-2">
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                  </div>
                ))}
                <div className="mt-2 flex space-x-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
                  <Button onClick={() => handleComment(resource.id)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

