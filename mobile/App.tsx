import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import socket from './src/services/socketIO';

export default function App() {
  const [isClient, setisClient ] = useState(false)
  const [offsetXJS, setoffsetXJS] = useState(0)
  const [offsetYJS, setoffsetYJS] = useState(0)
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  function setCoordJS(y:number, x:number) {
    setoffsetXJS(x);
    setoffsetYJS(y);
  }

  const pan = Gesture.Pan()
    .onChange(({ translationX, translationY }) => {
      offsetX.value = translationX;
      offsetY.value = translationY;
      runOnJS(setCoordJS)(translationY, translationX);
    })
    .onFinalize(() => {
      offsetX.value = withSpring(0, { damping: 10 });
      offsetY.value = withSpring(0, { damping: 10 });
      runOnJS(setCoordJS)(0, 0);
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  useEffect(() => {
    socket.on("ball-move", (data) => {
      console.log("CLIENT", data);
      if (!isClient) return;
      offsetX.value = withSpring(data.x);
      offsetY.value = withSpring(data.y);
    })
  
    return () => {
      socket.off("ball-move")
    }
  }, []);
  
  useEffect(() => {
    socket.emit("ball-move", { x: offsetXJS, y: offsetYJS })
    console.log("HOST",{
      x: offsetXJS,
      y: offsetYJS
    });

  }, [offsetXJS, offsetYJS]);
  
  

  return (
    <GestureHandlerRootView style={styles.container}>
      {
        isClient ? (
          <Animated.View style={[{width: 80, height: 80, borderRadius: 200, backgroundColor: '#ff904b' }, animatedStyles]} />
        ) : (
          <GestureDetector gesture={pan}>
            <Animated.View style={[{width: 80, height: 80, borderRadius: 200, backgroundColor: '#4ba8ff' }, animatedStyles]} />
          </GestureDetector>
        )
      }
      <View style={{ position: "absolute", top: 68, left: 8 }} >
        <Button title={!isClient? "set to client" : "set to host"} onPress={() => setisClient(!isClient)} />
      </View>
      <View style={{ position: "absolute", top: 68, right: 8 }} >
        <Text>Mode: {isClient ? "CLIENT" : "HOST"}</Text>
      </View>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
