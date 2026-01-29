/**
 * Writing Studio Plugin - Daily Record Service
 * Tracks daily writing statistics and maintains history archive
 */

import joplin from 'api';
import { countWords } from './StatsService';
import { tagService } from './TagService';

/**
 * Single day writing record
 */
export interface DailyRecord {
    date: string;           // YYYY-MM-DD format
    projectName: string;
    wordsWritten: number;
    totalWords: number;
    chaptersCompleted: number;
    chaptersTotal: number;
    notesCreated: string[];
    notesEdited: string[];
    timeSpent?: number;     // minutes
}

/**
 * Writing history archive
 */
export interface WritingHistory {
    records: DailyRecord[];
    lastUpdated: string;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Daily Record Service class
 */
export class DailyRecordService {
    private readonly SETTING_KEY = 'writingStudio.dailyRecords';

    /**
     * Get all writing history
     */
    async getHistory(): Promise<WritingHistory> {
        try {
            const data = await joplin.settings.value(this.SETTING_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.debug('No history found, starting fresh');
        }
        return { records: [], lastUpdated: getTodayDate() };
    }

    /**
     * Save writing history
     */
    async saveHistory(history: WritingHistory): Promise<void> {
        history.lastUpdated = new Date().toISOString();
        await joplin.settings.setValue(this.SETTING_KEY, JSON.stringify(history));
    }

    /**
     * Get today's record for a project
     */
    async getTodayRecord(projectName: string): Promise<DailyRecord | null> {
        const history = await this.getHistory();
        const today = getTodayDate();
        return history.records.find(r => r.date === today && r.projectName === projectName) || null;
    }

    /**
     * Calculate today's writing progress and update record
     */
    async updateTodayRecord(projectName: string): Promise<DailyRecord> {
        const today = getTodayDate();
        const history = await this.getHistory();

        // Get current project stats
        const chapters = await tagService.getNotesByType('chapter', projectName);
        let totalWords = 0;
        let completedChapters = 0;

        for (const chapter of chapters) {
            try {
                const note = await joplin.data.get(['notes', chapter.id], { fields: ['body'] });
                totalWords += countWords(note.body);
                // TODO: Check status tag for completed
            } catch (e) {
                // Note might be deleted
            }
        }

        // Find or create today's record
        let existingIndex = history.records.findIndex(
            r => r.date === today && r.projectName === projectName
        );

        let record: DailyRecord;

        if (existingIndex >= 0) {
            const existing = history.records[existingIndex];
            const wordsWritten = Math.max(0, totalWords - (existing.totalWords - existing.wordsWritten));

            record = {
                ...existing,
                wordsWritten,
                totalWords,
                chaptersTotal: chapters.length
            };
            history.records[existingIndex] = record;
        } else {
            // New record for today
            record = {
                date: today,
                projectName,
                wordsWritten: 0,  // Will be calculated on next update
                totalWords,
                chaptersCompleted: completedChapters,
                chaptersTotal: chapters.length,
                notesCreated: [],
                notesEdited: []
            };
            history.records.push(record);
        }

        await this.saveHistory(history);
        return record;
    }

    /**
     * Record a note creation event
     */
    async recordNoteCreated(projectName: string, noteId: string): Promise<void> {
        const today = getTodayDate();
        const history = await this.getHistory();

        const index = history.records.findIndex(
            r => r.date === today && r.projectName === projectName
        );

        if (index >= 0) {
            if (!history.records[index].notesCreated.includes(noteId)) {
                history.records[index].notesCreated.push(noteId);
                await this.saveHistory(history);
            }
        }
    }

    /**
     * Record a note edit event
     */
    async recordNoteEdited(projectName: string, noteId: string): Promise<void> {
        const today = getTodayDate();
        const history = await this.getHistory();

        const index = history.records.findIndex(
            r => r.date === today && r.projectName === projectName
        );

        if (index >= 0) {
            if (!history.records[index].notesEdited.includes(noteId)) {
                history.records[index].notesEdited.push(noteId);
                await this.saveHistory(history);
            }
        }
    }

    /**
     * Get records for a specific project
     */
    async getProjectRecords(projectName: string): Promise<DailyRecord[]> {
        const history = await this.getHistory();
        return history.records
            .filter(r => r.projectName === projectName)
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    /**
     * Get records for the last N days
     */
    async getRecentRecords(projectName: string, days: number = 7): Promise<DailyRecord[]> {
        const records = await this.getProjectRecords(projectName);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        return records.filter(r => r.date >= cutoffStr);
    }

    /**
     * Get weekly summary
     */
    async getWeeklySummary(projectName: string): Promise<{
        totalWords: number;
        avgWordsPerDay: number;
        daysActive: number;
        bestDay: DailyRecord | null;
    }> {
        const records = await this.getRecentRecords(projectName, 7);

        const totalWords = records.reduce((sum, r) => sum + r.wordsWritten, 0);
        const daysActive = records.filter(r => r.wordsWritten > 0).length;
        const avgWordsPerDay = daysActive > 0 ? Math.round(totalWords / daysActive) : 0;
        const bestDay = records.reduce<DailyRecord | null>((best, r) =>
            !best || r.wordsWritten > best.wordsWritten ? r : best, null);

        return { totalWords, avgWordsPerDay, daysActive, bestDay };
    }

    /**
     * Export history as JSON string
     */
    async exportHistory(): Promise<string> {
        const history = await this.getHistory();
        return JSON.stringify(history, null, 2);
    }

    /**
     * Import history from JSON string
     */
    async importHistory(json: string): Promise<boolean> {
        try {
            const history = JSON.parse(json) as WritingHistory;
            if (history.records && Array.isArray(history.records)) {
                await this.saveHistory(history);
                return true;
            }
        } catch (e) {
            console.error('Failed to import history:', e);
        }
        return false;
    }
}

// Singleton instance
export const dailyRecordService = new DailyRecordService();
