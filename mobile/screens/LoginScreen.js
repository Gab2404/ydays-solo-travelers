import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

export default function LoginScreen({ navigation, setUser }) {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { login: loginInput, password });
      const userData = res.data;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) { Alert.alert("Erreur", "Identifiants incorrects"); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBg}>
          <Text style={styles.logoIcon}>🧭</Text>
        </View>
        <Text style={styles.title}>Travel Quest</Text>
        <Text style={styles.subtitle}>Explorez le monde autrement</Text>
      </View>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email ou Téléphone"
          placeholderTextColor="#94a3b8"
          value={loginInput}
          onChangeText={setLoginInput}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoBg: { width: 80, height: 80, backgroundColor: '#fff7ed', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logoIcon: { fontSize: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#1e293b', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 5 },
  
  form: { width: '100%' },
  input: { backgroundColor: '#f8fafc', padding: 18, borderRadius: 16, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0', color: '#334155' },
  button: { backgroundColor: '#d97706', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: '#d97706', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { color: '#d97706', textAlign: 'center', marginTop: 20, fontWeight: '600' }
});