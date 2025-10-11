import AuthLoader from "@/components/auth-loader";
import { ActivityIndicator, View } from "react-native";



export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <AuthLoader />
      <ActivityIndicator size="large" />
    </View>
  );
}
