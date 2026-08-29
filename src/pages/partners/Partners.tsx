import React, { useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartHandshake, Search, Plus, Mail, Phone, Building, DollarSign, Calendar, Trash2 } from "lucide-react";
import { usePartners, useCreatePartner, useDeletePartner } from "@/services/api/hooks";
import type { Partner } from "@/services/api/types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getPartnerTypeIcon = (type?: string) => {
  switch (type) {
    case "Financial": return <DollarSign className="h-4 w-4 text-green-500" />;
    case "Resource": return <Building className="h-4 w-4 text-blue-500" />;
    case "Service": return <HeartHandshake className="h-4 w-4 text-purple-500" />;
    default: return <HeartHandshake className="h-4 w-4" />;
  }
};

const Partners = () => {
  const { data, isLoading } = usePartners();
  const createPartner = useCreatePartner();
  const deletePartner = useDeletePartner();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Add form state
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partnershipType, setPartnershipType] = useState("Financial");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  const partners = data?.partners ?? [];
  const filteredPartners = partners.filter((partner) => {
    const tabMatch =
      activeTab === "all" ||
      (activeTab === "active" && partner.status === "active") ||
      (activeTab === "inactive" && partner.status === "inactive");
    const q = searchQuery.toLowerCase();
    const searchMatch =
      partner.name.toLowerCase().includes(q) ||
      (partner.contactPerson || "").toLowerCase().includes(q) ||
      (partner.partnershipType || "").toLowerCase().includes(q);
    return tabMatch && searchMatch;
  });

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createPartner.mutateAsync({
        name: name.trim(),
        contactPerson,
        email,
        phone,
        partnershipType,
        notes,
      });
      setName(""); setContactPerson(""); setEmail(""); setPhone(""); setNotes("");
      setOpen(false);
    } catch { /* handled in hook */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Ministry Partners</h1>
        <p className="text-muted-foreground">Manage partnerships and supporters of your children's ministry</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search partners..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add New Partner</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
              <DialogDescription>Enter the details of the new ministry partner below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Organization Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Grace Community Foundation" /></div>
              <div className="grid gap-2"><Label>Contact Person</Label><Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="John Smith" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" /></div>
                <div className="grid gap-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" /></div>
              </div>
              <div className="grid gap-2">
                <Label>Partnership Type</Label>
                <Select value={partnershipType} onValueChange={setPartnershipType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Resource">Resource</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional information" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!name.trim()}>Save Partner</Button>
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

        <TabsContent value="active" className="mt-6"><PartnersList partners={filteredPartners} isLoading={isLoading} onDelete={(id) => deletePartner.mutate(id)} /></TabsContent>
        <TabsContent value="inactive" className="mt-6"><PartnersList partners={filteredPartners} isLoading={isLoading} onDelete={(id) => deletePartner.mutate(id)} /></TabsContent>
        <TabsContent value="all" className="mt-6"><PartnersList partners={filteredPartners} isLoading={isLoading} onDelete={(id) => deletePartner.mutate(id)} /></TabsContent>
      </Tabs>
    </div>
  );
};

const PartnersList = ({ partners, isLoading, onDelete }: { partners: Partner[]; isLoading: boolean; onDelete: (id: string) => void }) => {
  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>;
  if (partners.length === 0) {
    return (
      <div className="text-center py-10">
        <HeartHandshake className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No partners found</h3>
        <p className="text-muted-foreground">Try changing your search or add a new ministry partner.</p>
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
                <CardTitle className="flex items-center">{partner.name}</CardTitle>
                <CardDescription>{partner.contactPerson || "—"}</CardDescription>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs">
                {getPartnerTypeIcon(partner.partnershipType || undefined)}
                <span>{partner.partnershipType || "Partner"}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${partner.email}`} className="text-primary hover:underline">{partner.email || "—"}</a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${partner.phone}`} className="hover:underline">{partner.phone || "—"}</a>
              </div>
              {partner.contributionAmount && (
                <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2 text-muted-foreground" /><span>{partner.contributionAmount}</span></div>
              )}
              {partner.nextMeeting && (
                <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-muted-foreground" /><span>Next meeting: {new Date(partner.nextMeeting).toLocaleDateString()}</span></div>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{partner.notes || "No notes"}</p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${partner.email}`, "_blank")}>Contact</Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete partner?</AlertDialogTitle><AlertDialogDescription>This will permanently remove {partner.name}.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onDelete(partner.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Partners;
