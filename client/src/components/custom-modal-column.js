import React from 'react';
import {
    Col
} from 'antd';

const CustomCol = ({ lang, documentContent = '', ...props }) => (
  <Col xs={24} md={12} { ...props }>
      <div style={{ fontWeight: 600, fontSize: '18px' }}>
          { lang }
      </div>
      <div style={{ paddingTop: '6px' }}>
          { documentContent }
      </div>
  </Col>
);

export default CustomCol;