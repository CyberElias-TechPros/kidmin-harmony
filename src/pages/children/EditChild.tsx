import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChild, useUpdateChild } from "@/services/api/hooks";
import type { ChildInput } from "@/services/api/types";

interface ChildFormData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  ageGroup: string;
  allergies: string;
  medicalNotes: string;
  churchMember: boolean;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
}

const EditChild = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useChild(id!);
  const updateChild = useUpdateChild();
  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm<ChildFormData>();
  const [gender, setGender] = React.useState<string>("");
  const [ageGroup, setAgeGroup] = React.useState<string>("");
  const [churchMember, setChurchMember] = React.useState<boolean>(false);

  useEffect(() => {
    if (data?.child) {
      const c = data.child;
      setGender(c.gender || "");
      setAgeGroup(c.ageGroup || "");
      setChurchMember(c.churchMember);
      reset({
        firstName: c.firstName,
        lastName: c.lastName,
        dob: c.dob || "",
        gender: c.gender || "",
        ageGroup: c.ageGroup || "",
        allergies: c.allergies || "",
        medicalNotes: c.medicalNotes || "",
        churchMember: c.churchMember,
        parentFirstName: c.parentFirstName || "",
        parentLastName: c.parentLastName || "",
        parentEmail: c.parentEmail || "",
        parentPhone: c.parentPhone || "",
        address: c.address || "",
        city: c.city || "",
        state: c.state || "",
        zipCode: c.zipCode || "",
        emergencyContactName: c.emergencyContactName || "",
        emergencyContactRelation: c.emergencyContactRelation || "",
        emergencyContactPhone: c.emergencyContactPhone || "",
      });
    }
  }, [data, reset]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.child) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Child Not Found</h2>
        <Button onClick={() => navigate("/children")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </div>
    );
  }

  const onSubmit = async (data: ChildFormData) => {
    const payload: ChildInput = {
      ...data,
      gender: gender || undefined,
      ageGroup: ageGroup || undefined,
      churchMember,
      allergies: data.allergies || undefined,
      medicalNotes: data.medicalNotes || undefined,
      dob: data.dob || undefined,
    };
    try {
      await updateChild.mutateAsync({ id: id!, data: payload });
      navigate(`/children/${id}`);
    } catch {
      // hook shows toast
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Edit Child</h1>
          <p className="text-muted-foreground">Update {data.child.fullName}'s information</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/children/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
              <CardDescription>Basic details about the child</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register("firstName", { required: "First name is required" })} className={cn(errors.firstName && "border-destructive")} />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register("lastName", { required: "Last name is required" })} className={cn(errors.lastName && "border-destructive")} />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" {...register("dob")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger id="ageGroup"><SelectValue placeholder="Select Age Group" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-school">Pre-School (3-5)</SelectItem>
                    <SelectItem value="elementary">Elementary (6-10)</SelectItem>
                    <SelectItem value="pre-teen">Pre-Teen (11-12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea id="allergies" placeholder="List allergies or 'None'" {...register("allergies")} className="resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalNotes">Medical Notes</Label>
                <Textarea id="medicalNotes" placeholder="Important medical information" {...register("medicalNotes")} className="resize-none" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="churchMember" checked={churchMember} onCheckedChange={(c) => setChurchMember(c as boolean)} />
                <Label htmlFor="churchMember">Family is church member</Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parent/Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="parentFirstName">First Name</Label><Input id="parentFirstName" {...register("parentFirstName")} /></div>
                  <div className="space-y-2"><Label htmlFor="parentLastName">Last Name</Label><Input id="parentLastName" {...register("parentLastName")} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="parentEmail">Email</Label><Input id="parentEmail" type="email" {...register("parentEmail")} /></div>
                <div className="space-y-2"><Label htmlFor="parentPhone">Phone</Label><Input id="parentPhone" {...register("parentPhone")} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" {...register("city")} /></div>
                  <div className="space-y-2"><Label htmlFor="state">State</Label><Input id="state" {...register("state")} /></div>
                  <div className="space-y-2"><Label htmlFor="zipCode">Zip</Label><Input id="zipCode" {...register("zipCode")} /></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="emergencyContactName">Name</Label><Input id="emergencyContactName" {...register("emergencyContactName")} /></div>
                  <div className="space-y-2"><Label htmlFor="emergencyContactRelation">Relationship</Label><Input id="emergencyContactRelation" {...register("emergencyContactRelation")} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="emergencyContactPhone">Phone</Label><Input id="emergencyContactPhone" {...register("emergencyContactPhone")} /></div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-6" />
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/children/${id}`)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditChild;
