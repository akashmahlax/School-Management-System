'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Teacher = {
  id: string
  name: string
  subject: string
  qualifications: string
  yearsOfExperience: number
}

export default function TeacherQualificationsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const { userRole } = useAuth()

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')

    if (error) {
      console.error('Error fetching teachers:', error)
    } else {
      setTeachers(data)
    }
  }

  if (userRole !== 'student') {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Teacher Qualifications</h1>
        <p>This page is only accessible to students.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Teacher Qualifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>Our Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Qualifications</TableHead>
                <TableHead>Years of Experience</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.subject}</TableCell>
                  <TableCell>{teacher.qualifications}</TableCell>
                  <TableCell>{teacher.yearsOfExperience}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

