
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const AddChild = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ChildFormData>();

  // Form state for select components
  const [gender, setGender] = React.useState<string>('');
  const [ageGroup, setAgeGroup] = React.useState<string>('');
  const [churchMember, setChurchMember] = React.useState<boolean>(false);

  const onSubmit = async (data: ChildFormData) => {
    // In a real app, we would save the data to the database
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted with:', data);
      
      toast.success('Child registered successfully!');
      navigate('/children');
    } catch (error) {
      toast.error('Failed to register child. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Register New Child</h1>
          <p className="text-muted-foreground">
            Add a new child to the children's ministry
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/children')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Child Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
              <CardDescription>Enter basic details about the child</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register('firstName', {
                      required: 'First name is required'
                    })}
                    className={cn(errors.firstName && 'border-destructive')}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register('lastName', {
                      required: 'Last name is required'
                    })}
                    className={cn(errors.lastName && 'border-destructive')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    {...register('dob', {
                      required: 'Date of birth is required'
                    })}
                    className={cn(errors.dob && 'border-destructive')}
                  />
                  {errors.dob && (
                    <p className="text-sm text-destructive">{errors.dob.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={gender}
                    onValueChange={(value) => setGender(value)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
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
                <Select
                  value={ageGroup}
                  onValueChange={(value) => setAgeGroup(value)}
                >
                  <SelectTrigger id="ageGroup">
                    <SelectValue placeholder="Select Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-school">Pre-School (3-5 years)</SelectItem>
                    <SelectItem value="elementary">Elementary (6-10 years)</SelectItem>
                    <SelectItem value="pre-teen">Pre-Teen (11-12 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any allergies or write 'None'"
                  {...register('allergies')}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalNotes">Medical Notes</Label>
                <Textarea
                  id="medicalNotes"
                  placeholder="Any important medical information"
                  {...register('medicalNotes')}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="churchMember"
                  checked={churchMember}
                  onCheckedChange={(checked) => setChurchMember(checked as boolean)}
                />
                <Label htmlFor="churchMember">Family is church member</Label>
              </div>
            </CardContent>
          </Card>

          {/* Parent/Guardian Information Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parent/Guardian Information</CardTitle>
                <CardDescription>Enter details about the child's parent or guardian</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentFirstName">First Name</Label>
                    <Input
                      id="parentFirstName"
                      {...register('parentFirstName', {
                        required: "Parent's first name is required"
                      })}
                      className={cn(errors.parentFirstName && 'border-destructive')}
                    />
                    {errors.parentFirstName && (
                      <p className="text-sm text-destructive">{errors.parentFirstName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentLastName">Last Name</Label>
                    <Input
                      id="parentLastName"
                      {...register('parentLastName', {
                        required: "Parent's last name is required"
                      })}
                      className={cn(errors.parentLastName && 'border-destructive')}
                    />
                    {errors.parentLastName && (
                      <p className="text-sm text-destructive">{errors.parentLastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    {...register('parentEmail', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={cn(errors.parentEmail && 'border-destructive')}
                  />
                  {errors.parentEmail && (
                    <p className="text-sm text-destructive">{errors.parentEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Phone Number</Label>
                  <Input
                    id="parentPhone"
                    {...register('parentPhone', {
                      required: 'Phone number is required'
                    })}
                    className={cn(errors.parentPhone && 'border-destructive')}
                  />
                  {errors.parentPhone && (
                    <p className="text-sm text-destructive">{errors.parentPhone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register('address', {
                      required: 'Address is required'
                    })}
                    className={cn(errors.address && 'border-destructive')}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register('city', {
                        required: 'City is required'
                      })}
                      className={cn(errors.city && 'border-destructive')}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register('state', {
                        required: 'State is required'
                      })}
                      className={cn(errors.state && 'border-destructive')}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode', {
                        required: 'Zip code is required'
                      })}
                      className={cn(errors.zipCode && 'border-destructive')}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Provide a contact in case of emergency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    {...register('emergencyContactName', {
                      required: 'Emergency contact name is required'
                    })}
                    className={cn(errors.emergencyContactName && 'border-destructive')}
                  />
                  {errors.emergencyContactName && (
                    <p className="text-sm text-destructive">{errors.emergencyContactName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation">Relationship to Child</Label>
                  <Input
                    id="emergencyContactRelation"
                    {...register('emergencyContactRelation', {
                      required: 'Relationship is required'
                    })}
                    className={cn(errors.emergencyContactRelation && 'border-destructive')}
                  />
                  {errors.emergencyContactRelation && (
                    <p className="text-sm text-destructive">{errors.emergencyContactRelation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                  <Input
                    id="emergencyContactPhone"
                    {...register('emergencyContactPhone', {
                      required: 'Emergency contact phone is required'
                    })}
                    className={cn(errors.emergencyContactPhone && 'border-destructive')}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-sm text-destructive">{errors.emergencyContactPhone.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/children')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              'Registering...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Register Child
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddChild;
