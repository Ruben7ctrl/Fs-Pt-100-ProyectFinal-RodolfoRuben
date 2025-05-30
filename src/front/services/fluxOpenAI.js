const backendUrl = import.meta.env.VITE_BACKEND_URL;
const openAiServices = {};
const apiKey =  import.meta.env.VITE_OPENIA;
openAiServices.createCampaign = async () => {
  try {
    const payload = `Eres un dungeon master, generame una historia de campaña de RPG tipo dungeons and dragons donde se puedan seleccionar 3 tipos de personajes, cada uno con una clase diferente (soldado, maga y asesino) y estadisticas para cada uno acorde a sus clases.
A partir de lo que el usuario te responda, iras guiando y respondiendo a todas las acciones que realice el jugador (usuario). 
Lo primero que tendra que hacer el jugador, es seleccionar que heroe va a ser, despues el nombre que quiere poner a su heroe y la dificultad de la historia que generes.
Una vez seleccionado el heroe con su nombre y la dificultad, vas a devolver una lista de acciones para el escenario que le generes y se enfrente el jugador 
deveulvemelo como un md`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: payload}],
            max_tokens: 800,
            temperature: 0.7,
        })
    })
    if(!resp.ok) {
        const errorText = await resp.text()
        throw new Error(`OPENAI API error: ${resp.status} - ${errorText}`);
    }
    const data = await resp.json()
    // console.log('data------>', data);
    const campaign = data.choices[0].message.content.trim()
    // console.log('campaign------->', campaign);
    
    return { text: campaign, sender: 'assistant'}
  } catch (error) {
    console.log('Error fetching campaign:', error);
    
  }
};


openAiServices.send = async (history, body) => {

    try {
        // console.log('Enviando a la API con:', {history, body});

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Eres un dungeon master de Dungeons and Dragons' },
                    ...history,
                    { role: 'user', content: body}
                ],
                max_tokens: 800,
                temperature: 0.7,
            })
        })
        // console.log('Respuesta recibida:', resp);

        if(!resp.ok) {
            const errorText = await resp.text();
            // console.log('Fallo OpenAI:', errorText);
            throw new Error(`OpenAI API error: ${resp.status} - ${errorText}`);
        }
        
        const data = await resp.json()
        // console.log('Respueta recibida:', data);
        const content = data.choices?.[0]?.message?.content?.trim()
        if(!content) {
            throw new Error("La respuesta no tiene contenido valido");
        }

        return { text: content, sender: 'assistant'};

    } catch (error) {
        console.log('Error en send():', error);
        return { text: 'Hubo un error al obtener la respuesta del asistente', sender: 'assistant'}
        
    }
}

openAiServices.startCampaign = async (difficulty_level, character_name, character_class, user_id) => {
    try {
        const body = {
            difficulty_level,
            character_name,
            character_class,
            user_id
        }
        const token = localStorage.getItem('token')
        console.log('Token usado', token);
        

        const resp = await fetch(backendUrl + '/api/ia_sessions', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        })

        const data = await resp.json()
        if (resp.ok) {
            localStorage.setItem('activeSessionID', data.id)
            return data.id
        } else {
            console.log('error en respuesta', data.error);
            return null
            
        }
    } catch (error) {
        console.log('error al iniciar la campaña', error);
        return null
        
    }
}

openAiServices.saveDEcisionEvent = async (sessionID, chapter_number, decision, description, outcome) => {
    try {
        const body = {
            chapter_number,
            decision,
            description,
            outcome,
        }

        const resp = await fetch(backendUrl + `/api/ia_sessions/${sessionID}/ia_events`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body),
        })

        const data = await resp.json()
        if(!resp.ok) {
            console.error(`Error guardando evento. Status ${resp.status}`, data);
            throw new Error(data.error || "Fallo al guardad el evento");
            
        }

        return data
    } catch (error) {
        console.log(error);
        
    }
}

export default openAiServices;
