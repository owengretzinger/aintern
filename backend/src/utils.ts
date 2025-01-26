import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIO_DIR = path.join(__dirname, "../temp");

export const execCommand = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, _stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

export const lipSyncMessage = async (message: number): Promise<void> => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i ${path.join(AUDIO_DIR, `message_${message}.mp3`)} ${path.join(AUDIO_DIR, `message_${message}.wav`)}`,
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./@rhubarb-lip-sync/rhubarb -f json -o ${path.join(AUDIO_DIR, `message_${message}.json`)} ${path.join(AUDIO_DIR, `message_${message}.wav`)} -r phonetic`,
  );
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

export const readJsonTranscript = async (file: string): Promise<any> => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

export const audioFileToBase64 = async (file: string): Promise<string> => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};
