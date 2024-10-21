import { isArray } from "lodash";

export enum MetricTypes {
  Voltage = "Voltage",
  Current = "Current"
}

export interface Reading {
  timestamp: number;
  metric: MetricTypes;
  value: number;
}

// This is a fake database which stores data in-memory while the process is running
// Feel free to change the data structure to anything else you would like
export const database: Record<string, Reading[]> = {};

/**
 * Store a reading in the database using the given key
 */
export const addReading = (key: string, reading: Reading | Reading[]) => {
  if (!database[key])
    database[key] = [];

  if (isArray(reading))
    database[key].push(...reading);
  else
    database[key].push(reading);
};

/**
 * Retrieve a reading from the database using the given key
 */
export const getReading = (key: string): Reading[] | undefined => {
  return database[key];
};
