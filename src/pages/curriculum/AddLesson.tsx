
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Trash2, Calendar, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number;
  materials: string;
}

interface Material {
  id: string;
  name: string;
}

interface Objective {
  id: string;
  text: string;
}

const AddLesson = () => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  
  const [objectives, setObjectives] = useState<Objective[]>([
    { id: '1', text: '' }
  ]);
  
  const [materials, setMaterials] = useState<Material[]>([
    { id: '1', name: '' }
  ]);
  
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', name: '', description: '', duration: 0, materials: '' }
  ]);
  
  const handleAddObjective = () => {
    setObjectives([...objectives, { id: crypto.randomUUID(), text: '' }]);
  };
  
  const handleRemoveObjective = (id: string) => {
    if (objectives.length > 1) {
      setObjectives(objectives.filter(obj => obj.id !== id));
    } else {
      toast.error("You must have at least one learning objective");
    }
  };
  
  const handleObjectiveChange = (id: string, value: string) => {
    setObjectives(objectives.map(obj => 
      obj.id === id ? { ...obj, text: value } : obj
    ));
  };
  
  const handleAddMaterial = () => {
    setMaterials([...materials, { id: crypto.randomUUID(), name: '' }]);
  };
  
  const handleRemoveMaterial = (id: string) => {
    if (materials.length > 1) {
      setMaterials(materials.filter(mat => mat.id !== id));
    } else {
      toast.error("You must have at least one material");
    }
  };
  
  const handleMaterialChange = (id: string, value: string) => {
    setMaterials(materials.map(mat => 
      mat.id === id ? { ...mat, name: value } : mat
    ));
  };
  
  const handleAddActivity = () => {
    setActivities([...activities, { 
      id: crypto.randomUUID(), 
      name: '', 
      description: '', 
      duration: 0,
      materials: ''
    }]);
  };
  
  const handleRemoveActivity = (id: string) => {
    if (activities.length > 1) {
      setActivities(activities.filter(activity => activity.id !== id));
    } else {
      toast.error("You must have at least one activity");
    }
  };
  
  const handleActivityChange = (id: string, field: keyof Activity, value: string | number) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    
    if (!ageGroup) {
      toast.error("Age group is required");
      return;
    }
    
    if (!date) {
      toast.error("Lesson date is required");
      return;
    }
    
    if (!duration) {
      toast.error("Lesson duration is required");
      return;
    }
    
    // Check if any objective is empty
    if (objectives.some(obj => !obj.text.trim())) {
      toast.error("All learning objectives must be filled out");
      return;
    }
    
    // Check if any material is empty
    if (materials.some(mat => !mat.name.trim())) {
      toast.error("All materials must be filled out");
      return;
    }
    
    // Check if any activity is incomplete
    for (const activity of activities) {
      if (!activity.name.trim()) {
        toast.error("All activities must have a name");
        return;
      }
      if (!activity.description.trim()) {
        toast.error("All activities must have a description");
        return;
      }
      if (!activity.duration) {
        toast.error("All activities must have a duration");
        return;
      }
    }
    
    // Success - in a real app, we would call an API here
    toast.success("Lesson created successfully!");
    
    // Redirect back to the lessons page
    navigate('/lessons');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/lessons')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>
        <h1 className="text-2xl font-bold">Create New Lesson</h1>
        <div className="w-[100px]"></div> {/* Empty div for flex spacing */}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., The Good Samaritan" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age-group">Age Group</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger id="age-group">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toddlers">Toddlers (2-3)</SelectItem>
                    <SelectItem value="preschool">Preschool (4-5)</SelectItem>
                    <SelectItem value="elementary">Elementary (6-9)</SelectItem>
                    <SelectItem value="preteen">Preteen (10-12)</SelectItem>
                    <SelectItem value="youth">Youth (13-18)</SelectItem>
                    <SelectItem value="all">All Ages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Lesson Description</Label>
              <Textarea 
                id="description" 
                placeholder="Briefly describe what this lesson is about..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Lesson Date
                </Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Duration (minutes)
                </Label>
                <Input 
                  id="duration" 
                  type="number" 
                  min="5"
                  max="180"
                  step="5"
                  placeholder="e.g., 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {objectives.map((objective, index) => (
              <div key={objective.id} className="flex items-start gap-2">
                <div className="flex-grow">
                  <Input 
                    placeholder={`Objective ${index + 1} (e.g., "Students will understand...")`}
                    value={objective.text}
                    onChange={(e) => handleObjectiveChange(objective.id, e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveObjective(objective.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleAddObjective}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Objective
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {materials.map((material, index) => (
              <div key={material.id} className="flex items-start gap-2">
                <div className="flex-grow">
                  <Input 
                    placeholder={`Material ${index + 1} (e.g., "Bibles")`}
                    value={material.name}
                    onChange={(e) => handleMaterialChange(material.id, e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMaterial(material.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleAddMaterial}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity.id} className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Activity {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveActivity(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Activity Name</Label>
                    <Input 
                      placeholder="e.g., Bible Story Time"
                      value={activity.name}
                      onChange={(e) => handleActivityChange(activity.id, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Describe this activity..."
                      value={activity.description}
                      onChange={(e) => handleActivityChange(activity.id, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Duration (minutes)
                      </Label>
                      <Input 
                        type="number"
                        min="1"
                        placeholder="e.g., 15"
                        value={activity.duration || ''}
                        onChange={(e) => handleActivityChange(activity.id, 'duration', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Materials Needed</Label>
                      <Input 
                        placeholder="e.g., Bible, craft supplies"
                        value={activity.materials}
                        onChange={(e) => handleActivityChange(activity.id, 'materials', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddActivity}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <h3 className="font-medium">Drop files here or click to upload</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upload lesson plans, worksheets, presentation files, or any other resources
                </p>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={() => toast.info("File upload would be processed here")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Select Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/lessons')}
          >
            Cancel
          </Button>
          <Button type="submit">Create Lesson</Button>
        </div>
      </form>
    </div>
  );
};

export default AddLesson;
