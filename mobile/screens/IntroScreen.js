import React, { useState, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Dimensions, ImageBackground, 
  TouchableOpacity, StatusBar, Animated, Image, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { X } from 'lucide-react-native'; 

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

const COLORS = {
  orange: '#ED6F2D', 
  white: '#FFFFFF',
  inactiveDot: 'rgba(255, 255, 255, 0.4)'
};

const slides = [
  {
    id: '1',
    image: require('../assets/images/INTRO3.jpg'), 
    title: 'Marre de visiter seul dans ton coin ?',
    description: 'Les guides classiques sont ennuyeux et la solitude pèse parfois. Ne sois plus jamais un simple spectateur de ton voyage.'
  },
  {
    id: '2',
    image: require('../assets/images/INTRO1.png'), 
    title: 'Vasco transforme la ville en terrain de jeu',
    description: 'Notre app métamorphose chaque rue en défi. Une expérience immersive qui te guide et te connecte aux autres.'
  },
  {
    id: '3',
    image: require('../assets/images/INTRO2.png'), 
    title: 'Libre, Social & Immersif',
    description: 'Garde ta liberté de voyageur solo tout en faisant des rencontres spontanées, sans la pression des apps de dating.'
  },
  {
    id: '4',
    image: require('../assets/images/INTRO4.jpg'), 
    title: 'Lance ta première quête en 2 clics',
    description: 'Choisis ton thème (Sport, Culture, Food), rejoins une équipe et gagne des récompenses réelles dès aujourd\'hui !'
  },
];

export default function IntroScreen({ navigation }) {
  let [fontsLoaded] = useFonts({ 
    AoboshiOne_400Regular, 
    Poppins_400Regular, 
    Poppins_600SemiBold, 
    Poppins_700Bold 
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const finishOnboarding = () => {
    navigation.replace('Welcome'); 
  };

  const renderItem = ({ item }) => {
    return (
      <ImageBackground 
        source={item.image} 
        style={styles.slideBackground} 
        resizeMode="cover"
      >
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']} 
          style={styles.gradientOverlay} 
        />

        <View style={styles.contentContainer}>
          <View style={styles.logoWrapper}>
             <Image 
               source={require('../assets/images/LOGO1.png')} 
               style={styles.logoImageSlide} 
               resizeMode="contain"
             />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      </ImageBackground>
    );
  };

  const Paginator = ({ data, scrollX }) => {
    return (
      <View style={styles.paginatorContainer}>
        {data.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8], 
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return <Animated.View key={i.toString()} style={[styles.dot, { width: dotWidth, opacity }]} />;
        })}
      </View>
    );
  };

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        style={{ flex: 1 }}
      />

      <View style={styles.topControls}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={finishOnboarding}
          activeOpacity={0.6}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
            {currentIndex === slides.length - 1 ? (
                <Text style={styles.finishText}>C'EST PARTI !</Text>
            ) : (
                <X size={28} color={COLORS.white} style={styles.shadowIcon} />
            )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomControls}>
        <Paginator data={slides} scrollX={scrollX} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  slideBackground: { width: width, height: height, justifyContent: 'center' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },

  contentContainer: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    paddingBottom: 130, 
    paddingHorizontal: 30,
  },

  logoWrapper: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, 
  },
  logoImageSlide: {
    width: width * 0.6, 
    height: width * 0.6,
  },

  textContainer: {
    width: '100%',
    alignItems: 'flex-start',
    height: height * 0.28, 
    justifyContent: 'flex-start', 
  },
  title: { 
    fontFamily: 'AoboshiOne_400Regular', 
    fontSize: 32, 
    color: COLORS.white, 
    textAlign: 'left', 
    marginBottom: 15,
    lineHeight: 38,
    textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 5
  },
  description: { 
    fontFamily: 'Poppins_400Regular', 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.9)', 
    textAlign: 'left', 
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3
  },

  topControls: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 50,
    right: 15,
    zIndex: 20,
  },
  actionButton: {
    padding: 5,
  },
  shadowIcon: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  finishText: { 
    fontFamily: 'Poppins_700Bold', 
    color: COLORS.white, 
    fontSize: 14, 
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  bottomControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  paginatorContainer: { 
    flexDirection: 'row', 
    height: 40, 
    alignItems: 'center' 
  },
  dot: { 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: COLORS.white, // CHANGEMENT ICI: Orange -> Blanc
    marginHorizontal: 5 
  },
});