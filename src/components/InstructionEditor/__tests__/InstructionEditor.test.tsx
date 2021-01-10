import React from 'react';
import InstructionEditor from '../InstructionEditor';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import { createInstruction } from '../../../types/Instruction';
import createMode from '../../../modes/createMode';
import { Duration } from '../../../types/Length';

test('InstructionEditor renders correctly', () => {
  const mode = createMode({sportType: "bike", ftp: 200, weight: 75, runningTimes: [], lengthType: "time"});
  const instruction = createInstruction({
    text: 'This is a comment',
    offset: new Duration(300),
  }, mode);

  const component = renderer.create(
    <InstructionEditor
      instruction={instruction}
      width={500}
      index={0}
      onChange={() => { }}
      onDelete={() => { }}
      mode={mode}
    />,
  );

  expect(component).toMatchSnapshot();
});
