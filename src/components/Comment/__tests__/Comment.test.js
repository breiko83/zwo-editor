import React from 'react';
import Comment from '../../Comment/Comment';
import renderer from 'react-test-renderer';
import {cleanup, fireEvent, render} from '@testing-library/react';
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
        onChange={(id, values) => changeInstruction(id, values)} 
        onDelete={(id) => deleteInstruction(id)} 
      />,
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})

it('Renders time correctly', () => {
  const instruction = {
    text: 'This is a comment',
    time: 300,
    id: uuidv4()
  }

  const {getByTestId} = render(
    <Comment
        key={instruction.id} 
        instruction={instruction} 
        onChange={(id, values) => changeInstruction(id, values)} 
        onDelete={(id) => deleteInstruction(id)} 
      />,
  );

  // expect time label to be 5 mins - 300 seconds

  expect(getByTestId('time')).toHaveTextContent('5:00')
})