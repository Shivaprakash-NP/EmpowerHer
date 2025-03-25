// components/LanguageSettingsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LanguageSettingsScreen() {
  const languages = ['English', 'Hindi', 'Spanish']; // Sample languages
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const changeLanguage = (language) => {
    setSelectedLanguage(language);
    Alert.alert("Language Changed", `Language set to ${language}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      {languages.map((lang) => (
        <TouchableOpacity key={lang} style={styles.option} onPress={() => changeLanguage(lang)}>
          <Text style={styles.optionText}>{lang} {selectedLanguage === lang ? '(Selected)' : ''}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  option: { 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc' 
  },
  optionText: { 
    fontSize: 18, 
    color: '#333' 
  },
});
