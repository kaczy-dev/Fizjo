import { ReminderConfig, Medication, UserHealthProfile } from '../types';

export class ReminderService {
  public static async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  public static isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Personalized notification generation
  public static generatePersonalizedMessage(
    type: 'rehab_session' | 'office_break' | 'medication',
    user: UserHealthProfile,
    config: ReminderConfig,
    medicationName?: string
  ): { title: string; body: string } {
    const name = user.name || 'Użytkowniku';

    if (type === 'rehab_session') {
      if (config.motivationalTone === 'clinical') {
        return {
          title: `Moje Fizjo: Zaplanowana sesja rehabilitacyjna`,
          body: `${name}, nadeszła godzina ${config.rehabSessionTime}. Wykonaj zestaw ćwiczeń odcinka szyjnego, aby utrzymać ciągłość terapii (${user.streakDays} dni z rzędu).`
        };
      } else if (config.motivationalTone === 'gentle') {
        return {
          title: `Chwila dla Twojego kręgosłupa 🌱`,
          body: `${name}, zrób głęboki wdech. Poświęć 5-10 minut na delikatne rozluźnienie karku i odciążenie dysków.`
        };
      } else {
        return {
          title: `Czas na rehabilitację szyi! 💪`,
          body: `Świetnie Ci idzie, ${name}! Dziś kolejny krok do pożegnania sztywności karku. Kliknij, aby rozpocząć bezpieczną sesję.`
        };
      }
    }

    if (type === 'office_break') {
      return {
        title: `Mikro-przerwa biurowa (Ergonomia) ⏱️`,
        body: `${name}, siedzisz już od ponad godziny! Odsuń się od monitora, zrób 5 cofnięć brody (chin tuck) i ściągnij łopatki.`
      };
    }

    // Medication
    return {
      title: `Przypomnienie o leku / suplemencie 💊`,
      body: `${name}, pora na przyjęcie: ${medicationName || 'zaleconego preparatu'}. Pamiętaj o popiciu wodą.`
    };
  }

  public static triggerNotification(title: string, body: string, icon = '/icon.png'): void {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon,
          badge: icon
        });
      } catch {
        // Handle environments where new Notification throws
      }
    }
  }

  // Check which medications are due today
  public static getDueMedications(medications: Medication[]): { med: Medication; time: string }[] {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentMinutesTotal = currentHour * 60 + currentMin;

    const dueList: { med: Medication; time: string }[] = [];

    medications.forEach(med => {
      med.scheduleTimes.forEach(time => {
        const [h, m] = time.split(':').map(Number);
        const schedTotal = h * 60 + m;
        // Due if within 60 minutes window or not yet taken
        const isTaken = !!med.takenToday[time];
        if (!isTaken && Math.abs(currentMinutesTotal - schedTotal) <= 45) {
          dueList.push({ med, time });
        }
      });
    });

    return dueList;
  }
}
