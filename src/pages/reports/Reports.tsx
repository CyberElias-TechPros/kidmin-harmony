
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, BarChart3, Users, CalendarCheck, BookOpen, School, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";

// Mock data for attendance
const attendanceData = [
  { month: 'Jan', attendance: 82, capacity: 120 },
  { month: 'Feb', attendance: 87, capacity: 120 },
  { month: 'Mar', attendance: 94, capacity: 120 },
  { month: 'Apr', attendance: 90, capacity: 120 },
  { month: 'May', attendance: 85, capacity: 120 },
  { month: 'Jun', attendance: 105, capacity: 120 },
  { month: 'Jul', attendance: 110, capacity: 120 },
  { month: 'Aug', attendance: 108, capacity: 120 },
  { month: 'Sep', attendance: 115, capacity: 120 },
  { month: 'Oct', attendance: 100, capacity: 120 },
  { month: 'Nov', attendance: 104, capacity: 120 },
  { month: 'Dec', attendance: 90, capacity: 120 },
];

// Mock data for age distribution
const ageDistributionData = [
  { name: '0-2 years', value: 18, color: '#8884d8' },
  { name: '3-5 years', value: 35, color: '#82ca9d' },
  { name: '6-8 years', value: 42, color: '#ffc658' },
  { name: '9-12 years', value: 29, color: '#ff8042' },
];

// Mock data for lesson completion
const lessonCompletionData = [
  { name: 'Genesis', complete: 12, total: 12 },
  { name: 'Exodus', complete: 10, total: 12 },
  { name: 'Gospels', complete: 8, total: 14 },
  { name: 'Acts', complete: 6, total: 10 },
  { name: 'Epistles', complete: 3, total: 8 },
];

// Mock data for check-in times
const checkInTimeData = [
  { time: '8:30 AM', count: 5 },
  { time: '8:45 AM', count: 12 },
  { time: '9:00 AM', count: 25 },
  { time: '9:15 AM', count: 38 },
  { time: '9:30 AM', count: 20 },
  { time: '9:45 AM', count: 8 },
  { time: '10:00 AM', count: 5 },
];

// Mock data for teacher participation
const teacherParticipationData = [
  { month: 'Jan', volunteers: 15, teachers: 8 },
  { month: 'Feb', volunteers: 18, teachers: 8 },
  { month: 'Mar', volunteers: 14, teachers: 9 },
  { month: 'Apr', volunteers: 16, teachers: 8 },
  { month: 'May', volunteers: 15, teachers: 7 },
  { month: 'Jun', volunteers: 19, teachers: 10 },
  { month: 'Jul', volunteers: 20, teachers: 10 },
  { month: 'Aug', volunteers: 17, teachers: 9 },
  { month: 'Sep', volunteers: 16, teachers: 9 },
  { month: 'Oct', volunteers: 18, teachers: 8 },
  { month: 'Nov', volunteers: 17, teachers: 9 },
  { month: 'Dec', volunteers: 14, teachers: 8 },
];

// Metrics cards data
const currentMetrics = [
  {
    title: "Total Children",
    value: "124",
    change: "+12%",
    trend: "up",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Average Attendance",
    value: "87%",
    change: "+5%",
    trend: "up",
    icon: <CalendarCheck className="h-4 w-4" />,
  },
  {
    title: "Teacher to Child Ratio",
    value: "1:7",
    change: "-0.5",
    trend: "up",
    icon: <School className="h-4 w-4" />,
  },
  {
    title: "Lesson Completion",
    value: "75%",
    change: "+8%",
    trend: "up",
    icon: <BookOpen className="h-4 w-4" />,
  },
];

const Reports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeframe, setTimeframe] = useState("year");

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Ministry Reports</h1>
        <p className="text-muted-foreground">
          Analyze attendance, growth, and curriculum progress
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Tabs defaultValue={timeframe} onValueChange={setTimeframe} className="w-full sm:max-w-md">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
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
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="preschool">Pre-School</SelectItem>
              <SelectItem value="kindergarten">Kindergarten</SelectItem>
              <SelectItem value="elementary">Elementary</SelectItem>
              <SelectItem value="preteen">Pre-Teen</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs flex items-center text-muted-foreground">
                {metric.trend === "up" ? (
                  <ArrowUpCircle className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {metric.change}
                </span>
                {" from last period"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Monthly attendance compared to capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#6366F1" 
                    fillOpacity={1} 
                    fill="url(#colorAttendance)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="capacity" 
                    stroke="#F43F5E" 
                    strokeDasharray="5 5" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Breakdown of children by age groups</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ageDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Curriculum Progress</CardTitle>
            <CardDescription>Lessons completed by curriculum section</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lessonCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  <Bar dataKey="complete" name="Completed" fill="#10B981" />
                  <Bar dataKey="total" name="Total Lessons" fill="#E2E8F0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-in Times</CardTitle>
            <CardDescription>Distribution of child check-ins by time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={checkInTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Children" 
                    stroke="#6366F1" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher & Volunteer Participation</CardTitle>
          <CardDescription>Monthly breakdown of ministry team involvement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherParticipationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                />
                <Legend />
                <Bar dataKey="teachers" name="Teachers" fill="#6366F1" />
                <Bar dataKey="volunteers" name="Volunteers" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
