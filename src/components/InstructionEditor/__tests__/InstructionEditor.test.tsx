import React from 'react';
import InstructionEditor from '../InstructionEditor';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import { createInstruction } from '../../../types/Instruction';

test('InstructionEditor renders correctly', () => {
  const instruction = createInstruction({
    text: 'This is a comment',
    time: 300,
  });

  const component = renderer.create(
    <InstructionEditor
      instruction={instruction}
      width={500}
      index={0}
      onChange={() => { }}
      onDelete={() => { }}
    />,
  );

  expect(component).toMatchSnapshot();
});
