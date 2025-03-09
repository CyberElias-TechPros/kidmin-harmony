
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
import { 
  BookOpen, 
  Plus, 
  Search, 
  FileText,
  Calendar,
  User,
  Download,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock data for lessons
const activeLessons = [
  {
    id: '1',
    title: 'The Creation Story',
    date: '2023-06-15',
    targetAge: 'Elementary (6-10 years)',
    description: 'Learn about how God created the world in seven days.',
    status: 'active',
    materials: 3,
    resources: ['Lesson Notes', 'Coloring Pages', 'Teacher Guide'],
    thumbnail: 'https://images.unsplash.com/photo-1528754704113-7d6189dcb12d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGNyZWF0aW9ufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '2',
    title: 'Noah\'s Ark',
    date: '2023-06-22',
    targetAge: 'Preschool (4-5 years)',
    description: 'The story of Noah and the ark that saved the animals.',
    status: 'active',
    materials: 4,
    resources: ['Lesson Notes', 'Craft Template', 'Animal Cutouts', 'Teacher Guide'],
    thumbnail: 'https://images.unsplash.com/photo-1598194123105-873dd4a07857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bm9haHMlMjBhcmt8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '3',
    title: 'The Good Samaritan',
    date: '2023-06-29',
    targetAge: 'Elementary (6-10 years)',
    description: 'Jesus\' parable about loving your neighbor and showing kindness to everyone.',
    status: 'active',
    materials: 2,
    resources: ['Lesson Notes', 'Activity Sheets'],
    thumbnail: 'https://images.unsplash.com/photo-1469571486292-b53601021a68?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8aGVscGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
  },
];

const archivedLessons = [
  {
    id: '4',
    title: 'David and Goliath',
    date: '2023-05-18',
    targetAge: 'Elementary (6-10 years)',
    description: 'The story of how young David defeated the giant Goliath with his faith in God.',
    status: 'completed',
    materials: 3,
    resources: ['Lesson Notes', 'Activity Sheets', 'Teacher Guide'],
    thumbnail: 'https://images.unsplash.com/photo-1571931264142-7b808758d5a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZGF2aWQlMjBhbmQlMjBnb2xpYXRofGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '5',
    title: 'The Prodigal Son',
    date: '2023-05-11',
    targetAge: 'Preteen (11-12 years)',
    description: 'Jesus\' parable about forgiveness and God\'s love for all His children.',
    status: 'completed',
    materials: 4,
    resources: ['Lesson Notes', 'Discussion Questions', 'Handouts', 'Teacher Guide'],
    thumbnail: 'https://images.unsplash.com/photo-1529946179074-87642f6204d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8ZmF0aGVyJTIwYW5kJTIwc29ufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
];

const Curriculum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter lessons based on search query
  const filteredActiveLessons = activeLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.targetAge.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredArchivedLessons = archivedLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.targetAge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadAll = (lessonId: string, lessonTitle: string) => {
    toast.success(`Downloading all materials for "${lessonTitle}"`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Curriculum & Lessons</h1>
        <p className="text-muted-foreground">
          Manage and access lesson materials for children's ministry
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lessons..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Button onClick={() => navigate('/lessons/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Lesson
          </Button>
        )}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Lessons</TabsTrigger>
          <TabsTrigger value="archived">Archived Lessons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {filteredActiveLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActiveLessons.map((lesson) => (
                <Card key={lesson.id} className="overflow-hidden flex flex-col h-full">
                  <div className="aspect-video w-full overflow-hidden bg-secondary">
                    {lesson.thumbnail ? (
                      <img 
                        src={lesson.thumbnail} 
                        alt={lesson.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <BookOpen className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Badge variant="outline" className="font-normal">
                        {lesson.targetAge}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                        <span>Scheduled: {format(new Date(lesson.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-start">
                        <FileText className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                        <span>{lesson.materials} teaching materials</span>
                      </div>
                      <p className="line-clamp-2 text-muted-foreground mt-2">
                        {lesson.description}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadAll(lesson.id, lesson.title)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Materials
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View Lesson
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No active lessons found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? `No results for "${searchQuery}"` : "Add new lessons to get started"}
              </p>
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/lessons/add')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Lesson
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="mt-6">
          {filteredArchivedLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArchivedLessons.map((lesson) => (
                <Card key={lesson.id} className="overflow-hidden flex flex-col h-full opacity-80 hover:opacity-100 transition-opacity">
                  <div className="aspect-video w-full overflow-hidden bg-secondary/50">
                    {lesson.thumbnail ? (
                      <img 
                        src={lesson.thumbnail} 
                        alt={lesson.title} 
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <BookOpen className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Badge variant="outline" className="font-normal">
                        {lesson.targetAge}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                        <span>Completed: {format(new Date(lesson.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-start">
                        <User className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                        <span>Created by Teacher Sarah</span>
                      </div>
                      <p className="line-clamp-2 text-muted-foreground mt-2">
                        {lesson.description}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadAll(lesson.id, lesson.title)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Materials
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View Archive
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No archived lessons found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? `No results for "${searchQuery}"` : "Completed lessons will appear here"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Curriculum;
