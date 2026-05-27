import React, { useState, useContext, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
  Dimensions, StatusBar, Image, TextInput, KeyboardAvoidingView, 
  Platform, ActivityIndicator, ScrollView, Animated, Easing, Keyboard 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import validation from '../utils/validation';
import errorHandler from '../utils/errorHandler';
import { Mail, Lock, User, Phone, Calendar, X } from 'lucide-react-native';

// --- FONTS IMPORT ---
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_600SemiBold, 
  Poppins_800ExtraBold,
  Poppins_900Black 
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

const COLORS = {
  orange: '#ED6F2D', 
  white: '#FFFFFF',
  glassPopupBg: 'rgba(0, 0, 0, 0.55)', 
  inputBorder: 'rgba(255, 255, 255, 0.3)',
  inputBg: 'rgba(0, 0, 0, 0.2)'
};

export default function AuthScreen({ navigation }) {
  const { login, register } = useContext(AuthContext);
  
  let [fontsLoaded] = useFonts({
    AoboshiOne_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black
  });

  const [popupMode, setPopupMode] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  // Animation Refs
  const welcomeTranslateY = useRef(new Animated.Value(0)).current;
  const welcomeOpacity = useRef(new Animated.Value(1)).current; 
  const popupTranslateY = useRef(new Animated.Value(height)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  // Form Data
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const [registerData, setRegisterData] = useState({
    lastname: '', firstname: '', age: '', phone: '', email: '', password: '', role: 'joueur'
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // --- LOGIQUE TRANSITION ---

  const openPopup = (mode) => {
    setPopupMode(mode);
    Animated.parallel([
      Animated.timing(welcomeTranslateY, {
        toValue: height, 
        duration: 800, 
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(welcomeOpacity, {
        toValue: 0,
        duration: 700, 
        useNativeDriver: true,
      }),
      Animated.timing(popupTranslateY, {
        toValue: 0, 
        duration: 800, 
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 800, 
        useNativeDriver: true,
      })
    ]).start();
  };

  const closePopup = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(welcomeTranslateY, {
        toValue: 0,
        duration: 800, 
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 800, 
        useNativeDriver: true,
      }),
      Animated.timing(popupTranslateY, {
        toValue: height, 
        duration: 800, 
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 600, 
        useNativeDriver: true,
      })
    ]).start(() => {
       setPopupMode(null);
    });
  };

  // --- LOGIQUE MÉTIER ---

  const handleLogin = async () => {
    const res = validation.validateLoginForm(loginData);
    if (!res.isValid) return errorHandler.showValidationErrors(res.errors);
    setIsLoading(true);
    try { await login(loginData.login, loginData.password); } 
    catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  };

  const handleRegister = async () => {
    const res = validation.validateRegistrationForm(registerData);
    if (!res.isValid) return errorHandler.showValidationErrors(res.errors);
    setIsLoading(true);
    try {
      await register(registerData);
      errorHandler.showSuccess('Compte créé ! Connectez-vous.');
      setPopupMode('login');
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  };

  const updateReg = (key, val) => setRegisterData(prev => ({ ...prev, [key]: val }));

  // --- RENDER CONTENT ---

  const renderPopupContent = () => {
    if (popupMode === 'login') {
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.inputWrapper}>
            <Mail size={20} color={COLORS.white} style={styles.inputIcon} />
            <TextInput
              style={styles.input} placeholder="Email ou Téléphone" placeholderTextColor="rgba(255,255,255,0.6)"
              value={loginData.login} onChangeText={(t) => setLoginData({...loginData, login: t})} autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={COLORS.white} style={styles.inputIcon} />
            <TextInput
              style={styles.input} placeholder="Mot de passe" placeholderTextColor="rgba(255,255,255,0.6)"
              value={loginData.password} onChangeText={(t) => setLoginData({...loginData, password: t})} secureTextEntry
            />
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>CONNEXION</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPopupMode('register')} style={{marginTop: 20, padding: 10}}>
              <Text style={styles.switchText}>Créer un compte</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    } else if (popupMode === 'register') {
      return (
        // ScrollView gère le scroll interne si le clavier réduit l'espace
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.row}>
            <View style={[styles.inputWrapper, {flex: 1, marginRight: 5}]}>
              <User size={18} color={COLORS.white} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} placeholder="Nom" placeholderTextColor="rgba(255,255,255,0.6)"
                value={registerData.lastname} onChangeText={t => updateReg('lastname', t)}
              />
            </View>
            <View style={[styles.inputWrapper, {flex: 1, marginLeft: 5}]}>
              <User size={18} color={COLORS.white} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} placeholder="Prénom" placeholderTextColor="rgba(255,255,255,0.6)"
                value={registerData.firstname} onChangeText={t => updateReg('firstname', t)}
              />
            </View>
          </View>
          <View style={styles.inputWrapper}>
            <Calendar size={18} color={COLORS.white} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} placeholder="Âge" placeholderTextColor="rgba(255,255,255,0.6)" keyboardType="numeric"
              value={registerData.age} onChangeText={t => updateReg('age', t)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Phone size={18} color={COLORS.white} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} placeholder="Téléphone" placeholderTextColor="rgba(255,255,255,0.6)" keyboardType="phone-pad"
              value={registerData.phone} onChangeText={t => updateReg('phone', t)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Mail size={18} color={COLORS.white} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.6)" keyboardType="email-address" autoCapitalize="none"
              value={registerData.email} onChangeText={t => updateReg('email', t)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Lock size={18} color={COLORS.white} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} placeholder="Mot de passe" placeholderTextColor="rgba(255,255,255,0.6)" secureTextEntry
              value={registerData.password} onChangeText={t => updateReg('password', t)}
            />
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={handleRegister} disabled={isLoading}>
             {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>S'INSCRIRE</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPopupMode('login')} style={{marginTop: 5, paddingBottom: 10, padding: 5}}>
            <Text style={styles.switchText}>Déjà un compte ? Connexion</Text>
        </TouchableOpacity>
        </ScrollView>
      );
    }
    return null;
  };

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground source={require('../assets/images/bordeaux_fond.png')} style={styles.background} resizeMode="cover">
        
        <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.topShadow} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.bottomShadow} />

        {/* === COUCHE 1 : ÉCRAN D'ACCUEIL === */}
        <Animated.View style={[styles.welcomeLayer, { transform: [{ translateY: welcomeTranslateY }], opacity: welcomeOpacity }]}>
          <View style={styles.header}>
            <Text style={styles.discoverText}>Découvrez</Text>
            <Image source={require('../assets/images/LOGO1.png')} style={styles.logoImageWelcome} resizeMode="contain"/>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.mainButton} onPress={() => openPopup('login')} activeOpacity={0.8}>
              <Text style={styles.mainButtonText}>SE CONNECTER</Text>
            </TouchableOpacity>
            <View style={styles.textRow}>
              <Text style={styles.footerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => openPopup('register')}>
                <Text style={styles.linkText}>Inscrivez-vous !</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* === COUCHE 2 : POPUP === */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.popupLayer}
          pointerEvents={popupMode ? 'auto' : 'none'}
        >
            <Animated.View style={[
              styles.glassCard, 
              { transform: [{ translateY: popupTranslateY }], opacity: popupOpacity }
            ]}>
                <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>
                    {popupMode === 'login' ? 'Bon retour !' : "Rejoignez l'aventure"}
                </Text>
                <TouchableOpacity onPress={closePopup} style={styles.closeButton}>
                    <X size={24} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
                </View>
                {renderPopupContent()}
            </Animated.View>
        </KeyboardAvoidingView>

      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { width: width, height: height },
  topShadow: { position: 'absolute', top: 0, width: '100%', height: '35%', zIndex: 1 },
  bottomShadow: { position: 'absolute', bottom: 0, width: '100%', height: '45%', zIndex: 1 },
  
  welcomeLayer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
    zIndex: 2
  },
  header: { alignItems: 'center' },
  discoverText: {
    fontFamily: 'AoboshiOne_400Regular',
    color: COLORS.white,
    fontSize: 70,
    marginTop: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 10
  },
  logoImageWelcome: { width: width * 0.85, height: 140, marginTop: -50 },
  footer: { width: '100%', alignItems: 'center', zIndex: 20, paddingHorizontal: 20 },
  mainButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 2, borderColor: COLORS.white,
    borderRadius: 50, paddingVertical: 16, width: '80%', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8,
  },
  mainButtonText: { 
    fontFamily: 'Poppins_900Black',
    color: COLORS.white, fontSize: 16, letterSpacing: 2 
  },
  textRow: { flexDirection: 'row', marginTop: 25, alignItems: 'center' },
  footerText: { 
    fontFamily: 'Poppins_400Regular',
    color: COLORS.white, opacity: 0.8, fontSize: 15
  },
  linkText: { 
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.white, fontSize: 15, textDecorationLine: 'underline' 
  },

  popupLayer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, 
    zIndex: 10, 
    justifyContent: 'flex-end', 
  },
  glassCard: {
    backgroundColor: COLORS.glassPopupBg, 
    borderTopLeftRadius: 35, borderTopRightRadius: 35,
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 30, paddingVertical: 30, paddingBottom: 10,
    width: '100%',
    // Propriété clé : permet au popup de rétrécir si le clavier le pousse
    flexShrink: 1, 
    maxHeight: '85%', // Sécurité pour pas toucher le haut de l'écran
    shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 20,
  },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  popupTitle: { 
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 26, color: COLORS.white, letterSpacing: 0.5 
  },
  closeButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50 },
  
  row: { flexDirection: 'row' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, borderWidth: 1.5, borderColor: COLORS.inputBorder,
    paddingHorizontal: 15, height: 58, marginBottom: 15,
    backgroundColor: COLORS.inputBg
  },
  inputIcon: { marginRight: 12, opacity: 0.8 },
  input: { 
    fontFamily: 'Poppins_600SemiBold',
    flex: 1, fontSize: 15, color: COLORS.white, paddingTop: 4 
  },
  
  actionButton: {
    backgroundColor: COLORS.orange, paddingVertical: 18, borderRadius: 50,
    alignItems: 'center', marginTop: 10, 
    shadowColor: COLORS.orange, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10
  },
  actionButtonText: { 
    fontFamily: 'Poppins_900Black',
    color: COLORS.white, fontSize: 18, letterSpacing: 1.5 
  },
  switchText: { 
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center', color: COLORS.white, textDecorationLine: 'underline', opacity: 0.9 
  }
});