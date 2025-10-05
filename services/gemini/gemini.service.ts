import api from "../api/api";

export class GeminiService {
    async transcribeAudio(fileUri: string) {
        const formData = new FormData();
        formData.append('file', {
            uri: fileUri,
            type: 'audio/m4a', // Confirmado como formato padrão do expo-av
            name: 'audio.m4a',
        } as any);

        const response = await api.post('gemini/audiotranscription', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    async transcribeImage(fileUri: string) {
        const formData = new FormData();
        formData.append('file', {
            uri: fileUri,
            type: 'image/jpeg',
            name: 'image.jpg',
        } as any);

        const response = await api.post('gemini/imagetranscription', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }
}