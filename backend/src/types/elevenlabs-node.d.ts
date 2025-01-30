declare module "elevenlabs-node" {
  interface VoiceSettings {
    stability: number;
    similarityBoost: number;
  }

  interface TextToSpeechParams {
    fileName: string;
    textInput: string;
    voiceId?: string;
    stability?: number;
    similarityBoost?: number;
    modelId?: string;
    style?: number;
    speakerBoost?: boolean;
  }

  class ElevenLabs {
    constructor(config: { apiKey: string; voiceId?: string });

    textToSpeech(params: TextToSpeechParams): Promise<void>;
    getVoices(): Promise<any>;
    getVoiceSettings(params: { voiceId: string }): Promise<VoiceSettings>;
    editVoiceSettings(params: {
      voiceId: string;
      stability: number;
      similarityBoost: number;
    }): Promise<void>;
    getModels(): Promise<any>;
    getUserInfo(): Promise<any>;
    getUserSubscription(): Promise<any>;
    getDefaultVoiceSettings(): Promise<VoiceSettings>;
  }

  export default ElevenLabs;
}

declare module "elevenlabs-node";
