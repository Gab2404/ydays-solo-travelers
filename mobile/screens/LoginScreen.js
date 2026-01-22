import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import validation from '../utils/validation';
import errorHandler from '../utils/errorHandler';
import { Mail, Lock, LogIn } from 'lucide-react-native'; 

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIQUE EXISTANTE ---
  const handleLogin = async () => {
    const validationResult = validation.validateLoginForm({ 
      login: loginInput, 
      password 
    });
    
    if (!validationResult.isValid) {
      errorHandler.showValidationErrors(validationResult.errors);
      return;
    }

    setIsLoading(true);
    
    try {
      await login(loginInput, password);
      errorHandler.showSuccess('Connexion réussie !');
    } catch (err) {
      console.error('Erreur login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Couleurs de la charte VASCO
  const COLORS = {
    orange: '#ED6F2D', 
    darkGreen: '#214347', 
    teal: '#43868D', 
    inputBg: '#F8FAFC',
    border: '#E2E8F0'
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.content}>
        
        {/* EN-TÊTE : Épuré, sans logo graphique, juste la Typo */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: COLORS.orange }]}>VASCO</Text>
          <Text style={[styles.tagline, { color: COLORS.darkGreen }]}>EXPLORE AUTREMENT</Text>
        </View>
        
        {/* FORMULAIRE */}
        <View style={styles.formContainer}>
          <Text style={[styles.welcomeText, { color: COLORS.darkGreen }]}>
            Bon retour parmi nous
          </Text>

          <View style={[styles.inputWrapper, { backgroundColor: COLORS.inputBg, borderColor: COLORS.border }]}>
            <Mail size={20} color={COLORS.teal} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email ou Téléphone"
              placeholderTextColor="#94a3b8"
              value={loginInput}
              onChangeText={setLoginInput}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: COLORS.inputBg, borderColor: COLORS.border }]}>
            <Lock size={20} color={COLORS.teal} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: COLORS.orange }, 
              isLoading && styles.buttonDisabled
            ]} 
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Se connecter</Text>
                <LogIn size={20} color="#fff" style={{ marginLeft: 10 }} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
            >
              <Text style={[styles.link, { color: COLORS.darkGreen }]}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
  },
  content: {
    flex: 1,
    padding: 30, // Un peu plus de marge sur les côtés
    justifyContent: 'center', // Centre verticalement tout le bloc
  },
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 60, // Espace généreux entre le titre et le formulaire
  },
  title: { 
    fontSize: 56, // Taille imposante pour compenser l'absence de logo
    fontWeight: '900', // Simulation du Aoboshi One (Extra Bold)
    letterSpacing: 2,
    marginBottom: 8,
    // Sur Android, includeFontPadding peut parfois décaler le texte
    includeFontPadding: false, 
  },
  tagline: { 
    fontSize: 14, 
    fontWeight: '700', // Simulation du Poppins Bold
    letterSpacing: 4, // Espacement large typique des baselines "Luxe/Pro"
    textTransform: 'uppercase'
  },
  formContainer: { 
    width: '100%' 
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.9
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 58, 
  },
  inputIcon: {
    marginRight: 14
  },
  input: { 
    flex: 1,
    fontSize: 16, 
    color: '#334155',
    fontWeight: '500'
  },
  button: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 10, 
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
    fontSize: 17,
    letterSpacing: 0.5
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30
  },
  footerText: {
     color: '#64748b',
     fontSize: 15
  },
  link: { 
    fontWeight: '800',
    textDecorationLine: 'underline',
    marginLeft: 4,
    fontSize: 15
  }
});