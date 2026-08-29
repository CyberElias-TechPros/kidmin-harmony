import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Search, Plus, Download, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLessons } from "@/services/api/hooks";
import type { Lesson } from "@/services/api/types";

const Curriculum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useLessons();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const lessons = useMemo(() => data?.lessons ?? [], [data]);
  const canCreate = user?.role === "admin" || user?.role === "teacher";

  const categories = Array.from(new Set(lessons.map((l) => l.category).filter(Boolean))) as string[];
  const ageGroups = Array.from(new Set(lessons.map((l) => l.ageGroup).filter(Boolean))) as string[];

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return lessons.filter((lesson) => {
      const matchesSearch =
        lesson.title.toLowerCase().includes(q) ||
        (lesson.description || "").toLowerCase().includes(q) ||
        (lesson.category || "").toLowerCase().includes(q);
      const matchesAge = selectedAgeGroup === "" || lesson.ageGroup === selectedAgeGroup;
      const matchesCat = selectedCategory === "" || lesson.category === selectedCategory;
      return matchesSearch && matchesAge && matchesCat;
    });
  }, [lessons, searchQuery, selectedAgeGroup, selectedCategory]);

  const now = Date.now();
  const upcoming = filtered.filter((l) => l.date && new Date(l.date).getTime() >= now).sort((a, b) => (a.date! < b.date! ? -1 : 1));
  const past = filtered.filter((l) => !l.date || new Date(l.date).getTime() < now).sort((a, b) => (a.date! < b.date! ? 1 : -1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
          <p className="text-muted-foreground mt-1">Manage lesson plans and teaching materials</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/lessons/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add New Lesson
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Search Lessons</CardTitle>
              <CardDescription>Find lessons by title, content, or category</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search lessons..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Age Group" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ages</SelectItem>
                    {ageGroups.map((age) => <SelectItem key={age} value={age}>{age}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2"><p className="text-4xl font-bold">{lessons.length}</p><p className="text-sm text-muted-foreground">Total Lessons</p></div>
            <div className="text-center space-y-2"><p className="text-4xl font-bold">{upcoming.length}</p><p className="text-sm text-muted-foreground">Upcoming Lessons</p></div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Lessons</TabsTrigger>
            <TabsTrigger value="past">Past Lessons</TabsTrigger>
            <TabsTrigger value="all">All Lessons</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcoming.length === 0 ? <EmptyLessons onCreate={canCreate ? () => navigate("/lessons/add") : undefined} /> :
              upcoming.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} onView={() => navigate(`/lessons/${lesson.id}`)} />)}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {past.length === 0 ? <EmptyLessons /> :
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {past.map((lesson) => (
                  <Card key={lesson.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        {lesson.category && <Badge variant="outline">{lesson.category}</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{lesson.description || "No description"}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                        {lesson.date && <div className="flex items-center"><Calendar className="h-3 w-3 mr-1" /><span>{new Date(lesson.date).toLocaleDateString()}</span></div>}
                        {lesson.duration && <div className="flex items-center"><Clock className="h-3 w-3 mr-1" /><span>{lesson.duration} min</span></div>}
                        {lesson.ageGroup && <div>Ages {lesson.ageGroup}</div>}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="outline" className="w-full" onClick={() => navigate(`/lessons/${lesson.id}`)}>
                        <FileText className="mr-2 h-4 w-4" /> View Lesson
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filtered.length === 0 ? <EmptyLessons onCreate={canCreate ? () => navigate("/lessons/add") : undefined} /> :
              filtered.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} onView={() => navigate(`/lessons/${lesson.id}`)} list />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const LessonRow = ({ lesson, onView, list }: { lesson: Lesson; onView: () => void; list?: boolean }) => (
  <Card className="overflow-hidden">
    <div className="flex flex-col md:flex-row">
      <div className="bg-primary/10 p-6 flex flex-col justify-center items-center md:w-48">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">{lesson.date ? new Date(lesson.date).toLocaleDateString(undefined, { month: "short" }) : "—"}</p>
          <p className="text-3xl font-bold">{lesson.date ? new Date(lesson.date).getDate() : "—"}</p>
        </div>
      </div>
      <CardContent className="flex-1 p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-xl font-semibold">{lesson.title}</h3>
            <p className="text-muted-foreground mt-1">{lesson.description || "No description"}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {lesson.category && <Badge variant="outline">{lesson.category}</Badge>}
              {lesson.ageGroup && <Badge variant="outline">Ages {lesson.ageGroup}</Badge>}
              {lesson.duration && <div className="flex items-center"><Clock className="h-3 w-3 mr-1" /><span className="text-xs">{lesson.duration} min</span></div>}
            </div>
          </div>
          <div className="flex items-start mt-4 md:mt-0">
            <Button onClick={onView}>{list ? "View Lesson" : "View Details"}</Button>
          </div>
        </div>
      </CardContent>
    </div>
  </Card>
);

const EmptyLessons = ({ onCreate }: { onCreate?: () => void }) => (
  <div className="text-center p-8">
    <p className="text-lg font-medium">No lessons found</p>
    <p className="text-muted-foreground mt-1">Try adjusting your search filters or create a new lesson</p>
    {onCreate && <Button className="mt-4" onClick={onCreate}><Plus className="mr-2 h-4 w-4" /> Add New Lesson</Button>}
  </div>
);

export default Curriculum;
