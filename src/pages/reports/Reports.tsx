import React, { useMemo, useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar as CalendarIcon, Download, Users, CalendarCheck, BookOpen, School,
  ArrowUpCircle, ArrowDownCircle, Clock, TrendingUp, Trophy, Sparkles,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { useReportSummary, useReportAnalytics } from "@/services/api/hooks";
import { toCsv, downloadCsv, filenameTimestamp } from "@/lib/csv";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
} from "recharts";

type Timeframe = "month" | "quarter" | "year" | "custom";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
};

function filterByRange<T extends { key: string }>(rows: T[], timeframe: Timeframe, from?: Date, to?: Date): T[] {
  if (timeframe === "month") return rows.slice(-1);
  if (timeframe === "quarter") return rows.slice(-3);
  if (timeframe === "year") return rows.slice(-12);
  if (timeframe === "custom" && from && to) {
    const f = format(from, "yyyy-MM");
    const t = format(to, "yyyy-MM");
    return rows.filter((r) => r.key >= f && r.key <= t);
  }
  return rows;
}

const Reports = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>("year");
  const [fromDate, setFromDate] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const { data: summary, isLoading: summaryLoading } = useReportSummary();
  const { data: analytics, isLoading: analyticsLoading } = useReportAnalytics();

  const attendanceTrend = useMemo(
    () => filterByRange(analytics?.attendanceTrend ?? [], timeframe, fromDate, toDate),
    [analytics, timeframe, fromDate, toDate]
  );
  const teacherParticipation = useMemo(
    () => filterByRange(analytics?.teacherParticipation ?? [], timeframe, fromDate, toDate),
    [analytics, timeframe, fromDate, toDate]
  );

  const metrics = [
    {
      title: "Total Children",
      value: summary?.totalChildren ?? 0,
      change: `${summary?.teachersCount ?? 0} teachers`,
      trend: "up",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Average Attendance",
      value: `${summary?.attendance.percentage ?? 0}%`,
      change: `${summary?.attendance.today ?? 0} present today`,
      trend: "up",
      icon: <CalendarCheck className="h-4 w-4" />,
    },
    {
      title: "Teacher to Child Ratio",
      value: summary?.teachersCount ? `1:${Math.round((summary.totalChildren || 0) / summary.teachersCount)}` : "—",
      change: "across ministry",
      trend: "up",
      icon: <School className="h-4 w-4" />,
    },
    {
      title: "Total Lessons",
      value: summary?.totalLessons ?? 0,
      change: `${summary?.totalPartners ?? 0} partners`,
      trend: "up",
      icon: <BookOpen className="h-4 w-4" />,
    },
  ];

  const insights = useMemo(() => {
    const peeks: { icon: React.ReactNode; title: string; value: string; sub?: string }[] = [];
    const checkins = analytics?.checkInTimes ?? [];
    if (checkins.length > 0 && checkins.some((c) => c.count > 0)) {
      const peak = checkins.reduce((a, b) => (b.count > a.count ? b : a), checkins[0]);
      peeks.push({ icon: <Clock className="h-4 w-4" />, title: "Busiest check-in", value: peak.time, sub: `${peak.count} check-ins` });
    }
    const ages = analytics?.ageDistribution ?? [];
    if (ages.length > 0) {
      const top = ages.reduce((a, b) => (b.value > a.value ? b : a), ages[0]);
      peeks.push({ icon: <Users className="h-4 w-4" />, title: "Largest age group", value: top.name, sub: `${top.value} children` });
    }
    const curr = analytics?.curriculumProgress ?? [];
    if (curr.length > 0) {
      const top = curr.reduce((a, b) => (b.total > a.total ? b : a), curr[0]);
      peeks.push({ icon: <BookOpen className="h-4 w-4" />, title: "Top curriculum area", value: top.name, sub: `${top.total} lessons` });
    }
    const trend = analytics?.attendanceTrend ?? [];
    if (trend.length > 0) {
      const best = trend.reduce((a, b) => (b.rate > a.rate ? b : a), trend[0]);
      if (best.rate > 0) peeks.push({ icon: <Trophy className="h-4 w-4" />, title: "Best attendance", value: `${best.rate}%`, sub: best.month });
    }
    return peeks;
  }, [analytics]);

  const handleExportCsv = () => {
    if (!analytics) return;
    const rows = analytics.attendanceTrend.map((a) => ({
      month: a.full,
      present: a.attendance,
      registered: a.registered,
      rate: `${a.rate}%`,
    }));
    const csv = toCsv(rows, [
      { key: "month", label: "Month" },
      { key: "present", label: "Present" },
      { key: "registered", label: "Registered" },
      { key: "rate", label: "Attendance Rate" },
    ]);
    downloadCsv(`kidmin-attendance-${filenameTimestamp()}.csv`, csv);
  };

  const chartLoading = analyticsLoading || summaryLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Ministry Reports</h1>
        <p className="text-muted-foreground">Analyze attendance, growth, and curriculum progress</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)} className="w-full sm:max-w-md">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {timeframe === "custom" && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal w-[150px]">
                    <CalendarIcon className="mr-2 h-4 w-4" /> {fromDate ? format(fromDate, "MMM d") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal w-[150px]">
                    <CalendarIcon className="mr-2 h-4 w-4" /> {toDate ? format(toDate, "MMM d") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                </PopoverContent>
              </Popover>
            </>
          )}
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="preschool">Preschool</SelectItem>
              <SelectItem value="elementary">Elementary</SelectItem>
              <SelectItem value="preteen">Pre-Teen</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleExportCsv} title="Export attendance CSV">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Insight cards */}
      {!chartLoading && insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((ins, index) => (
            <Card key={index} className="border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{ins.title}</CardTitle>
                <span className="text-primary">{ins.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold capitalize">{ins.value}</div>
                <p className="text-xs text-muted-foreground">{ins.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs flex items-center text-muted-foreground">
                {metric.trend === "up" ? (
                  <ArrowUpCircle className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Present children vs. registered in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartLoading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceTrend}>
                    <defs>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="attendance" name="Present" stroke="#6366F1" fillOpacity={1} fill="url(#colorAttendance)" />
                    <Area type="monotone" dataKey="registered" name="Registered" stroke="#F43F5E" fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Breakdown of children by age groups</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full">
              {chartLoading ? <ChartSkeleton /> : analytics?.ageDistribution.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.ageDistribution}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}
                      dataKey="value" nameKey="name"
                    >
                      {analytics.ageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No children registered yet" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Curriculum Progress</CardTitle>
            <CardDescription>Lessons completed by curriculum area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartLoading ? <ChartSkeleton /> : analytics?.curriculumProgress.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.curriculumProgress}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="complete" name="Completed" fill="#10B981" />
                    <Bar dataKey="total" name="Total Lessons" fill="#cbd5e1" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No lessons yet" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-in Times</CardTitle>
            <CardDescription>Distribution of child check-ins by time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartLoading ? <ChartSkeleton /> : analytics?.checkInTimes.some((c) => c.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.checkInTimes}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="count" name="Children" stroke="#6366F1" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No check-in data yet" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher & Volunteer Participation</CardTitle>
          <CardDescription>Monthly breakdown of ministry team involvement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherParticipation}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="teachers" name="Teachers" fill="#6366F1" />
                  <Bar dataKey="volunteers" name="Volunteers" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Live data from your ministry records
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

const ChartSkeleton = () => (
  <div className="h-full w-full flex items-center justify-center">
    <Skeleton className="h-[260px] w-full rounded-md" />
  </div>
);

const EmptyChart = ({ message }: { message: string }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center">
      <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/40" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export default Reports;
