import React from "react";
import { useState, useEffect } from "react";
import './css/Dashboard.css'
// import { useState } from "react";

const Dashboard: React.FC = () => {

    const [botID, setBotID] = useState('')

    const [transcript, setTranscript] = useState([])
    const [summary, setSummary] = useState('empty')

    useEffect(()=>{

        const queryParams = new URLSearchParams(window.location.search);
        const uid = queryParams.get("intern");
        console.log(uid)
        if (uid) setBotID(uid)

    },[])

    useEffect(()=>{

        const main = async () => {
            
            if(botID && botID != ''){
                console.log('BOT_ID:', botID)
    
                const response = await fetch('http://localhost:3001/api/summon/transcript', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: botID
                    })
                })

                const out = await response.json()

                if (out){
                    setTranscript(out.transcript)
                    setSummary(out.summary)
                }

                // setTranscript(await response.json())

            }
        }

        main()

    },[botID])

  return <section className = 'dashboard'>

    <div className ='part transcript'>
        {transcript.map(word=>{
            <div className ='empty'>empty</div>
            console.log(word)
            const speaker = word.speaker
            const text = word.words[0].text
            return <div className="text">
                <h3>{text}</h3>
                <p>{speaker}</p>
            </div>
        })}
    </div>
    <div className ='part'>
        <div className ='empty'>empty</div>
    </div>
    <div className ='part'>
        <div className ='empty summary'>{summary}</div>
    </div>
  </section>;
};

export default Dashboard;
