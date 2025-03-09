
import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, Search, CalendarDays, Map, Users } from 'lucide-react';

// Mock data for events
const upcomingEvents = [
  {
    id: '1',
    title: 'Bible Camp 2023',
    date: '2023-07-28',
    time: '09:00 AM - 3:00 PM',
    location: 'Church Main Hall',
    description: 'Annual bible camp for all age groups with fun activities and Bible lessons.',
    attendees: 45,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2h1cmNoJTIwY2FtcHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '2',
    title: 'Christmas Concert',
    date: '2023-12-18',
    time: '6:00 PM - 8:00 PM',
    location: 'Church Auditorium',
    description: 'Annual children\'s Christmas concert and presentation.',
    attendees: 120,
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8Y2hyaXN0bWFzJTIwY29uY2VydHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '3',
    title: 'Easter Egg Hunt',
    date: '2024-04-05',
    time: '10:00 AM - 12:00 PM',
    location: 'Church Garden',
    description: 'Easter celebration with egg hunt, games, and storytelling.',
    attendees: 80,
    image: 'https://images.unsplash.com/photo-1522424427480-1a9165a08b0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZWFzdGVyJTIwZWdnfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
];

const pastEvents = [
  {
    id: '4',
    title: 'Summer Bible School',
    date: '2023-05-15',
    time: '09:00 AM - 2:00 PM',
    location: 'Church Main Hall',
    description: 'Special summer bible school program for children ages 5-12.',
    attendees: 65,
    image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YmlibGUlMjBzY2hvb2x8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '5',
    title: 'Thanksgiving Celebration',
    date: '2022-11-24',
    time: '4:00 PM - 6:00 PM',
    location: 'Church Fellowship Hall',
    description: 'Thanksgiving celebration with families and children.',
    attendees: 95,
    image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8dGhhbmtzZ2l2aW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
];

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter events based on search query
  const filteredUpcomingEvents = upcomingEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPastEvents = pastEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Church Events</h1>
        <p className="text-muted-foreground">
          Manage and view all upcoming and past church events
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Button onClick={() => navigate('/events/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Event
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {filteredUpcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUpcomingEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden flex flex-col h-full">
                  <div className="aspect-video w-full overflow-hidden bg-secondary">
                    {event.image ? (
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Calendar className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                    <CardDescription className="flex items-center">
                      <CalendarDays className="h-3.5 w-3.5 mr-1" />
                      {formatDate(event.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Map className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-start">
                        <Users className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                        <span>{event.attendees} registered attendees</span>
                      </div>
                      <p className="line-clamp-2 text-muted-foreground mt-2">
                        {event.description}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No upcoming events found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? `No results for "${searchQuery}"` : "Check back soon for new events"}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {filteredPastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPastEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden flex flex-col h-full opacity-80 hover:opacity-100 transition-opacity">
                  <div className="aspect-video w-full overflow-hidden bg-secondary/50">
                    {event.image ? (
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Calendar className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                    <CardDescription className="flex items-center">
                      <CalendarDays className="h-3.5 w-3.5 mr-1" />
                      {formatDate(event.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Map className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-start">
                        <Users className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                        <span>{event.attendees} attendees</span>
                      </div>
                      <p className="line-clamp-2 text-muted-foreground mt-2">
                        {event.description}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Report
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No past events found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? `No results for "${searchQuery}"` : "Past events will appear here"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;
