import React, { useEffect } from 'react'

function CreateMessage({ handleTipChange, handleMessageChange, handleCalculateTotalCost, semcoinBalance, handleCreateMessage, tip, message, totalCost, setTip, setMessage, setTotalCost }) {

	const onTipChange = async (event) => {
		const newTip = await handleTipChange(tip, Number(event.target.value));
		setTip(newTip);
		const newCost = await handleCalculateTotalCost(message, newTip);
		setTotalCost(newCost);
	}

	const onMessageChange = async (event) => {
		const newMessage = await handleMessageChange(message, event.target.value);
		setMessage(newMessage);
		const newCost = await handleCalculateTotalCost(newMessage, tip);
		setTotalCost(newCost);
	}

	useEffect(() => {

	}, [semcoinBalance, tip, message, totalCost]);

	return (
		<>
			<div className="row sticky-top">
				<div className="mt-5 col-12 d-flex flex-column border p-3">
					<h3>Create a Message</h3>
					<label htmlFor="message">Message</label>
					<textarea rows={4} style={{ resize: 'none' }} onChange={onMessageChange} value={message} className='m-2' type="text" name="message" id="message" />
					<label htmlFor="tip">Tip</label>
					<input onChange={onTipChange} value={tip} className='m-2' type="number" name="tip" id="tip" />
					<h3 className='mt-4'>Total cost: {totalCost} <i className="fa-solid fa-coins"></i></h3>
					<button onClick={() => handleCreateMessage()} disabled={!(totalCost <= semcoinBalance && message.length !== 0)} className='m-2 btn btn-semcoin-dark' type="submit">CREATE</button>
					<p className='mt-3' style={{ color: '#98c1d9', filter: 'brightness(80%)' }}>Cost is calculated at 1 token per byte length of your message + tip!</p>
				</div>
			</div>
		</>
	)
}

export default CreateMessage;