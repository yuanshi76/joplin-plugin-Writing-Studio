/**
 * Writing Studio Plugin - Sensitive Words Service
 * Detects sensitive words in text
 */

import joplin from 'api';

/**
 * Match result for a sensitive word
 */
export interface SensitiveMatch {
    word: string;
    positions: number[];
    count: number;
}

/**
 * Sensitive Words Service class
 */
export class SensitiveWordsService {
    /**
     * Get configured sensitive words list
     */
    async getSensitiveWords(): Promise<string[]> {
        const wordsStr: string = await joplin.settings.value('sensitiveWords') || '';
        if (!wordsStr.trim()) return [];

        return wordsStr
            .split(/[,，]/)
            .map(w => w.trim())
            .filter(w => w.length > 0);
    }

    /**
     * Check text for sensitive words
     */
    async checkText(text: string): Promise<SensitiveMatch[]> {
        const words = await this.getSensitiveWords();
        const matches: SensitiveMatch[] = [];

        for (const word of words) {
            if (!word) continue;

            const positions: number[] = [];
            let pos = 0;

            while ((pos = text.indexOf(word, pos)) !== -1) {
                positions.push(pos);
                pos += word.length;
            }

            if (positions.length > 0) {
                matches.push({
                    word,
                    positions,
                    count: positions.length
                });
            }
        }

        return matches;
    }

    /**
     * Get context around a position
     */
    getContext(text: string, position: number, radius: number = 20): string {
        const start = Math.max(0, position - radius);
        const end = Math.min(text.length, position + radius);
        let context = text.substring(start, end);

        if (start > 0) context = '...' + context;
        if (end < text.length) context = context + '...';

        return context;
    }

    /**
     * Check current note for sensitive words
     */
    async checkCurrentNote(): Promise<{
        noteTitle: string;
        matches: SensitiveMatch[];
        totalCount: number;
    } | null> {
        const note = await joplin.workspace.selectedNote();
        if (!note) return null;

        const matches = await this.checkText(note.body);
        const totalCount = matches.reduce((sum, m) => sum + m.count, 0);

        return {
            noteTitle: note.title,
            matches,
            totalCount
        };
    }
}

// Singleton instance
export const sensitiveWordsService = new SensitiveWordsService();
