import React from "react";
import { ChatbotIA } from "../components/ChatbotIA";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MagnifyingGlass, User } from "phosphor-react";


export const IAsession = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center">
              
            <ChatbotIA />
        </div>
    )
}