import { Instruction } from "../types/Instruction";
import { RunningTimes } from "../types/RunningTimes";
import { Interval } from "../types/Interval";
import { SportType } from "../types/SportType";

export function getId(): string | null {
  return localStorage.getItem('id');
}
export function setId(id: string) {
  localStorage.setItem('id', id);
}

export function getIntervals(): Interval[] {
  return JSON.parse(localStorage.getItem('currentWorkout') || '[]');
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
  const missingRunningTimes: RunningTimes = { oneMile: "", fiveKm: "", tenKm: "", halfMarathon: "", marathon: "" }
  const runningTimesJson = localStorage.getItem('runningTimes')
  if (runningTimesJson) {
    return JSON.parse(runningTimesJson)
  }

  // Fallback to old localStorage keys
  const oneMile = localStorage.getItem('oneMileTime') || ''
  const fiveKm = localStorage.getItem('fiveKmTime') || ''
  const tenKm = localStorage.getItem('tenKmTime') || ''
  const halfMarathon = localStorage.getItem('halfMarathonTime') || ''
  const marathon = localStorage.getItem('marathonTime') || ''
  if (oneMile || fiveKm || tenKm || halfMarathon || marathon) {
    return { oneMile, fiveKm, tenKm, halfMarathon, marathon }
  }

  return missingRunningTimes
}

export function setRunningTimes(runningTimes: RunningTimes) {
  localStorage.setItem('runningTimes', JSON.stringify(runningTimes));
}
