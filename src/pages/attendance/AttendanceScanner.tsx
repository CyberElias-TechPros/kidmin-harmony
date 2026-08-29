import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, QrCode, CheckCircle, User } from "lucide-react";
import { useChildren, useCheckIn } from "@/services/api/hooks";

interface ScannedChild {
  id: string;
  name: string;
  class: string;
}

const AttendanceScanner = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedChild, setLastScannedChild] = useState<ScannedChild | null>(null);
  const [recentScans, setRecentScans] = useState<ScannedChild[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const checkIn = useCheckIn();
  const { data: childrenData } = useChildren();
  const children = childrenData?.children ?? [];

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    html5QrCode
      .start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, () => {})
      .then(() => setIsScanning(true))
      .catch((err) => {
        console.error(`Unable to start scanning: ${err}`);
        toast.error("Could not access camera. Please check permissions.");
      });
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => setIsScanning(false)).catch(() => setIsScanning(false));
    }
  };

  const resolveChildId = (decodedText: string): string | null => {
    try {
      const parsed = JSON.parse(decodedText);
      return parsed?.id || null;
    } catch {
      // Not JSON — treat the text itself as a child id (or a full name lookup).
      return decodedText || null;
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    const childId = resolveChildId(decodedText);
    if (!childId) {
      toast.error("Invalid QR code. Please try again.");
      return;
    }

    // Convert a possible name (e.g. "Emma Johnson") into an id by looking it up.
    let resolvedId = childId;
    const match = children.find(
      (c) => c.id === childId || `${c.firstName} ${c.lastName}`.toLowerCase() === childId.toLowerCase()
    );
    if (!match) {
      toast.error("No matching child found for this QR code.");
      return;
    }
    resolvedId = match.id;

    try {
      const result = await checkIn.mutateAsync({ childId: resolvedId });
      if (result.alreadyCheckedIn) {
        toast.info(`${match.fullName} is already checked in.`);
      } else {
        toast.success(`${match.fullName} checked in successfully!`);
      }
      const childInfo = { id: match.id, name: match.fullName, class: match.ageGroup || "Unassigned" };
      setLastScannedChild(childInfo);
      setRecentScans((prev) => [childInfo, ...prev.slice(0, 4)]);

      // Briefly pause scanning to prevent duplicate scans of the same code.
      if (scannerRef.current && isScanning) {
        scannerRef.current.pause();
        setTimeout(() => scannerRef.current?.resume(), 2000);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/attendance")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Attendance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="mr-2 h-5 w-5" /> QR Code Scanner
            </CardTitle>
            <CardDescription>Scan a child's QR code for quick check-in</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              id="qr-reader"
              className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden"
            >
              {!isScanning && (
                <div className="text-center p-4">
                  <QrCode className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-muted-foreground">Camera preview will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!isScanning ? (
              <Button className="w-full" onClick={startScanner}>Start Scanner</Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={stopScanner}>Stop Scanner</Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate("/attendance/manual")}>
              <User className="mr-2 h-4 w-4" /> Manual Check-in
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {lastScannedChild && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="mr-2 h-5 w-5" /> Last Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between"><span className="font-semibold">Name:</span><span>{lastScannedChild.name}</span></div>
                <div className="flex justify-between"><span className="font-semibold">Class:</span><span>{lastScannedChild.class}</span></div>
                <div className="flex justify-between"><span className="font-semibold">Check-in Time:</span><span>{new Date().toLocaleTimeString()}</span></div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/children/${lastScannedChild.id}`)}>
                  View Child Profile
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>Last {recentScans.length} children checked in</CardDescription>
            </CardHeader>
            <CardContent>
              {recentScans.length > 0 ? (
                <div className="space-y-4">
                  {recentScans.map((child, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{child.name}</p>
                          <p className="text-xs text-muted-foreground">{child.class}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/children/${child.id}`)}>View</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground"><p>No recent check-ins</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;
