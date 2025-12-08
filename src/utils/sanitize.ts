/**
 * Remove undefined values from an object
 * Firebase doesn't accept undefined values
 */
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Sanitize workout data for Firebase by removing undefined values
 */
export function sanitizeWorkoutData(data: any) {
  return {
    ...removeUndefined(data),
    workout: data.workout ? data.workout.map((bar: any) => removeUndefined(bar)) : [],
  };
}
