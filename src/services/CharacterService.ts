/**
 * Writing Studio Plugin - Character Service
 * Handles character management and relationship data
 */

import joplin from 'api';
import { tagService } from './TagService';

/**
 * Character data structure
 */
export interface Character {
    id: string;
    title: string;
    name: string;
    age?: string;
    gender?: string;
    role?: string;
    description?: string;
    relationships: CharacterRelation[];
}

/**
 * Character relationship
 */
export interface CharacterRelation {
    targetId: string;
    targetName: string;
    relationType: string;  // e.g., "父亲", "朋友", "敌人"
}

/**
 * Character Service class
 */
export class CharacterService {
    /**
     * Get all characters for a project
     */
    async getCharacters(projectName: string): Promise<Character[]> {
        const characters: Character[] = [];

        const characterNotes = await tagService.getNotesByType('character', projectName);

        for (const note of characterNotes) {
            try {
                const fullNote = await joplin.data.get(['notes', note.id], { fields: ['id', 'title', 'body'] });
                const character = this.parseCharacterNote(fullNote.id, fullNote.title, fullNote.body);
                characters.push(character);
            } catch (e) {
                console.debug('Could not get character note:', note.id);
            }
        }

        return characters;
    }

    /**
     * Parse character data from note body
     */
    private parseCharacterNote(id: string, title: string, body: string): Character {
        // Parse basic info section
        const ageMatch = body.match(/\*\*年龄\*\*[：:]\s*([^\n]+)/);
        const genderMatch = body.match(/\*\*性别\*\*[：:]\s*([^\n]+)/);

        // Parse relationships section
        const relationships: CharacterRelation[] = [];
        const relationSection = body.match(/##\s*人物关系\s*\n+([\s\S]*?)(?=##|$)/);

        if (relationSection) {
            // Match patterns like "- 张三：朋友" or "- **李四**：师父"
            const relationMatches = relationSection[1].matchAll(/[-*]\s*\*?\*?([^*:\n]+)\*?\*?[：:]\s*([^\n]+)/g);
            for (const match of relationMatches) {
                relationships.push({
                    targetId: '', // Will be resolved later
                    targetName: match[1].trim(),
                    relationType: match[2].trim()
                });
            }
        }

        // Parse description from 性格特点 section
        const descMatch = body.match(/##\s*性格特点\s*\n+([\s\S]*?)(?=##|$)/);

        return {
            id,
            title,
            name: title.replace(/^#\s*/, ''),
            age: ageMatch ? ageMatch[1].trim() : undefined,
            gender: genderMatch ? genderMatch[1].trim() : undefined,
            description: descMatch ? descMatch[1].trim().substring(0, 100) : undefined,
            relationships
        };
    }

    /**
     * Resolve relationship target IDs
     */
    async resolveRelationships(characters: Character[]): Promise<Character[]> {
        const nameToId = new Map<string, string>();

        // Build name -> id mapping
        for (const char of characters) {
            nameToId.set(char.name, char.id);
            nameToId.set(char.title, char.id);
        }

        // Resolve target IDs
        for (const char of characters) {
            for (const rel of char.relationships) {
                const targetId = nameToId.get(rel.targetName);
                if (targetId) {
                    rel.targetId = targetId;
                }
            }
        }

        return characters;
    }
}

// Singleton instance
export const characterService = new CharacterService();
