import React, { useEffect, useState } from "react";
import openAiServices from "../services/fluxOpenAI";
import { MarkdownReader } from "./MarkdownReader";
import "../styles/IAsession.css"


export const ChatbotIA = () => {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('')

    useEffect(() => {
        openAiServices.createCampaign().then(data => {
            setMessages([data])
        })
    }, [])

    const handleSendMessage = async () => {
        if(!input.trim()) return;

        const userMessage = { text: input, sender: 'user'}
        const updatedMessages = [...messages, userMessage]

        setMessages([...messages, userMessage])
        setInput('')
        try {
            const history = updatedMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const botMessages = await openAiServices.send(history, input)

            setMessages(prev => [...prev, botMessages])
        } catch (error) {
            console.log(error);
            
        }
    }

    // console.log('Mensajes actuales:', messages.map((msg, i) => ({
    //     index: i,
    //     textLength: msg.text?.length || 0,
    //     sender: msg.sender,
    //     preview: msg.text?.slice(0, 30) + (msg.text?.length > 30 ? '...' : '')
    // })));
    
    // console.log('Renderizando mensage:', messages);

    

    return (
        <div className="chat-container">
            <div className="chat-box">
                {
                    messages.map((msg, index) => <MarkdownReader key={index} text={msg.text} sender={msg.sender}/>)
                }
            </div>
            <div className="input-container">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key == 'Enter' && handleSendMessage()} placeholder="Escribir Mensaje" />
            </div>
            <button onClick={handleSendMessage}>
                Enviar
            </button>
        </div>
    )
}