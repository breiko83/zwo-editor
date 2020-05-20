import React from 'react';
import './bar.css';
import {Resizable} from 're-resizable';

function Bar() {
  return (
    <Resizable
      className='bar'
      defaultSize={{
        width: 300,
        height: 200,        
      }}
      minWidth={10}
      minHeight={50}
      maxHeight={500}
    >
      1
    </Resizable>
  );
}

export default Bar;