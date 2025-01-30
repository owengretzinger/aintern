import axios from "axios";
import fs from "fs";
import path from "path";
import { platform } from "os";
import { execSync } from "child_process";

const RHUBARB_VERSION = "1.13.0";

async function setupRhubarb() {
  const os = platform();
  let downloadUrl;

  console.log("os:", os);
  switch (os) {
    case "darwin":
      downloadUrl = `https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v${RHUBARB_VERSION}/rhubarb-lip-sync-${RHUBARB_VERSION}-macOS.zip`;
      break;
    case "win32":
      downloadUrl = `https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v${RHUBARB_VERSION}/rhubarb-lip-sync-${RHUBARB_VERSION}-Windows.zip`;
      break;
    case "linux":
      downloadUrl = `https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v${RHUBARB_VERSION}/rhubarb-lip-sync-${RHUBARB_VERSION}-Linux.zip`;
      break;
    default:
      throw new Error(`Unsupported platform: ${os}`);
  }

  const response = await axios({
    url: downloadUrl,
    responseType: "arraybuffer",
  });

  const tempDir = path.join(process.cwd(), "temp-rhubarb");
  const rhubarbDir = path.join(process.cwd(), "@rhubarb-lip-sync");

  // Create temp directory
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Save the zip file
  const zipPath = path.join(tempDir, "rhubarb.zip");
  fs.writeFileSync(zipPath, response.data);

  // Remove existing rhubarb directory if it exists
  if (fs.existsSync(rhubarbDir)) {
    fs.rmSync(rhubarbDir, { recursive: true, force: true });
  }

  // Extract the zip file
  if (os === "win32") {
    execSync(
      `powershell Expand-Archive -Path "${zipPath}" -DestinationPath "${tempDir}" -Force`,
    );
    const extractedDir = path.join(
      tempDir,
      `Rhubarb-Lip-Sync-${RHUBARB_VERSION}-Windows`,
    );
    fs.renameSync(extractedDir, rhubarbDir);
  } else {
    execSync(`unzip -o "${zipPath}" -d "${tempDir}"`);
    const extractedDir = path.join(
      tempDir,
      `Rhubarb-Lip-Sync-${RHUBARB_VERSION}-${
        os === "darwin" ? "macOS" : "Linux"
      }`,
    );
    fs.renameSync(extractedDir, rhubarbDir);
  }

  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });

  // Set executable permissions on Unix-like systems
  if (os !== "win32") {
    execSync(`chmod +x "${rhubarbDir}/rhubarb"`);
  }
}

setupRhubarb().catch(console.error);
