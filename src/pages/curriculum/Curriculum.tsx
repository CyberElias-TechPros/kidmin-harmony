
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Search, Plus, Download, Filter, FileText } from 'lucide-react';

// Mock data for lessons
const LESSONS = [
  {
    id: '1',
    title: 'God Creates the World',
    description: 'Learning about the creation story from Genesis',
    ageGroup: '4-6',
    duration: 45,
    date: '2023-09-10',
    category: 'Bible Stories'
  },
  {
    id: '2',
    title: 'Noah\'s Ark',
    description: 'Learning about Noah and God\'s promise',
    ageGroup: '7-9',
    duration: 50,
    date: '2023-09-17',
    category: 'Bible Stories'
  },
  {
    id: '3',
    title: 'The Good Samaritan',
    description: 'Jesus teaches about loving our neighbors',
    ageGroup: '10-12',
    duration: 55,
    date: '2023-09-24',
    category: 'Parables'
  },
  {
    id: '4',
    title: 'Daniel in the Lion\'s Den',
    description: 'God protects Daniel for his faithfulness',
    ageGroup: '7-9',
    duration: 45,
    date: '2023-10-01',
    category: 'Bible Stories'
  },
  {
    id: '5',
    title: 'The Lord\'s Prayer',
    description: 'Learning how Jesus taught us to pray',
    ageGroup: '10-12',
    duration: 40,
    date: '2023-10-08',
    category: 'Prayer'
  },
  {
    id: '6',
    title: 'The Fruit of the Spirit',
    description: 'Learning about godly character traits',
    ageGroup: '7-9',
    duration: 50,
    date: '2023-10-15',
    category: 'Christian Living'
  }
];

const Curriculum = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Filter lessons based on search query and filters
  const filteredLessons = LESSONS.filter(lesson => {
    // Filter by search query
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by age group
    const matchesAgeGroup = selectedAgeGroup === '' || lesson.ageGroup === selectedAgeGroup;
    
    // Filter by category
    const matchesCategory = selectedCategory === '' || lesson.category === selectedCategory;
    
    return matchesSearch && matchesAgeGroup && matchesCategory;
  });
  
  // Group upcoming lessons by month
  const currentDate = new Date();
  const upcomingLessons = filteredLessons
    .filter(lesson => new Date(lesson.date) >= currentDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group past lessons (those with dates before today)
  const pastLessons = filteredLessons
    .filter(lesson => new Date(lesson.date) < currentDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get unique categories for filtering
  const categories = Array.from(new Set(LESSONS.map(lesson => lesson.category)));
  
  // Get unique age groups for filtering
  const ageGroups = Array.from(new Set(LESSONS.map(lesson => lesson.ageGroup)));
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
          <p className="text-muted-foreground mt-1">
            Manage lesson plans and teaching materials
          </p>
        </div>
        <Button onClick={() => navigate('/lessons/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Lesson
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Search Lessons</CardTitle>
              <CardDescription>
                Find lessons by title, content, or category
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search lessons..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ages</SelectItem>
                    {ageGroups.map(age => (
                      <SelectItem key={age} value={age}>{age} years</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{LESSONS.length}</p>
              <p className="text-sm text-muted-foreground">Total Lessons</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{upcomingLessons.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming Lessons</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Curriculum
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Lessons</TabsTrigger>
          <TabsTrigger value="past">Past Lessons</TabsTrigger>
          <TabsTrigger value="all">All Lessons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-6">
          {upcomingLessons.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg font-medium">No upcoming lessons found</p>
              <p className="text-muted-foreground mt-1">Try adjusting your search filters or create a new lesson</p>
              <Button className="mt-4" onClick={() => navigate('/lessons/add')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Lesson
              </Button>
            </div>
          ) : (
            upcomingLessons.map(lesson => (
              <Card key={lesson.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-primary/10 p-6 flex flex-col justify-center items-center md:w-48">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        {new Date(lesson.date).toLocaleDateString(undefined, { month: 'short' })}
                      </p>
                      <p className="text-3xl font-bold">
                        {new Date(lesson.date).getDate()}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {new Date(lesson.date).toLocaleDateString(undefined, { weekday: 'long' })}
                      </p>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{lesson.title}</h3>
                        <p className="text-muted-foreground mt-1">{lesson.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Badge variant="outline">{lesson.category}</Badge>
                          <Badge variant="outline">Ages {lesson.ageGroup}</Badge>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="text-xs">{lesson.duration} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start mt-4 md:mt-0">
                        <Button onClick={() => navigate(`/lessons/${lesson.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-6">
          {pastLessons.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg font-medium">No past lessons found</p>
              <p className="text-muted-foreground mt-1">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pastLessons.map(lesson => (
                <Card key={lesson.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <Badge variant="outline">{lesson.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {lesson.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(lesson.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{lesson.duration} min</span>
                      </div>
                      <div>Ages {lesson.ageGroup}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Lesson
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {filteredLessons.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg font-medium">No lessons found</p>
              <p className="text-muted-foreground mt-1">Try adjusting your search filters or create a new lesson</p>
              <Button className="mt-4" onClick={() => navigate('/lessons/add')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Lesson
              </Button>
            </div>
          ) : (
            <div className="bg-background rounded-lg border">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                <div className="col-span-5">Lesson Title</div>
                <div className="col-span-2">Age Group</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              
              {filteredLessons
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(lesson => (
                <div 
                  key={lesson.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-secondary/20 transition-colors"
                >
                  <div className="col-span-5">
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge variant="outline">Ages {lesson.ageGroup}</Badge>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {lesson.category}
                  </div>
                  <div className="col-span-2 flex items-center">
                    {new Date(lesson.date).toLocaleDateString()}
                  </div>
                  <div className="col-span-1 flex justify-end items-center">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Curriculum;
