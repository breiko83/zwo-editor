import React from 'react';
import Workouts from '../Workouts';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';

// Mock Firebase
jest.mock('../../firebase', () => ({
  firebaseApp: {}
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    // Mock empty snapshot
    const mockSnapshot = {
      forEach: jest.fn()
    };
    callback(mockSnapshot);
    return jest.fn(); // Return unsubscribe function
  }),
  ref: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn()
}));

test('Workouts renders correctly with no workouts', () => {
  const component = renderer.create(
    <Workouts userId="test-user-123" />
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('Workouts renders correctly with workouts', () => {
  const { onValue } = require('firebase/database');
  
  // Mock onValue to return sample workouts
  onValue.mockImplementationOnce((ref: any, callback: any) => {
    const mockSnapshot = {
      forEach: (fn: any) => {
        // Mock bike workout
        fn({
          key: 'workout-1',
          val: () => ({
            name: 'Morning Ride',
            description: 'Easy recovery ride',
            updatedAt: 'Wed Oct 28 2020 11:10:17 GMT+0000 (Greenwich Mean Time)',
            durationType: 'time',
            sportType: 'bike',
            workoutTime: '45:00',
            workoutDistance: '0'
          })
        });
        
        // Mock run workout
        fn({
          key: 'workout-2',
          val: () => ({
            name: 'Interval Run',
            description: '5x5 minutes at threshold',
            updatedAt: 'Thu Oct 29 2020 08:30:00 GMT+0000 (Greenwich Mean Time)',
            durationType: 'distance',
            sportType: 'run',
            workoutTime: '0',
            workoutDistance: '10 km'
          })
        });
      }
    };
    callback(mockSnapshot);
    return jest.fn();
  });

  const component = renderer.create(
    <Workouts userId="test-user-123" />
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
