/**
 * Writing Studio Plugin - Project Panel
 * Consolidated panel with tabbed interface for all features
 */

import joplin from 'api';
import { tagService, WS_NOTE_TYPES } from '../services/TagService';
import { statsService } from '../services/StatsService';
import { WSNoteType } from '../models/types';

let panelHandle: string | null = null;
let currentTab: 'notes' | 'timeline' | 'stats' = 'notes';

const NOTE_TYPE_CONFIG: Record<WSNoteType, { icon: string; label: string; color: string }> = {
  project: { icon: '📚', label: '项目', color: '#4A90D9' },
  chapter: { icon: '📄', label: '章节', color: '#50C878' },
  character: { icon: '👤', label: '人物', color: '#FF6B6B' },
  timeline: { icon: '⏱️', label: '时间线', color: '#FFB347' },
  setting: { icon: '🌍', label: '设定', color: '#9B59B6' }
};

function getStyles(): string {
  return `
    <style>
      :root {
        --bg-primary: #1e1e2e;
        --bg-secondary: #2a2a3e;
        --bg-hover: #3a3a4e;
        --text-primary: #cdd6f4;
        --text-secondary: #a6adc8;
        --border-color: #45475a;
        --draft-color: #FFB347;
        --submitted-color: #50C878;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        margin: 0;
        padding: 0;
        font-size: 13px;
      }
      
      .panel-header {
        padding: 12px;
        border-bottom: 1px solid var(--border-color);
      }
      
      .panel-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      
      .tab-bar {
        display: flex;
        gap: 4px;
      }
      
      .tab-btn {
        flex: 1;
        padding: 8px;
        background: var(--bg-secondary);
        border: none;
        border-radius: 6px;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 12px;
      }
      
      .tab-btn.active {
        background: var(--bg-hover);
        color: var(--text-primary);
      }
      
      .tab-btn:hover {
        background: var(--bg-hover);
      }
      
      .panel-content {
        padding: 12px;
        overflow-y: auto;
        max-height: calc(100vh - 100px);
      }
      
      .section {
        margin-bottom: 16px;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        font-weight: 500;
      }
      
      .section-count {
        background: var(--bg-secondary);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
        color: var(--text-secondary);
        margin-left: auto;
      }
      
      .note-list {
        margin-left: 16px;
      }
      
      .note-item {
        display: flex;
        align-items: center;
        padding: 6px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s;
        gap: 8px;
        margin-bottom: 4px;
      }
      
      .note-item:hover {
        background: var(--bg-hover);
      }
      
      .note-title {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .status-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        color: white;
      }
      
      .status-draft { background: var(--draft-color); }
      .status-submitted { background: var(--submitted-color); }
      
      .submit-btn {
        background: var(--submitted-color);
        color: white;
        border: none;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
      }
      
      .add-button {
        background: var(--bg-secondary);
        border: 1px dashed var(--border-color);
        border-radius: 6px;
        padding: 8px;
        text-align: center;
        cursor: pointer;
        color: var(--text-secondary);
        margin-top: 8px;
      }
      
      .add-button:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }
      
      .stats-card {
        background: var(--bg-secondary);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      }
      
      .stats-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      
      .stats-label { color: var(--text-secondary); }
      .stats-value { font-weight: 600; }
      
      .progress-bar {
        height: 6px;
        background: var(--border-color);
        border-radius: 3px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4A90D9, #50C878);
        border-radius: 3px;
      }
      
      .action-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 16px;
      }
      
      .action-btn {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px 8px;
        cursor: pointer;
        color: var(--text-primary);
        text-align: center;
        font-size: 12px;
      }
      
      .action-btn:hover {
        background: var(--bg-hover);
        border-color: var(--text-secondary);
      }
      
      .action-icon {
        font-size: 18px;
        display: block;
        margin-bottom: 4px;
      }
      
      .empty-message {
        text-align: center;
        padding: 20px;
        color: var(--text-secondary);
      }
      
      .timeline-item {
        display: flex;
        gap: 12px;
        padding: 10px;
        border-left: 2px solid var(--draft-color);
        margin-left: 8px;
        margin-bottom: 8px;
        cursor: pointer;
      }
      
      .timeline-item:hover {
        background: var(--bg-secondary);
        border-radius: 0 6px 6px 0;
      }
      
      .timeline-date {
        font-size: 11px;
        color: var(--draft-color);
        white-space: nowrap;
      }
      
      .timeline-title {
        flex: 1;
      }
    </style>
  `;
}

interface NoteInfo {
  id: string;
  title: string;
  type: WSNoteType;
  status: 'draft' | 'submitted' | null;
}

async function getProjectNotes(projectName: string): Promise<NoteInfo[]> {
  const notes: NoteInfo[] = [];
  const typesToShow: WSNoteType[] = ['chapter', 'character', 'timeline', 'setting'];

  for (const type of typesToShow) {
    const typeNotes = await tagService.getNotesByType(type, projectName);
    for (const note of typeNotes) {
      const rawStatus = await tagService.getNoteStatus(note.id);
      const status = (rawStatus === 'draft' || rawStatus === 'submitted') ? rawStatus : null;
      notes.push({ id: note.id, title: note.title, type, status });
    }
  }
  return notes;
}

function renderNotesTab(notes: NoteInfo[], projectName: string): string {
  const renderSection = (type: WSNoteType, commandName: string) => {
    const config = NOTE_TYPE_CONFIG[type];
    const typeNotes = notes.filter(n => n.type === type);

    const notesHtml = typeNotes.length > 0
      ? typeNotes.map(note => {
        const statusBadge = note.status === 'submitted'
          ? `<span class="status-badge status-submitted">完成</span>`
          : note.status === 'draft'
            ? `<span class="status-badge status-draft">草稿</span><button class="submit-btn" onclick="event.stopPropagation(); submitNote('${note.id}')">提交</button>`
            : '';
        return `<div class="note-item" onclick="openNote('${note.id}')"><span class="note-title">${note.title}</span>${statusBadge}</div>`;
      }).join('')
      : '';

    return `
      <div class="section">
        <div class="section-header" style="color: ${config.color}">
          <span>${config.icon} ${config.label}</span>
          <span class="section-count">${typeNotes.length}</span>
        </div>
        <div class="note-list">
          ${notesHtml}
          <div class="add-button" onclick="executeCommand('${commandName}')">+ 新建${config.label}</div>
        </div>
      </div>
    `;
  };

  return `
    ${renderSection('chapter', 'writingStudio.newChapter')}
    ${renderSection('character', 'writingStudio.newCharacter')}
    ${renderSection('setting', 'writingStudio.newSetting')}
    
    <div class="action-grid">
      <div class="action-btn" onclick="executeCommand('writingStudio.getInspiration')">
        <span class="action-icon">💡</span>
        获取灵感
      </div>
      <div class="action-btn" onclick="executeCommand('writingStudio.aiContinue')">
        <span class="action-icon">✨</span>
        AI 续写
      </div>
      <div class="action-btn" onclick="executeCommand('writingStudio.aiPolish')">
        <span class="action-icon">🎨</span>
        AI 润色
      </div>
      <div class="action-btn" onclick="executeCommand('writingStudio.checkSensitiveWords')">
        <span class="action-icon">🛡️</span>
        敏感词检测
      </div>
    </div>
  `;
}

function renderTimelineTab(notes: NoteInfo[]): string {
  const timelineNotes = notes.filter(n => n.type === 'timeline');

  if (timelineNotes.length === 0) {
    return `
      <div class="empty-message">
        <p>⏱️ 暂无时间线事件</p>
        <div class="add-button" onclick="executeCommand('writingStudio.newTimelineEvent')">+ 添加事件</div>
      </div>
    `;
  }

  const itemsHtml = timelineNotes.map(note => `
    <div class="timeline-item" onclick="openNote('${note.id}')">
      <span class="timeline-date">📍</span>
      <span class="timeline-title">${note.title}</span>
    </div>
  `).join('');

  return `
    ${itemsHtml}
    <div class="add-button" onclick="executeCommand('writingStudio.newTimelineEvent')">+ 添加事件</div>
  `;
}

async function renderStatsTab(folderId: string): Promise<string> {
  const stats = await statsService.getProjectStats(folderId);

  return `
    <div class="stats-card">
      <div class="stats-row">
        <span class="stats-label">总字数</span>
        <span class="stats-value">${statsService.formatWordCount(stats.totalWordCount)}</span>
      </div>
      <div class="stats-row">
        <span class="stats-label">目标进度</span>
        <span class="stats-value">${stats.totalProgress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${stats.totalProgress}%"></div>
      </div>
    </div>
    
    <div class="stats-card">
      <div class="stats-row">
        <span class="stats-label">今日字数</span>
        <span class="stats-value">${stats.todayWritten}</span>
      </div>
      <div class="stats-row">
        <span class="stats-label">每日目标</span>
        <span class="stats-value">${stats.dailyGoal}</span>
      </div>
    </div>
    
    <div class="action-btn" onclick="switchTab('notes')" style="margin-top: 16px; display: block;">
      ← 返回笔记列表
    </div>
  `;
}

async function generatePanelHtml(): Promise<string> {
  const folder = await joplin.workspace.selectedFolder();

  if (!folder) {
    return `
      ${getStyles()}
      <div class="empty-message">
        <p>请先选择一个写作项目文件夹</p>
        <div class="add-button" onclick="executeCommand('writingStudio.newProject')">📚 新建写作项目</div>
      </div>
    `;
  }

  const projectName = tagService.getProjectNameFromFolder(folder.title);
  const notes = await getProjectNotes(projectName);

  let contentHtml = '';
  if (currentTab === 'notes') {
    contentHtml = renderNotesTab(notes, projectName);
  } else if (currentTab === 'timeline') {
    contentHtml = renderTimelineTab(notes);
  } else if (currentTab === 'stats') {
    contentHtml = await renderStatsTab(folder.id);
  }

  return `
    ${getStyles()}
    
    <div class="panel-header">
      <div class="panel-title">📖 ${projectName}</div>
      <div class="tab-bar">
        <button class="tab-btn ${currentTab === 'notes' ? 'active' : ''}" onclick="switchTab('notes')">📝 笔记</button>
        <button class="tab-btn ${currentTab === 'timeline' ? 'active' : ''}" onclick="switchTab('timeline')">⏱️ 时间线</button>
        <button class="tab-btn ${currentTab === 'stats' ? 'active' : ''}" onclick="switchTab('stats')">📊 统计</button>
      </div>
    </div>
    
    <div class="panel-content">
      ${contentHtml}
    </div>
  `;
}

export async function registerProjectPanel(): Promise<void> {
  panelHandle = await joplin.views.panels.create('writingStudioProjectPanel');

  await joplin.views.panels.addScript(panelHandle, 'webviews/panelScript.js');
  await joplin.views.panels.setHtml(panelHandle, await generatePanelHtml());

  await joplin.views.panels.onMessage(panelHandle, async (message: any) => {
    if (message.type === 'openNote') {
      await joplin.commands.execute('openNote', message.noteId);
    } else if (message.type === 'executeCommand') {
      await joplin.commands.execute(message.command);
      setTimeout(refreshPanel, 500);
    } else if (message.type === 'submitNote') {
      await tagService.addStatusTag(message.noteId, 'submitted');
      await refreshPanel();
    } else if (message.type === 'switchTab') {
      currentTab = message.tab;
      await refreshPanel();
    }
  });

  await joplin.workspace.onNoteSelectionChange(refreshPanel);
  console.info('Writing Studio: Project panel registered');
}

export async function refreshPanel(): Promise<void> {
  if (panelHandle) {
    await joplin.views.panels.setHtml(panelHandle, await generatePanelHtml());
  }
}

export async function togglePanel(): Promise<void> {
  if (panelHandle) {
    const visible = await joplin.views.panels.visible(panelHandle);
    await joplin.views.panels.show(panelHandle, !visible);
  }
}
