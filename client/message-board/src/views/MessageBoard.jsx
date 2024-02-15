import React, { useEffect } from 'react'
import LoadingMessages from '../components/LoadingMessages';
import Messages from '../components/Messages';

function MessageBoard({ messages }) {

    useEffect(() => {

    }, [messages]);

    return (
        <>
            <div className="header mt-5">
                <h1>Message Board</h1>
                <p>Spend Semcoin to have your say</p>
            </div>
            <div className="board d-flex flex-column">
                {(!messages || messages.length === 0) && <LoadingMessages />}
                {messages && messages.length > 0 && <Messages messages={messages} />}
            </div>
        </>
    )
}

export default MessageBoard;