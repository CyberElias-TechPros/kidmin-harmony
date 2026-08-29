import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash, Phone, Mail, MapPin, AlertTriangle, CalendarCheck, BookOpen, Send, QrCode } from "lucide-react";
import QrCodeView from "@/components/QrCode";
import {
  useChild, useAddNote, useDeleteChild, useLessons,
} from "@/services/api/hooks";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ChildDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, isError } = useChild(id!);
  const addNote = useAddNote();
  const deleteChild = useDeleteChild();
  const [noteText, setNoteText] = useState("");
  const { data: lessonsData } = useLessons();

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "admin" || user?.role === "teacher";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.child) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Child Not Found</h2>
        <p className="mb-6 text-muted-foreground">The child you're looking for doesn't exist or you don't have access.</p>
        <Button onClick={() => navigate("/children")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Children
        </Button>
      </div>
    );
  }

  const { child } = data;
  const notes = data.notes ?? [];
  const attendance = data.attendance ?? [];

  const handleDelete = async () => {
    try {
      await deleteChild.mutateAsync(child.id);
      navigate("/children");
    } catch {
      // hook shows toast
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      await addNote.mutateAsync({ id: child.id, text: noteText });
      setNoteText("");
    } catch {
      // hook shows toast
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/children")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="mr-2 h-4 w-4" /> QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[320px]">
              <DialogHeader>
                <DialogTitle>Check-in QR Code</DialogTitle>
                <DialogDescription>Scan this code at the attendance station to check in {child.fullName}.</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                <QrCodeView value={JSON.stringify({ id: child.id, name: child.fullName })} size={220} />
              </div>
            </DialogContent>
          </Dialog>
          {isStaff && (
            <>
              <Button variant="outline" onClick={() => navigate(`/children/${child.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {child.fullName}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently removes the record. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">
                  {child.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              </div>
              <h1 className="text-2xl font-bold">{child.fullName}</h1>
              <p className="text-muted-foreground">
                {child.age ?? "?"} years old • {child.ageGroup || "Not assigned"}
              </p>
              <div className="mt-3 flex justify-center">
                <Badge>{child.ageGroup || "Ungrouped"}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical & Safety</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                {child.allergies ? <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" /> : <span />}
                <div>
                  <p className="font-medium">Allergies</p>
                  <p className="text-muted-foreground">{child.allergies || "None listed"}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Medical Notes</p>
                <p className="text-muted-foreground">{child.medicalNotes || "None"}</p>
              </div>
              <div>
                <p className="font-medium">Church Member</p>
                <p className="text-muted-foreground">{child.churchMember ? "Yes" : "No"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent / Guardian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center"><UserIcon /> <span className="ml-2 font-medium">{child.parentName || "—"}</span></div>
              <div className="flex items-center"><Mail className="h-4 w-4 text-muted-foreground" /> <span className="ml-2">{child.parentEmail || "—"}</span></div>
              <div className="flex items-center"><Phone className="h-4 w-4 text-muted-foreground" /> <span className="ml-2">{child.parentPhone || "—"}</span></div>
              <div className="flex items-center"><MapPin className="h-4 w-4 text-muted-foreground" /> <span className="ml-2">{child.address ? `${child.city || ""}, ${child.state || ""} ${child.zipCode || ""}` : "—"}</span></div>
            </CardContent>
          </Card>

          {(child.emergencyContactName || child.emergencyContactPhone) && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="font-medium">{child.emergencyContactName || "—"}</span> {child.emergencyContactRelation ? `(${child.emergencyContactRelation})` : ""}</div>
                <div className="flex items-center"><Phone className="h-4 w-4 text-muted-foreground" /> <span className="ml-2">{child.emergencyContactPhone || "—"}</span></div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs column */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="attendance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Check-in records for {child.firstName}</CardDescription>
                </CardHeader>
                <CardContent>
                  {attendance.length > 0 ? (
                    <div className="border rounded-md">
                      <div className="grid grid-cols-3 font-medium p-3 border-b bg-muted/50">
                        <div>Date</div><div>Status</div><div>Checked By</div>
                      </div>
                      {attendance.map((record) => (
                        <div key={record.id} className="grid grid-cols-3 p-3 border-b last:border-0">
                          <div>{new Date(record.date).toLocaleDateString()}</div>
                          <div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CalendarCheck className="h-3 w-3 mr-1" /> Present
                            </Badge>
                          </div>
                          <div>{record.checkedBy || "—"}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No attendance records yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Curriculum Overview</CardTitle>
                  <CardDescription>Lessons available for this age group</CardDescription>
                </CardHeader>
                <CardContent>
                  {lessonsData?.lessons && lessonsData.lessons.length > 0 ? (
                    <div className="space-y-3">
                      {lessonsData.lessons.slice(0, 8).map((lesson) => (
                        <div key={lesson.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.category || "Lesson"}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/lessons/${lesson.id}`)}>View</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No lessons available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Notes & Observations</CardTitle>
                    <CardDescription>Teachers' notes about {child.firstName}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{note.author}</div>
                          <div className="text-sm text-muted-foreground">{new Date(note.date).toLocaleDateString()}</div>
                        </div>
                        <p>{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-muted-foreground">No notes yet.</p>
                  )}
                  {isStaff && (
                    <div className="pt-4 border-t">
                      <Textarea
                        placeholder="Add an observation or note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="mb-2"
                      />
                      <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                        <Send className="mr-2 h-4 w-4" /> Add Note
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const UserIcon = () => (
  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default ChildDetails;
