import React, { useEffect, useState } from "react";
import openAiServices from "../services/fluxOpenAI";
import { MarkdownReader } from "./MarkdownReader";
import "../styles/IAsession.css"
import useGlobalReducer from "../hooks/useGlobalReducer";


export const ChatbotIA = () => {

    const { store, dispatch } = useGlobalReducer()
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('')
    const [chapter, setChapter] = useState(1)

    const [campaignConfig, setCampaignConfig] = useState({
        difficulty_level: null,
        character_name: null,
        character_class: null,
    })

    const detectarDatosCampaign = (input) => {
        const nameMatch = input.match(/me llamo ([\wáéíóúñ]+(?:\s[\wáéíóúñ]+)?)/i);
        const classMatch = input.match(/soy un[ae]? ([\wáéíóúñ]+)/i);
        const difficultyMatch = input.match(/dificultad es ([\wáéíóúñ]+)/i);

        setCampaignConfig(prev => ({
            ...prev,
            character_name: nameMatch?.[1] || prev.character_name,
            character_class: classMatch?.[1] || prev.character_class,
            difficulty_level: difficultyMatch?.[1] || prev.difficulty_level,
        }))
    }


    useEffect(() => {
        if (campaignConfig.character_name != null) {

            const tryStartCampaign = async () => {
                const { character_name, character_class, difficulty_level } = campaignConfig;
                const activeSessionID = localStorage.getItem('activeSessionID');
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userID = user.id || 'demo-user';

                if (!activeSessionID && character_name && character_class && difficulty_level) {
                    const sessionID = await openAiServices.startCampaign(
                        difficulty_level,
                        character_name,
                        character_class,
                        userID,
                    );

                    if (sessionID) {
                        localStorage.setItem('activeSessionID', sessionID)
                        localStorage.setItem(`sessionID-${userID}`, sessionID)
                        dispatch({ type: 'set_sessionID', payload: sessionID });
                    } else {
                        console.warn("No se pudo iniciar la sesión");
                    }

                }
            };

            tryStartCampaign();
        }
    }, [campaignConfig]);


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))

        if (user) {
            const savedSessionID = localStorage.getItem(`sessionID-${user.id}`)

            if (savedSessionID) {
                openAiServices.getIAsession(savedSessionID).then(sessionData => {
                    console.log('session existente cargada', sessionData)
                    localStorage.setItem('activeSesionID', savedSessionID)
                    dispatch({ type: 'set_sessionID', payload: savedSessionID})

                    openAiServices.getIAevents(savedSessionID).then(data => {
                        const formattedMessages = data.map(e => ({
                            text: e.description || '',
                            sender: e.role === 'user' ? 'user' : 'assistant'
                        }))
                        setMessages(formattedMessages)
                    })

                }).catch(err => console.error('Error cargando sesion existente', err))
            } else {
                openAiServices.createCampaign().then(data => {
                    console.log('Campaña nueva Creada:', data);
                    setMessages([data])
                })
            }
        }

    }, [])

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' }
        const updatedMessages = [...messages, userMessage]

        setMessages([...messages, userMessage])
        detectarDatosCampaign(input);
        setInput('')


        try {
            const history = updatedMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const botMessages = await openAiServices.send(history, input)
            const reply = botMessages.text

            setMessages(prev => [...prev, botMessages])

            const activeSessionID = localStorage.getItem('activeSessionID')
            if (activeSessionID) {
                await openAiServices.saveDEcisionEvent(
                    activeSessionID,
                    chapter,
                    input,
                    reply,
                    "progreso"
                )
                setChapter(prev => prev + 1)
            }

            // const user = JSON.parse(localStorage.getItem('user') || '{')
            // const userID = user.id || 'demo-user'

            // if (
            //     !activeSessionID && campaignConfig.characterName && campaignConfig.characterClass && campaignConfig.difficulty_level
            // ) {
            //     const sessionID = await openAiServices.startCampaign(
            //         campaignConfig.difficulty_level,
            //         campaignConfig.characterName,
            //         campaignConfig.characterClass,
            //         userID,
            //     )

            //     if (sessionID) {
            //         localStorage.setItem('activeSessionID', sessionID)
            //     } else {
            //         console.warn("No se pudo iniciar la sesion")
            //     }
            // }

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

    // const [formValues, setFormValues] = useState({
    //     title: "",
    //     genre: "",
    //     difficulty: "",
    //     characterName: "",
    //     characterClass: "",
    // })

    // const [started, setStarted] = useState(false);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormValues((prev) => ({
    //         ...prev,
    //         [name]: value,
    //     }))
    // }

    // const handleStartCampaign = async () => {
    //     const data = await openAiServices.createCampaign();
    //     setMessages([data])

    //     const user = JSON.parse(localStorage.getItem('user') || '{')
    //     const userID = user.id || 'demo-user'

    //     const sessionID = await openAiServices.startCampaign(
    //         formValues.title,
    //         formValues.genre,
    //         formValues.difficulty,
    //         formValues.characterName,
    //         formValues.characterClass,
    //         userID
    //     );

    //     if (sessionID) {
    //         localStorage.setItem('activeSessionID', sessionID)
    //         setStarted(true)
    //     } else {
    //         console.warn('No se puede iniciar la sesion de RPG')
    //     }
    // }

    // const handleSendMessage = async () => {
    //     if(!input.trim()) return;

    //     const userMessage = { text: input, sender: 'user'}
    //     const updatedMessages = [...messages, userMessage]

    //     setMessages([...messages, userMessage])
    //     setInput('')

    //     try {
    //         const history = updatedMessages.map(msg => ({
    //             role: msg.sender === 'user' ? 'user' : 'assistant',
    //             content: msg.text
    //         }));

    //         const botMessages = await openAiServices.send(history, input)
    //         const reply = botMessages.text

    //         setMessages(prev => [...prev, botMessages])

    //         const activeSessionID = localStorage.getItem('activeSessionID')
    //         if(activeSessionID) {
    //             await openAiServices.saveDEcisionEvent(
    //                 activeSessionID,
    //                 chapter,
    //                 input,
    //                 reply,
    //                 "progreso"
    //             )
    //             setChapter(prev => prev + 1)
    //         }
    //     } catch (error) {
    //         console.log(error);

    //     } 

    // }

    return (
        <div className="chat-container">
            {/* {!started ? (
                <div className="form.container">
                    <h2>Iniciar Campaña</h2>
                    <input type="text" name="title" placeholder="Titulo" value={formValues.title} onChange={handleChange} />
                    <select name="genre" value={formValues.genre} onChange={handleChange}>
                        <option value="">Seleccionar Genero</option>
                        <option value="Fantasia">Fantasía</option>
                        <option value="Ciencia Ficcion">Ciencia Ficcion</option>
                        <option value="Misterio">Misterio</option>
                    </select>
                    <select name="difficulty" value={formValues.difficulty} onChange={handleChange}>
                        <option value="">Seleccionar Dificultad</option>
                        <option value="Facil">Facil</option>
                        <option value="Medio">Medio</option>
                        <option value="Dificil">Dificil</option>
                    </select>
                    <input type="text" name="characterName" placeholder="Nombre del Personaje" value={formValues.characterName} onChange={handleChange} />
                    <select name="characterClass" value={formValues.characterClass} onChange={handleChange}>
                        <option value="">Seleccionar Clase</option>
                        <option value="Maga">Maga</option>
                        <option value="Asesino">Asesino</option>
                        <option value="Soldado">Soldado</option>
                    </select>
                    <button onClick={handleStartCampaign}>Comenzar Aventura</button>
                </div>
            ) : ( */}
            <>
                <div className="chat-box">
                    {
                        messages.map((msg, index) => <MarkdownReader key={index} text={msg.text} sender={msg.sender} />)
                    }
                </div>
                <div className="input-container">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key == 'Enter' && handleSendMessage()} placeholder="Escribir Mensaje" />
                </div>
                <button onClick={handleSendMessage}>
                    Enviar
                </button>
            </>
            {/* )} */}
        </div>
    )
}