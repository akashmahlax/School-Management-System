'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Teacher = {
  id: string
  name: string
  subject: string
  qualifications: string
  yearsOfExperience: number
}

type Transaction = {
  id: string
  recipient_id: string
  amount: number
  type: string
  date: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [amount, setAmount] = useState('')
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchTeachers()
    if (userRole === 'teacher') {
      fetchTransactions()
    }
  }, [userRole])

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

  const fetchTransactions = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('recipient_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userRole !== 'teacher') {
      toast({
        title: "Error",
        description: "Only teachers can send payments.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.rpc('make_payment', {
        recipient_id: selectedTeacher,
        payment_amount: parseFloat(amount),
        payment_type: 'transfer'
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Payment sent successfully.",
      })
      fetchTransactions()
      setSelectedTeacher('')
      setAmount('')
    } catch (error) {
      console.error('Error making payment:', error)
      toast({
        title: "Error",
        description: "Failed to send payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderPaymentAnalytics = () => {
    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', { month: 'long' })
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += transaction.amount
      return acc
    }, {} as Record<string, number>)

    const chartData = Object.entries(monthlyData).map(([month, total]) => ({
      month,
      total
    }))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Teachers</h1>
      {userRole === 'principal' && (
        <Card>
          <CardHeader>
            <CardTitle>Teacher List</CardTitle>
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
      )}
      {userRole === 'teacher' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Send Payment to Another Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher">Recipient</Label>
                  <Select onValueChange={setSelectedTeacher} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.filter(t => t.id !== user?.id).map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Send Payment</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {renderPaymentAnalytics()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

