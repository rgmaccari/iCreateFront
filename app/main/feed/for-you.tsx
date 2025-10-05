import { User } from "@/services/user/user";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const { user } = useLocalSearchParams();
  const userData: User = user ? JSON.parse(user as string) : null;

  const handleSelect = (screen: number) => {
    if (screen === 1) router.push('/feed/feed');

    if (screen === 2) router.push('/feed/pinterest');

    if (screen === 3) router.push('/feed/sla');

    if (screen === 4) router.push('/feed/lucid');
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => handleSelect(1)}>
        <Text style={styles.buttonText}>11</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleSelect(2)}>
        <Text style={styles.buttonText}>22</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleSelect(3)}>
        <Text style={styles.buttonText}>33</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleSelect(4)}>
        <Text style={styles.buttonText}>44</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#362946",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});