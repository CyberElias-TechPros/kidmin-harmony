import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, FileText, Edit, Trash2, Download, CheckCircle, User, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  useEvent, useDeleteEvent, useRegisterEventChild, useChildren,
} from "@/services/api/hooks";
import { queryKeys } from "@/services/api/hooks";
import { eventsApi } from "@/services/api/client";

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, isError } = useEvent(id!);
  const deleteEvent = useDeleteEvent();
  const registerChild = useRegisterEventChild();
  const { data: childrenData } = useChildren();
  const [registerChildId, setRegisterChildId] = useState("");
  const [volName, setVolName] = useState("");
  const [volRole, setVolRole] = useState("");
  const qc = useQueryClient();
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "admin" || user?.role === "teacher";

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-40" /><Skeleton className="h-96 w-full rounded-xl" /></div>;
  if (isError || !data?.event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <Button onClick={() => navigate("/events")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </div>
    );
  }

  const { event, attendees, volunteers } = data;

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      navigate("/events");
    } catch { /* handled in hook */ }
  };

  const handleRegister = async () => {
    if (!registerChildId) return;
    try {
      await registerChild.mutateAsync({ eventId: event.id, childId: registerChildId, status: "confirmed" });
      setRegisterChildId("");
    } catch { /* handled in hook */ }
  };

  const handleAddVolunteer = async () => {
    if (!volName.trim()) return;
    try {
      await eventsApi.addVolunteer(event.id, { name: volName, role: volRole });
      toast.success("Volunteer assigned");
      setVolName("");
      setVolRole("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign volunteer");
    }
  };

  const handleRemoveAttendee = async (childId: string) => {
    try {
      await eventsApi.removeChild(event.id, childId);
      qc.invalidateQueries({ queryKey: queryKeys.event(event.id) });
      qc.invalidateQueries({ queryKey: queryKeys.events });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove attendee");
    }
  };

  const formatDateRange = () => {
    if (event.startDate === event.endDate) return format(new Date(event.startDate), "EEEE, MMMM d, yyyy");
    return `${format(new Date(event.startDate), "MMM d")} - ${format(new Date(event.endDate), "MMM d, yyyy")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-lg bg-secondary/10">
            <div className="absolute inset-0">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-primary/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            <div className="relative p-6 pt-32 md:p-8 md:pt-40">
              <div className="space-y-4">
                <Badge className="mb-2">{event.status === "upcoming" ? "Upcoming" : "Completed"}</Badge>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /><span>{formatDateRange()}</span></div>
                  <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /><span>{event.startTime} - {event.endTime}</span></div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <div><div>{event.location || "Location TBD"}</div><div className="text-sm text-muted-foreground">{event.address}</div></div>
                </div>
                <div className="flex items-center"><Users className="h-4 w-4 mr-2" /><span>{attendees.length} / {event.capacity} registered</span></div>
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
                <CardHeader><CardTitle>Event Description</CardTitle></CardHeader>
                <CardContent><p className="whitespace-pre-line">{event.description || "No description provided."}</p></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendees" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Registered Children</CardTitle>
                    <CardDescription>{attendees.length} children registered for this event</CardDescription>
                  </div>
                  {(isStaff || user?.role === "parent") && (
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm"><User className="h-4 w-4 mr-2" /> Register Child</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Register a Child</DialogTitle>
                          <DialogDescription>Add a child to this event's attendee list.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Label>Child</Label>
                          <Select value={registerChildId} onValueChange={setRegisterChildId}>
                            <SelectTrigger><SelectValue placeholder="Select a child" /></SelectTrigger>
                            <SelectContent>
                              {(childrenData?.children ?? []).map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleRegister} disabled={!registerChildId}>Register</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {attendees.length > 0 ? (
                    <div className="space-y-3">
                      {attendees.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-4 w-4 text-primary" /></div>
                            <div>
                              <p className="font-medium">{a.name}</p>
                              <p className="text-xs text-muted-foreground">Parent: {a.parent || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> {a.status}</Badge>
                            {isStaff && (
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleRemoveAttendee(a.childId)}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No children registered for this event yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volunteers" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Assigned Volunteers</CardTitle>
                    <CardDescription>{volunteers.length} volunteers assigned to this event</CardDescription>
                  </div>
                  {isStaff && (
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm"><User className="h-4 w-4 mr-2" /> Assign Volunteer</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Assign a Volunteer</DialogTitle>
                          <DialogDescription>Add someone to help at this event.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="space-y-1"><Label>Name</Label><Input value={volName} onChange={(e) => setVolName(e.target.value)} /></div>
                          <div className="space-y-1"><Label>Role</Label><Input value={volRole} onChange={(e) => setVolRole(e.target.value)} placeholder="e.g. Group Leader" /></div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddVolunteer} disabled={!volName.trim()}>Assign</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {volunteers.length > 0 ? (
                    <div className="space-y-3">
                      {volunteers.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-4 w-4 text-primary" /></div>
                            <div>
                              <p className="font-medium">{v.name}</p>
                              <p className="text-xs text-muted-foreground">{v.role || "Volunteer"} {v.assigned ? `· ${v.assigned}` : ""}</p>
                            </div>
                          </div>
                          {isStaff && (
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={async () => {
                              try {
                                await eventsApi.removeVolunteer(event.id, v.id);
                                qc.invalidateQueries({ queryKey: queryKeys.event(event.id) });
                              } catch (e) {
                                toast.error(e instanceof Error ? e.message : "Failed to remove volunteer");
                              }
                            }}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No volunteers assigned to this event yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Event Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {isStaff && (
                <>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/events/${event.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Event
                  </Button>
                  {isAdmin && (
                    <Button variant="destructive" className="w-full" onClick={handleDelete}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Event
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Event Statistics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Registration Status</span>
                  <span className="text-sm font-medium">{event.capacity > 0 ? Math.round((attendees.length / event.capacity) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${event.capacity > 0 ? Math.min(100, (attendees.length / event.capacity) * 100) : 0}%` }} />
                </div>
              </div>
              <div className="space-y-3">
                <Row label="Total capacity" value={event.capacity} />
                <Row label="Registered attendees" value={attendees.length} />
                <Row label="Available spots" value={Math.max(0, event.capacity - attendees.length)} />
                <Row label="Volunteers assigned" value={volunteers.length} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between text-sm"><span>{label}:</span><span className="font-medium">{value}</span></div>
);

export default EventDetails;
