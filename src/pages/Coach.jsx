import { useEffect, useState } from "react";
import "./Coach.css";
import ReactMarkdown from "react-markdown";
import Swal from "sweetalert2";
import remarkGfm from "remark-gfm";
import API_URL from "../config/api.js";

const Coach = () => {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const loadConversation = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) return;

                const response = await fetch(
                    `${API_URL}/coach/history`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load conversation history."
                    );
                }

                setMessages(data.messages || []);
            } catch (error) {
                console.error("Conversation history error:", error);
            }
        };

        loadConversation();
    }, []);


    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || isLoading) return;

        const currentMessage = message.trim();

        const userMessage = {
            role: "user",
            content: currentMessage,
        };

        // Build history including the latest user message
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setMessage("");
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/coach`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: currentMessage,
                    history: messages,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to get a response from your AI Coach."
                );
            }

            const aiMessage = {
                role: "assistant",
                content: data.reply,
            };

            setMessages((previous) => [...previous, aiMessage]);

        } catch (error) {
            console.error("AI Coach error:", error);

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content:
                        error.message ||
                        "Sorry, something went wrong. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };



    const handleClearChat = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/coach/history`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to clear chat history."
                );
            }

            setMessages([]);

            return true;
        } catch (error) {
            console.error("Clear chat error:", error);

            await Swal.fire({
                title: "Unable to Clear Chat",
                text: error.message || "Something went wrong.",
                icon: "error",
                background: "#111",
                color: "#fff",
                confirmButtonColor: "#ff6b00",
            });

            return false;
        }
    };




    return (
        <div className="coach-page">
            <div className="coach-header">
                <h1>C-FIT AI Coach</h1>
                <p>Your personal fitness companion, ready to help.</p>
            </div>

            <div className="coach-chat">


                <div className="coach-header">
                    <h2>C-FIT AI Coach</h2>

                    <button
                        type="button"
                        className="clear-chat-btn"

                        onClick={async () => {
                            const result = await Swal.fire({
                                title: "Clear Chat History?",
                                text: "Your saved Coach conversation will be cleared.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes, clear chat",
                                cancelButtonText: "Keep Chat",
                                confirmButtonColor: "#ff6b00",
                                cancelButtonColor: "#444",
                                background: "#111",
                                color: "#fff",
                                reverseButtons: true,
                            });

                            if (result.isConfirmed) {
                                const cleared = await handleClearChat();

                                if (cleared) {
                                    await Swal.fire({
                                        title: "Chat Cleared!",
                                        text: "Your C-FIT Coach conversation has been cleared.",
                                        icon: "success",
                                        background: "#111",
                                        color: "#fff",
                                        confirmButtonColor: "#ff6b00",
                                    });
                                }
                            }
                        }}

                    >
                        Clear Chat
                    </button>
                </div>

                <div className="coach-messages">

                    {messages.length === 0 && (
                        <div className="coach-welcome">
                            <div className="coach-welcome-orb">AI</div>

                            <h2>Let's reach your goals!</h2>

                            <p>
                                Your personal fitness assistant is ready.
                                Choose a topic or ask me anything about fitness.
                            </p>

                            <div className="coach-suggestions">
                                {[
                                    "Create a beginner workout",
                                    "How can I build muscle?",
                                    "Help me improve my stamina",
                                ].map((question) => (
                                    <button
                                        type="button"
                                        className="coach-suggestion"
                                        key={question}
                                        onClick={() => setMessage(question)}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}



                    {messages.map((item, index) => (
                        <div
                            className={`chat-message ${item.role}`}
                            key={index}
                        >
                            {item.role === "assistant" ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        table: ({ ...props }) => (
                                            <div className="markdown-table-wrapper">
                                                <table {...props} />
                                            </div>
                                        )
                                    }}
                                >
                                    {item.content}
                                </ReactMarkdown>
                            ) : (
                                item.content
                            )}
                        </div>
                    ))}


                    {isLoading && (
                        <div className="chat-message assistant typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                            <small>C-FIT Coach is typing...</small>
                        </div>
                    )}
                </div>

                <form className="coach-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Ask your fitness coach..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
};

export default Coach;
