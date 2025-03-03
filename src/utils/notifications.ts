import { loadDecks, Card } from './storage';

// Helper function to count due cards
const getDueCardsCount = (cards: Card[]): number => {
  const now = Date.now();
  return cards.filter(card => card.dueDate <= now).length;
};

// Check if we're running in a browser that supports notifications
export const isNotificationsSupported = (): boolean => {
  return 'Notification' in window;
};

// Request permission to send notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationsSupported()) return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Schedule a notification for the next day
export const scheduleNotification = async (title: string, body: string, id: number = 1, hours: number = 9): Promise<void> => {
  if (!isNotificationsSupported()) return;
  
  try {
    // For web, we can't schedule notifications directly
    // Instead, we'll store the notification details in localStorage
    // and check for due notifications when the app loads
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, 0, 0, 0);

    const notifications = getScheduledNotifications();
    notifications.push({
      id,
      title,
      body,
      scheduledFor: tomorrow.getTime()
    });
    
    localStorage.setItem('scheduled_notifications', JSON.stringify(notifications));
    console.log('Notification scheduled for', tomorrow);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Get all scheduled notifications
export const getScheduledNotifications = (): Array<{
  id: number;
  title: string;
  body: string;
  scheduledFor: number;
}> => {
  try {
    const stored = localStorage.getItem('scheduled_notifications');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Schedule daily study reminder based on due cards
export const scheduleDailyReminder = async (): Promise<void> => {
  if (!isNotificationsSupported()) return;
  
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
  try {
    localStorage.removeItem('scheduled_notifications');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

// Check for due notifications and show them
export const checkDueNotifications = (): void => {
  if (!isNotificationsSupported()) return;
  
  try {
    const notifications = getScheduledNotifications();
    const now = Date.now();
    const dueNotifications = notifications.filter(n => n.scheduledFor <= now);
    
    // Remove due notifications from the list
    const remainingNotifications = notifications.filter(n => n.scheduledFor > now);
    localStorage.setItem('scheduled_notifications', JSON.stringify(remainingNotifications));
    
    // Show due notifications
    dueNotifications.forEach(n => {
      if (Notification.permission === 'granted') {
        new Notification(n.title, { body: n.body });
      }
    });
  } catch (error) {
    console.error('Error checking due notifications:', error);
  }
};

// Initialize notifications when app starts
export const initNotifications = async (): Promise<void> => {
  if (!isNotificationsSupported()) return;
  
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    // Check for due notifications
    checkDueNotifications();
    // Schedule new notification
    await scheduleDailyReminder();
  }
};
