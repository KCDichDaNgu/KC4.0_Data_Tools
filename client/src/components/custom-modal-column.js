import React from 'react';
import {
    Col
} from 'antd';

const CustomCol = ({ lang, documentContent = '', ...props }) => (
    <Col xs={24} md={12} { ...props }>
        <div className="full-doc-modal-lang">
            { lang }
        </div>
        <div style={{ paddingTop: '6px' }}>
            { documentContent }
        </div>
    </Col>
);

export default CustomCol;