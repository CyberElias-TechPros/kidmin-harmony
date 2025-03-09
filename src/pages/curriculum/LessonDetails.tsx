
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, FileText, Users, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

// Mock lesson data (in a real app, this would come from an API)
const MOCK_LESSONS = [
  {
    id: '1',
    title: 'God Creates the World',
    description: 'Learning about the creation story from Genesis',
    ageGroup: '4-6',
    duration: 45,
    date: '2023-09-10',
    materials: ['Bible', 'Coloring sheets', 'Crayons', 'Creation posters'],
    objectives: [
      'Understand that God created everything',
      'Learn the order of creation',
      'Memorize Genesis 1:1'
    ],
    activities: [
      {
        name: 'Creation Days Mobile',
        description: 'Make a hanging mobile with the 7 days of creation',
        duration: 15,
        materials: ['Paper circles', 'String', 'Markers', 'Hole punch']
      },
      {
        name: 'Memory Verse Game',
        description: 'Practice memorizing Genesis 1:1 through a fun game',
        duration: 10,
        materials: ['Bible verse cards']
      }
    ],
    attachments: [
      { name: 'Lesson Plan.pdf', url: '#', size: '1.2 MB' },
      { name: 'Coloring Sheets.pdf', url: '#', size: '3.5 MB' },
      { name: 'Presentation Slides.pptx', url: '#', size: '5.8 MB' }
    ]
  },
  {
    id: '2',
    title: 'Noah\'s Ark',
    description: 'Learning about Noah and God\'s promise',
    ageGroup: '7-9',
    duration: 50,
    date: '2023-09-17',
    materials: ['Bible', 'Craft supplies', 'Rainbow craft materials'],
    objectives: [
      'Understand Noah\'s obedience to God',
      'Learn about God\'s promise through the rainbow',
      'Memorize Genesis 9:13'
    ],
    activities: [
      {
        name: 'Build a Mini Ark',
        description: 'Create small arks using craft sticks and paper',
        duration: 20,
        materials: ['Craft sticks', 'Glue', 'Paper', 'Animal stickers']
      },
      {
        name: 'Rainbow Promise Craft',
        description: 'Make a rainbow craft to remember God\'s promise',
        duration: 15,
        materials: ['Colored paper', 'Cotton balls', 'Glue']
      }
    ],
    attachments: [
      { name: 'Noah\'s Ark Lesson.pdf', url: '#', size: '1.5 MB' },
      { name: 'Animal Pairs Game.pdf', url: '#', size: '2.1 MB' },
      { name: 'Rainbow Craft Template.pdf', url: '#', size: '0.8 MB' }
    ]
  }
];

const LessonDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Find the lesson with the matching ID
  const lesson = MOCK_LESSONS.find(lesson => lesson.id === id);
  
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
        <p className="mb-6 text-muted-foreground">The lesson you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/lessons')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>
      </div>
    );
  }
  
  const handleDownload = (fileName: string) => {
    toast.info(`Downloading ${fileName}...`);
    // In a real app, this would initiate a file download
    setTimeout(() => {
      toast.success(`${fileName} downloaded successfully!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/lessons')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/lessons/edit/${id}`)}>
            Edit Lesson
          </Button>
          <Button>Assign Teachers</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                  <CardDescription className="mt-2">{lesson.description}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Ages {lesson.ageGroup}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{new Date(lesson.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{lesson.duration} minutes</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Learning Objectives</h3>
                <ul className="space-y-2">
                  {lesson.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Required Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {lesson.materials.map((material, index) => (
                    <Badge key={index} variant="secondary">{material}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="activities">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities" className="space-y-4 mt-4">
              {lesson.activities.map((activity, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{activity.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{activity.duration} minutes</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{activity.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Materials Needed:</h4>
                      <div className="flex flex-wrap gap-2">
                        {activity.materials.map((material, idx) => (
                          <Badge key={idx} variant="outline">{material}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lesson Attachments</CardTitle>
                  <CardDescription>
                    Download resources for this lesson
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lesson.attachments.map((attachment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-primary" />
                          <div>
                            <p className="font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">{attachment.size}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(attachment.name)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download All Resources
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Assigned Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-sm">JS</span>
                    </div>
                    <span>John Smith</span>
                  </div>
                  <Badge>Primary</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-sm">SD</span>
                    </div>
                    <span>Sarah Davis</span>
                  </div>
                  <Badge variant="outline">Assistant</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Manage Teachers
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Print Lesson Plan
              </Button>
              <Button className="w-full" variant="outline">
                Email Resources
              </Button>
              <Button className="w-full" variant="outline">
                Mark as Complete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonDetails;
