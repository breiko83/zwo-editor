import { useState, useEffect } from 'react';
import { BarType, Instruction, SportType, DurationType, PaceUnitType } from '../Editor';
import { RunningTimes } from '../RunningTimesEditor';

const loadRunningTimes = (): RunningTimes => {
  const missingRunningTimes: RunningTimes = {
    oneMile: '',
    fiveKm: '',
    tenKm: '',
    halfMarathon: '',
    marathon: '',
  };
  
  const runningTimesJson = localStorage.getItem('runningTimes');
  if (runningTimesJson) {
    return JSON.parse(runningTimesJson);
  }

  // Fallback to old localStorage keys
  const oneMile = localStorage.getItem('oneMileTime') || '';
  const fiveKm = localStorage.getItem('fiveKmTime') || '';
  const tenKm = localStorage.getItem('tenKmTime') || '';
  const halfMarathon = localStorage.getItem('halfMarathonTime') || '';
  const marathon = localStorage.getItem('marathonTime') || '';
  
  if (oneMile || fiveKm || tenKm || halfMarathon || marathon) {
    return { oneMile, fiveKm, tenKm, halfMarathon, marathon };
  }

  return missingRunningTimes;
};

/**
 * Custom hook for managing workout state and localStorage persistence
 */
export const useWorkoutState = (initialId: string) => {
  const [id, setId] = useState(initialId);
  const [bars, setBars] = useState<Array<BarType>>(
    JSON.parse(localStorage.getItem('currentWorkout') || '[]')
  );
  const [actionId, setActionId] = useState<string | undefined>(undefined);
  const [ftp, setFtp] = useState(parseInt(localStorage.getItem('ftp') || '200'));
  const [weight, setWeight] = useState(parseInt(localStorage.getItem('weight') || '75'));
  const [instructions, setInstructions] = useState<Array<Instruction>>(
    JSON.parse(localStorage.getItem('instructions') || '[]')
  );
  const [tags, setTags] = useState(JSON.parse(localStorage.getItem('tags') || '[]'));
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [description, setDescription] = useState(localStorage.getItem('description') || '');
  const [author, setAuthor] = useState(localStorage.getItem('author') || '');
  const [sportType, setSportType] = useState<SportType>(
    (localStorage.getItem('sportType') as SportType) || 'bike'
  );
  const [durationType, setDurationType] = useState<DurationType>(
    (localStorage.getItem('durationType') as DurationType) || 'time'
  );
  const [paceUnitType, setPaceUnitType] = useState<PaceUnitType>(
    (localStorage.getItem('paceUnitType') as PaceUnitType) || 'metric'
  );
  const [runningTimes, setRunningTimes] = useState(loadRunningTimes());
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction>();

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('currentWorkout', JSON.stringify(bars));
    localStorage.setItem('ftp', ftp.toString());
    localStorage.setItem('instructions', JSON.stringify(instructions));
    localStorage.setItem('weight', weight.toString());
    localStorage.setItem('name', name);
    localStorage.setItem('description', description);
    localStorage.setItem('author', author);
    localStorage.setItem('tags', JSON.stringify(tags));
    localStorage.setItem('sportType', sportType);
    localStorage.setItem('durationType', durationType);
    localStorage.setItem('paceUnitType', paceUnitType);
    localStorage.setItem('runningTimes', JSON.stringify(runningTimes));
  }, [
    bars,
    ftp,
    instructions,
    weight,
    name,
    description,
    author,
    tags,
    sportType,
    durationType,
    paceUnitType,
    runningTimes,
  ]);

  const resetWorkout = () => {
    setBars([]);
    setInstructions([]);
    setName('');
    setDescription('');
    setAuthor('');
    setTags([]);
  };

  return {
    id,
    setId,
    bars,
    setBars,
    actionId,
    setActionId,
    ftp,
    setFtp,
    weight,
    setWeight,
    instructions,
    setInstructions,
    tags,
    setTags,
    name,
    setName,
    description,
    setDescription,
    author,
    setAuthor,
    sportType,
    setSportType,
    durationType,
    setDurationType,
    paceUnitType,
    setPaceUnitType,
    runningTimes,
    setRunningTimes,
    selectedInstruction,
    setSelectedInstruction,
    resetWorkout,
  };
};
