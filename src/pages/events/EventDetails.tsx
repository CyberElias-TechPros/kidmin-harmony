
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  User, 
  Edit, 
  Trash2, 
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock data for a single event
const eventData = {
  id: '1',
  title: 'Bible Camp 2023',
  startDate: '2023-07-28',
  endDate: '2023-07-30',
  startTime: '09:00 AM',
  endTime: '03:00 PM',
  location: 'Church Main Hall',
  address: '123 Church Street, Cityville',
  description: 'Annual bible camp for all age groups with fun activities and Bible lessons. This three-day event will include worship, games, crafts, and memorable Bible teaching. All children must be registered in advance and bring their own lunch.',
  capacity: 60,
  registeredAttendees: 45,
  status: 'upcoming',
  createdBy: 'Pastor David',
  createdAt: '2023-05-15',
  image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2h1cmNoJTIwY2FtcHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
  resources: [
    { id: 'r1', name: 'Camp Schedule.pdf', type: 'PDF', size: '245 KB' },
    { id: 'r2', name: 'Permission Form.pdf', type: 'PDF', size: '180 KB' },
    { id: 'r3', name: 'Activities List.docx', type: 'DOCX', size: '125 KB' },
  ],
  attendees: [
    { id: 'c1', name: 'Emma Johnson', age: 7, status: 'confirmed', parent: 'Sarah Johnson' },
    { id: 'c2', name: 'Noah Williams', age: 9, status: 'confirmed', parent: 'Michael Williams' },
    { id: 'c3', name: 'Olivia Davis', age: 6, status: 'confirmed', parent: 'Jennifer Davis' },
    { id: 'c4', name: 'William Brown', age: 8, status: 'pending', parent: 'Robert Brown' },
    { id: 'c5', name: 'Sophia Miller', age: 10, status: 'confirmed', parent: 'Jessica Miller' },
  ],
  volunteers: [
    { id: 'v1', name: 'James Wilson', role: 'Group Leader', assigned: 'Group A' },
    { id: 'v2', name: 'Isabella Moore', role: 'Activities Coordinator', assigned: 'All Groups' },
    { id: 'v3', name: 'Matthew Taylor', role: 'Group Leader', assigned: 'Group B' },
  ]
};

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event] = useState(eventData); // In a real app, fetch based on id
  
  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';

  const handleEditEvent = () => {
    toast.info('Edit functionality would be implemented here');
  };

  const handleDeleteEvent = () => {
    toast.info('Delete functionality would be implemented here');
    navigate('/events');
  };

  const handleDownloadResource = (resourceId: string, resourceName: string) => {
    toast.success(`Downloading ${resourceName}`);
    // In a real app, this would trigger a file download
  };

  const handleRegisterChild = () => {
    toast.info('Registration functionality would be implemented here');
  };

  const formatDateRange = () => {
    if (event.startDate === event.endDate) {
      return format(new Date(event.startDate), 'EEEE, MMMM d, yyyy');
    } else {
      return `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d, yyyy')}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Info - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-lg bg-secondary/10">
            <div className="absolute inset-0">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-primary/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            
            <div className="relative p-6 pt-32 md:p-8 md:pt-40">
              <div className="space-y-4">
                <Badge className="mb-2">
                  {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </Badge>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDateRange()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <div>
                    <div>{event.location}</div>
                    <div className="text-sm text-muted-foreground">{event.address}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.registeredAttendees} / {event.capacity} registered</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{event.description}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Event Resources</CardTitle>
                  <CardDescription>
                    Download resources for this event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {event.resources.length > 0 ? (
                    <div className="space-y-3">
                      {event.resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{resource.name}</p>
                              <p className="text-xs text-muted-foreground">{resource.type} · {resource.size}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadResource(resource.id, resource.name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No resources available for this event
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="attendees" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Registered Children</CardTitle>
                    <CardDescription>
                      {event.attendees.length} children registered for this event
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export List
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {event.attendees.length > 0 ? (
                    <div className="space-y-3">
                      {event.attendees.map((attendee) => (
                        <div key={attendee.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{attendee.name}</p>
                              <p className="text-xs text-muted-foreground">Age: {attendee.age} · Parent: {attendee.parent}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {attendee.status === 'confirmed' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirmed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No children registered for this event yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="volunteers" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Assigned Volunteers</CardTitle>
                    <CardDescription>
                      {event.volunteers.length} volunteers assigned to this event
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Assign Volunteer
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {event.volunteers.length > 0 ? (
                    <div className="space-y-3">
                      {event.volunteers.map((volunteer) => (
                        <div key={volunteer.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{volunteer.name}</p>
                              <p className="text-xs text-muted-foreground">{volunteer.role} · {volunteer.assigned}</p>
                            </div>
                          </div>
                          {isAdmin && (
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No volunteers assigned to this event yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.status === 'upcoming' && (
                <Button className="w-full" onClick={handleRegisterChild}>
                  Register Child
                </Button>
              )}
              
              {isAdmin && (
                <>
                  <Button variant="outline" className="w-full" onClick={handleEditEvent}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Event
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleDeleteEvent}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Event
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Registration Status</span>
                  <span className="text-sm font-medium">{Math.round((event.registeredAttendees / event.capacity) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${(event.registeredAttendees / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total capacity:</span>
                  <span className="font-medium">{event.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Registered attendees:</span>
                  <span className="font-medium">{event.registeredAttendees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available spots:</span>
                  <span className="font-medium">{event.capacity - event.registeredAttendees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volunteers assigned:</span>
                  <span className="font-medium">{event.volunteers.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created by:</span>
                  <span>{event.createdBy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created on:</span>
                  <span>{format(new Date(event.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last updated:</span>
                  <span>{format(new Date(), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
