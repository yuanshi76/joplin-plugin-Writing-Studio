/**
 * Writing Studio Plugin - Template Service
 * Handles creating notes from templates with tag-based type identification
 */

import joplin from 'api';
import { TEMPLATES, PLACEHOLDERS } from '../templates/defaults';
import { WSNoteType, Chapter } from '../models/types';
import { tagService } from './TagService';

/**
 * Get content body without frontmatter (kept for backwards compatibility)
 */
export function getContentWithoutFrontmatter(body: string): string {
    return body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

/**
 * Template Service class
 */
export class TemplateService {
    /**
     * Create a note from template with tag-based type identification
     */
    async createFromTemplate(
        type: WSNoteType,
        title: string,
        folderId: string,
        projectName: string,
        options: { order?: number } = {}
    ): Promise<string> {
        const template = TEMPLATES[type];
        if (!template) {
            throw new Error(`Unknown template type: ${type}`);
        }

        const today = new Date().toISOString().split('T')[0];
        let content = template
            .replace(new RegExp(PLACEHOLDERS.TITLE, 'g'), title)
            .replace(new RegExp(PLACEHOLDERS.DATE, 'g'), today)
            .replace(new RegExp(PLACEHOLDERS.ORDER, 'g'), String(options.order ?? 1));

        // Create the note
        const note = await joplin.data.post(['notes'], null, {
            title,
            body: content,
            parent_id: folderId
        });

        // Add type tag
        await tagService.addTypeTag(note.id, type, projectName);

        // Auto-add draft status for content notes (not project config)
        if (type !== 'project') {
            await tagService.addStatusTag(note.id, 'draft');
        }

        return note.id;
    }

    /**
     * Create a new writing project (folder + config note)
     */
    async createProject(name: string): Promise<{ folderId: string; noteId: string }> {
        // Create the folder first
        const folder = await joplin.data.post(['folders'], null, {
            title: `📖 ${name}`
        });

        // Create project config note with project tag
        const noteId = await this.createFromTemplate('project', `_项目配置`, folder.id, name);

        return { folderId: folder.id, noteId };
    }

    /**
     * Get project name from folder title
     */
    getProjectName(folderTitle: string): string {
        return folderTitle.replace(/^📖\s*/, '').trim();
    }

    /**
     * Get all chapters in a project by tag
     */
    async getChaptersByTag(projectName: string): Promise<Array<{ id: string; title: string; order?: number }>> {
        const notes = await tagService.getNotesByType('chapter', projectName);
        // TODO: Sort by order stored somewhere (could use note properties or title parsing)
        return notes;
    }

    /**
     * Get next chapter order number
     */
    async getNextChapterOrder(projectName: string): Promise<number> {
        const chapters = await tagService.getNotesByType('chapter', projectName);
        return chapters.length + 1;
    }
}

// Singleton instance
export const templateService = new TemplateService();
