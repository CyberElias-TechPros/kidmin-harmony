
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartHandshake, Search, Plus, Mail, Phone, Building, DollarSign, Calendar } from 'lucide-react';

// Mock data for partners
const partnersMockData = [
  {
    id: '1',
    name: 'Grace Community Foundation',
    contactPerson: 'John Smith',
    email: 'john@gracefoundation.org',
    phone: '(555) 123-4567',
    partnershipType: 'Financial',
    contributionAmount: '$5,000',
    lastContribution: '2023-01-15',
    nextMeeting: '2023-07-10',
    notes: 'Annual sponsor for Bible Camp and Christmas events.',
    status: 'active'
  },
  {
    id: '2',
    name: 'Kingdom Kids Publishing',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@kingdomkids.com',
    phone: '(555) 987-6543',
    partnershipType: 'Resource',
    contributionAmount: null,
    lastContribution: '2023-03-01',
    nextMeeting: '2023-06-15',
    notes: 'Provides curriculum materials and children\'s books at discounted rates.',
    status: 'active'
  },
  {
    id: '3',
    name: 'Faithful Volunteers Network',
    contactPerson: 'Michael Chang',
    email: 'michael@faithfulvolunteers.org',
    phone: '(555) 456-7890',
    partnershipType: 'Service',
    contributionAmount: null,
    lastContribution: '2023-05-20',
    nextMeeting: '2023-08-05',
    notes: 'Provides volunteer staff for special events and camps.',
    status: 'active'
  },
  {
    id: '4',
    name: 'Divine Catering Services',
    contactPerson: 'Lisa Wong',
    email: 'lisa@divinecatering.com',
    phone: '(555) 234-5678',
    partnershipType: 'Service',
    contributionAmount: null,
    lastContribution: '2022-12-10',
    nextMeeting: null,
    notes: 'Provides discounted catering services for church events.',
    status: 'inactive'
  },
];

const Partners = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  
  const filteredPartners = partnersMockData.filter(partner => 
    (activeTab === 'all' || 
     (activeTab === 'active' && partner.status === 'active') ||
     (activeTab === 'inactive' && partner.status === 'inactive')) &&
    (partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     partner.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
     partner.partnershipType.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getPartnerTypeIcon = (type: string) => {
    switch(type) {
      case 'Financial':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'Resource':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'Service':
        return <HeartHandshake className="h-4 w-4 text-purple-500" />;
      default:
        return <HeartHandshake className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Ministry Partners</h1>
        <p className="text-muted-foreground">
          Manage partnerships and supporters of your children's ministry
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search partners..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
              <DialogDescription>
                Enter the details of the new ministry partner below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input id="name" placeholder="Grace Community Foundation" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" placeholder="John Smith" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contact@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="(555) 123-4567" />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="partnershipType">Partnership Type</Label>
                <Select>
                  <SelectTrigger id="partnershipType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" placeholder="Additional information about this partner" />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save Partner</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="all">All Partners</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <PartnersList partners={filteredPartners} />
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-6">
          <PartnersList partners={filteredPartners} />
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <PartnersList partners={filteredPartners} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface PartnersListProps {
  partners: typeof partnersMockData;
}

const PartnersList = ({ partners }: PartnersListProps) => {
  if (partners.length === 0) {
    return (
      <div className="text-center py-10">
        <HeartHandshake className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No partners found</h3>
        <p className="text-muted-foreground">
          Try changing your search or add a new ministry partner.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {partners.map((partner) => (
        <Card key={partner.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  {partner.name}
                </CardTitle>
                <CardDescription>{partner.contactPerson}</CardDescription>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs">
                {getPartnerTypeIcon(partner.partnershipType)}
                <span>{partner.partnershipType}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${partner.email}`} className="text-primary hover:underline">
                  {partner.email}
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${partner.phone}`} className="hover:underline">
                  {partner.phone}
                </a>
              </div>
              {partner.contributionAmount && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{partner.contributionAmount}</span>
                </div>
              )}
              {partner.nextMeeting && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Next meeting: {new Date(partner.nextMeeting).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {partner.notes}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button variant="outline" size="sm">
              Contact
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Partners;
