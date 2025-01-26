const main = async (BOT_ID) => {
    try {
        const response = await fetch(`https://us-west-2.recall.ai/api/v1/bot/${BOT_ID}/transcript/`, {
            method: 'GET',
            headers: {
                'Authorization': 'Token ac478c1256dfaaa43ad1e0861627a41c23b64a5e',
                'accept': 'application/json'
            }
        })
        const out = await response.json()
    
        // console.log(out)
        // console.log(out[out.length - 1].words)
        const test = out[out.length - 1].words[0].text
        return test
    } catch (e) {
        console.warn(e)
        return null
    }
}

const ID = 
'50350112-cbe1-4b90-be1a-6a3c19153d67'
// main(ID)

let lastMsg = ''
setInterval(async () => {
    const response = await main(ID)
    
    if (response != lastMsg){
        console.log('======================================================')
        console.log(response)
        lastMsg = response
    }
}, 500)