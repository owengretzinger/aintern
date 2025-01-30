# (A)Intern

A 3D AI meeting assistant that joins your video calls, responds to questions in real-time, and takes meeting notes automatically.

https://github.com/user-attachments/assets/e6afa2e4-1626-4273-97b0-04f05b5f4d0c

## Overview

(A)Intern features a 3D virtual AI assistant named Iris that can:

<details>
<summary>Join meetings on platforms like Google Meet by simply providing a URL</summary>

![Enter URL](https://github.com/user-attachments/assets/b32e5e28-5a92-465c-b4f5-8e3de35239e6)

</details>

<details>
<summary>Answer questions in real-time with natural voice responses and lifelike expressions</summary>

![In Meeting](https://github.com/user-attachments/assets/c33e46a5-2e69-4d7d-be45-7f330ee2c62a)

</details>

<details>
<summary>Access and reference uploaded company documents for contextual responses</summary>

![image](https://github.com/user-attachments/assets/61af77c3-0eec-46a8-8a6e-e3c37aaaa59a)

</details>

<details>
<summary>Take automated meeting notes and generate summaries</summary>

![Transcript and Summary](https://github.com/user-attachments/assets/21d8f06f-1fc1-40ef-aad4-90c305af949a)

</details>

## Project Structure

The project consists of four main components:

- `/avatar` - 3D avatar rendering and animation system
- `/backend` - Express server handling AI, meeting management, and data processing
- `/dashboard` - React-based user interface for managing meetings and documents
- `/video-stream` - Video streaming service for meeting integration

## Technical Architecture

### Avatar System

- Ready Player Me for 3D modeling
- Mixamo for natural animations
- ElevenLabs for voice synthesis
- Rhubarb Lip Sync for lip synchronization
- Three.js for 3D rendering

### Meeting Integration

- Recall.ai API for meeting bot capabilities
- Custom video streaming solution for Three.js compatibility
- Real-time transcription and response system
- OpenAI for natural language processing

### Core Technologies

- React/Vite frontends
- Express.js backend
- Supabase database
- WebSocket communication

## Technical Implementation

The system works through the following flow:

1. User submits a meeting URL through the dashboard
2. Meeting bot joins the call via Recall.ai
3. Questions are transcribed in real-time
4. Backend processes queries with relevant document context
5. AI generates responses with voice synthesis and lip-sync
6. Avatar stream is piped back into the meeting

### Latency Handling

The current system has approximately 10 seconds of latency due to our unique technical solution:

- Recall's headless browser can't directly render Three.js
- Solution: Convert avatar to video stream first
- Trade-off: Higher latency for better visual experience

![Flow Diagram](https://github.com/user-attachments/assets/d4c49d0a-0bc0-48bf-8da4-7904f82d9f1f)

## Development

### Prerequisites

- Node.js
- pnpm
- ngrok (for local development with Recall.ai)

### Local Development with ngrok

When testing the meeting integration locally, you'll need ngrok to expose your local server to the internet. This is required because Recall.ai needs to communicate with publicly accessible endpoints.

1. Install ngrok: https://ngrok.com/download
2. Start ngrok on port 3001 (or your backend port):
   ```bash
   ngrok http 3001
   ```
3. Update your environment variables to use the ngrok URL:
   - In `backend/.env`, set `PUBLIC_URL` to your ngrok URL
   - In `video-stream/.env`, update the WebSocket URL accordingly

### Setup

1. Clone the repository
2. Install dependencies in each directory:
   ```bash
   cd avatar && pnpm install
   cd ../backend && pnpm install
   cd ../dashboard && pnpm install
   cd ../video-stream && pnpm install
   ```
3. Configure environment variables (see `.env.example` in each directory)
4. Start the development servers
