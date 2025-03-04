import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { requestNotificationPermission, scheduleDailyReminder, cancelAllNotifications, isNotificationsSupported } from '@/utils/notifications';
import { useToast } from '@/hooks/use-toast';

export function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported in this browser
    const supported = isNotificationsSupported();
    setNotificationsSupported(supported);
    
    if (supported) {
      // Check permission status on component mount
      checkPermissionStatus();
    }
  }, []);

  const checkPermissionStatus = async () => {
    const hasPermission = await requestNotificationPermission();
    setPermissionGranted(hasPermission);
    setNotificationsEnabled(hasPermission);
  };

  const handleToggleNotifications = async (checked: boolean) => {
    if (checked) {
      // Request permission if needed
      const hasPermission = await requestNotificationPermission();
      
      if (hasPermission) {
        setPermissionGranted(true);
        setNotificationsEnabled(true);
        await scheduleDailyReminder();
        toast({
          title: "Notifications enabled",
          description: "You'll receive daily reminders for your due cards.",
        });
      } else {
        setNotificationsEnabled(false);
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } else {
      // Disable notifications
      setNotificationsEnabled(false);
      await cancelAllNotifications();
      toast({
        title: "Notifications disabled",
        description: "You won't receive daily reminders anymore.",
      });
    }
  };

  // If notifications are not supported, show a message
  if (!notificationsSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Daily study reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Notifications are not supported in your current browser. 
            Please try using a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Daily study reminders</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="notifications" 
            checked={notificationsEnabled}
            onCheckedChange={handleToggleNotifications}
          />
          <Label htmlFor="notifications">Enable daily reminders</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          {notificationsEnabled 
            ? "You'll receive a daily notification when you have cards due for review." 
            : "Enable notifications to receive daily reminders for your card reviews."}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={() => scheduleDailyReminder()}
          disabled={!permissionGranted}
        >
          Test Notification
        </Button>
      </CardFooter>
    </Card>
  );
}
