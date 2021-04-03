import React from 'react';
import './upload-file-button.css'
const UploadFileButton = props => (
    <React.Fragment>
        <div className="upload-button-container">
            <label
                className="upload-button-label"
                for={props.index}
            >
                <svg viewBox="64 64 896 896" focusable="false" data-icon="upload" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true"><path d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 00-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path></svg>
            </label>
            <input
                style={{display:'none'}}
                id={props.index}
                type="file"
                onChange={ e => {
                    props.onUpload(e.target.files[0], props.index)
                }}
                onClick={ e => {e.target.value = null} }
            >
            </input>
        </div>
    </React.Fragment>
)

export default UploadFileButton