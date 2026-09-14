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
    type: 'rehab_session' | 'office_break' | 'medication' | 'morning_activation' | 'lunch_relief' | 'evening_relaxation',
    user: UserHealthProfile,
    config: ReminderConfig,
    medicationName?: string
  ): { title: string; body: string } {
    const name = user.name || 'Użytkowniku';

    if (type === 'morning_activation') {
      return {
        title: `Poranna Aktywacja Karku 🌅`,
        body: `${name}, zacznij dzień od 3-minutowej mobilizacji szyi przed pracą przy biurku.`
      };
    }

    if (type === 'lunch_relief') {
      return {
        title: `Przerwa w pracy: Pozycja Brüggera 🥗`,
        body: `${name}, czas na południowe odciążenie krążków międzykręgowych i otwarcie klatki piersiowej.`
      };
    }

    if (type === 'evening_relaxation') {
      return {
        title: `Wieczorne Wyciszenie Podpotyliczne 🌙`,
        body: `${name}, zredukuj nagromadzone napięcie w karku przed snem, by zapobiec porannej sztywności.`
      };
    }

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
        body: `${name}, siedzisz już od dłuższego czasu! Odsuń się od monitora, zrób 5 cofnięć brody (chin tuck) i ściągnij łopatki.`
      };
    }

    // Medication
    return {
      title: `Przypomnienie o leku / suplemencie 💊`,
      body: `${name}, pora na przyjęcie: ${medicationName || 'zaleconego preparatu'}. Pamiętaj o popiciu wodą.`
    };
  }

  // Play a gentle soothing reminder chime using Web Audio API
  public static playReminderChime(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.35); // G5

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio not permitted or user didn't interact yet
    }
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
