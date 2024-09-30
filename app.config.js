import * as dotenv from "dotenv"

dotenv.config()

module.exports =  {
  "expo": {
    "name": "ignitefleet",
    "slug": "ignitefleet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "plugins": [   "expo-font",
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.281419029855-4ct8u6n4t9as723npv2khhlbf3rmv6q5"
        }
      ]
    ],
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#202024"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.madsonsantos.ignitefleet",
      "config": {
        "googleMapsApiKey": process.env.GOOGLE_MAP_API_KEY
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#202024",
        "config": {
          "googleMaps":{
            "apiKey":  process.env.GOOGLE_MAP_API_KEY
          }
        }
      },
      "package": "com.madsonsantos.ignitefleet"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
