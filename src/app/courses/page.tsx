import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const coursesData = [
  { id: 1, name: 'Mathematics 101', teacher: 'Alice Johnson', students: 30 },
  { id: 2, name: 'Science 202', teacher: 'Bob Smith', students: 25 },
  { id: 3, name: 'English Literature', teacher: 'Carol Williams', students: 28 },
]

export default function CoursesPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button>Add Course</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Name</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Number of Students</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coursesData.map((course) => (
            <TableRow key={course.id}>
              <TableCell>{course.name}</TableCell>
              <TableCell>{course.teacher}</TableCell>
              <TableCell>{course.students}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

