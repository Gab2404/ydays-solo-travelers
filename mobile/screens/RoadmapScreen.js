import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  ScrollView, Dimensions, Animated 
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CheckCircle, MapPin, ChevronRight, X, Clock } from 'lucide-react-native';
import pathService from '../services/pathService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.75;

export default function RoadmapScreen({ route, navigation }) {
  const { id } = route.params;
  const [path, setPath] = useState(null);
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [inProgressQuests, setInProgressQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;

  useEffect(() => {
    fetchPath();
  }, [id]);

  const fetchPath = async () => {
    try {
      setIsLoading(true);
      const data = await pathService.getPathById(id);
      setPath(data);
    } catch (err) {
      errorHandler.handle(err, 'Impossible de charger le parcours');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  if (!path) return null;

  const reversedQuests = [...path.quests].reverse();

  const getQuestCoordinates = (index) => {
    const centerX = width / 2;
    const yGap = 140; 
    const xOffset = 80; 
    
    const x = index % 2 === 0 ? centerX + xOffset : centerX - xOffset;
    const y = 140 + index * yGap; 
    
    return { x, y };
  };

  const generateSvgPath = () => {
    if (!reversedQuests || reversedQuests.length === 0) return [];
    
    const paths = [];
    reversedQuests.forEach((quest, index) => {
      if (index === 0) return;
      
      const pos = getQuestCoordinates(index);
      const prevPos = getQuestCoordinates(index - 1);
      const controlY = (prevPos.y + pos.y) / 2;
      
      const d = `M ${prevPos.x} ${prevPos.y} C ${prevPos.x} ${controlY}, ${pos.x} ${controlY}, ${pos.x} ${pos.y}`;
      
      const prevQuest = reversedQuests[index - 1];
      const isPathCompleted = completedQuests.includes(prevQuest._id) && completedQuests.includes(quest._id);
      
      paths.push({
        d,
        color: isPathCompleted ? "#22c55e" : "#cbd5e1"
      });
    });
    
    return paths;
  };

  const handleStartQuest = () => {
    if (selectedQuestId && !inProgressQuests.includes(selectedQuestId)) {
      setInProgressQuests([...inProgressQuests, selectedQuestId]);
      errorHandler.showSuccess('Étape commencée !');
    }
  };

  const handleValidateStep = () => {
    if (selectedQuestId && !completedQuests.includes(selectedQuestId)) {
      setCompletedQuests([...completedQuests, selectedQuestId]);
      errorHandler.showSuccess('Bravo ! 🎉 Étape validée !');
    }
  };

  const handleNodePress = (questId) => {
    setSelectedQuestId(questId);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleClosePanel = () => {
    Animated.timing(slideAnim, {
      toValue: PANEL_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedQuestId(null);
    });
  };

  const selectedQuest = path.quests.find(q => q._id === selectedQuestId);
  const questNumber = selectedQuest ? reversedQuests.length - reversedQuests.findIndex(q => q._id === selectedQuestId) : 0;
  const totalQuests = path.quests.length;
  const progressPercentage = Math.round((completedQuests.length / totalQuests) * 100);

  const isQuestCompleted = selectedQuest && completedQuests.includes(selectedQuest._id);
  const isQuestInProgress = selectedQuest && inProgressQuests.includes(selectedQuest._id);
  const isQuestNotStarted = selectedQuest && !isQuestInProgress && !isQuestCompleted;

  return (
    <View style={styles.container}>
      
      <View style={styles.fixedHeader}>
        <Text style={styles.city}>{path.city}</Text>
        <Text style={styles.pathTitle} numberOfLines={1}>{path.title}</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.roadmapContainer} 
        showsVerticalScrollIndicator={false}
        bounces={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={{ height: reversedQuests.length * 140 + 200 }}>
          
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={width} height={reversedQuests.length * 140 + 200}>
              {generateSvgPath().map((pathData, idx) => (
                <Path
                  key={idx}
                  d={pathData.d}
                  stroke={pathData.color}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="8, 8"
                />
              ))}
            </Svg>
          </View>

          {reversedQuests.map((quest, index) => {
            const realNumber = path.quests.length - index; 
            const pos = getQuestCoordinates(index);
            const isSelected = selectedQuestId === quest._id;
            const isCompleted = completedQuests.includes(quest._id);

            return (
              <TouchableOpacity 
                key={quest._id} 
                style={[
                  styles.node, 
                  { left: pos.x - 35, top: pos.y - 35 },
                  isSelected && styles.nodeSelected
                ]}
                onPress={() => handleNodePress(quest._id)}
                activeOpacity={0.9}
              >
                <View style={[
                  styles.nodeInner, 
                  isSelected && styles.nodeInnerSelected,
                  isCompleted && styles.nodeInnerCompleted
                ]}>
                  {isCompleted ? (
                    <CheckCircle size={24} color="#fff" />
                  ) : (
                    <Text style={[
                      styles.nodeText, 
                      isSelected && styles.nodeTextSelected
                    ]}>
                      {realNumber}
                    </Text>
                  )}
                </View>
                
                <View style={styles.nodeLabel}>
                  <Text style={styles.nodeLabelText} numberOfLines={1}>
                    {quest.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          
          <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.startBadgeContainer}>
              <Text style={styles.startBadgeText}>DÉPART 🚩</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {selectedQuest && (
        <Animated.View style={[styles.sidePanel, { transform: [{ translateX: slideAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <View style={styles.sidePanelHeader}>
              <TouchableOpacity onPress={handleClosePanel} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>
                  ÉTAPE {questNumber} SUR {totalQuests}
                </Text>
              </View>
              
              {isQuestInProgress && !isQuestCompleted && (
                <View style={styles.statusBadgeOrange}>
                  <Text style={styles.statusBadgeOrangeText}>Étape en cours</Text>
                </View>
              )}
              
              {isQuestCompleted && (
                <View style={styles.statusBadgeGreen}>
                  <Text style={styles.statusBadgeGreenText}>Étape validée</Text>
                </View>
              )}
              
              <Text style={styles.sidePanelTitle}>{selectedQuest.title}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progression</Text>
                  <Text style={styles.progressValue}>{progressPercentage}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                </View>
              </View>
            </View>

            <View style={styles.sidePanelContent}>
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>INFORMATIONS</Text>
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>{selectedQuest.description}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => navigation.navigate('Map', { id })}
              >
                <MapPin size={20} color="#f97316" />
                <Text style={styles.mapButtonText}>Voir la map</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.sidePanelFooter}>
            {isQuestNotStarted && (
              <TouchableOpacity style={styles.actionButton} onPress={handleStartQuest}>
                <Text style={styles.actionButtonText}>Commencer l'étape</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            )}
            
            {isQuestInProgress && !isQuestCompleted && (
              <TouchableOpacity style={styles.actionButton} onPress={handleValidateStep}>
                <Text style={styles.actionButtonText}>Valider cette étape</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            )}
            
            {isQuestCompleted && (
              <TouchableOpacity style={styles.completedButton} disabled>
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.completedButtonText}>Étape terminée</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      <BottomNav navigation={navigation} activeRoute="Roadmap" currentPathId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingBottom: 80 },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  
  fixedHeader: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: '#f97316',
    zIndex: 10,
  },
  city: { fontSize: 11, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: 1 },
  pathTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 5 },

  roadmapContainer: { flexGrow: 1, paddingTop: 130, paddingBottom: 0 },
  
  node: { position: 'absolute', width: 70, height: 70, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  nodeInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', borderWidth: 4, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3 },
  nodeSelected: { transform: [{scale: 1.2}] },
  nodeInnerSelected: { borderColor: '#d97706', backgroundColor: '#fff7ed' },
  nodeInnerCompleted: { borderColor: '#16a34a', backgroundColor: '#22c55e' },
  nodeText: { fontSize: 18, fontWeight: 'bold', color: '#94a3b8' },
  nodeTextSelected: { color: '#d97706' },
  nodeLabel: { position: 'absolute', top: 65, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  nodeLabelText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  
  startBadgeContainer: { backgroundColor:'#fff', paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:2, borderColor:'#d97706', elevation: 2 },
  startBadgeText: { fontWeight: '900', color: '#d97706', fontSize: 12 },

  sidePanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 80,
    width: PANEL_WIDTH,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: -2, height: 0 },
    zIndex: 100
  },
  
  sidePanelHeader: {
    backgroundColor: '#f97316',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  
  stepBadgeText: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  
  statusBadgeOrange: {
    backgroundColor: '#fb923c',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  
  statusBadgeOrangeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  
  statusBadgeGreen: {
    backgroundColor: '#22c55e',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  
  statusBadgeGreenText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  
  sidePanelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  
  progressContainer: {
    marginTop: 5,
  },
  
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  progressLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  
  progressValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  
  sidePanelContent: {
    padding: 20,
  },
  
  descriptionBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#cbd5e1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  
  descriptionText: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
  },
  
  infoSection: {
    marginBottom: 20,
  },
  
  infoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 10,
  },
  
  mapButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  mapButtonText: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '600',
  },
  
  sidePanelFooter: {
    padding: 20,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  actionButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#f97316',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  completedButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
  },
  
  completedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});