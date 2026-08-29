import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, CheckCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useChildren, useCheckIn } from "@/services/api/hooks";

const ManualCheckIn = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useChildren();
  const checkIn = useCheckIn();
  const [query, setQuery] = useState("");
  const [serviceType, setServiceType] = useState("Sunday Morning");
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());

  const children = useMemo(() => data?.children ?? [], [data]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return children;
    return children.filter(
      (c) => c.fullName.toLowerCase().includes(q) || (c.parentName || "").toLowerCase().includes(q)
    );
  }, [children, query]);

  const handleCheckIn = async (childId: string, name: string) => {
    try {
      const result = await checkIn.mutateAsync({ childId, serviceType });
      if (result.alreadyCheckedIn) {
        toast.info(`${name} is already checked in.`);
      } else {
        toast.success(`${name} checked in successfully!`);
      }
      setCheckedInIds((prev) => new Set(prev).add(childId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/attendance")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Manual Check-In</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><UserCheck className="mr-2 h-5 w-5" /> Check In a Child</CardTitle>
            <CardDescription>Search for a registered child and mark them present</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or parent..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <Input value={serviceType} onChange={(e) => setServiceType(e.target.value)} />
            </div>

            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">Loading children…</div>
              ) : filtered.length > 0 ? (
                filtered.map((child) => (
                  <div key={child.id} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-secondary/30">
                    <div>
                      <p className="font-medium">{child.fullName}</p>
                      <p className="text-xs text-muted-foreground">{child.ageGroup || "Unassigned"} • {child.parentName || "—"}</p>
                    </div>
                    {checkedInIds.has(child.id) ? (
                      <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Checked In</Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleCheckIn(child.id, child.fullName)}>Check In</Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">No children found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checked In Today</CardTitle>
            <CardDescription>{checkedInIds.size} children marked present</CardDescription>
          </CardHeader>
          <CardContent>
            {checkedInIds.size > 0 ? (
              <div className="space-y-2">
                {children
                  .filter((c) => checkedInIds.has(c.id))
                  .map((child) => (
                    <div key={child.id} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{child.fullName}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No one checked in yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualCheckIn;
