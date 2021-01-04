import React from 'react';
import Comment from '../Comment';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import { createInstruction } from '../../../types/Instruction';

test('Comment renders correctly', () => {
  const instruction = createInstruction({
    text: 'This is a comment',
    time: 300,
  });

  const component = renderer.create(
    <Comment
      instruction={instruction}
      width={500}
      index={0}
      onChange={() => { }}
      onDelete={() => { }}
    />,
  );

  expect(component).toMatchSnapshot();
});
