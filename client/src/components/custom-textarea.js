import React, { useEffect, useState } from 'react';
import {
    Input
} from 'antd';

const CustomTextArea = ({ defaultValue, ...props }) => {

    const [state, setState] = useState({ 
        value: defaultValue || '',
        typingTimeOut: 0 
    });

    useEffect(() => {
        return () => clearTimeout(state.typingTimeOut)
    }, [state.typingTimeOut])

    const trimmedValue = state.value.trim();
    const wordsCount = trimmedValue.length == 0 ? 0 : trimmedValue.split(/\s+/).length;

    function trimOnChange(e) {
        if (state.typingTimeOut) {
            clearTimeout(state.typingTimeOut);
        }
        
        const currValue = e.target.value;

        setState({
            value: currValue,
            typingTimeOut: setTimeout(() => {
                setState({ ...state, value: currValue.trim() });
            }, 650)
        });
    }

    return (
        <React.Fragment>
            <Input.TextArea
                { ...props }
                className='border-none'
                value={ state.value }
                onChange={ (e) => {
                    props.onChange(e)
                    trimOnChange(e) 
                }}
            />
            
            <div style={{ color: 'rgba(0, 0, 0, 0.45)', textAlign: 'right'}}>
                { wordsCount }
            </div>
        </React.Fragment>
    );
}

export default CustomTextArea;
