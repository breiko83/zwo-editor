import moment from 'moment';
import { Instruction } from "../types/Instruction";
import { RunningTimes } from "../types/RunningTimes";
import { Interval } from "../types/Interval";
import { SportType } from "../types/SportType";
import { PaceType } from '../types/PaceType';
import { DurationType } from '../types/DurationType';
import { Duration } from '../types/Length';

export function getId(): string | null {
  return localStorage.getItem('id');
}
export function setId(id: string) {
  localStorage.setItem('id', id);
}

function convertDurations(obj: {[k: string]: any}) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && typeof v.seconds === "number") {
      obj[k] = new Duration(v.seconds);
    }
  }
  return obj;
}
export function getIntervals(): Interval[] {
  return JSON.parse(localStorage.getItem('currentWorkout') || '[]').map(convertDurations);
}
export function setIntervals(intervals: Interval[]) {
  localStorage.setItem('currentWorkout', JSON.stringify(intervals));
}

export function getInstructions(): Instruction[] {
  return JSON.parse(localStorage.getItem('instructions') || '[]');
}
export function setInstructions(instructions: Instruction[]) {
  localStorage.setItem('instructions', JSON.stringify(instructions));
}

export function getTags(): string[] {
  return JSON.parse(localStorage.getItem('tags') || '[]');
}
export function setTags(tags: string[]) {
  localStorage.setItem('tags', JSON.stringify(tags));
}

export function getName(): string {
  return localStorage.getItem('name') || '';
}
export function setName(name: string) {
  localStorage.setItem('name', name);
}

export function getDescription(): string {
  return localStorage.getItem('description') || '';
}
export function setDescription(description: string) {
  localStorage.setItem('description', description);
}

export function getAuthor(): string {
  return localStorage.getItem('author') || '';
}
export function setAuthor(author: string) {
  localStorage.setItem('author', author);
}

export function getSportType(): SportType {
  return (localStorage.getItem('sportType') || 'bike') as SportType;
}
export function setSportType(sportType: SportType) {
  localStorage.setItem('sportType', sportType);
}

export function getDurationType(): DurationType {
  return (localStorage.getItem('durationType') || 'time') as DurationType;
}
export function setDurationType(durationType: DurationType) {
  localStorage.setItem('durationType', durationType);
}

export function getFtp(): number {
  return parseInt(localStorage.getItem('ftp') || '200');
}
export function setFtp(ftp: number) {
  localStorage.setItem('ftp', ftp.toString());
}

export function getWeight(): number {
  return parseInt(localStorage.getItem('weight') || '75');
}
export function setWeight(weight: number) {
  localStorage.setItem('weight', weight.toString());
}

export function getRunningTimes(): RunningTimes {
  const missingRunningTimes: RunningTimes = [0, 0, 0, 0, 0];
  const runningTimesJson = localStorage.getItem('runningTimes');
  if (runningTimesJson && runningTimesJson) {
    const parsed = JSON.parse(runningTimesJson);
    // Ignore the intermediate store-as-object scheme
    if (parsed instanceof Array) {
      return parsed;
    }
  }

  // Fallback to old localStorage keys
  const convert = (t: string) => moment.duration(t).asSeconds();
  const times: RunningTimes = [];
  times[PaceType.oneMile] = convert(localStorage.getItem('oneMileTime') || '');
  times[PaceType.fiveKm] = convert(localStorage.getItem('fiveKmTime') || '');
  times[PaceType.tenKm] = convert(localStorage.getItem('tenKmTime') || '');
  times[PaceType.halfMarathon] = convert(localStorage.getItem('halfMarathonTime') || '');
  times[PaceType.marathon] = convert(localStorage.getItem('marathonTime') || '');
  if (times.some(t => t !== 0)) {
    return times;
  }

  return missingRunningTimes;
}

export function setRunningTimes(runningTimes: RunningTimes) {
  localStorage.setItem('runningTimes', JSON.stringify(runningTimes));
}
