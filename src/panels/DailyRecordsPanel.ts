/**
 * Writing Studio Plugin - Daily Record Panel
 * Visual panel showing writing history and statistics
 */

import joplin from 'api';
import { dailyRecordService, DailyRecord } from '../services/DailyRecordService';
import { tagService } from '../services/TagService';
import { statsService } from '../services/StatsService';

let recordsPanelHandle: string | null = null;

/**
 * Generate CSS styles for the records panel
 */
function getRecordsStyles(): string {
    return `
    <style>
      :root {
        --bg-primary: #1e1e2e;
        --bg-secondary: #2a2a3e;
        --bg-hover: #3a3a4e;
        --text-primary: #cdd6f4;
        --text-secondary: #a6adc8;
        --border-color: #45475a;
        --accent-green: #50C878;
        --accent-blue: #4A90D9;
        --accent-orange: #FFB347;
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
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .stat-card {
        background: var(--bg-secondary);
        border-radius: 10px;
        padding: 16px;
        text-align: center;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 11px;
        color: var(--text-secondary);
      }
      
      .stat-value.green { color: var(--accent-green); }
      .stat-value.blue { color: var(--accent-blue); }
      .stat-value.orange { color: var(--accent-orange); }
      
      .week-chart {
        background: var(--bg-secondary);
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 20px;
      }
      
      .chart-title {
        font-weight: 600;
        margin-bottom: 12px;
      }
      
      .chart-bars {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        height: 100px;
        gap: 8px;
      }
      
      .chart-bar-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .chart-bar {
        width: 100%;
        background: linear-gradient(180deg, var(--accent-green), var(--accent-blue));
        border-radius: 4px 4px 0 0;
        min-height: 4px;
        transition: height 0.3s;
      }
      
      .chart-day {
        font-size: 10px;
        color: var(--text-secondary);
        margin-top: 6px;
      }
      
      .chart-value {
        font-size: 9px;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }
      
      .history-section {
        background: var(--bg-secondary);
        border-radius: 10px;
        padding: 16px;
      }
      
      .history-title {
        font-weight: 600;
        margin-bottom: 12px;
      }
      
      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid var(--border-color);
      }
      
      .history-item:last-child {
        border-bottom: none;
      }
      
      .history-date {
        font-weight: 500;
      }
      
      .history-words {
        color: var(--accent-green);
        font-weight: 600;
      }
      
      .history-details {
        font-size: 11px;
        color: var(--text-secondary);
      }
      
      .empty-message {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-secondary);
      }
      
      .refresh-btn {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 6px 12px;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 12px;
      }
      
      .refresh-btn:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }
    </style>
  `;
}

/**
 * Get day name abbreviation
 */
function getDayName(dateStr: string): string {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const date = new Date(dateStr);
    return days[date.getDay()];
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * Generate weekly chart HTML
 */
function renderWeekChart(records: DailyRecord[]): string {
    // Get last 7 days
    const days: { date: string; words: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const record = records.find(r => r.date === dateStr);
        days.push({
            date: dateStr,
            words: record?.wordsWritten || 0
        });
    }

    const maxWords = Math.max(...days.map(d => d.words), 1);

    const barsHtml = days.map(day => {
        const height = Math.max(4, (day.words / maxWords) * 80);
        return `
      <div class="chart-bar-container">
        <div class="chart-value">${day.words > 0 ? day.words : ''}</div>
        <div class="chart-bar" style="height: ${height}px"></div>
        <div class="chart-day">${getDayName(day.date)}</div>
      </div>
    `;
    }).join('');

    return `
    <div class="week-chart">
      <div class="chart-title">📊 本周写作</div>
      <div class="chart-bars">
        ${barsHtml}
      </div>
    </div>
  `;
}

/**
 * Render history list
 */
function renderHistoryList(records: DailyRecord[]): string {
    if (records.length === 0) {
        return `<div class="empty-message">暂无写作记录</div>`;
    }

    const itemsHtml = records.slice(0, 10).map(record => `
    <div class="history-item">
      <div>
        <div class="history-date">${formatDate(record.date)}</div>
        <div class="history-details">创建 ${record.notesCreated.length} 篇 · 编辑 ${record.notesEdited.length} 篇</div>
      </div>
      <div class="history-words">+${record.wordsWritten} 字</div>
    </div>
  `).join('');

    return `
    <div class="history-section">
      <div class="history-title">📅 写作历史</div>
      ${itemsHtml}
    </div>
  `;
}

/**
 * Generate full panel HTML
 */
async function generateRecordsHtml(): Promise<string> {
    const folder = await joplin.workspace.selectedFolder();

    if (!folder) {
        return `
      ${getRecordsStyles()}
      <div class="empty-message">
        <p>📊 请先选择一个写作项目</p>
      </div>
    `;
    }

    const projectName = tagService.getProjectNameFromFolder(folder.title);

    // Update today's record
    await dailyRecordService.updateTodayRecord(projectName);

    // Get data
    const records = await dailyRecordService.getProjectRecords(projectName);
    const summary = await dailyRecordService.getWeeklySummary(projectName);
    const todayRecord = await dailyRecordService.getTodayRecord(projectName);

    return `
    ${getRecordsStyles()}
    <div class="panel-header">
      <div class="panel-title">📊 ${projectName} - 写作记录</div>
      <button class="refresh-btn" onclick="executeCommand('writingStudio.refreshRecords')">刷新</button>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value green">${todayRecord?.wordsWritten || 0}</div>
        <div class="stat-label">今日字数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value blue">${summary.totalWords}</div>
        <div class="stat-label">本周字数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value orange">${summary.avgWordsPerDay}</div>
        <div class="stat-label">日均字数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.daysActive}/7</div>
        <div class="stat-label">活跃天数</div>
      </div>
    </div>
    
    ${renderWeekChart(records)}
    ${renderHistoryList(records)}
  `;
}

/**
 * Register the records panel
 */
export async function registerRecordsPanel(): Promise<void> {
    recordsPanelHandle = await joplin.views.panels.create('writingStudioRecordsPanel');

    await joplin.views.panels.addScript(recordsPanelHandle, 'webviews/panelScript.js');
    await joplin.views.panels.setHtml(recordsPanelHandle, await generateRecordsHtml());

    await joplin.views.panels.onMessage(recordsPanelHandle, async (message: any) => {
        if (message.type === 'executeCommand') {
            if (message.command === 'writingStudio.refreshRecords') {
                await refreshRecordsPanel();
            } else {
                await joplin.commands.execute(message.command);
            }
        }
    });

    await joplin.views.panels.show(recordsPanelHandle, false);
    console.info('Writing Studio: Records panel registered');
}

/**
 * Refresh the records panel
 */
export async function refreshRecordsPanel(): Promise<void> {
    if (recordsPanelHandle) {
        await joplin.views.panels.setHtml(recordsPanelHandle, await generateRecordsHtml());
    }
}

/**
 * Toggle records panel visibility
 */
export async function toggleRecordsPanel(): Promise<void> {
    if (recordsPanelHandle) {
        const visible = await joplin.views.panels.visible(recordsPanelHandle);
        await joplin.views.panels.show(recordsPanelHandle, !visible);
        if (!visible) {
            await refreshRecordsPanel();
        }
    }
}
