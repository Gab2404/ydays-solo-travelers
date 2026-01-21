import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const CameraCapture = ({ visible, onClose, onPhotoTaken, questTitle }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (visible && !permission) {
      requestPermission();
    }
  }, [visible]);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      const photoData = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        exif: false
      });
      setPhoto(photoData);
    } catch (error) {
      console.error('Erreur prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  const confirmPhoto = () => {
    if (photo) {
      onPhotoTaken(photo);
      setPhoto(null);
    }
  };

  const handleClose = () => {
    setPhoto(null);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Demande d'autorisation...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>📸 Permission Caméra</Text>
          <Text style={styles.permissionText}>
            L'accès à la caméra est nécessaire pour valider les quêtes.
          </Text>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={requestPermission}
          >
            <Text style={styles.actionButtonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Validation de quête</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {questTitle}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Aperçu photo OU Caméra */}
        {photo ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photo.uri }} style={styles.preview} />
            
            <View style={styles.previewActions}>
              <TouchableOpacity 
                style={styles.retakeButton} 
                onPress={retakePhoto}
              >
                <Text style={styles.retakeButtonText}>🔄 Reprendre</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={confirmPhoto}
              >
                <Text style={styles.confirmButtonText}>✓ Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView 
              style={styles.camera} 
              facing={facing}
              ref={cameraRef}
            >
              {/* Instructions */}
              <View style={styles.instructions}>
                <Text style={styles.instructionsText}>
                  📸 Prenez une photo du lieu ou monument
                </Text>
              </View>

              {/* Bouton de capture */}
              <View style={styles.captureContainer}>
                <TouchableOpacity 
                  style={styles.captureButton} 
                  onPress={takePicture}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="large" color="#fff" />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Bouton flip caméra */}
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <Text style={styles.flipButtonText}>🔄</Text>
              </TouchableOpacity>
            </CameraView>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f97316',
  },

  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  cameraContainer: {
    flex: 1,
  },

  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },

  instructions: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },

  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },

  captureContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },

  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },

  flipButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  flipButtonText: {
    fontSize: 24,
  },

  previewContainer: {
    flex: 1,
  },

  preview: {
    flex: 1,
    resizeMode: 'contain',
  },

  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },

  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64748b',
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 10,
  },

  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 10,
  },

  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 40,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },

  permissionText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  actionButton: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 15,
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  closeButton: {
    backgroundColor: '#64748b',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },

  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraCapture;