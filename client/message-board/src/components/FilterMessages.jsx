import React, { useEffect, useState } from 'react'

function FilterMessages({
    isMobile,
    filterMinTokens,
    filterMaxTokens,
    filterUuid,
    setFilterMinTokens,
    setFilterMaxTokens,
    setFilterUuid,
    handleFilter,
    absoluteMaxTokens
}) {

    const onMinTokensChanged = async (event) => {
        const _minTokens = Number(event.target.value);
        if (_minTokens <= filterMaxTokens) {
            setFilterMinTokens(_minTokens);
        }
        handleFilter(_minTokens, filterMaxTokens, filterUuid);
    }

    const onMaxTokensChanged = async (event) => {
        const _maxTokens = Number(event.target.value);
        if (_maxTokens >= filterMinTokens && _maxTokens <= absoluteMaxTokens) {
            setFilterMaxTokens(_maxTokens);
        } else if (_maxTokens >= filterMinTokens && _maxTokens > absoluteMaxTokens) {
            setFilterMaxTokens(absoluteMaxTokens);
        }
        handleFilter(filterMinTokens, _maxTokens, filterUuid);
    }

    const onUuidChanged = async (event) => {
        const _uuid = event.target.value;
        setFilterUuid(_uuid);
        handleFilter(filterMinTokens, filterMaxTokens, _uuid);
    }


    useEffect(() => {

    }, []);

    return (
        <>
            <div className="row sticky-top">
                <div className="mt-5 col-12 d-flex flex-column border p-3">
                    <h4>Tip</h4>
                    <label htmlFor="message">Minimum</label>
                    <input type="text" onChange={onMinTokensChanged} value={filterMinTokens} className='m-2' name="minTokens" id="minTokens" />
                    <label htmlFor="tip">Maximum</label>
                    <input type="text" onChange={onMaxTokensChanged} value={filterMaxTokens} className='m-2' name="maxTokens" id="maxTokens" />

                    <h4>Id Search</h4>
                    <input type="text" onChange={onUuidChanged} value={filterUuid} className='m-2' name="uuid" id="uuid" />
                </div>
            </div>
        </>
    )
}

export default FilterMessages;