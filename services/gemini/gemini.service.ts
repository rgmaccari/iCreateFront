import api from "../api/api";

export class GeminiService {
  async transcribeAudio(fileUri: string) {
    console.log("Acionando o GeminiService - transcribeAudio()");
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      type: "audio/m4a",
      name: "audio.m4a",
    } as any);

    const response = await api.post("gemini/audiotranscription", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async transcribeImage(fileUri: string) {
    console.log("Acionando o GeminiService - transcribeImage()");
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: "image.jpg",
    } as any);

    const response = await api.post("gemini/imagetranscription", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("service - transcribe image", response.data);
    return response.data.content;
  }
}
