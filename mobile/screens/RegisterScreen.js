import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import validation from '../utils/validation';
import errorHandler from '../utils/errorHandler';
import { User, Mail, Lock, Phone, Calendar, ArrowLeft, UserPlus } from 'lucide-react-native';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  
  // J'ai retiré 'nationality' qui n'était pas utilisé dans votre front
  const [formData, setFormData] = useState({
    lastname: '', 
    firstname: '', 
    age: '', 
    phone: '', 
    email: '', 
    password: '', 
    role: 'joueur'
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
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
      console.error('Erreur inscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = {
    orange: '#ED6F2D', 
    darkGreen: '#214347', 
    teal: '#43868D', 
    inputBg: '#F8FAFC',
    border: '#E2E8F0',
    white: '#FFFFFF'
  };

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* EN-TÊTE */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.darkGreen} />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={[styles.brandTitle, { color: COLORS.orange }]}>VASCO</Text>
              <Text style={[styles.pageTitle, { color: COLORS.darkGreen }]}>INSCRIPTION</Text>
            </View>
          </View>

          <Text style={[styles.subtitle, { color: COLORS.teal }]}>
            Rejoignez l'aventure et explorez autrement.
          </Text>

          {/* FORMULAIRE */}
          <View style={styles.formContainer}>
            
            {/* Ligne 1 : Nom & Prénom */}
            <View style={styles.row}>
              <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: COLORS.inputBg, borderColor: COLORS.border }]}>
                <User size={18} color={COLORS.teal} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Nom" 
                  placeholderTextColor="#94a3b8"
                  value={formData.lastname}
                  onChangeText={t => handleChange('lastname', t)}
                  editable={!isLoading}
                />
              </View>
              <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: COLORS.inputBg, borderColor: COLORS.border }]}>
                <User size={18} color={COLORS.teal} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Prénom" 
                  placeholderTextColor="#94a3b8"
                  value={formData.firstname}
                  onChangeText={t => handleChange('firstname', t)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Age (Pleine largeur maintenant) */}
            <View style={[styles.inputWrapper, { backgroundColor: COLORS.inputBg, borderColor: COLORS.border }]}>
              <Calendar size={18} color={COLORS.teal} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Âge" 
                placeholderTextColor="#94a3b8"
                keyboardType="numeric" 
                value={formData.age}
                onChangeText={t => handleChange('age', t)}
                editable={!isLoading}
              />
            </View>

            {/* Téléphone */}
            <View style={[styles.inputWrapper, { backgroundColor: COLORS.inputBg, borderColor: COLORS.border }]}>
              <Phone size={20} color={COLORS.teal} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Téléphone" 
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad" 
                value={formData.phone}
                onChangeText={t => handleChange('phone', t)}
                editable={!isLoading}
              />
            </View>

            {/* Email */}
            <View style={[styles.inputWrapper, { backgroundColor: COLORS.inputBg, borderColor: COLORS.border }]}>
              <Mail size={20} color={COLORS.teal} style={styles.inputIcon} />
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
            </View>

            {/* Mot de passe */}
            <View style={[styles.inputWrapper, { backgroundColor: COLORS.inputBg, borderColor: COLORS.border }]}>
              <Lock size={20} color={COLORS.teal} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Mot de passe" 
                placeholderTextColor="#94a3b8"
                secureTextEntry 
                value={formData.password}
                onChangeText={t => handleChange('password', t)}
                editable={!isLoading}
              />
            </View>

            {/* Bouton d'action */}
            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: COLORS.orange }, 
                isLoading && styles.buttonDisabled
              ]} 
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Commencer l'aventure</Text>
                  <UserPlus size={20} color="#fff" style={{ marginLeft: 10 }} />
                </View>
              )}
            </TouchableOpacity>

            {/* Lien retour */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Déjà un compte ? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text style={[styles.link, { color: COLORS.darkGreen }]}>Se connecter</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: { 
    flexGrow: 1, 
    padding: 24,
    paddingTop: 60, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  titleContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900', 
    letterSpacing: 1,
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800', 
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    gap: 16, 
  },
  row: {
    flexDirection: 'row',
    gap: 12, 
  },
  halfInput: {
    flex: 1, 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 0,
  },
  inputIcon: {
    marginRight: 12
  },
  input: { 
    flex: 1,
    fontSize: 15, 
    color: '#334155',
    fontWeight: '500'
  },
  button: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 16, 
    shadowColor: '#ED6F2D', 
    shadowOpacity: 0.25, 
    shadowRadius: 12, 
    shadowOffset: { width: 0, height: 6 }, 
    elevation: 8 
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 16,
    letterSpacing: 0.5
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20
  },
  footerText: {
     color: '#64748b',
     fontSize: 15
  },
  link: { 
    fontWeight: '800',
    textDecorationLine: 'underline',
    fontSize: 15
  }
});