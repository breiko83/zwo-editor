import React from 'react';
import Comment from '../../Comment/Comment';
import renderer from 'react-test-renderer';
import { v4 as uuidv4 } from 'uuid'
import '@testing-library/jest-dom/extend-expect'

test('Comment renders correctly', () => {
  const instruction = {
    text: 'This is a comment',
    time: 300,
    id: uuidv4()
  }

  const component = renderer.create(
    <Comment
      key={instruction.id}
      instruction={instruction}
      onChange={() => { }}
      onDelete={() => { }}
    />,
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
