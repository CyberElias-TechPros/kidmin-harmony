
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  CalendarCheck, 
  BookOpen, 
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for a child
const mockChild = {
  id: '1',
  firstName: 'Emma',
  lastName: 'Johnson',
  fullName: 'Emma Johnson',
  dob: '2016-05-12',
  age: 7,
  gender: 'Female',
  ageGroup: 'Elementary',
  allergies: 'Peanuts, Dairy',
  medicalNotes: 'Mild asthma, carries inhaler',
  churchMember: true,
  registrationDate: '2023-01-15',
  baptized: false,
  parent: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, CA 90210'
  },
  emergencyContact: {
    name: 'Robert Johnson',
    relation: 'Uncle',
    phone: '(555) 987-6543'
  },
  attendance: {
    overall: '85%',
    lastFourWeeks: [
      { date: '2023-06-04', status: 'present' },
      { date: '2023-06-11', status: 'present' },
      { date: '2023-06-18', status: 'absent' },
      { date: '2023-06-25', status: 'present' }
    ]
  },
  lessons: {
    completed: 12,
    inProgress: 2,
    recent: [
      { id: '1', title: 'Noah\'s Ark', date: '2023-06-11', completed: true },
      { id: '2', title: 'David and Goliath', date: '2023-06-18', completed: false },
      { id: '3', title: 'The Good Samaritan', date: '2023-06-25', completed: true }
    ]
  },
  notes: [
    { id: '1', date: '2023-06-11', author: 'Teacher Smith', text: 'Emma participated enthusiastically in class today.' },
    { id: '2', date: '2023-06-18', author: 'Admin Johnson', text: 'Parents called to inform Emma would miss class due to illness.' },
    { id: '3', date: '2023-06-25', author: 'Teacher Smith', text: 'Emma shared a prayer request for her grandma who is sick.' }
  ]
};

const ChildDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [child, setChild] = useState(mockChild);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API fetch
    const fetchChild = async () => {
      try {
        // In a real app, this would be an API call using the id
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // We're using the mock data for now
        setChild(mockChild);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load child details');
        navigate('/children');
      }
    };

    fetchChild();
  }, [id, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading child details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{child.fullName}</h1>
            {child.churchMember && (
              <Badge variant="outline" className="border-primary text-primary">
                Church Member
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {child.age} years old · {child.ageGroup} · Registered on {new Date(child.registrationDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/children')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button onClick={() => navigate(`/children/${child.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <User className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <CalendarCheck className="mr-2 h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="lessons">
            <BookOpen className="mr-2 h-4 w-4" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="notes">
            <MessageSquare className="mr-2 h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                    <p>{child.fullName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                    <p>{new Date(child.dob).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Age</h3>
                    <p>{child.age} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                    <p>{child.gender}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Age Group</h3>
                  <p>{child.ageGroup}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Baptized</h3>
                  <p>{child.baptized ? 'Yes' : 'No'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-medium text-orange-500">Allergies</h3>
                  </div>
                  <p>{child.allergies || 'None'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Medical Notes</h3>
                  <p>{child.medicalNotes || 'None'}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Parent/Guardian Information */}
            <Card>
              <CardHeader>
                <CardTitle>Parent/Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p>{child.parent.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{child.parent.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{child.parent.email}</p>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{child.parent.address}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Emergency Contact</h3>
                  <p className="font-medium mt-2">{child.emergencyContact.name}</p>
                  <p className="text-sm">{child.emergencyContact.relation}</p>
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{child.emergencyContact.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground">Overall Attendance</h3>
                    <p className="text-2xl font-bold mt-2">{child.attendance.overall}</p>
                  </div>
                  
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground">Lessons Completed</h3>
                    <p className="text-2xl font-bold mt-2">{child.lessons.completed}</p>
                  </div>
                  
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground">Recent Notes</h3>
                    <p className="text-2xl font-bold mt-2">{child.notes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                View {child.firstName}'s attendance records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Last 4 Weeks</h3>
                <div className="grid grid-cols-4 gap-2">
                  {child.attendance.lastFourWeeks.map((week, index) => (
                    <div key={index} className="text-center">
                      <div className={`
                        w-full aspect-square rounded-full flex items-center justify-center
                        ${week.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      `}>
                        {week.status === 'present' ? 'P' : 'A'}
                      </div>
                      <p className="text-xs mt-1">
                        {new Date(week.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-4">Detailed Attendance Records</h3>
                <div className="border rounded-md">
                  <div className="grid grid-cols-3 font-medium p-3 border-b bg-muted/50">
                    <div>Date</div>
                    <div>Status</div>
                    <div>Checked By</div>
                  </div>
                  {/* Just showing limited data for this prototype */}
                  {[...Array(10)].map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (7 * index));
                    const isPresent = Math.random() > 0.3; // 70% chance of being present
                    
                    return (
                      <div key={index} className="grid grid-cols-3 p-3 border-b last:border-0">
                        <div>{date.toLocaleDateString()}</div>
                        <div>
                          <Badge 
                            variant={isPresent ? 'default' : 'outline'}
                            className={isPresent ? 
                              'bg-green-500 hover:bg-green-600' : 
                              'text-red-500 border-red-200'
                            }
                          >
                            {isPresent ? 'Present' : 'Absent'}
                          </Badge>
                        </div>
                        <div>{isPresent ? 'Teacher Smith' : '-'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline">
                Export Attendance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Lessons Tab */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Progress</CardTitle>
              <CardDescription>
                Track {child.firstName}'s spiritual growth and learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Progress Summary</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Lessons Completed</span>
                        <span>{child.lessons.completed}/{child.lessons.completed + child.lessons.inProgress}</span>
                      </div>
                      <div className="w-full h-2 bg-secondary-foreground/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ 
                            width: `${(child.lessons.completed / (child.lessons.completed + child.lessons.inProgress)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Memory Verses</span>
                        <span className="text-sm">8/12</span>
                      </div>
                      <div className="w-full h-2 bg-secondary-foreground/20 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-primary rounded-full" style={{ width: '66.6%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Current Focus</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>Gospel of John</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>The Fruit of the Spirit</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>Prayer Basics</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-4">Recent Lessons</h3>
                <div className="border rounded-md">
                  <div className="grid grid-cols-4 font-medium p-3 border-b bg-muted/50">
                    <div className="col-span-2">Lesson</div>
                    <div>Date</div>
                    <div>Status</div>
                  </div>
                  {child.lessons.recent.map((lesson) => (
                    <div key={lesson.id} className="grid grid-cols-4 p-3 border-b last:border-0">
                      <div className="col-span-2">{lesson.title}</div>
                      <div>{new Date(lesson.date).toLocaleDateString()}</div>
                      <div>
                        <Badge 
                          variant={lesson.completed ? 'default' : 'outline'}
                          className={lesson.completed ? 
                            'bg-green-500 hover:bg-green-600' : 
                            'border-orange-200 text-orange-700'
                          }
                        >
                          {lesson.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline">
                View Full Curriculum
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notes & Observations</CardTitle>
                <CardDescription>
                  Teachers' notes and important observations about {child.firstName}
                </CardDescription>
              </div>
              <Button>
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {child.notes.map((note) => (
                  <div key={note.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{note.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(note.date).toLocaleDateString()}
                      </div>
                    </div>
                    <p>{note.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChildDetails;
