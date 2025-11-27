import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../utils/api';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    lastname: '', firstname: '', age: '', nationality: '', 
    phone: '', email: '', password: '', role: 'joueur'
  });

  const handleChange = (name, value) => setFormData({ ...formData, [name]: value });

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', formData);
      Alert.alert("Succès", "Compte créé ! Connectez-vous.");
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert("Erreur", "Impossible de créer le compte.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inscription 🎒</Text>
      
      <TextInput style={styles.input} placeholder="Nom" onChangeText={t => handleChange('lastname', t)} />
      <TextInput style={styles.input} placeholder="Prénom" onChangeText={t => handleChange('firstname', t)} />
      <TextInput style={styles.input} placeholder="Âge" keyboardType="numeric" onChangeText={t => handleChange('age', t)} />
      <TextInput style={styles.input} placeholder="Téléphone" keyboardType="phone-pad" onChangeText={t => handleChange('phone', t)} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" onChangeText={t => handleChange('email', t)} />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry onChangeText={t => handleChange('password', t)} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Commencer l'aventure</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Retour à la connexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fffbeb' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#d97706', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#d97706', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#d97706', textAlign: 'center' }
});