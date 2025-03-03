
import { LocalNotifications } from '@capacitor/local-notifications';
import { loadDecks, getDueCardsCount } from './storage';

// Check if we're running on a mobile device where Capacitor is available
export const isMobileCapacitor = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined';
};

// Request permission to send notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isMobileCapacitor()) return false;
  
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Schedule a notification for the next day
export const scheduleNotification = async (title: string, body: string, id: number = 1, hours: number = 9): Promise<void> => {
  if (!isMobileCapacitor()) return;

  try {
    // Set notification for the next day at specified hour (default 9 AM)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, 0, 0, 0);

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: { at: tomorrow },
          sound: 'beep.wav',
          actionTypeId: '',
          extra: null
        }
      ]
    });
    console.log('Notification scheduled for', tomorrow);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Schedule daily study reminder based on due cards
export const scheduleDailyReminder = async (): Promise<void> => {
  if (!isMobileCapacitor()) return;
  
  try {
    const decks = loadDecks();
    let totalDueCards = 0;
    
    // Count total due cards across all decks
    decks.forEach(deck => {
      totalDueCards += getDueCardsCount(deck.cards);
    });
    
    if (totalDueCards > 0) {
      const title = 'Time to study!';
      const body = `You have ${totalDueCards} cards due for review today.`;
      await scheduleNotification(title, body);
    } else {
      // If no cards are due, still schedule a gentle reminder
      const title = 'Language Learning';
      const body = 'No cards due today, but why not review some vocabulary?';
      await scheduleNotification(title, body);
    }
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async (): Promise<void> => {
  if (!isMobileCapacitor()) return;
  
  try {
    const pendingNotifications = await LocalNotifications.getPending();
    if (pendingNotifications.notifications.length > 0) {
      const ids = pendingNotifications.notifications.map(n => n.id);
      await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

// Initialize notifications when app starts
export const initNotifications = async (): Promise<void> => {
  if (!isMobileCapacitor()) return;
  
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    // Cancel any existing notifications to avoid duplicates
    await cancelAllNotifications();
    // Schedule new notification
    await scheduleDailyReminder();
  }
};
