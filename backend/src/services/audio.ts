import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ElevenLabs from "elevenlabs-node";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIO_DIR = path.join(__dirname, "../../temp");

export const VOICE_ID = "cgSgspJ2msm6clMCkdW9";

export const voice = new ElevenLabs({
  apiKey: env.ELEVEN_LABS_API_KEY,
  voiceId: VOICE_ID,
});

const execCommand = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, _stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

export class AudioService {
  async processAudioMessage(message: number, text: string) {
    const baseFileName = `message_${message}`;
    const fileName = path.join(AUDIO_DIR, `${baseFileName}.mp3`);

    // Clean up existing files
    await this.cleanupFiles(baseFileName);

    // Generate speech
    await this.generateSpeech(fileName, text);

    // Generate lip sync
    await this.generateLipSync(message);

    // Read results
    const audio = await this.audioToBase64(fileName);
    const lipsync = await this.readJsonTranscript(
      path.join(AUDIO_DIR, `${baseFileName}.json`)
    );

    return { audio, lipsync };
  }

  private async cleanupFiles(baseFileName: string) {
    const files = [".mp3", ".wav", ".json"].map((ext) =>
      path.join(AUDIO_DIR, `${baseFileName}${ext}`)
    );

    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // Ignore errors if files don't exist
      }
    }
  }

  private async generateSpeech(fileName: string, text: string) {
    await voice.textToSpeech({
      fileName,
      textInput: text,
      voiceId: VOICE_ID,
      stability: 0.5,
      similarityBoost: 0.5,
      modelId: "eleven_multilingual_v2",
      style: 0,
      speakerBoost: true,
    });
  }

  private async generateLipSync(message: number) {
    const time = new Date().getTime();
    console.log(`Starting conversion for message ${message}`);
    
    await execCommand(
      `ffmpeg -y -i ${path.join(AUDIO_DIR, `message_${message}.mp3`)} ${path.join(
        AUDIO_DIR,
        `message_${message}.wav`
      )}`
    );
    
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    
    await execCommand(
      `./@rhubarb-lip-sync/rhubarb -f json -o ${path.join(
        AUDIO_DIR,
        `message_${message}.json`
      )} ${path.join(AUDIO_DIR, `message_${message}.wav`)} -r phonetic`
    );
    
    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
  }

  private async readJsonTranscript(file: string): Promise<any> {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  }

  private async audioToBase64(file: string): Promise<string> {
    const data = await fs.readFile(file);
    return data.toString("base64");
  }
} 