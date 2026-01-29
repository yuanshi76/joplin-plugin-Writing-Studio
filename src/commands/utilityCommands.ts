/**
 * Writing Studio Plugin - Utility Commands
 * Commands for sensitive word check and inspiration
 */

import joplin from 'api';
import { sensitiveWordsService } from '../services/SensitiveWordsService';
import { inspirationService } from '../services/InspirationService';

// Cache dialog handles
const dialogHandles: Map<string, string> = new Map();

async function getDialogHandle(dialogId: string): Promise<string> {
  if (!dialogHandles.has(dialogId)) {
    const handle = await joplin.views.dialogs.create(dialogId);
    dialogHandles.set(dialogId, handle);
  }
  return dialogHandles.get(dialogId)!;
}

/**
 * Register utility commands
 */
export async function registerUtilityCommands(): Promise<void> {
  // Command: Check sensitive words
  await joplin.commands.register({
    name: 'writingStudio.checkSensitiveWords',
    label: 'Writing Studio: 检测敏感词',
    iconName: 'fas fa-shield-alt',
    execute: async () => {
      const result = await sensitiveWordsService.checkCurrentNote();
      const dialogs = joplin.views.dialogs;
      const handle = await getDialogHandle('ws-sensitive-result');

      if (!result) {
        await dialogs.setHtml(handle, `
          <div style="padding: 20px;">
            <h3>⚠️ 请先选择一个笔记</h3>
          </div>
        `);
        await dialogs.setButtons(handle, [{ id: 'ok', title: '确定' }]);
        await dialogs.open(handle);
        return;
      }

      if (result.matches.length === 0) {
        await dialogs.setHtml(handle, `
          <div style="padding: 20px;">
            <h3>✅ 未发现敏感词</h3>
            <p>「${result.noteTitle}」中没有发现敏感词。</p>
            <p style="font-size: 12px; color: #666;">提示：可以在设置中配置敏感词列表</p>
          </div>
        `);
        await dialogs.setButtons(handle, [{ id: 'ok', title: '确定' }]);
        await dialogs.open(handle);
        return;
      }

      const matchesHtml = result.matches.map(m => `
        <div style="margin: 8px 0; padding: 8px; background: #fff0f0; border-radius: 4px;">
          <strong style="color: #d00;">${m.word}</strong>
          <span style="color: #666; margin-left: 8px;">出现 ${m.count} 次</span>
        </div>
      `).join('');

      await dialogs.setHtml(handle, `
        <div style="padding: 20px; max-width: 400px;">
          <h3>⚠️ 发现敏感词</h3>
          <p>「${result.noteTitle}」中发现 <strong>${result.totalCount}</strong> 处敏感词：</p>
          ${matchesHtml}
        </div>
      `);
      await dialogs.setButtons(handle, [{ id: 'ok', title: '我知道了' }]);
      await dialogs.open(handle);
    }
  });

  // Command: Get inspiration
  await joplin.commands.register({
    name: 'writingStudio.getInspiration',
    label: 'Writing Studio: 获取灵感',
    iconName: 'fas fa-lightbulb',
    execute: async () => {
      const prompts = inspirationService.getMultiplePrompts(3);
      const dialogs = joplin.views.dialogs;
      const handle = await getDialogHandle('ws-inspiration');

      const promptsHtml = prompts.map(p => `
        <div style="margin: 12px 0; padding: 12px; background: #f5f8ff; border-radius: 8px; border-left: 3px solid #4A90D9;">
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">${inspirationService.getCategoryName(p.category)}</div>
          <div style="font-size: 14px;">${p.prompt}</div>
        </div>
      `).join('');

      await dialogs.setHtml(handle, `
        <div style="padding: 20px; max-width: 450px;">
          <h3>💡 写作灵感</h3>
          <p style="color: #666; font-size: 12px;">点击"再来一批"获取新灵感</p>
          ${promptsHtml}
        </div>
      `);
      await dialogs.setButtons(handle, [
        { id: 'new', title: '再来一批' },
        { id: 'close', title: '关闭' }
      ]);

      let dialogResult = await dialogs.open(handle);
      while (dialogResult.id === 'new') {
        const newPrompts = inspirationService.getMultiplePrompts(3);
        const newHtml = newPrompts.map(p => `
          <div style="margin: 12px 0; padding: 12px; background: #f5f8ff; border-radius: 8px; border-left: 3px solid #4A90D9;">
            <div style="font-size: 11px; color: #888; margin-bottom: 4px;">${inspirationService.getCategoryName(p.category)}</div>
            <div style="font-size: 14px;">${p.prompt}</div>
          </div>
        `).join('');

        await dialogs.setHtml(handle, `
          <div style="padding: 20px; max-width: 450px;">
            <h3>💡 写作灵感</h3>
            <p style="color: #666; font-size: 12px;">点击"再来一批"获取新灵感</p>
            ${newHtml}
          </div>
        `);
        dialogResult = await dialogs.open(handle);
      }
    }
  });
}
