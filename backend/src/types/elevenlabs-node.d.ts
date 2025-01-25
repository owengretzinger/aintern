declare module 'elevenlabs-node' {
  export function getVoices(apiKey: string): Promise<any>;
  export function textToSpeech(apiKey: string, voiceId: string, fileName: string, text: string): Promise<void>;
  export default {
    getVoices,
    textToSpeech
  };
}
