import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent, useUpdateEvent } from "@/services/api/hooks";
import type { Event } from "@/services/api/types";

interface EventFormData {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  description: string;
  capacity: number;
}

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useEvent(id!);
  const updateEvent = useUpdateEvent();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<EventFormData>();

  useEffect(() => {
    if (data?.event) {
      const e = data.event;
      reset({
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        startTime: e.startTime || "09:00",
        endTime: e.endTime || "12:00",
        location: e.location || "",
        address: e.address || "",
        description: e.description || "",
        capacity: e.capacity,
      });
    }
  }, [data, reset]);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-40" /><Skeleton className="h-96 w-full rounded-xl" /></div>;
  if (!data?.event) return <div className="py-12 text-center text-muted-foreground">Event not found.</div>;

  const onSubmit = async (form: EventFormData) => {
    const payload: Partial<Event> = {
      title: form.title,
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location,
      address: form.address,
      description: form.description,
      capacity: form.capacity,
    };
    try {
      await updateEvent.mutateAsync({ id: id!, data: payload });
      navigate(`/events/${id}`);
    } catch { /* handled in hook */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(`/events/${id}`)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <h1 className="text-2xl font-bold">Edit Event</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Event Details</CardTitle><CardDescription>Update the event information</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Event Title</Label><Input {...register("title", { required: "Title is required" })} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" {...register("startDate")} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" {...register("endDate")} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Time</Label><Input type="time" {...register("startTime")} /></div>
              <div className="space-y-2"><Label>End Time</Label><Input type="time" {...register("endTime")} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Location</Label><Input {...register("location")} /></div>
              <div className="space-y-2"><Label>Capacity</Label><Input type="number" min={1} {...register("capacity")} /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input {...register("address")} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={4} {...register("description")} /></div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/events/${id}`)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> Save</Button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
