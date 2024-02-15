import React, { useEffect, useState } from 'react'

function TextValueLoading() {
    const [dots, setDots] = useState('.');

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDots(prevDots => {
                switch (prevDots) {
                    case '.': return '..';
                    case '..': return '...';
                    case '...': return '.';
                    default: return '.';
                }
            });
        }, 500);
        return () => clearInterval(intervalId); // Clean up interval on component unmount
    }, []);

    return (
        <span>{dots}</span>
    )
}

export default TextValueLoading