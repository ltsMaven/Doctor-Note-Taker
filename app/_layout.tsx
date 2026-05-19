import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.ink,
              headerTitleStyle: { fontWeight: "900" },
              headerShadowVisible: false,
              headerBackVisible: false,
              contentStyle: { backgroundColor: colors.background }
            }}
          >
            <Stack.Screen name="index" options={{ title: "Doctor Note Taker" }} />
            <Stack.Screen name="patient-landing" options={{ title: "Patient" }} />
            <Stack.Screen name="login" options={{ title: "Sign in" }} />
            <Stack.Screen name="doctor" options={{ title: "Doctor" }} />
            <Stack.Screen name="doctor-record" options={{ title: "Record" }} />
            <Stack.Screen name="doctor-patients" options={{ title: "Patients" }} />
            <Stack.Screen name="doctor-patient/[patientId]" options={{ title: "Patient details" }} />
            <Stack.Screen name="patient" options={{ title: "Patient" }} />
          </Stack>
          <StatusBar style="dark" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
