# ydays-questa


    cd .\backend\
    npm init -y
    npm install express mongoose cors dotenv
    npm install --save-dev nodemon

    cd ..
    cd .\frontend\
    npm create vite@latest . -- --template react
    npm install react-router-dom lucide-react axios
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p

    npm install leaflet react-leaflet

    cd ..
    npx create-expo-app mobile    
    cd .\mobile\   
    npm install axios @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage react-native-maps  

    npm uninstall react-native-maps
    npx expo install react-native-maps

    npm install lucide-react-native react-native-svg

    npx expo install react-native-svg

    cd backend
    npm install bcryptjs
    cp .env.example .env

    cd m
    npx expo install expo-camera expo-image-picker expo-file-system
    npm install expo-file-system expo-sharing
    npm install @react-native-async-storage/async-storage expo-file-system expo-sharing

    npx expo install expo-media-library
    npx expo install expo-image-picker
    npm install react-native-maps-directions
    npx expo install expo-linear-gradient
    npx expo install @expo-google-fonts/aoboshi-one @expo-google-fonts/poppins expo-font


    cd b
    npm install multer 
    npm audit fix
    npm install archiver