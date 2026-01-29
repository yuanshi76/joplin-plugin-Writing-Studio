/**
 * Writing Studio Plugin - Statistics Service
 * Handles word count calculation and writing goal tracking
 * Uses tag-based identification and daily snapshots for tracking
 */

import joplin from 'api';
import { tagService } from './TagService';

/**
 * Statistics for a single note
 */
export interface NoteStats {
    noteId: string;
    wordCount: number;
    charCount: number;
    charCountNoSpaces: number;
}

/**
 * Project statistics
 */
export interface ProjectStats {
    totalWordCount: number;
    totalCharCount: number;
    chapterCount: number;
    todayWritten: number;
    dailyGoal: number;
    totalGoal: number;
    dailyProgress: number;
    totalProgress: number;
}

/**
 * Daily snapshot for tracking word count changes
 */
interface DailySnapshot {
    date: string;
    projectName: string;
    wordCountAtStart: number;
}

const SNAPSHOT_KEY = 'writingStudio.dailySnapshots';

/**
 * Count words in Chinese/English mixed text
 */
export function countWords(text: string): number {
    if (!text || text.trim().length === 0) return 0;

    let cleanText = text
        .replace(/^#+\s+/gm, '')
        .replace(/\*\*|__|\\*|_/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/^>\s+/gm, '')
        .replace(/---+/g, '')
        .replace(/\n{2,}/g, '\n')
        .trim();

    const chineseChars = (cleanText.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
    const englishWords = cleanText
        .replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0 && /[a-zA-Z0-9]/.test(word))
        .length;

    return chineseChars + englishWords;
}

/**
 * Count characters in text
 */
export function countChars(text: string, includeSpaces: boolean = true): number {
    if (!text) return 0;
    if (includeSpaces) return text.length;
    return text.replace(/\s/g, '').length;
}

/**
 * Get today's date string
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Statistics Service class
 */
export class StatsService {
    private statsCache: Map<string, NoteStats> = new Map();

    /**
     * Get or initialize daily snapshot for a project
     */
    private async getDailySnapshot(projectName: string, currentWordCount: number): Promise<DailySnapshot> {
        const today = getTodayDate();

        try {
            const data = await joplin.settings.value(SNAPSHOT_KEY);
            if (data) {
                const snapshots: DailySnapshot[] = JSON.parse(data);
                const existing = snapshots.find(s => s.date === today && s.projectName === projectName);
                if (existing) {
                    return existing;
                }
            }
        } catch (e) {
            // No snapshots yet
        }

        // Create new snapshot for today
        const newSnapshot: DailySnapshot = {
            date: today,
            projectName,
            wordCountAtStart: currentWordCount
        };

        await this.saveDailySnapshot(newSnapshot);
        return newSnapshot;
    }

    /**
     * Save daily snapshot
     */
    private async saveDailySnapshot(snapshot: DailySnapshot): Promise<void> {
        let snapshots: DailySnapshot[] = [];

        try {
            const data = await joplin.settings.value(SNAPSHOT_KEY);
            if (data) {
                snapshots = JSON.parse(data);
            }
        } catch (e) {
            // Start fresh
        }

        // Remove old snapshots (keep only last 30 days)
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        snapshots = snapshots.filter(s => s.date >= cutoffStr);

        // Add or update snapshot for today
        const index = snapshots.findIndex(s => s.date === snapshot.date && s.projectName === snapshot.projectName);
        if (index >= 0) {
            snapshots[index] = snapshot;
        } else {
            snapshots.push(snapshot);
        }

        await joplin.settings.setValue(SNAPSHOT_KEY, JSON.stringify(snapshots));
    }

    /**
     * Get statistics for a single note
     */
    async getNoteStats(noteId: string): Promise<NoteStats> {
        const note = await joplin.data.get(['notes', noteId], { fields: ['id', 'body'] });

        const stats: NoteStats = {
            noteId,
            wordCount: countWords(note.body),
            charCount: countChars(note.body, true),
            charCountNoSpaces: countChars(note.body, false)
        };

        this.statsCache.set(noteId, stats);
        return stats;
    }

    /**
     * Get statistics for an entire project using tags
     */
    async getProjectStats(folderId: string): Promise<ProjectStats> {
        let totalWordCount = 0;
        let totalCharCount = 0;
        const dailyGoal = await joplin.settings.value('defaultDailyGoal') || 2000;
        const totalGoal = await joplin.settings.value('defaultTotalGoal') || 100000;

        const folder = await joplin.data.get(['folders', folderId], { fields: ['title'] });
        const projectName = tagService.getProjectNameFromFolder(folder.title);

        const chapters = await tagService.getNotesByType('chapter', projectName);
        const chapterCount = chapters.length;

        for (const chapter of chapters) {
            try {
                const note = await joplin.data.get(['notes', chapter.id], { fields: ['body'] });
                totalWordCount += countWords(note.body);
                totalCharCount += countChars(note.body, false);
            } catch (e) {
                console.debug('Could not get note:', chapter.id);
            }
        }

        // Get today's starting snapshot and calculate difference
        const snapshot = await this.getDailySnapshot(projectName, totalWordCount);
        const todayWritten = Math.max(0, totalWordCount - snapshot.wordCountAtStart);

        return {
            totalWordCount,
            totalCharCount,
            chapterCount,
            todayWritten,
            dailyGoal,
            totalGoal,
            dailyProgress: Math.min(100, Math.round((todayWritten / dailyGoal) * 100)),
            totalProgress: Math.min(100, Math.round((totalWordCount / totalGoal) * 100))
        };
    }

    /**
     * Get current note word count
     */
    async getCurrentNoteStats(): Promise<NoteStats | null> {
        const note = await joplin.workspace.selectedNote();
        if (!note) return null;
        return this.getNoteStats(note.id);
    }

    /**
     * Format word count for display
     */
    formatWordCount(count: number): string {
        if (count >= 10000) {
            return (count / 10000).toFixed(1) + ' 万字';
        }
        return count.toLocaleString() + ' 字';
    }
}

// Singleton instance
export const statsService = new StatsService();
