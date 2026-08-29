import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Search, CalendarDays, Map, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/services/api/hooks";
import type { Event } from "@/services/api/types";

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");

  const upcoming = (data?.upcoming ?? []).filter((e) => matchesSearch(e, searchQuery));
  const past = (data?.past ?? []).filter((e) => matchesSearch(e, searchQuery));

  const canCreate = user?.role === "admin" || user?.role === "teacher";

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Church Events</h1>
        <p className="text-muted-foreground">Manage and view all upcoming and past church events</p>
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
        {canCreate && (
          <Button onClick={() => navigate("/events/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add New Event
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <EventGridSkeleton />
          ) : upcoming.length > 0 ? (
            <EventGrid events={upcoming} onView={(id) => navigate(`/events/${id}`)} />
          ) : (
            <EmptyEvents searchQuery={searchQuery} onCreate={canCreate ? () => navigate("/events/add") : undefined} />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {isLoading ? (
            <EventGridSkeleton />
          ) : past.length > 0 ? (
            <EventGrid events={past} onView={(id) => navigate(`/events/${id}`)} dim />
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No past events found</h3>
              <p className="text-muted-foreground">{searchQuery ? `No results for "${searchQuery}"` : "Past events will appear here"}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const matchesSearch = (event: Event, q: string) => {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    event.title.toLowerCase().includes(s) ||
    (event.description || "").toLowerCase().includes(s) ||
    (event.location || "").toLowerCase().includes(s)
  );
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const EventGrid = ({ events, onView, dim }: { events: Event[]; onView: (id: string) => void; dim?: boolean }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {events.map((event) => (
      <Card key={event.id} className={`overflow-hidden flex flex-col h-full ${dim ? "opacity-80 hover:opacity-100 transition-opacity" : ""}`}>
        <div className="aspect-video w-full overflow-hidden bg-secondary">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <Calendar className="h-12 w-12 text-primary/40" />
            </div>
          )}
        </div>
        <CardHeader className="p-4">
          <CardTitle className="line-clamp-1">{event.title}</CardTitle>
          <CardDescription className="flex items-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1" /> {formatDate(event.startDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <Map className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
              <span>{event.location || "Location TBD"}</span>
            </div>
            <div className="flex items-start">
              <Users className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
              <span>{event.registeredAttendees} / {event.capacity} registered</span>
            </div>
            {event.description && <p className="line-clamp-2 text-muted-foreground mt-2">{event.description}</p>}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" onClick={() => onView(event.id)}>View Details</Button>
        </CardFooter>
      </Card>
    ))}
  </div>
);

const EventGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
  </div>
);

const EmptyEvents = ({ searchQuery, onCreate }: { searchQuery: string; onCreate?: () => void }) => (
  <div className="text-center py-12">
    <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
    <h3 className="mt-4 text-lg font-medium">No upcoming events found</h3>
    <p className="text-muted-foreground">{searchQuery ? `No results for "${searchQuery}"` : "Check back soon for new events"}</p>
    {onCreate && (
      <Button className="mt-4" onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" /> Create New Event
      </Button>
    )}
  </div>
);

export default Events;
