import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon, QrCode, UserCheck, CheckCircle2, Search, Download,
} from "lucide-react";
import { format } from "date-fns";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { useAttendance, useAttendanceSession } from "@/services/api/hooks";
import { toCsv, downloadCsv, filenameTimestamp } from "@/lib/csv";

const Attendance = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useAttendance();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);

  const sessions = data?.sessions ?? [];
  const effectiveSessionId = selectedSessionId || sessions[0]?.id;
  const { data: sessionDetail } = useAttendanceSession(effectiveSessionId || "");

  const checkIns = sessionDetail?.checkIns ?? [];
  const filteredCheckIns = checkIns.filter((c) =>
    (c.childName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Real attendance history chart: present vs. absent per session, newest last.
  const chartData = sessions
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((s) => ({
      label: format(new Date(s.date), "dd MMM"),
      present: s.present,
      absent: s.absent,
      rate: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

  const handleExport = () => {
    const rows = sessions.map((s) => ({
      date: s.date,
      service: s.serviceType,
      registered: s.total,
      present: s.present,
      absent: s.absent,
      rate: s.total > 0 ? `${Math.round((s.present / s.total) * 100)}%` : "0%",
    }));
    const csv = toCsv(rows, [
      { key: "date", label: "Date" },
      { key: "service", label: "Service" },
      { key: "registered", label: "Registered" },
      { key: "present", label: "Present" },
      { key: "absent", label: "Absent" },
      { key: "rate", label: "Rate" },
    ]);
    downloadCsv(`kidmin-attendance-${filenameTimestamp()}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track and manage children's attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/attendance/scanner")}>
            <QrCode className="mr-2 h-4 w-4" /> QR Scanner
          </Button>
          <Button onClick={() => navigate("/attendance/manual")}>
            <UserCheck className="mr-2 h-4 w-4" /> Manual Check-In
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>View attendance records by date</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Today's Attendance</CardTitle>
                <CardDescription>{format(new Date(), "PPPP")}</CardDescription>
              </div>
              {sessions.length > 0 && (
                <Select value={effectiveSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {format(new Date(s.date), "dd MMM")} - {s.serviceType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary/80 rounded-lg p-4 text-center">
                    <span className="text-sm font-medium text-muted-foreground">Registered</span>
                    <div className="text-3xl font-bold mt-1">{data?.totalChildren ?? 0}</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Present today</span>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">{data?.todayPresent ?? 0}</div>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-4 text-center">
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Absent</span>
                    <div className="text-3xl font-bold text-red-700 dark:text-red-300 mt-1">
                      {Math.max(0, (data?.totalChildren ?? 0) - (data?.todayPresent ?? 0))}
                    </div>
                  </div>
                </div>

                {data?.totalChildren ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Present Rate</Label>
                      <span className="text-sm font-medium">
                        {Math.round(((data?.todayPresent ?? 0) / data.totalChildren) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${((data?.todayPresent ?? 0) / data.totalChildren) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </>
            )}

            <div className="rounded-md border">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-medium">Recent Check-ins</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search check-ins"
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Checked By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCheckIns.length > 0 ? (
                    filteredCheckIns.map((checkIn) => (
                      <TableRow key={checkIn.id}>
                        <TableCell className="font-medium">{checkIn.childName}</TableCell>
                        <TableCell>{new Date(checkIn.time).toLocaleTimeString()}</TableCell>
                        <TableCell>{checkIn.checkedBy || "—"}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Checked In
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No check-ins for this session
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Track attendance patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 bg-secondary rounded-md p-4 h-64">
                {sessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8 }} />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No attendance data to chart yet
                  </div>
                )}
              </div>
              <div className="md:col-span-4 space-y-4">
                <div className="bg-secondary rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Average Attendance</h3>
                  <div className="text-3xl font-bold">
                    {sessions.length > 0
                      ? Math.round(
                          sessions.reduce((acc, s) => acc + (s.total > 0 ? s.present / s.total : 0), 0) / sessions.length * 100
                        )
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Across all sessions</p>
                </div>
                <div className="bg-secondary rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Total Sessions</h3>
                  <div className="text-3xl font-bold">{sessions.length}</div>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "PP")}</TableCell>
                      <TableCell>{record.serviceType}</TableCell>
                      <TableCell>{record.total}</TableCell>
                      <TableCell className="text-green-600">{record.present}</TableCell>
                      <TableCell className="text-red-600">{record.absent}</TableCell>
                      <TableCell>{record.total > 0 ? Math.round((record.present / record.total) * 100) : 0}%</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedSessionId(record.id)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">No attendance sessions recorded yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Attendance;
