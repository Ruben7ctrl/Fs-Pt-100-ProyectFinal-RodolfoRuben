const userServices = {}
const backendUrl = import.meta.env.VITE_BACKEND_URL;


userServices.signup = async (formData) => {
    try {
        const resp = await fetch(backendUrl + "/api/signup", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        if(!resp.ok) throw new Error("something went wrong with signup")
        const data = await resp.json()
        
        return data;
    } catch (error) {
        console.log(error)
    }
}

userServices.signin = async (formData) => {
    try {
        const resp = await fetch(backendUrl + "/api/signin", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        if(!resp.ok) throw new Error("something went wrong with signin")
        const data = await resp.json()
        console.log("login response", data)
        localStorage.setItem("token", data.token)

        return data
    } catch (error) {
        console.log(error);
        
    }
}



export default userServices