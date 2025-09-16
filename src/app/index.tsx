import { ActivityIndicator, View } from "react-native";
import AuthLoader from "../components/auth-loader";


export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* AuthLoader vai decidir para onde mandar o usuário */}
      <AuthLoader />
      <ActivityIndicator size="large" />
    </View>
  );
}
