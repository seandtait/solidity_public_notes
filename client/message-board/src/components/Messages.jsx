import React, { useEffect } from 'react'

function Messages({ messages }) {
    const bigInt = require('big-integer');

    function convertUnixTimestampToDateString(unixTimestamp) {
        // Create a new Date object from the Unix timestamp
        const date = new Date(unixTimestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds

        // Extract the day, month, and year from the date object
        const day = String(date.getDate()).padStart(2, '0'); // Pad single digit days with a leading 0
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();

        // Format the date as dd/mm/YYYY
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }

    useEffect(() => {

    }, [messages]);

    return (
        <>
            <div className="messages mt-2 h-100">
                {messages.map((message) => (
                    <div key={message.uuid} className="row">
                        <div className="col-12">
                            <div className='tip-box d-flex flex-column'><div className='tip-overlap'>{bigInt(message.tip).toString()}</div></div>
                            <div className='message-box' style={{}}>
                                <h2 className='m-2 text-break'>{message.message}</h2>
                                <p>
                                    {message.uuid}
                                </p>
                                <figcaption className="blockquote-footer">
                                    <cite title="Source Title">{convertUnixTimestampToDateString(message.date)}</cite>
                                </figcaption>
                            </div>
                        </div>
                    </div>

                ))}
            </div>
        </>
    )
}

export default Messages;