import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Trash2, Calendar, Clock, Save } from "lucide-react";
import { useLesson, useUpdateLesson } from "@/services/api/hooks";

interface Activity { id: string; name: string; description: string; duration: number; materials: string; }

const EditLesson = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useLesson(id!);
  const updateLesson = useUpdateLesson();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (data) {
      setTitle(data.lesson.title);
      setDescription(data.lesson.description || "");
      setAgeGroup(data.lesson.ageGroup || "");
      setDate(data.lesson.date || "");
      setDuration(data.lesson.duration?.toString() || "");
      setObjectives(data.objectives.length ? data.objectives : [""]);
      setMaterials(data.materials.length ? data.materials : [""]);
      setActivities(data.activities.length
        ? data.activities.map((a, i) => ({ id: String(i), name: a.name, description: a.description || "", duration: a.duration || 0, materials: a.materials.join(", ") }))
        : [{ id: "0", name: "", description: "", duration: 0, materials: "" }]);
    }
  }, [data]);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-40" /><Skeleton className="h-96 w-full rounded-xl" /></div>;
  if (isError || !data?.lesson) return <div className="py-12 text-center text-muted-foreground">Lesson not found.</div>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLesson.mutateAsync({
        id: id!,
        data: {
          title: title.trim(),
          description,
          ageGroup,
          date,
          duration: parseInt(duration, 10) || 0,
          objectives: objectives.map((o) => o.trim()).filter(Boolean),
          materials: materials.map((m) => m.trim()).filter(Boolean),
          activities: activities
            .filter((a) => a.name.trim())
            .map((a) => ({ name: a.name, description: a.description, duration: a.duration, materials: a.materials.split(",").map((m) => m.trim()).filter(Boolean) })),
        },
      });
      navigate(`/lessons/${id}`);
    } catch { /* handled in hook */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(`/lessons/${id}`)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <h1 className="text-2xl font-bold">Edit Lesson</h1>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Age Group</Label><Select value={ageGroup} onValueChange={setAgeGroup}><SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger><SelectContent>
                <SelectItem value="toddlers">Toddlers (2-3)</SelectItem>
                <SelectItem value="preschool">Preschool (4-5)</SelectItem>
                <SelectItem value="elementary">Elementary (6-9)</SelectItem>
                <SelectItem value="preteen">Preteen (10-12)</SelectItem>
                <SelectItem value="youth">Youth (13-18)</SelectItem>
                <SelectItem value="all">All Ages</SelectItem>
              </SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Lesson Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="space-y-2"><Label className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Duration (minutes)</Label><Input type="number" min="5" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Learning Objectives</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2">
                <Input placeholder={`Objective ${i + 1}`} value={obj} onChange={(e) => setObjectives(objectives.map((o, idx) => idx === i ? e.target.value : o))} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setObjectives([...objectives, ""])}><Plus className="mr-2 h-4 w-4" /> Add Objective</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Materials</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {materials.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <Input placeholder={`Material ${i + 1}`} value={m} onChange={(e) => setMaterials(materials.map((o, idx) => idx === i ? e.target.value : o))} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setMaterials([...materials, ""])}><Plus className="mr-2 h-4 w-4" /> Add Material</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Activities</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {activities.map((a, i) => (
              <div key={a.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Input placeholder="Activity name" value={a.name} onChange={(e) => setActivities(activities.map((o, idx) => idx === i ? { ...o, name: e.target.value } : o))} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setActivities(activities.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <Textarea placeholder="Description" value={a.description} onChange={(e) => setActivities(activities.map((o, idx) => idx === i ? { ...o, description: e.target.value } : o))} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Duration (min)" value={a.duration || ""} onChange={(e) => setActivities(activities.map((o, idx) => idx === i ? { ...o, duration: parseInt(e.target.value, 10) || 0 } : o))} />
                  <Input placeholder="Materials (comma separated)" value={a.materials} onChange={(e) => setActivities(activities.map((o, idx) => idx === i ? { ...o, materials: e.target.value } : o))} />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setActivities([...activities, { id: crypto.randomUUID(), name: "", description: "", duration: 0, materials: "" }])}><Plus className="mr-2 h-4 w-4" /> Add Activity</Button>
          </CardContent>
        </Card>

        <Separator className="my-4" />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/lessons/${id}`)}>Cancel</Button>
          <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditLesson;
