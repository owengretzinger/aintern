import express from "express";

const router = express.Router();

router.post("/summon", async (req, res) => {
    try {
        const meeting_url = req.body.meeting_url 
        
        const response = await fetch('https://us-west-2.recall.ai/api/v1/bot', {
            method: 'POST',
            headers: {
                'Authorization': 'Token ' + process.env.RECALL_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                meeting_url: req.body.meeting_url,
                bot_name: 'Iris the Intern',
                output_media: {
                    camera: {
                        kind: 'webpage',
                        config: {
                            url: 'https://a82e-130-15-35-204.ngrok-free.app/?viewOnly=true',
                        }
                    }
                },
                variant: {
                    google_meet: "web_4_core"
                },
                transcription_options: {
                    provider: "meeting_captions"
                }
            })
        })
    
        res.json(await response.json())

    } catch (e) {
        console.warn(e)
        res.status(500)
    }
});

export const summonRouter = router;
