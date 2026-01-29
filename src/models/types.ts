/**
 * Writing Studio Plugin - Data Models
 * Defines the core data structures for the writing plugin
 */

/**
 * Note types recognized by the plugin via YAML frontmatter
 */
export type WSNoteType = 'project' | 'chapter' | 'character' | 'timeline' | 'setting';

/**
 * Chapter writing status
 */
export type ChapterStatus = 'draft' | 'revision' | 'complete';

/**
 * Character role in the story
 */
export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor';

/**
 * Base interface for all Writing Studio notes
 */
export interface WSNote {
  id: string;           // Joplin note ID
  type: WSNoteType;
  title: string;
  folderId: string;     // Parent folder (project) ID
}

/**
 * Project configuration note
 */
export interface Project extends WSNote {
  type: 'project';
  version: number;
  dailyGoal: number;
  totalGoal: number;
  created: string;
  description?: string;
}

/**
 * Chapter note
 */
export interface Chapter extends WSNote {
  type: 'chapter';
  order: number;
  status: ChapterStatus;
  pov?: string;         // Point of view character
  location?: string;
  synopsis?: string;
  wordCount?: number;
}

/**
 * Character card note
 */
export interface Character extends WSNote {
  type: 'character';
  role: CharacterRole;
  age?: string;
  gender?: string;
  appearance?: string;
  personality?: string;
  background?: string;
  relationships?: string;
}

/**
 * Timeline event note
 */
export interface TimelineEvent extends WSNote {
  type: 'timeline';
  storyDate: string;
  description?: string;
  relatedChapters: string[];
  relatedCharacters: string[];
}

/**
 * Parsed frontmatter from a note
 */
export interface WSFrontmatter {
  ws_type?: WSNoteType;
  ws_version?: number;
  ws_order?: number;
  ws_status?: ChapterStatus;
  ws_pov?: string;
  ws_location?: string;
  ws_role?: CharacterRole;
  ws_story_date?: string;
  ws_related_chapters?: string[];
  ws_related_characters?: string[];
  daily_goal?: number;
  total_goal?: number;
  created?: string;
  [key: string]: unknown;
}
