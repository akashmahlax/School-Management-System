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

type Transaction = {
  id: string
  recipient_id: string
  amount: number
  type: string
  date: string
}

type Staff = {
  id: string
  name: string
  role: string
}

export default function FinancialManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState('salary')
  const [balance, setBalance] = useState(0)
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (userRole === 'principal') {
      fetchTransactions()
      fetchStaff()
      fetchSchoolBalance()
    }
  }, [userRole])

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data)
    }
  }

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username as name, role')
      .in('role', ['teacher', 'staff'])

    if (error) {
      console.error('Error fetching staff:', error)
    } else {
      setStaff(data)
    }
  }

  const fetchSchoolBalance = async () => {
    const { data, error } = await supabase
      .from('school_finances')
      .select('balance')
      .single()

    if (error) {
      console.error('Error fetching school balance:', error)
    } else {
      setBalance(data.balance)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userRole !== 'principal') {
      toast({
        title: "Error",
        description: "Only principals can make payments.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.rpc('make_payment', {
        recipient_id: selectedStaff,
        payment_amount: parseFloat(amount),
        payment_type: paymentType
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Payment sent successfully.",
      })
      fetchTransactions()
      fetchSchoolBalance()
      setSelectedStaff('')
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

  if (userRole !== 'principal') {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Financial Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>School Balance: ${balance.toFixed(2)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Recipient</Label>
              <Select onValueChange={setSelectedStaff} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
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
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select onValueChange={setPaymentType} defaultValue={paymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="reimbursement">Reimbursement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Send Payment</Button>
          </form>
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
                <TableHead>Recipient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{staff.find(s => s.id === transaction.recipient_id)?.name || 'Unknown'}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

