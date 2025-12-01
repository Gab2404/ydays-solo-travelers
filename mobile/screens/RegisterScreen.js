import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import validation from '../utils/validation';
import errorHandler from '../utils/errorHandler';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    lastname: '', 
    firstname: '', 
    age: '', 
    nationality: '', 
    phone: '', 
    email: '', 
    password: '', 
    role: 'joueur'
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    // Validation complète du formulaire
    const validationResult = validation.validateRegistrationForm(formData);
    
    if (!validationResult.isValid) {
      errorHandler.showValidationErrors(validationResult.errors);
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      errorHandler.showSuccess('Compte créé avec succès !');
      navigation.navigate('Login');
    } catch (err) {
      // L'erreur est déjà gérée dans AuthContext
      console.error('Erreur inscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inscription 🎒</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Nom" 
        placeholderTextColor="#94a3b8"
        value={formData.lastname}
        onChangeText={t => handleChange('lastname', t)}
        editable={!isLoading}
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Prénom" 
        placeholderTextColor="#94a3b8"
        value={formData.firstname}
        onChangeText={t => handleChange('firstname', t)}
        editable={!isLoading}
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Âge" 
        placeholderTextColor="#94a3b8"
        keyboardType="numeric" 
        value={formData.age}
        onChangeText={t => handleChange('age', t)}
        editable={!isLoading}
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Téléphone" 
        placeholderTextColor="#94a3b8"
        keyboardType="phone-pad" 
        value={formData.phone}
        onChangeText={t => handleChange('phone', t)}
        editable={!isLoading}
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#94a3b8"
        keyboardType="email-address" 
        autoCapitalize="none" 
        value={formData.email}
        onChangeText={t => handleChange('email', t)}
        editable={!isLoading}
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Mot de passe" 
        placeholderTextColor="#94a3b8"
        secureTextEntry 
        value={formData.password}
        onChangeText={t => handleChange('password', t)}
        editable={!isLoading}
      />

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Commencer l'aventure</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        disabled={isLoading}
      >
        <Text style={styles.link}>Retour à la connexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#fffbeb' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#d97706', 
    textAlign: 'center', 
    marginBottom: 30 
  },
  input: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    color: '#334155' 
  },
  button: { 
    backgroundColor: '#d97706', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 20 
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  link: { 
    color: '#d97706', 
    textAlign: 'center' 
  }
});