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

export const Controls: React.FC<Props> = ({ onFeed, onPlay, onSleep }) => {
  return (
    <View style={styles.container}>
      <ActionButton onPress={onFeed} icon={Utensils} label="Feed" color="#F97316" />
      <ActionButton onPress={onPlay} icon={Gamepad2} label="Play" color="#EC4899" />
      <ActionButton onPress={onSleep} icon={Moon} label="Sleep" color="#3B82F6" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    width: 96,
    height: 96,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
});
