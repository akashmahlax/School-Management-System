'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Home, Users, GraduationCap, BookOpen, UserPlus, CreditCard, Briefcase, BarChart, LogIn, LogOut, FileText, Bell, UserCircle, Film, Clipboard, Settings, DollarSign, TrendingUp, Award } from 'lucide-react'


import { UserPen } from 'lucide-react';

const Sidebar = () => {
  const { user, userRole, signOut } = useAuth()

  return (
    <div className="w-64 bg-gray-100 h-full p-4">
      <h1 className="text-2xl font-bold mb-8">School Manager</h1>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          {user && (
            <>
              {(userRole === 'staff' || userRole === 'principal' || userRole === 'teacher') && (
                <>
                  <li>
                    <Link href="/students" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <Users size={20} />
                      <span>Students</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/teachers" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <GraduationCap size={20} />
                      <span>Teachers</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <BookOpen size={20} />
                      <span>Courses</span>
                    </Link>
                  </li>
                </>
              )}
              {(userRole === 'staff' || userRole === 'principal') && (
                <>
                  <li>
                    <Link href="/admissions" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <UserPlus size={20} />
                      <span>Admissions</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/fees" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <CreditCard size={20} />
                      <span>Fees</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/staff" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <Briefcase size={20} />
                      <span>Staff</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/analytics" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <BarChart size={20} />
                      <span>Analytics</span>
                    </Link>
                  </li>
                </>
              )}
              {userRole === 'principal' && (
                <>
                  <li>
                    <Link href="/school-settings" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <Settings size={20} />
                      <span>School Settings</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/financial-management" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <DollarSign size={20} />
                      <span>Financial Management</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/performance-evaluation" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                      <TrendingUp size={20} />
                      <span>Performance Evaluation</span>
                    </Link>
                  </li>
                </>
              )}
              {userRole === 'teacher' && (
                <li>
                  <Link href="/grade-book" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                    <Clipboard size={20} />
                    <span>Grade Book</span>
                  </Link>
                </li>
              )}
              {userRole === 'student' && (
                <li>
                  <Link href="/teacher-qualifications" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                    <Award size={20} />
                    <span>Teacher Qualifications</span>
                  </Link>
                </li>
              )}
              <li>
                <Link href={`/profile/${user.id}`} className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                  <UserCircle size={20} />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link href="/stories" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                  <Film size={20} />
                  <span>Stories</span>
                </Link>
              </li>
              <li>
                <Link href="/resources" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                  <FileText size={20} />
                  <span>Resources</span>
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                  <Bell size={20} />
                  <span>Announcements</span>
                </Link>
              </li>
            </>
          )}
          {!user ? (
            <>
            <li>
              <Link href="/login" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                <LogIn size={20} />
                <span>Login</span>
              </Link>
            </li>
             <li>
             <Link href="/signup" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
               <UserPen size={20} />
               <span>Sign Up</span>
             </Link>
           </li>
           </>
          ) : (
            <li>
              <button onClick={signOut} className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded w-full">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar

