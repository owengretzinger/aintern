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


router.post('/transcript', async (req, res) => {
    const id = req.body.id
    console.log('id:', id)
    try{
        const response = await fetch(`https://us-west-2.recall.ai/api/v1/bot/${id}/transcript/`, {
            method: 'GET',
            headers: {
                'Authorization': 'Token ' + process.env.RECALL_API_KEY,
                'accept': 'application/json'
            },
        })
        
        const out = await response.json()

        const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'Summarize the following JSON transcript in a few sentences.' },
                    { role: 'user', content: JSON.stringify(out) }
                ]
            })
        });
        
        const summaryData = await summaryResponse.json();
        const summary = summaryData.choices?.[0]?.message?.content || 'Summary unavailable';
        
        res.json({ transcript: out, summary });
    } catch(e){
        console.warn(e)
        res.status(500)
    }
})



export const summonRouter = router;
