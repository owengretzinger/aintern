const main = async () => {
    const id = ''
    const response = await fetch(`https://us-west-2.recall.ai/api/v1/bot/${id}/transcript/`, {
        method: 'GET',
        headers: {
            'Authorization': 'Token ' + process.env.RECALL_API_KEY,
            'accept': 'application/json'
        },
    })

    const out = await response.json()
}

main()