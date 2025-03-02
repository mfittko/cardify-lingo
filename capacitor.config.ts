
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.660a78c1d643423c8ff4dc41ddfba944',
  appName: 'cardify-lingo',
  webDir: 'dist',
  server: {
    url: 'https://660a78c1-d643-423c-8ff4-dc41ddfba944.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    }
  }
};

export default config;
