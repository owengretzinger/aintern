import { exec } from "child_process";
import { promises as fs } from "fs";

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
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`,
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./@rhubarb-lip-sync/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`,
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
