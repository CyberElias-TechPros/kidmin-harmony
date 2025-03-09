
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  Calendar as CalendarIcon, 
  QrCode, 
  UserCheck, 
  CheckCircle2,
  Search, 
  Filter,
  Download 
} from 'lucide-react';
import { format } from 'date-fns';

// Mock attendance data
const mockAttendance = [
  {
    id: '1',
    date: '2023-07-02',
    serviceType: 'Sunday Morning',
    total: 87,
    present: 63,
    absent: 24,
    checkIns: [
      { id: '1', childName: 'Emma Johnson', time: '9:45 AM', checkedBy: 'Sarah Teacher' },
      { id: '2', childName: 'Noah Wilson', time: '9:52 AM', checkedBy: 'Sarah Teacher' },
      { id: '3', childName: 'Olivia Davis', time: '10:01 AM', checkedBy: 'Michael Teacher' },
      { id: '4', childName: 'William Miller', time: '10:05 AM', checkedBy: 'Michael Teacher' },
      { id: '5', childName: 'Sophia Brown', time: '10:12 AM', checkedBy: 'Sarah Teacher' },
    ]
  },
  {
    id: '2',
    date: '2023-06-25',
    serviceType: 'Sunday Morning',
    total: 91,
    present: 71,
    absent: 20,
    checkIns: []
  },
  {
    id: '3',
    date: '2023-06-18',
    serviceType: 'Sunday Morning',
    total: 85,
    present: 62,
    absent: 23,
    checkIns: []
  },
  {
    id: '4',
    date: '2023-06-11',
    serviceType: 'Sunday Morning',
    total: 88,
    present: 68,
    absent: 20,
    checkIns: []
  },
];

const Attendance = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(mockAttendance[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Track and manage children's attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/attendance/scanner')}>
            <QrCode className="mr-2 h-4 w-4" />
            QR Scanner
          </Button>
          <Button onClick={() => navigate('/attendance/manual')}>
            <UserCheck className="mr-2 h-4 w-4" />
            Manual Check-In
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>
              View attendance records by date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>High Attendance</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>Low Attendance</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Attendance Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Today's Attendance</CardTitle>
                <CardDescription>
                  {format(new Date(selectedSession.date), 'PPPP')}
                </CardDescription>
              </div>
              <Select defaultValue={selectedSession.id} onValueChange={(value) => {
                const session = mockAttendance.find(a => a.id === value);
                if (session) setSelectedSession(session);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {mockAttendance.map(attendance => (
                    <SelectItem key={attendance.id} value={attendance.id}>
                      {format(new Date(attendance.date), 'dd MMM')} - {attendance.serviceType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/80 rounded-lg p-4 text-center">
                <span className="text-sm font-medium text-muted-foreground">Registered</span>
                <div className="text-3xl font-bold mt-1">{selectedSession.total}</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Present</span>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">{selectedSession.present}</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Absent</span>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300 mt-1">{selectedSession.absent}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Present Rate</Label>
                <span className="text-sm font-medium">
                  {Math.round((selectedSession.present / selectedSession.total) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${(selectedSession.present / selectedSession.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-medium">Recent Check-ins</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search check-ins"
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Checked By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSession.checkIns.length > 0 ? (
                    selectedSession.checkIns
                      .filter(checkIn => 
                        checkIn.childName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(checkIn => (
                        <TableRow key={checkIn.id}>
                          <TableCell className="font-medium">{checkIn.childName}</TableCell>
                          <TableCell>{checkIn.time}</TableCell>
                          <TableCell>{checkIn.checkedBy}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Checked In
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No check-ins for this session
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button>
              View All Attendance
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            Track attendance patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* This would ideally be a chart like recharts */}
              <div className="md:col-span-8 bg-secondary rounded-md h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Attendance Chart (Last 3 Months)</p>
              </div>
              
              <div className="md:col-span-4 space-y-4">
                <div className="bg-secondary rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Average Attendance</h3>
                  <div className="text-3xl font-bold">72%</div>
                  <p className="text-sm text-muted-foreground">Last 12 weeks</p>
                </div>
                
                <div className="bg-secondary rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Highest Attendance</h3>
                  <div className="text-3xl font-bold">89%</div>
                  <p className="text-sm text-muted-foreground">Easter Sunday</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-medium">Previous Sessions</h3>
                <div className="flex gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Service Type</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="sunday">Sunday Services</SelectItem>
                      <SelectItem value="midweek">Midweek Services</SelectItem>
                      <SelectItem value="special">Special Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Total Registered</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendance.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.date), 'PP')}
                      </TableCell>
                      <TableCell>{record.serviceType}</TableCell>
                      <TableCell>{record.total}</TableCell>
                      <TableCell className="text-green-600">{record.present}</TableCell>
                      <TableCell className="text-red-600">{record.absent}</TableCell>
                      <TableCell>
                        {Math.round((record.present / record.total) * 100)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" 
                          onClick={() => {
                            setSelectedSession(record);
                            setDate(new Date(record.date));
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
