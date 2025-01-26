import React, { useEffect } from "react";
import { useState } from "react";

import './css/Home.css'

const Home: React.FC = () => {
    
    const [interns, setInterns]= useState([])

    useEffect(()=>{
        const old= localStorage.getItem('interns')
        console.log('retrieved:', old)

        if (old) setInterns(JSON.parse(old))
    },[])
    
    useEffect(()=>{
        console.log(interns)
        localStorage.setItem('interns', JSON.stringify(interns))
    },[interns])

    const sendIntern = async (meeting_url: string) => {
        const response = await fetch('http://localhost:3000/api/summon/summon', {
            method: 'POST',
            headers: {
                'Content-Type':' application/json'
            },
            body: JSON.stringify({
                meeting_url
            })
        })

        return await response.json()
    }

    const handleSubmit = (e: any) => {
        e.preventDefault()
        const input = e.target.querySelector('input')
        const url = input.value

        const p = document.querySelector('p')
        if (p) p.classList.add('active')

        console.log('sending intern to:', url)
        if(url != '' && url){

            sendIntern(url).then((res)=>{
                console.log(res)
                if (res) if (res.id) {
                    setInterns([...interns, res.id])
                } 
            })
        }

        input.classList.add('active')
        setTimeout(()=>{
            input.classList.remove('active')
        }, 500)
    }

    const handleRedirect = (e:any) => {
        const elem = e.target
        const id = elem.id
        window.location.pathname = `dashboard?intern=${id}`
    }

    const handleClick = () => {
        const p = document.querySelector('p')
        if (p) p.classList.remove('active')
    }

    return <section className="home" onClick={handleClick}>
        
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="enter meeting url"/>
            </form>
            <p>sending intern ✅</p>

            <ul className="list">
                {interns.map(uid=>{
                    return <li id = {uid} onClick={handleRedirect}>intern {uid} 👓📖</li>
                })}
            </ul>

        </section>;
};

export default Home;
