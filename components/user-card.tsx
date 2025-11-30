import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../services/user/user';

interface UserCardProps {
  user: User;
  onLogout: () => void;
}

// Converte buffer (número[]) em Base64
const bufferToBase64 = (buffer: number[] | string): string => {
  if (typeof buffer === 'string') return buffer;
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return global.btoa(binary);
};

export default function UserCard({ user, onLogout }: UserCardProps) {
  let avatarUri: string | null = null;

  if (user.avatarBase64 && user.avatarMimeType) {
    const base64 = bufferToBase64(user.avatarBase64 as any);
    avatarUri = `data:${user.avatarMimeType};base64,${base64}`;
  }

  return (
    <LinearGradient colors={['#cab0e6ff', '#ebebebff']} style={styles.gradientContainer}>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholder}>
              <FontAwesome name="user" size={40} color="#fff" />
            </View>
          )}
        </View>

        {/* Nickname */}
        <Text style={styles.nickname}>@{user.nickname}</Text>

        {/* Botão sair */}
        <TouchableOpacity onPress={onLogout}>
          <FontAwesome name="sign-out" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 20,
    marginTop: 0,
    marginVertical: 20,
    marginHorizontal: 0,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarWrapper: {
    marginRight: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8888',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nickname: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
});
