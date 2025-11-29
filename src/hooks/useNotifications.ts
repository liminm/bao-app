import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { GameState, MOISTURE_DECAY_BASE, FULLNESS_DECAY, HYGIENE_DECAY } from './useGameState';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const useNotifications = () => {
    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    const scheduleStatNotifications = async (gameState: GameState) => {
        // Cancel any existing to avoid duplicates
        await Notifications.cancelAllScheduledNotificationsAsync();

        if (gameState.stage === 'leftover') return; // Don't notify if game over

        // Helper to schedule
        const schedule = async (seconds: number, title: string, body: string) => {
            if (seconds <= 0) return;

            // Ensure we don't schedule too far in the future or negative
            if (seconds < 10) seconds = 10; // Minimum delay

            await Notifications.scheduleNotificationAsync({
                content: { title, body },
                trigger: { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
            });
        };

        // Fullness (Hunger)
        // Target: 30%
        if (gameState.fullness > 30) {
            const hoursUntilHungry = (gameState.fullness - 30) / FULLNESS_DECAY;
            const secondsUntilHungry = hoursUntilHungry * 3600;
            await schedule(secondsUntilHungry, "Bao is hungry! 🥟", "Feed your dumpling before it starves!");
        }

        // Moisture (Dryness)
        // Target: 30%
        // Using base decay for estimation. Hygiene accelerates this, so this is a conservative estimate.
        if (gameState.moisture > 30) {
            const hoursUntilDry = (gameState.moisture - 30) / MOISTURE_DECAY_BASE;
            const secondsUntilDry = hoursUntilDry * 3600;
            await schedule(secondsUntilDry, "Bao is getting dry! 💧", "Time for some steam or water!");
        }

        // Hygiene
        // Target: 30%
        if (gameState.hygiene > 30) {
            const hoursUntilDirty = (gameState.hygiene - 30) / HYGIENE_DECAY;
            const secondsUntilDirty = hoursUntilDirty * 3600;
            await schedule(secondsUntilDirty, "Bao is messy! 🍃", "Swap the cabbage leaf to keep it clean.");
        }
    };

    const cancelNotifications = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    };

    return { scheduleStatNotifications, cancelNotifications };
};

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }
}
