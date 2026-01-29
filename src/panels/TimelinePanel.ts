/**
 * Writing Studio Plugin - Timeline Panel
 * Visual timeline view for story events
 */

import joplin from 'api';
import { timelineService, TimelineEvent } from '../services/TimelineService';
import { tagService } from '../services/TagService';

let timelinePanelHandle: string | null = null;

/**
 * Generate CSS styles for the timeline panel
 */
function getTimelineStyles(): string {
    return `
    <style>
      :root {
        --bg-primary: #1e1e2e;
        --bg-secondary: #2a2a3e;
        --bg-hover: #3a3a4e;
        --text-primary: #cdd6f4;
        --text-secondary: #a6adc8;
        --border-color: #45475a;
        --accent-orange: #FFB347;
        --accent-blue: #4A90D9;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        margin: 0;
        padding: 16px;
        font-size: 13px;
      }
      
      .timeline-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 16px;
      }
      
      .timeline-title {
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .timeline-container {
        position: relative;
        padding-left: 24px;
      }
      
      /* Vertical line */
      .timeline-container::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(180deg, var(--accent-orange), var(--accent-blue));
        border-radius: 1px;
      }
      
      .timeline-event {
        position: relative;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: var(--bg-secondary);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        border-left: 3px solid var(--accent-orange);
      }
      
      .timeline-event:hover {
        background: var(--bg-hover);
        transform: translateX(4px);
      }
      
      /* Timeline dot */
      .timeline-event::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 16px;
        width: 10px;
        height: 10px;
        background: var(--accent-orange);
        border-radius: 50%;
        border: 2px solid var(--bg-primary);
      }
      
      .event-date {
        font-size: 11px;
        color: var(--accent-orange);
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .event-title {
        font-weight: 600;
        margin-bottom: 6px;
      }
      
      .event-description {
        font-size: 12px;
        color: var(--text-secondary);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
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
        border-color: var(--accent-orange);
        color: var(--text-primary);
      }
    </style>
  `;
}

/**
 * Render a single timeline event
 */
function renderTimelineEvent(event: TimelineEvent): string {
    const description = event.description
        ? event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '')
        : '';

    return `
    <div class="timeline-event" onclick="openNote('${event.id}')">
      <div class="event-date">📅 ${event.storyDate}</div>
      <div class="event-title">${event.title}</div>
      ${description ? `<div class="event-description">${description}</div>` : ''}
    </div>
  `;
}

/**
 * Generate full timeline panel HTML
 */
async function generateTimelineHtml(): Promise<string> {
    const folder = await joplin.workspace.selectedFolder();

    if (!folder) {
        return `
      ${getTimelineStyles()}
      <div class="empty-message">
        <div class="empty-icon">⏱️</div>
        <p>请先选择一个写作项目</p>
      </div>
    `;
    }

    const projectName = tagService.getProjectNameFromFolder(folder.title);
    const events = await timelineService.getTimelineEvents(projectName);

    if (events.length === 0) {
        return `
      ${getTimelineStyles()}
      <div class="timeline-header">
        <div class="timeline-title">⏱️ ${projectName} - 时间线</div>
      </div>
      <div class="empty-message">
        <div class="empty-icon">📅</div>
        <p>还没有时间线事件</p>
        <p style="font-size: 12px; color: var(--text-secondary);">添加事件来可视化你的故事发展</p>
        <div class="add-button" onclick="executeCommand('writingStudio.newTimelineEvent')">+ 添加事件</div>
      </div>
    `;
    }

    const eventsHtml = events.map(renderTimelineEvent).join('');

    return `
    ${getTimelineStyles()}
    <div class="timeline-header">
      <div class="timeline-title">⏱️ ${projectName} - 时间线</div>
    </div>
    <div class="timeline-container">
      ${eventsHtml}
    </div>
    <div style="padding-left: 24px; margin-top: 8px;">
      <div class="add-button" onclick="executeCommand('writingStudio.newTimelineEvent')" style="display: block; text-align: center;">+ 添加事件</div>
    </div>
  `;
}

/**
 * Register the timeline panel
 */
export async function registerTimelinePanel(): Promise<void> {
    timelinePanelHandle = await joplin.views.panels.create('writingStudioTimelinePanel');

    // Add the webview script for message handling
    await joplin.views.panels.addScript(timelinePanelHandle, 'webviews/panelScript.js');

    await joplin.views.panels.setHtml(timelinePanelHandle, await generateTimelineHtml());

    // Handle messages from the webview
    await joplin.views.panels.onMessage(timelinePanelHandle, async (message: any) => {
        if (message.type === 'openNote') {
            await joplin.commands.execute('openNote', message.noteId);
        } else if (message.type === 'executeCommand') {
            await joplin.commands.execute(message.command);
            setTimeout(refreshTimelinePanel, 500);
        }
    });

    // Initially hide the panel
    await joplin.views.panels.show(timelinePanelHandle, false);

    console.info('Writing Studio: Timeline panel registered');
}

/**
 * Refresh the timeline panel
 */
export async function refreshTimelinePanel(): Promise<void> {
    if (timelinePanelHandle) {
        await joplin.views.panels.setHtml(timelinePanelHandle, await generateTimelineHtml());
    }
}

/**
 * Toggle timeline panel visibility
 */
export async function toggleTimelinePanel(): Promise<void> {
    if (timelinePanelHandle) {
        const visible = await joplin.views.panels.visible(timelinePanelHandle);
        await joplin.views.panels.show(timelinePanelHandle, !visible);
        if (!visible) {
            await refreshTimelinePanel();
        }
    }
}
