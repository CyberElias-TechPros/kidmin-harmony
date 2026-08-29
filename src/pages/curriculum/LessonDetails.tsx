import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Calendar, Clock, CheckCircle, FileText, Download, Edit, Trash, Users, Printer,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLesson, useDeleteLesson } from "@/services/api/hooks";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LessonDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, isError } = useLesson(id!);
  const deleteLesson = useDeleteLesson();
  const isStaff = user?.role === "admin" || user?.role === "teacher";

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-40" /><Skeleton className="h-96 w-full rounded-xl" /></div>;

  if (isError || !data?.lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
        <Button onClick={() => navigate("/lessons")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons</Button>
      </div>
    );
  }

  const { lesson, objectives, materials, activities } = data;

  const handleDelete = async () => {
    try {
      await deleteLesson.mutateAsync(lesson.id);
      navigate("/lessons");
    } catch { /* handled in hook */ }
  };

  const handleDownload = (fileName: string) => toast.info(`Downloading ${fileName}...`);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => navigate("/lessons")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Lesson Plan
          </Button>
          {isStaff && (
            <>
              <Button variant="outline" onClick={() => navigate(`/lessons/edit/${lesson.id}`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Lesson
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><Trash className="mr-2 h-4 w-4" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                    <AlertDialogDescription>This permanently removes the lesson and its materials. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                  <CardDescription className="mt-2">{lesson.description || "No description"}</CardDescription>
                </div>
                {lesson.ageGroup && <Badge variant="outline" className="bg-primary/10">Ages {lesson.ageGroup}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                {lesson.date && <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-muted-foreground" /><span>{new Date(lesson.date).toLocaleDateString()}</span></div>}
                {lesson.duration && <div className="flex items-center"><Clock className="h-4 w-4 mr-2 text-muted-foreground" /><span>{lesson.duration} minutes</span></div>}
                {lesson.category && <Badge variant="secondary">{lesson.category}</Badge>}
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Learning Objectives</h3>
                <ul className="space-y-2">
                  {objectives.length > 0 ? objectives.map((obj, i) => (
                    <li key={i} className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" /><span>{obj}</span></li>
                  )) : <li className="text-muted-foreground">No objectives listed.</li>}
                </ul>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Required Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {materials.length > 0 ? materials.map((m, i) => <Badge key={i} variant="secondary">{m}</Badge>) : <span className="text-muted-foreground">No materials listed.</span>}
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
              {activities.length > 0 ? activities.map((activity, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{activity.name}</CardTitle>
                    <CardDescription><div className="flex items-center mt-1"><Clock className="h-4 w-4 mr-2" /><span>{activity.duration} minutes</span></div></CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{activity.description}</p>
                    {activity.materials.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Materials Needed:</h4>
                        <div className="flex flex-wrap gap-2">{activity.materials.map((m, idx) => <Badge key={idx} variant="outline">{m}</Badge>)}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) : <p className="text-muted-foreground text-center py-6">No activities listed.</p>}
            </TabsContent>
            <TabsContent value="resources" className="space-y-4 mt-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Resource Attachments</CardTitle><CardDescription>Materials associated with this lesson</CardDescription></CardHeader>
                <CardContent>
                  {materials.length > 0 ? (
                    <div className="space-y-3">
                      {materials.map((m, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                          <div className="flex items-center"><FileText className="h-5 w-5 mr-3 text-primary" /><p className="font-medium">{m}</p></div>
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(m)}><Download className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center py-6 text-muted-foreground">No resources attached.</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Lesson Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Age group" value={lesson.ageGroup || "All ages"} />
              <Row label="Duration" value={lesson.duration ? `${lesson.duration} min` : "—"} />
              <Row label="Category" value={lesson.category || "—"} />
              <Row label="Date" value={lesson.date ? new Date(lesson.date).toLocaleDateString() : "—"} />
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => navigate("/lessons")}>View All Lessons</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between"><span className="text-muted-foreground">{label}:</span><span className="font-medium">{value}</span></div>
);

export default LessonDetails;
