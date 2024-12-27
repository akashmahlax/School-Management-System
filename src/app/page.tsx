'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, BookOpen, CreditCard } from 'lucide-react'
import Link from 'next/link'
import './globals.css'
export default function Dashboard() {
  const { user, userRole } = useAuth()
  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    courseCount: 0,
    feeCollection: 0,
  })

  useEffect(() => { 
    if (userRole === 'staff') {
      fetchStats()
    }
  }, [userRole])

  const fetchStats = async () => {
    const { data: studentCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'student')

    const { data: teacherCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'teacher')

    const { data: courseCount } = await supabase
      .from('courses')
      .select('id', { count: 'exact' })

    const { data: feeCollection } = await supabase
      .from('fees')
      .select('amount')

    setStats({
      studentCount: studentCount?.length || 0,
      teacherCount: teacherCount?.length || 0,
      courseCount: courseCount?.length || 0,
      feeCollection: feeCollection ? feeCollection.reduce((sum, fee) => sum + fee.amount, 0) : 0,
    })
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Welcome to School Management System</h1>
        <p>Please log in to access the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {userRole === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center jusctify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <GraduationCap size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teacherCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.courseCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
              <CreditCard size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.feeCollection.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {userRole === 'staff' && (
              <>
                <Link href="/admissions">
                  <Button className="w-full">New Admission</Button>
                </Link>
                <Link href="/fees">
                  <Button className="w-full">Manage Fees</Button>
                </Link>
              </>
            )}
            {userRole === 'student' && (
              <>
                <Link href="/courses">
                  <Button className="w-full">View Courses</Button>
                </Link>
                <Link href="/resources">
                  <Button className="w-full">Access Resources</Button>
                </Link>
              </>
            )}
            <Link href="/stories">
              <Button className="w-full">View Stories</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {userRole === 'staff' ? (
                <>
                  <li>New student admitted: John Doe</li>
                  <li>Fee payment received: $500</li>
                  <li>New staff added: Jane Smith</li>
                  <li>Course schedule updated: Mathematics 101</li>
                </>
              ) : (
                <>
                  <li>New assignment posted: English Literature</li>
                  <li>Upcoming exam: Physics on 15th May</li>
                  <li>New resource uploaded: Chemistry notes</li>
                  <li>School event announced: Annual Sports Day</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

