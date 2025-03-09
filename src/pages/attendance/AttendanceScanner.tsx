
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ArrowLeft, QrCode, CheckCircle, User } from 'lucide-react';

interface ChildInfo {
  id: string;
  name: string;
  age: number;
  class: string;
}

const AttendanceScanner = () => {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedChild, setLastScannedChild] = useState<ChildInfo | null>(null);
  const [recentScans, setRecentScans] = useState<ChildInfo[]>([]);

  useEffect(() => {
    return () => {
      if (scanner && isScanning) {
        scanner.stop().catch(error => console.error("Error stopping scanner:", error));
      }
    };
  }, [scanner, isScanning]);

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    setScanner(html5QrCode);

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      onScanSuccess,
      onScanFailure
    ).then(() => {
      setIsScanning(true);
    }).catch(err => {
      console.error(`Unable to start scanning: ${err}`);
      toast.error("Could not access camera. Please check permissions.");
    });
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.stop().then(() => {
        setIsScanning(false);
      }).catch(err => {
        console.error(`Error stopping scanner: ${err}`);
      });
    }
  };

  const onScanSuccess = (decodedText: string) => {
    try {
      // Parse the QR code data (assuming it's a JSON string)
      const childData = JSON.parse(decodedText);
      
      // Mock implementation - in a real app, this would call an API to mark attendance
      const childInfo: ChildInfo = {
        id: childData.id || '123',
        name: childData.name || 'Sample Child',
        age: childData.age || 8,
        class: childData.class || 'Elementary',
      };
      
      setLastScannedChild(childInfo);
      setRecentScans(prev => [childInfo, ...prev.slice(0, 4)]);
      
      // Provide feedback
      toast.success(`${childInfo.name} checked in successfully!`);
      
      // In a real app, you'd want to process this data, e.g., record attendance
      console.log("Child checked in:", childInfo);
      
      // Briefly pause scanning to prevent multiple scans of the same code
      if (scanner) {
        scanner.pause();
        setTimeout(() => {
          scanner.resume();
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("Invalid QR code format. Please try again.");
    }
  };

  const onScanFailure = (error: string) => {
    // This is called continuously when no QR is detected, so we don't want to log it
    // console.error(`QR code scanning failed: ${error}`);
  };

  const manualCheckIn = () => {
    // In a real app, you'd navigate to a search page or show a modal
    navigate('/attendance');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate('/attendance')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Attendance
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="mr-2 h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Scan a child's QR code for quick check-in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                id="qr-reader" 
                className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden"
              >
                {!isScanning && (
                  <div className="text-center p-4">
                    <QrCode className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-4 text-muted-foreground">
                      Camera preview will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!isScanning ? (
              <Button 
                className="w-full" 
                onClick={startScanner}
              >
                Start Scanner
              </Button>
            ) : (
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={stopScanner}
              >
                Stop Scanner
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={manualCheckIn}
            >
              <User className="mr-2 h-4 w-4" />
              Manual Check-in
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          {lastScannedChild && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Last Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Name:</span>
                  <span>{lastScannedChild.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Age:</span>
                  <span>{lastScannedChild.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Class:</span>
                  <span>{lastScannedChild.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Check-in Time:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/children/${lastScannedChild.id}`)}
                >
                  View Child Profile
                </Button>
              </CardFooter>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>
                Last {recentScans.length} children checked in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentScans.length > 0 ? (
                <div className="space-y-4">
                  {recentScans.map((child, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{child.name}</p>
                          <p className="text-xs text-muted-foreground">{child.class}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/children/${child.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <p>No recent check-ins</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;
