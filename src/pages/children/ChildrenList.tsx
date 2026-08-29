import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Search, Eye, Edit, Trash, Download } from "lucide-react";
import { toast } from "sonner";
import {
  useChildren, useDeleteChild,
} from "@/services/api/hooks";
import { toCsv, downloadCsv, filenameTimestamp } from "@/lib/csv";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

const AGE_GROUPS = ["pre-school", "elementary", "pre-teen", "all"];

const ChildrenList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError } = useChildren();
  const deleteChild = useDeleteChild();
  const isStaff = user?.role === "admin" || user?.role === "teacher";
  const canRegister = ["admin", "teacher", "volunteer", "cellLeader"].includes(user?.role || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("all");

  const children = data?.children ?? [];

  const filteredChildren = children.filter((child) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      child.fullName.toLowerCase().includes(q) ||
      (child.parentName || "").toLowerCase().includes(q) ||
      (child.parentEmail || "").toLowerCase().includes(q);
    const matchesAgeGroup = ageGroupFilter === "all" || child.ageGroup === ageGroupFilter;
    return matchesSearch && matchesAgeGroup;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteChild.mutateAsync(id);
    } catch {
      // toast handled in hook
    }
  };

  const handleExport = () => {
    const rows = filteredChildren.map((c) => ({
      name: c.fullName,
      age: c.age ?? "",
      ageGroup: c.ageGroup ?? "",
      parent: c.parentName,
      parentEmail: c.parentEmail ?? "",
      parentPhone: c.parentPhone ?? "",
      allergies: c.allergies ?? "",
      medicalNotes: c.medicalNotes ?? "",
    }));
    const csv = toCsv(rows, [
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
      { key: "ageGroup", label: "Age Group" },
      { key: "parent", label: "Parent/Guardian" },
      { key: "parentEmail", label: "Parent Email" },
      { key: "parentPhone", label: "Parent Phone" },
      { key: "allergies", label: "Allergies" },
      { key: "medicalNotes", label: "Medical Notes" },
    ]);
    downloadCsv(`kidmin-children-${filenameTimestamp()}.csv`, csv);
    toast.success("Children exported to CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Children</h1>
          <p className="text-muted-foreground">Manage children registration and information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={filteredChildren.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {canRegister && (
            <Button onClick={() => navigate("/children/add")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Register Child
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Children Registry</CardTitle>
          <CardDescription>View and manage all registered children</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, parent, or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
              <SelectTrigger className="w-[180px]">
                <span>Age Group</span>
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g === "all" ? "All Groups" : g.charAt(0).toUpperCase() + g.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-destructive">Failed to load children. Please try again.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Parent/Guardian</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChildren.map((child) => (
                    <TableRow key={child.id}>
                      <TableCell className="font-medium">{child.fullName}</TableCell>
                      <TableCell>{child.age ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{child.ageGroup || "Not assigned"}</Badge>
                      </TableCell>
                      <TableCell>{child.parentName || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{child.parentEmail || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/children/${child.id}`)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          {isStaff && (
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/children/${child.id}/edit`)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          {user?.role === "admin" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500">
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {child.fullName}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove the child's record, notes and attendance. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(child.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredChildren.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No children found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              Showing {filteredChildren.length} of {children.length} children
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildrenList;
