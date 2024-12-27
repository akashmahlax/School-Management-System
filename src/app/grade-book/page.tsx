'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'

type Student = {
  id: string
  name: string
}

type Grade = {
  id: string
  student_id: string
  course_id: string
  grade: number
}

export default function GradeBookPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [courseId, setCourseId] = useState('')
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (userRole === 'teacher') {
      fetchStudents()
      fetchGrades()
    }
  }, [userRole])

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username as name')
      .eq('role', 'student')

    if (error) {
      console.error('Error fetching students:', error)
    } else {
      setStudents(data)
    }
  }

  const fetchGrades = async () => {
    if (!courseId) return

    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('course_id', courseId)

    if (error) {
      console.error('Error fetching grades:', error)
    } else {
      setGrades(data)
    }
  }

  const handleGradeChange = (studentId: string, newGrade: number) => {
    setGrades(prevGrades => 
      prevGrades.map(grade => 
        grade.student_id === studentId ? { ...grade, grade: newGrade } : grade
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userRole !== 'teacher') {
      toast({
        title: "Error",
        description: "Only teachers can modify grades.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('grades')
        .upsert(grades.map(grade => ({
          id: grade.id,
          student_id: grade.student_id,
          course_id: courseId,
          grade: grade.grade,
          updated_by: user?.id
        })))

      if (error) throw error

      toast({
        title: "Success",
        description: "Grades updated successfully.",
      })
    } catch (error) {
      console.error('Error updating grades:', error)
      toast({
        title: "Error",
        description: "Failed to update grades. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (userRole !== 'teacher') {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Grade Book</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Grade Book</h1>
      <Card>
        <CardHeader>
          <CardTitle>Enter Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Course ID</Label>
              <Input
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              />
            </div>
            <Button type="button" onClick={fetchGrades}>Load Grades</Button>
            {grades.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => {
                      const studentGrade = grades.find(g => g.student_id === student.id)
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={studentGrade?.grade || ''}
                              onChange={(e) => handleGradeChange(student.id, Number(e.target.value))}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <Button type="submit">Save Grades</Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

