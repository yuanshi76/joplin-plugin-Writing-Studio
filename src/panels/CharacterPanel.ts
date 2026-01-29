/**
 * Writing Studio Plugin - Character Graph Panel
 * Visual relationship graph for characters
 */

import joplin from 'api';
import { characterService, Character } from '../services/CharacterService';
import { tagService } from '../services/TagService';

let characterPanelHandle: string | null = null;

/**
 * Generate CSS styles for the character panel
 */
function getCharacterStyles(): string {
    return `
    <style>
      :root {
        --bg-primary: #1e1e2e;
        --bg-secondary: #2a2a3e;
        --bg-hover: #3a3a4e;
        --text-primary: #cdd6f4;
        --text-secondary: #a6adc8;
        --border-color: #45475a;
        --accent-red: #FF6B6B;
        --accent-blue: #4A90D9;
        --accent-green: #50C878;
        --accent-purple: #9B59B6;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        margin: 0;
        padding: 16px;
        font-size: 13px;
      }
      
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 16px;
      }
      
      .panel-title {
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .character-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .character-card {
        background: var(--bg-secondary);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
      }
      
      .character-card:hover {
        background: var(--bg-hover);
        border-color: var(--accent-red);
        transform: translateY(-2px);
      }
      
      .character-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent-red), var(--accent-purple));
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        font-size: 20px;
      }
      
      .character-name {
        font-weight: 600;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .character-info {
        font-size: 11px;
        color: var(--text-secondary);
      }
      
      .relations-section {
        background: var(--bg-secondary);
        border-radius: 8px;
        padding: 16px;
        margin-top: 16px;
      }
      
      .relations-title {
        font-weight: 600;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .relation-item {
        display: flex;
        align-items: center;
        padding: 8px;
        margin-bottom: 8px;
        background: var(--bg-primary);
        border-radius: 6px;
        font-size: 12px;
      }
      
      .relation-from,
      .relation-to {
        flex: 1;
        text-align: center;
      }
      
      .relation-arrow {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 12px;
        color: var(--accent-purple);
      }
      
      .relation-type {
        background: var(--accent-purple);
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
      }
      
      .empty-message {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-secondary);
      }
      
      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      .add-button {
        display: inline-block;
        margin-top: 16px;
        padding: 8px 16px;
        background: var(--bg-secondary);
        border: 1px dashed var(--border-color);
        border-radius: 6px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s;
      }
      
      .add-button:hover {
        background: var(--bg-hover);
        border-color: var(--accent-red);
        color: var(--text-primary);
      }
    </style>
  `;
}

/**
 * Get emoji avatar for character
 */
function getCharacterAvatar(name: string, gender?: string): string {
    if (gender === '女' || gender === '女性') {
        return '👩';
    } else if (gender === '男' || gender === '男性') {
        return '👨';
    }
    // Use first character as fallback
    return name.charAt(0) || '👤';
}

/**
 * Render single character card
 */
function renderCharacterCard(character: Character): string {
    const avatar = getCharacterAvatar(character.name, character.gender);
    const info = [character.gender, character.age].filter(Boolean).join(' · ') || '未设置';

    return `
    <div class="character-card" onclick="openNote('${character.id}')">
      <div class="character-avatar">${avatar}</div>
      <div class="character-name">${character.name}</div>
      <div class="character-info">${info}</div>
    </div>
  `;
}

/**
 * Render relationship graph as a list
 */
function renderRelationships(characters: Character[]): string {
    const allRelations: Array<{ from: string; to: string; type: string }> = [];

    for (const char of characters) {
        for (const rel of char.relationships) {
            if (rel.targetName) {
                allRelations.push({
                    from: char.name,
                    to: rel.targetName,
                    type: rel.relationType
                });
            }
        }
    }

    if (allRelations.length === 0) {
        return '';
    }

    const relationsHtml = allRelations.map(rel => `
    <div class="relation-item">
      <div class="relation-from">${rel.from}</div>
      <div class="relation-arrow">
        →
        <span class="relation-type">${rel.type}</span>
        →
      </div>
      <div class="relation-to">${rel.to}</div>
    </div>
  `).join('');

    return `
    <div class="relations-section">
      <div class="relations-title">🔗 人物关系</div>
      ${relationsHtml}
    </div>
  `;
}

/**
 * Generate full character panel HTML
 */
async function generateCharacterHtml(): Promise<string> {
    const folder = await joplin.workspace.selectedFolder();

    if (!folder) {
        return `
      ${getCharacterStyles()}
      <div class="empty-message">
        <div class="empty-icon">👥</div>
        <p>请先选择一个写作项目</p>
      </div>
    `;
    }

    const projectName = tagService.getProjectNameFromFolder(folder.title);
    let characters = await characterService.getCharacters(projectName);
    characters = await characterService.resolveRelationships(characters);

    if (characters.length === 0) {
        return `
      ${getCharacterStyles()}
      <div class="panel-header">
        <div class="panel-title">👥 ${projectName} - 人物</div>
      </div>
      <div class="empty-message">
        <div class="empty-icon">👤</div>
        <p>还没有人物卡片</p>
        <p style="font-size: 12px; color: var(--text-secondary);">创建人物来管理你的角色</p>
        <div class="add-button" onclick="executeCommand('writingStudio.newCharacter')">+ 添加人物</div>
      </div>
    `;
    }

    const cardsHtml = characters.map(renderCharacterCard).join('');
    const relationsHtml = renderRelationships(characters);

    return `
    ${getCharacterStyles()}
    <div class="panel-header">
      <div class="panel-title">👥 ${projectName} - 人物 (${characters.length})</div>
    </div>
    <div class="character-grid">
      ${cardsHtml}
    </div>
    <div style="text-align: center;">
      <div class="add-button" onclick="executeCommand('writingStudio.newCharacter')">+ 添加人物</div>
    </div>
    ${relationsHtml}
  `;
}

/**
 * Register the character panel
 */
export async function registerCharacterPanel(): Promise<void> {
    characterPanelHandle = await joplin.views.panels.create('writingStudioCharacterPanel');

    // Add the webview script for message handling
    await joplin.views.panels.addScript(characterPanelHandle, 'webviews/panelScript.js');

    await joplin.views.panels.setHtml(characterPanelHandle, await generateCharacterHtml());

    // Handle messages from the webview
    await joplin.views.panels.onMessage(characterPanelHandle, async (message: any) => {
        if (message.type === 'openNote') {
            await joplin.commands.execute('openNote', message.noteId);
        } else if (message.type === 'executeCommand') {
            await joplin.commands.execute(message.command);
            setTimeout(refreshCharacterPanel, 500);
        }
    });

    // Initially hide the panel
    await joplin.views.panels.show(characterPanelHandle, false);

    console.info('Writing Studio: Character panel registered');
}

/**
 * Refresh the character panel
 */
export async function refreshCharacterPanel(): Promise<void> {
    if (characterPanelHandle) {
        await joplin.views.panels.setHtml(characterPanelHandle, await generateCharacterHtml());
    }
}

/**
 * Toggle character panel visibility
 */
export async function toggleCharacterPanel(): Promise<void> {
    if (characterPanelHandle) {
        const visible = await joplin.views.panels.visible(characterPanelHandle);
        await joplin.views.panels.show(characterPanelHandle, !visible);
        if (!visible) {
            await refreshCharacterPanel();
        }
    }
}
