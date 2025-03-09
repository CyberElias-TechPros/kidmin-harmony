
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CalendarCheck, 
  BookOpen, 
  Calendar, 
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Check,
  UserPlus 
} from 'lucide-react';

// Mock data for dashboard stats
const mockStats = {
  totalChildren: 124,
  teachersCount: 18,
  attendance: {
    today: 87,
    percentage: 70.2,
    trend: 'up',
    absentees: 37
  },
  events: {
    upcoming: 3,
    nextEvent: 'Bible Camp 2023',
    nextEventDate: '2023-07-28'
  },
  lessons: {
    totalLessons: 48,
    completed: 32,
    inProgress: 16
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          Here's what's happening in your children's ministry
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalChildren}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.teachersCount} teachers assigned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.attendance.today} children</div>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground">
                {mockStats.attendance.percentage}% present
              </span>
              {mockStats.attendance.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 ml-1 text-red-500 transform rotate-180" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.events.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Next: {mockStats.events.nextEvent}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.lessons.completed}/{mockStats.lessons.totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.lessons.inProgress} lessons in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity & Alerts - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-orange-100 p-1">
                  <Users className="h-4 w-4 text-orange-700" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">{mockStats.attendance.absentees} children absent today</p>
                  <p className="text-sm text-orange-700/70">Consider following up with parents</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-orange-100 p-1">
                  <CalendarCheck className="h-4 w-4 text-orange-700" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">Event preparation needed</p>
                  <p className="text-sm text-orange-700/70">{mockStats.events.nextEvent} is 7 days away</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-800">
                View All Alerts
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your ministry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">New child registered</p>
                  <p className="text-sm text-muted-foreground">Sarah Johnson was added to Pre-School class</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Lesson completed</p>
                  <p className="text-sm text-muted-foreground">Elementary class completed "Noah's Ark" lesson</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">New event created</p>
                  <p className="text-sm text-muted-foreground">{mockStats.events.nextEvent} was added to the calendar</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" onClick={() => {}}>
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Actions & Tools - Takes 1 column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => navigate('/children/add')}
              >
                Register New Child
                <UserPlus className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/attendance/scanner')}
              >
                Check-In Children
                <CalendarCheck className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/events/add')}
              >
                Create New Event
                <Calendar className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/lessons/add')}
              >
                Add New Lesson
                <BookOpen className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ministry Overview</CardTitle>
              <CardDescription>Your ministry at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Age Groups Coverage</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Teacher to Child Ratio</span>
                  <span className="text-sm font-medium">1:7</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lesson Completion Rate</span>
                  <span className="text-sm font-medium">67%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="w-full flex items-center justify-center"
                onClick={() => {}}
              >
                View Full Reports <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
