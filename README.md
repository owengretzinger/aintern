# (A)Intern

Watch the demo:

[![Watch the demo](https://img.youtube.com/vi/qoR3mv23wPs/maxresdefault.jpg)](https://youtu.be/qoR3mv23wPs?si=Ro5gzIvniRAQinu_)

## Inspiration
The inspiration behind (A)Intern comes from the need to have an efficient, virtual assistant that can automate meeting tasks and help users by providing real-time answers, note-taking, and follow-up actions during video calls.

## What it does
Iris is a 3D virtual AI intern that can join meetings on platforms like Zoom, Google Meet, or MS Teams when provided with a URL. It listens to discussions, answers questions out loud, takes notes, and generates meeting summaries. Additionally, it can recall past meetings, access uploaded documents, and provide context when needed.



## How we built it
**Avatar:** Built using a combination of Ready Player Me for 3D modeling, Mixamo for animations, ElevenLabs for voice synthesis, and Rhubarb Lip Sync for lip-syncing.

**Meeting Bot:** Integrated the Recall.ai API for meeting bot capabilities and utilized OpenAI for natural language generation.

**Tech Stack:** The project uses a React frontend, Express backend, and Supabase database. It also makes extensive use of web sockets for communication between various components.

##  Challenges we ran into
- Recall.ai uses a system of streaming in the content of a web page as the bot's camera feed. However, Recall's headless browser cannot render Three.js. We spent half of the hackathon to finally come to a workaround: streaming the page as a video into another page, which Recall looks at to stream into the meeting.
- Ensuring the bot could respond in real-time to questions during meetings while maintaining context from past meetings.
- Syncing meeting notes, generating accurate summaries, and creating a smooth user experience for video conferencing platforms.
- Reducing latency between asking a question and receiving Iris' answer

## Accomplishments that we're proud of
- (A)Intern can automatically join meetings by just providing a URL, making it easy for users to integrate.
- It’s able to answer questions in real-time during meetings, providing value right away.
- The avatar’s lip-syncing with voice responses creates an interactive and lifelike experience for users.
- The integration of meeting summaries, transcripts, and contextual awareness is a significant achievement.

## What we learned
- Managing real-time interactions with an AI while ensuring smooth execution across different platforms requires a lot of coordination and testing.
- Augmenting AI’s knowledge through document uploads and maintaining contextual awareness is a critical aspect for providing helpful responses.
- The importance of a solid backend structure for efficient data handling and scalability.

## What's next for (A)Intern
- Expanding (A)Intern’s capabilities by testing with more meeting platforms.
- Adding enhanced AI features like predictive follow-ups, task management, and personalized meeting actions.
- Reducing latency.
- Improving avatar customization and voice diversity for a more tailored experience.
- Exploring deep learning for better question understanding and context awareness.

![image](https://github.com/user-attachments/assets/8ab3c7c2-d9d8-4ec2-80c0-844642df8c61)
