import fs from "fs";
import path from "path";
import { promisify } from "util";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

export interface Interval {
  start: number;
  end: number;
}

export async function loadCheckpoint(filePath: string): Promise<Interval[]> {
  try {
    const data = await readFileAsync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    } else {
      throw error;
    }
  }
}

export async function saveCheckpoint(filePath: string, intervals: Interval[]) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    const data = JSON.stringify(intervals, null, 2);
    await writeFileAsync(filePath, data, "utf8");
  } catch (error) {
    console.error("Error saving checkpoint:", error);
    throw error;
  }
}

export async function mergeIntervals(intervals: Interval[]): Promise<Interval[]> {
  if (intervals.length === 0) return intervals;

  intervals.sort((a, b) => a.start - b.start);
  const merged: Interval[] = [intervals[0]];

  // Start loop from the second interval
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const current = intervals[i];
    // merge overlaps
    if (current.start <= last.end + 1) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }
  return merged;
}
