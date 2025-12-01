import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Close() {
  const Insents = useSafeAreaInsets();
  const router = useRouter();

  useFocusEffect(() => {
    async function CloseSession() {
      await Promise.all([
        SecureStore.deleteItemAsync('user_id'),
        SecureStore.deleteItemAsync('nameCliente'),
        SecureStore.deleteItemAsync('empresa_id'),
        SecureStore.deleteItemAsync('nameEmpresa'),
      ]);

      router.replace('/');
    }

    CloseSession();
  });

  return (
    <View style={{ paddingTop: Insents.top }}>
      <Text style={{ flex: 1, margin: 'auto' }}>Cerrando...</Text>
    </View>
  );
}
/*
        await SecureStore.deleteItemAsync('user_id')
        await SecureStore.deleteItemAsync('nameCliente')
        await SecureStore.deleteItemAsync('empresa_id')
        await SecureStore.deleteItemAsync('nameEmpresa')
*/