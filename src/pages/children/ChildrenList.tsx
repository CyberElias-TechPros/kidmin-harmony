
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Filter, Eye, Edit, Trash } from 'lucide-react';

// Mock data for children
const mockChildren = [
  {
    id: '1',
    name: 'Emma Johnson',
    age: 7,
    gender: 'Female',
    ageGroup: 'Elementary',
    parentName: 'Sarah Johnson',
    attendance: '85%',
    checkInStatus: 'present',
    registrationDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Jacob Smith',
    age: 5,
    gender: 'Male',
    ageGroup: 'Pre-School',
    parentName: 'Michael Smith',
    attendance: '78%',
    checkInStatus: 'absent',
    registrationDate: '2023-02-22',
  },
  {
    id: '3',
    name: 'Olivia Davis',
    age: 9,
    gender: 'Female',
    ageGroup: 'Elementary',
    parentName: 'Emily Davis',
    attendance: '92%',
    checkInStatus: 'present',
    registrationDate: '2022-11-05',
  },
  {
    id: '4',
    name: 'Noah Wilson',
    age: 4,
    gender: 'Male',
    ageGroup: 'Pre-School',
    parentName: 'James Wilson',
    attendance: '65%',
    checkInStatus: 'absent',
    registrationDate: '2023-03-10',
  },
  {
    id: '5',
    name: 'Sophia Brown',
    age: 10,
    gender: 'Female',
    ageGroup: 'Elementary',
    parentName: 'Jennifer Brown',
    attendance: '88%',
    checkInStatus: 'present',
    registrationDate: '2022-09-18',
  },
  {
    id: '6',
    name: 'William Miller',
    age: 6,
    gender: 'Male',
    ageGroup: 'Elementary',
    parentName: 'David Miller',
    attendance: '72%',
    checkInStatus: 'absent',
    registrationDate: '2023-04-05',
  },
  {
    id: '7',
    name: 'Ava Anderson',
    age: 3,
    gender: 'Female',
    ageGroup: 'Pre-School',
    parentName: 'Robert Anderson',
    attendance: '80%',
    checkInStatus: 'present',
    registrationDate: '2023-05-12',
  },
];

const ChildrenList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Apply filters and search
  const filteredChildren = mockChildren.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          child.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAgeGroup = ageGroupFilter === 'all' || child.ageGroup === ageGroupFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'present' && child.checkInStatus === 'present') ||
                           (statusFilter === 'absent' && child.checkInStatus === 'absent');
    
    return matchesSearch && matchesAgeGroup && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Children</h1>
          <p className="text-muted-foreground">
            Manage children registration and information
          </p>
        </div>
        <Button onClick={() => navigate('/children/add')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Register Child
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Children Registry</CardTitle>
          <CardDescription>
            View and manage all registered children
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or parent..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={ageGroupFilter}
                onValueChange={setAgeGroupFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Age Group</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="Pre-School">Pre-School</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Children Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChildren.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">{child.name}</TableCell>
                    <TableCell>{child.age} years</TableCell>
                    <TableCell>{child.ageGroup}</TableCell>
                    <TableCell>{child.parentName}</TableCell>
                    <TableCell>{child.attendance}</TableCell>
                    <TableCell>
                      <Badge
                        variant={child.checkInStatus === 'present' ? 'default' : 'outline'}
                        className={
                          child.checkInStatus === 'present' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'text-red-500 border-red-200'
                        }
                      >
                        {child.checkInStatus === 'present' ? 'Present' : 'Absent'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/children/${child.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/children/${child.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => {
                            // Handle delete functionality here
                          }}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredChildren.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No children found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredChildren.length} of {mockChildren.length} children
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildrenList;
