
const main = async () => {
    const response = await fetch('https://us-west-2.recall.ai/api/v1/bot', {
        method: 'POST',
        headers: {
            'Authorization': 'Token ac478c1256dfaaa43ad1e0861627a41c23b64a5e',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            meeting_url: 'https://meet.google.com/bmv-fuwj-wxq',
            bot_name: 'Iris the Intern',
            output_media: {
                camera: {
                    kind: 'webpage',
                    config: {
                        url: 'https://a82e-130-15-35-204.ngrok-free.app/?viewOnly=true',
                        // url: 'https://a82e-130-15-35-204.ngrok-free.app/',
                        // url: 'https://www.youtube.com/watch?v=OekfRqHfI0w&ab_channel=rr.',
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
    console.log(await response.json())
}
main()