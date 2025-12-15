import React from 'react';
import Comment from '../../Comment/Comment';
import renderer from 'react-test-renderer';
import {cleanup, fireEvent, render} from '@testing-library/react';
import { v4 as uuidv4 } from 'uuid'
import '@testing-library/jest-dom/extend-expect'


test('Comment renders correctly with time durationType', () => {


  const instruction = {
    text: 'This is a comment',
    time: 300,
    length: 0,
    id: uuidv4()
  }

  const component = renderer.create(
      <Comment
        key={instruction.id} 
        instruction={instruction} 
        onChange={(id, values) => changeInstruction(id, values)} 
        onClick={(id) => {}} 
        durationType="time"
        width={1000}
        index={0}
      />,
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})

test('Comment renders correctly with distance durationType', () => {


  const instruction = {
    text: 'This is a comment',
    time: 0,
    length: 1100,
    id: uuidv4()
  }

  const component = renderer.create(
      <Comment
        key={instruction.id} 
        instruction={instruction} 
        onChange={(id, values) => changeInstruction(id, values)} 
        onClick={(id) => {}} 
        durationType="distance"
        width={1000}
        index={0}
      />,
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})

// need more testing

// it('Renders time correctly', () => {
//   const instruction = {
//     text: 'This is a comment',
//     time: 300,
//     id: uuidv4()
//   }

//   const {getByTestId} = render(
//     <Comment
//         key={instruction.id} 
//         instruction={instruction} 
//         onChange={(id, values) => changeInstruction(id, values)} 
//         onDelete={(id) => deleteInstruction(id)} 
//         durationType="time"
//         index={0}
//         width={300}
//       />,
//   );

//   // expect time label to be 5 mins - 300 seconds

//   expect(getByTestId('time')).toHaveTextContent('5:00')
// })