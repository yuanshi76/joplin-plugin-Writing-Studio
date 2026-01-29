/**
 * Writing Studio Plugin - Timeline Service
 * Handles timeline event management and visualization data
 */

import joplin from 'api';
import { tagService } from './TagService';

/**
 * Timeline event data structure
 */
export interface TimelineEvent {
    id: string;
    title: string;
    storyDate: string;      // Story time (e.g., "第三年春")
    description?: string;
    relatedChapters?: string[];
    relatedCharacters?: string[];
}

/**
 * Timeline Service class
 */
export class TimelineService {
    /**
     * Get all timeline events for a project, sorted by story date
     */
    async getTimelineEvents(projectName: string): Promise<TimelineEvent[]> {
        const events: TimelineEvent[] = [];

        // Get all timeline notes using tags
        const timelineNotes = await tagService.getNotesByType('timeline', projectName);

        for (const note of timelineNotes) {
            try {
                const fullNote = await joplin.data.get(['notes', note.id], { fields: ['id', 'title', 'body'] });

                // Parse story date from note body (look for ## 事件日期 section)
                const dateMatch = fullNote.body.match(/##\s*事件日期\s*\n+([^\n#]+)/);
                const storyDate = dateMatch ? dateMatch[1].trim() : '未知时间';

                // Parse description
                const descMatch = fullNote.body.match(/##\s*事件描述\s*\n+([\s\S]*?)(?=##|$)/);
                const description = descMatch ? descMatch[1].trim() : '';

                events.push({
                    id: fullNote.id,
                    title: fullNote.title,
                    storyDate,
                    description
                });
            } catch (e) {
                console.debug('Could not get timeline note:', note.id);
            }
        }

        // Sort by story date (simple string sort for now)
        return events.sort((a, b) => a.storyDate.localeCompare(b.storyDate));
    }

    /**
     * Get related chapters for an event
     */
    async getRelatedChapters(eventId: string): Promise<string[]> {
        // TODO: Parse from note body or maintain relationships
        return [];
    }
}

// Singleton instance
export const timelineService = new TimelineService();
