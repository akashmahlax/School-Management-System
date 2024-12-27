'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

type Evaluation = {
  id: string
  user_id: string
  evaluator_id: string
  score: number
  comments: string
  date: string
}

type User = {
  id: string
  name: string
  role: string
}

export default function PerformanceEvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [score, setScore] = useState('')
  const [comments, setComments] = useState('')
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (userRole === 'principal') {
      fetchEvaluations()
      fetchUsers()
    }
  }, [userRole])

  const fetchEvaluations = async () => {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching evaluations:', error)
    } else {
      setEvaluations(data)
    }
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username as name, role')
      .in('role', ['teacher', 'student'])

    if (error) {
      console.error('Error fetching users:', error)
    } else {
      setUsers(data)
    }
  }

  const handleEvaluation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userRole !== 'principal') {
      toast({
        title: "Error",
        description: "Only principals can submit evaluations.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('evaluations')
        .insert({
          user_id: selectedUser,
          evaluator_id: user?.id,
          score: parseFloat(score),
          comments,
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Evaluation submitted successfully.",
      })
      fetchEvaluations()
      setSelectedUser('')
      setScore('')
      setComments('')
    } catch (error) {
      console.error('Error submitting evaluation:', error)
      toast({
        title: "Error",
        description: "Failed to submit evaluation. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (userRole !== 'principal') {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Performance Evaluation</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Performance Evaluation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Submit Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEvaluation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Select onValueChange={setSelectedUser} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Score (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Submit Evaluation</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell>{new Date(evaluation.date).toLocaleDateString()}</TableCell>
                  <TableCell>{users.find(u => u.id === evaluation.user_id)?.name || 'Unknown'}</TableCell>
                  <TableCell>{evaluation.score}</TableCell>
                  <TableCell>{evaluation.comments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

