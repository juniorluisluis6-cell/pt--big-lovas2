import { GoogleGenAI, Type, Modality, VideoGenerationReferenceType } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const chatWithGemini = async (message: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: message,
      config: {
        systemInstruction: "You are a fashion expert and personal stylist for BIG LOVA-FASHION. Your tone is elegant and professional.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Desculpe, estou tendo problemas para processar sua solicitação.";
  }
};

export const editFashionImage = async (base64Image: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ],
      },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    return null;
  }
};

export const generateFashionVideo = async (prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") => {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `High-end fashion cinematography: ${prompt}`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || "" },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Gemini Video Generation Error:", error);
    return null;
  }
};

export const findFashionEventsNearby = async (lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Quais são os eventos de moda ou lojas de luxo mais próximos de mim?",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    return {
      text: response.text,
      links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return null;
  }
};

export const speakFashionTip = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Diga com elegância: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.play();
    }
  } catch (error) {
    console.error("Gemini TTS Error:", error);
  }
};
