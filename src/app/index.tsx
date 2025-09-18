import AuthLoader from "@/src/components/auth-loader";
import { ActivityIndicator, View } from "react-native";



export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* AuthLoader vai decidir para onde mandar o usuário */}
      <AuthLoader />
      <ActivityIndicator size="large" />
    </View>
  );
}
