import { SportType, DurationType, BarType, Instruction } from './workout';

// Re-export workout-related types
export * from './workout';

// Saved workout type (from database)
export interface Workout {
  id: string;
  name: string;
  description: string;
  updatedAt: Date;
  durationType: string;
  sportType: string;
  workoutTime: string;
  workoutDistance: string;
}

export interface WorkoutData {
  author: string;
  name: string;
  description: string;
  sportType: SportType;
  durationType: DurationType;
  tags: string[];
  bars: Array<BarType>;
  instructions: Array<Instruction>;
}
