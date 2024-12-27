'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const studentData = [
  { grade: '9th', count: 120 },
  { grade: '10th', count: 150 },
  { grade: '11th', count: 130 },
  { grade: '12th', count: 100 },
]

const feeData = [
  { month: 'Jan', amount: 50000 },
  { month: 'Feb', amount: 55000 },
  { month: 'Mar', amount: 60000 },
  { month: 'Apr', amount: 58000 },
  { month: 'May', amount: 62000 },
  { month: 'Jun', amount: 65000 },
]

const staffDistribution = [
  { department: 'Teaching', count: 50 },
  { department: 'Administration', count: 20 },
  { department: 'Support', count: 15 },
  { department: 'Maintenance', count: 10 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Student Distribution by Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              count: {
                label: 'Student Count',
                color: 'hsl(var(--chart-1))',
              },
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentData}>
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Bar dataKey="count" fill="var(--color-count)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              amount: {
                label: 'Fee Amount',
                color: 'hsl(var(--chart-2))',
              },
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feeData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Staff Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              count: {
                label: 'Staff Count',
                color: 'hsl(var(--chart-3))',
              },
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staffDistribution}
                    dataKey="count"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="var(--color-count)"
                    label
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

