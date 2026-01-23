import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, StatusBar,
  ImageBackground, Dimensions
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import validation from '../utils/validation';
import errorHandler from '../utils/errorHandler';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native'; 
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Couleurs basées sur la charte VASCO
  const COLORS = {
    orange: '#ED6F2D', 
    white: '#FFFFFF',
    textShadow: 'rgba(0, 0, 0, 0.5)',
    inputBorder: 'rgba(255, 255, 255, 0.5)',
  };

  const handleLogin = async () => {
    const validationResult = validation.validateLoginForm({ login: loginInput, password });
    if (!validationResult.isValid) {
      errorHandler.showValidationErrors(validationResult.errors);
      return;
    }
    setIsLoading(true);
    try {
      await login(loginInput, password);
    } catch (err) {
      console.error('Erreur login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/bordeaux_fond.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* OMBRE HAUTE POUR LA LISIBILITÉ DU BOUTON RETOUR */}
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'transparent']}
        style={styles.topShadow}
      />

      <View style={styles.mainOverlay}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <ArrowLeft size={26} color={COLORS.white} />
        </TouchableOpacity>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.keyboardView}
        >
          {/* CARTE TRANSLUCIDE AVEC CONTRASTE RENFORCÉ */}
          <View style={styles.glassCard}>
            <View style={styles.headerContainer}>
              <Image 
                source={require('../assets/images/LOGO.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              {/* Ombre portée sur le texte pour le détacher du fond */}
              <Text style={styles.welcomeText}>Bon retour parmi nous</Text>
            </View>
            
            <View style={styles.formFields}>
              {/* CHAMP EMAIL */}
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.white} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email ou Téléphone"
                  placeholderTextColor="rgba(255,255,255,0.8)"
                  value={loginInput}
                  onChangeText={setLoginInput}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* CHAMP PASSWORD */}
              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.white} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="rgba(255,255,255,0.8)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* BOUTON SE CONNECTER SOLIDE */}
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>SE CONNECTER</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Pas encore de compte ? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.link}>Créer un compte</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* OMBRE BASSE RENFORCÉE */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.bottomShadow}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: width, height: height },
  topShadow: { position: 'absolute', top: 0, width: '100%', height: '40%', zIndex: 1 },
  bottomShadow: { position: 'absolute', bottom: 0, width: '100%', height: '35%', zIndex: 1 },
  mainOverlay: { flex: 1, zIndex: 2, justifyContent: 'center', paddingHorizontal: 30 },
  keyboardView: { flex: 1, justifyContent: 'center' },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 10,
    padding: 10,
    zIndex: 10,
    // Ombre sur l'icône de retour
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  glassCard: {
    // Opacité légèrement augmentée pour la lilibilité (0.12 -> 0.2)
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 35,
    padding: 25,
    paddingVertical: 45,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { 
    width: width * 0.75, 
    height: 120, 
    marginBottom: 5,
    // Ombre pour faire ressortir le logo si le fond est clair à cet endroit
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  welcomeText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700', 
    textAlign: 'center',
    // Ombre de texte cruciale pour la lisibilité sur fond transparent
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formFields: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Bordure plus visible
    marginBottom: 18,
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fond sombre léger pour faire ressortir le texte blanc
  },
  inputIcon: { 
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: '600',
  },
  button: { 
    backgroundColor: '#ED6F2D', 
    paddingVertical: 18, 
    borderRadius: 50, 
    alignItems: 'center', 
    marginTop: 15, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: { backgroundColor: 'rgba(237, 111, 45, 0.5)' },
  buttonText: { 
    color: '#fff', 
    fontWeight: '900', 
    fontSize: 16, 
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 35 },
  footerText: { 
    color: '#fff', 
    fontSize: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  link: { 
    color: '#fff', 
    fontWeight: '900', 
    textDecorationLine: 'underline', 
    fontSize: 15,
    marginLeft: 5
  }
});