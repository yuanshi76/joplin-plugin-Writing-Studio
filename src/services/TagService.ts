/**
 * Writing Studio Plugin - Tag Service
 * Handles tag-based note type identification for multi-project support
 * 
 * Tag format: ws/type/projectName
 * Examples:
 *   - ws/chapter/我的小说
 *   - ws/character/我的小说
 *   - ws/timeline/我的小说
 *   - ws/setting/我的小说
 */

import joplin from 'api';
import { WSNoteType } from '../models/types';

/**
 * Tag prefix for Writing Studio
 */
export const WS_TAG_PREFIX = 'ws';

/**
 * Valid note types
 */
export const WS_NOTE_TYPES: WSNoteType[] = ['project', 'chapter', 'character', 'timeline', 'setting'];

/**
 * Create a tag name for a note type and project
 */
export function createTagName(type: WSNoteType, projectName: string): string {
    // Sanitize project name: remove special characters that might cause issues
    const safeName = projectName.replace(/[\/\\:*?"<>|]/g, '-').trim();
    return `${WS_TAG_PREFIX}/${type}/${safeName}`;
}

/**
 * Parse a tag name to extract type and project name
 */
export function parseTagName(tagName: string): { type: WSNoteType; projectName: string } | null {
    if (!tagName.startsWith(WS_TAG_PREFIX + '/')) return null;

    const parts = tagName.split('/');
    if (parts.length < 3) return null;

    const type = parts[1] as WSNoteType;
    if (!WS_NOTE_TYPES.includes(type)) return null;

    const projectName = parts.slice(2).join('/'); // Handle project names with '/'
    return { type, projectName };
}

/**
 * Tag Service class
 */
export class TagService {
    private tagCache: Map<string, string> = new Map(); // tagName -> tagId

    /**
     * Get or create a tag
     */
    async getOrCreateTag(tagName: string): Promise<string> {
        // Check cache first
        if (this.tagCache.has(tagName)) {
            return this.tagCache.get(tagName)!;
        }

        // Search for existing tag
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const result = await joplin.data.get(['tags'], {
                fields: ['id', 'title'],
                page
            });

            for (const tag of result.items) {
                if (tag.title === tagName) {
                    this.tagCache.set(tagName, tag.id);
                    return tag.id;
                }
            }

            hasMore = result.has_more;
            page++;
        }

        // Create new tag
        const newTag = await joplin.data.post(['tags'], null, { title: tagName });
        this.tagCache.set(tagName, newTag.id);
        return newTag.id;
    }

    /**
     * Add a type tag to a note
     */
    async addTypeTag(noteId: string, type: WSNoteType, projectName: string): Promise<void> {
        const tagName = createTagName(type, projectName);
        const tagId = await this.getOrCreateTag(tagName);

        try {
            await joplin.data.post(['tags', tagId, 'notes'], null, { id: noteId });
        } catch (error) {
            // Tag might already be assigned
            console.debug('Tag might already be assigned:', error);
        }
    }

    /**
     * Remove type tags from a note
     */
    async removeTypeTags(noteId: string): Promise<void> {
        const noteTags = await joplin.data.get(['notes', noteId, 'tags'], { fields: ['id', 'title'] });

        for (const tag of noteTags.items) {
            if (tag.title.startsWith(WS_TAG_PREFIX + '/')) {
                await joplin.data.delete(['tags', tag.id, 'notes', noteId]);
            }
        }
    }

    /**
     * Get note type from its tags
     */
    async getNoteType(noteId: string): Promise<{ type: WSNoteType; projectName: string } | null> {
        const noteTags = await joplin.data.get(['notes', noteId, 'tags'], { fields: ['title'] });

        for (const tag of noteTags.items) {
            const parsed = parseTagName(tag.title);
            if (parsed) return parsed;
        }

        return null;
    }

    /**
     * Get all notes of a specific type for a project
     */
    async getNotesByType(type: WSNoteType, projectName: string): Promise<Array<{ id: string; title: string }>> {
        const tagName = createTagName(type, projectName);
        const notes: Array<{ id: string; title: string }> = [];

        // Find the tag first
        let tagId: string | null = null;
        let page = 1;
        let hasMore = true;

        while (hasMore && !tagId) {
            const result = await joplin.data.get(['tags'], {
                fields: ['id', 'title'],
                page
            });

            for (const tag of result.items) {
                if (tag.title === tagName) {
                    tagId = tag.id;
                    break;
                }
            }

            hasMore = result.has_more;
            page++;
        }

        if (!tagId) return notes;

        // Get all notes with this tag
        page = 1;
        hasMore = true;

        while (hasMore) {
            const result = await joplin.data.get(['tags', tagId, 'notes'], {
                fields: ['id', 'title', 'body'],
                page
            });

            for (const note of result.items) {
                notes.push({ id: note.id, title: note.title });
            }

            hasMore = result.has_more;
            page++;
        }

        return notes;
    }

    /**
     * Get project name from folder
     */
    getProjectNameFromFolder(folderTitle: string): string {
        // Remove emoji prefix if present
        return folderTitle.replace(/^📖\s*/, '').trim();
    }

    /**
     * Check if a note belongs to a specific project
     */
    async notesBelongsToProject(noteId: string, projectName: string): Promise<boolean> {
        const info = await this.getNoteType(noteId);
        return info?.projectName === projectName;
    }

    /**
     * Add a status tag to a note (draft/submitted/idea)
     */
    async addStatusTag(noteId: string, status: 'draft' | 'submitted' | 'idea'): Promise<void> {
        // Remove existing status tags first
        await this.removeStatusTags(noteId);

        const tagName = `${WS_TAG_PREFIX}/status/${status}`;
        const tagId = await this.getOrCreateTag(tagName);

        try {
            await joplin.data.post(['tags', tagId, 'notes'], null, { id: noteId });
        } catch (error) {
            console.debug('Status tag might already be assigned:', error);
        }
    }

    /**
     * Remove status tags from a note
     */
    async removeStatusTags(noteId: string): Promise<void> {
        const noteTags = await joplin.data.get(['notes', noteId, 'tags'], { fields: ['id', 'title'] });

        for (const tag of noteTags.items) {
            if (tag.title.startsWith(WS_TAG_PREFIX + '/status/')) {
                await joplin.data.delete(['tags', tag.id, 'notes', noteId]);
            }
        }
    }

    /**
     * Get note status from its tags
     */
    async getNoteStatus(noteId: string): Promise<'draft' | 'submitted' | 'idea' | null> {
        const noteTags = await joplin.data.get(['notes', noteId, 'tags'], { fields: ['title'] });

        for (const tag of noteTags.items) {
            if (tag.title === `${WS_TAG_PREFIX}/status/draft`) return 'draft';
            if (tag.title === `${WS_TAG_PREFIX}/status/submitted`) return 'submitted';
            if (tag.title === `${WS_TAG_PREFIX}/status/idea`) return 'idea';
        }

        return null;
    }
}

// Singleton instance
export const tagService = new TagService();
