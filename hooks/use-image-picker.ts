import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export function useImagePicker() {
    const [image, setImage] = useState<{ uri: string; mimeType: string; name: string } | null>(null);

    const pickImage = async () => {
        try {
            //Solicitar permissão da galeria
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                alert('Permissão para acessar a galeria é necessária!');
                return;
            }

            //Abrir o seletor de imagens
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            //Não cancelou
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setImage({
                    uri: asset.uri,
                    mimeType: asset.mimeType ?? 'image/jpeg',
                    name: asset.fileName ?? 'image.jpg',
                });
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
        }
    };

    return { image, pickImage, setImage };
}
