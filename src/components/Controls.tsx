import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Utensils, Gamepad2, Moon } from 'lucide-react-native';

interface Props {
  onFeed: () => void;
  onPlay: () => void;
  onSleep: () => void;
}

const ActionButton = ({ onPress, icon: Icon, label, color }: any) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }}
    style={[styles.button, { backgroundColor: color }]}
  >
    <Icon size={32} color="white" />
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export const Controls: React.FC<Props> = ({ onFeed, onPlay, onClean }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.feedButton]} onPress={onFeed}>
        <Text style={styles.buttonText}>Feed</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.playButton]} onPress={onPlay}>
        <Text style={styles.buttonText}>Play</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.cleanButton]} onPress={onClean}>
        <Text style={styles.buttonText}>Clean</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedButton: {
    backgroundColor: '#F97316',
  },
  playButton: {
    backgroundColor: '#EC4899',
  },
  cleanButton: {
    backgroundColor: '#8B5CF6', // Purple for clean
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
