/**
 * Writing Studio Plugin - AI Commands
 * Registers commands for AI-powered writing assistance
 * Adds AI model tag to notes after processing
 */

import joplin from 'api';
import { aiService } from '../services/AIService';
import { tagService } from '../services/TagService';

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
 * Add AI model tag to note
 */
async function addAIModelTag(noteId: string): Promise<void> {
  const modelName = await joplin.settings.value('aiModel') || 'unknown';
  const tagName = `ws/ai/${modelName}`;
  const tagId = await tagService.getOrCreateTag(tagName);

  try {
    await joplin.data.post(['tags', tagId, 'notes'], null, { id: noteId });
  } catch (e) {
    // Tag might already be assigned
  }
}

/**
 * Register all AI-related commands
 */
export async function registerAICommands(): Promise<void> {
  // Command: AI Continue Writing
  await joplin.commands.register({
    name: 'writingStudio.aiContinue',
    label: 'Writing Studio: AI 续写',
    iconName: 'fas fa-magic',
    execute: async () => {
      const note = await joplin.workspace.selectedNote();
      if (!note) return;

      const context = note.body.slice(-500);
      const dialogs = joplin.views.dialogs;
      const result = await aiService.continueWriting(context);

      if (!result.success) {
        const errorHandle = await getDialogHandle('ws-ai-error');
        await dialogs.setHtml(errorHandle, `
          <div style="padding: 20px;">
            <h3>⚠️ AI 续写失败</h3>
            <p>${result.error}</p>
          </div>
        `);
        await dialogs.setButtons(errorHandle, [{ id: 'ok', title: '确定' }]);
        await dialogs.open(errorHandle);
        return;
      }

      const resultHandle = await getDialogHandle('ws-ai-result');
      await dialogs.setHtml(resultHandle, `
        <div style="padding: 20px; max-width: 500px;">
          <h3>✨ AI 续写结果</h3>
          <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; max-height: 300px; overflow-y: auto; white-space: pre-wrap;">${escapeHtml(result.content || '')}</div>
        </div>
      `);
      await dialogs.setButtons(resultHandle, [
        { id: 'append', title: '追加到笔记' },
        { id: 'cancel', title: '取消' }
      ]);

      const dialogResult = await dialogs.open(resultHandle);

      if (dialogResult.id === 'append' && result.content) {
        const newBody = note.body + '\n\n' + result.content;
        await joplin.data.put(['notes', note.id], null, { body: newBody });
        // Add AI model tag
        await addAIModelTag(note.id);
        console.info('Writing Studio: AI content appended with model tag');
      }
    }
  });

  // Command: AI Polish
  await joplin.commands.register({
    name: 'writingStudio.aiPolish',
    label: 'Writing Studio: AI 润色',
    iconName: 'fas fa-paint-brush',
    execute: async () => {
      const note = await joplin.workspace.selectedNote();
      if (!note) return;

      const dialogs = joplin.views.dialogs;
      const inputHandle = await getDialogHandle('ws-ai-polish-input');
      await dialogs.setHtml(inputHandle, `
        <form name="polish-form">
          <div style="padding: 20px; min-width: 400px;">
            <h3>✨ AI 润色</h3>
            <p style="color: #666; font-size: 12px;">请粘贴需要润色的文字：</p>
            <textarea name="text" style="width: 100%; height: 150px; resize: vertical;"></textarea>
            <p style="margin-top: 12px;">
              <label>润色风格：</label>
              <select name="style" style="margin-left: 8px;">
                <option value="">默认（提升质量）</option>
                <option value="literary">文学化（更优美）</option>
                <option value="concise">精简化（更简洁）</option>
                <option value="formal">正式化（更书面）</option>
              </select>
            </p>
          </div>
        </form>
      `);
      await dialogs.setButtons(inputHandle, [
        { id: 'polish', title: '开始润色' },
        { id: 'cancel', title: '取消' }
      ]);

      const inputResult = await dialogs.open(inputHandle);
      if (inputResult.id !== 'polish') return;

      const text = inputResult.formData?.['polish-form']?.text;
      const style = inputResult.formData?.['polish-form']?.style as 'formal' | 'literary' | 'concise' | undefined;

      if (!text || text.trim().length === 0) return;

      const result = await aiService.polish(text, style || undefined);

      if (!result.success) {
        const errorHandle = await getDialogHandle('ws-ai-polish-error');
        await dialogs.setHtml(errorHandle, `
          <div style="padding: 20px;">
            <h3>⚠️ 润色失败</h3>
            <p>${result.error}</p>
          </div>
        `);
        await dialogs.setButtons(errorHandle, [{ id: 'ok', title: '确定' }]);
        await dialogs.open(errorHandle);
        return;
      }

      const resultHandle = await getDialogHandle('ws-ai-polish-result');
      await dialogs.setHtml(resultHandle, `
        <div style="padding: 20px; max-width: 600px;">
          <h3>✨ 润色结果</h3>
          <div style="display: flex; gap: 16px;">
            <div style="flex: 1;">
              <p style="font-weight: bold; margin-bottom: 8px;">原文</p>
              <div style="background: #fff3f3; padding: 12px; border-radius: 6px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; font-size: 13px;">${escapeHtml(text)}</div>
            </div>
            <div style="flex: 1;">
              <p style="font-weight: bold; margin-bottom: 8px;">润色后</p>
              <div style="background: #f3fff3; padding: 12px; border-radius: 6px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; font-size: 13px;">${escapeHtml(result.content || '')}</div>
            </div>
          </div>
        </div>
      `);
      await dialogs.setButtons(resultHandle, [
        { id: 'copy', title: '复制结果' },
        { id: 'close', title: '关闭' }
      ]);

      await dialogs.open(resultHandle);
      // Add AI model tag after polish
      await addAIModelTag(note.id);
    }
  });

  // Command: Generate Synopsis
  await joplin.commands.register({
    name: 'writingStudio.aiSynopsis',
    label: 'Writing Studio: AI 生成摘要',
    iconName: 'fas fa-file-alt',
    execute: async () => {
      const note = await joplin.workspace.selectedNote();
      if (!note) return;

      const result = await aiService.generateSynopsis(note.body);
      const dialogs = joplin.views.dialogs;

      if (!result.success) {
        const errorHandle = await getDialogHandle('ws-ai-synopsis-error');
        await dialogs.setHtml(errorHandle, `
          <div style="padding: 20px;">
            <h3>⚠️ 生成摘要失败</h3>
            <p>${result.error}</p>
          </div>
        `);
        await dialogs.setButtons(errorHandle, [{ id: 'ok', title: '确定' }]);
        await dialogs.open(errorHandle);
        return;
      }

      const resultHandle = await getDialogHandle('ws-ai-synopsis-result');
      await dialogs.setHtml(resultHandle, `
        <div style="padding: 20px; max-width: 500px;">
          <h3>📝 章节摘要</h3>
          <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; white-space: pre-wrap;">${escapeHtml(result.content || '')}</div>
        </div>
      `);
      await dialogs.setButtons(resultHandle, [{ id: 'ok', title: '确定' }]);
      await dialogs.open(resultHandle);
      // Add AI model tag
      await addAIModelTag(note.id);
    }
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
