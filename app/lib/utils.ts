/**
 * Format the size of a file in a human readable format
 * @param bytes - The size of the file in bytes
 * @returns The size of the file in a human readable format
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    // Calculate the index of the size
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Calculate the size in the appropriate unit
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 

export const generateUUID = () => crypto.randomUUID();