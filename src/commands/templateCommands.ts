/**
 * Writing Studio Plugin - Template Commands
 * Registers commands for creating notes from templates
 * 
 * Note: Dialog handles are cached to avoid "View already added" error
 */

import joplin from 'api';
import { templateService } from '../services/TemplateService';
import { WSNoteType } from '../models/types';

// Cache dialog handles to reuse them
const dialogHandles: Map<string, string> = new Map();

/**
 * Get or create a dialog handle
 */
async function getDialogHandle(dialogId: string): Promise<string> {
    if (!dialogHandles.has(dialogId)) {
        const handle = await joplin.views.dialogs.create(dialogId);
        dialogHandles.set(dialogId, handle);
    }
    return dialogHandles.get(dialogId)!;
}

/**
 * Register all template-related commands
 */
export async function registerTemplateCommands(): Promise<void> {
    // Command: Create new writing project
    await joplin.commands.register({
        name: 'writingStudio.newProject',
        label: 'Writing Studio: 新建写作项目',
        iconName: 'fas fa-book',
        execute: async () => {
            const dialogs = joplin.views.dialogs;
            const handle = await getDialogHandle('ws-new-project-dialog');

            await dialogs.setHtml(handle, `
        <form name="project-form">
          <h3>新建写作项目</h3>
          <p>
            <label>项目名称：</label><br/>
            <input type="text" name="projectName" style="width: 100%;" placeholder="我的小说"/>
          </p>
        </form>
      `);
            await dialogs.setButtons(handle, [
                { id: 'ok', title: '创建' },
                { id: 'cancel', title: '取消' }
            ]);

            const dialogResult = await dialogs.open(handle);
            if (dialogResult.id !== 'ok') return;

            const projectName = dialogResult.formData?.['project-form']?.projectName;
            if (!projectName) return;

            try {
                const { folderId } = await templateService.createProject(projectName);
                await joplin.commands.execute('openFolder', folderId);
                console.info(`Writing Studio: Created project "${projectName}"`);
            } catch (error) {
                console.error('Failed to create project:', error);
            }
        }
    });

    // Command: Create new chapter
    await joplin.commands.register({
        name: 'writingStudio.newChapter',
        label: 'Writing Studio: 新建章节',
        iconName: 'fas fa-file-alt',
        execute: async () => {
            const folder = await joplin.workspace.selectedFolder();
            if (!folder) {
                console.warn('No folder selected');
                return;
            }

            const projectName = templateService.getProjectName(folder.title);
            const nextOrder = await templateService.getNextChapterOrder(projectName);

            const dialogs = joplin.views.dialogs;
            const handle = await getDialogHandle('ws-new-chapter-dialog');

            await dialogs.setHtml(handle, `
        <form name="chapter-form">
          <h3>新建章节</h3>
          <p>
            <label>章节标题：</label><br/>
            <input type="text" name="title" style="width: 100%;" placeholder="第${nextOrder}章"/>
          </p>
        </form>
      `);
            await dialogs.setButtons(handle, [
                { id: 'ok', title: '创建' },
                { id: 'cancel', title: '取消' }
            ]);

            const dialogResult = await dialogs.open(handle);
            if (dialogResult.id !== 'ok') return;

            const title = dialogResult.formData?.['chapter-form']?.title || `第${nextOrder}章`;

            try {
                const noteId = await templateService.createFromTemplate(
                    'chapter',
                    title,
                    folder.id,
                    projectName,
                    { order: nextOrder }
                );
                await joplin.commands.execute('openNote', noteId);
                console.info(`Writing Studio: Created chapter "${title}"`);
            } catch (error) {
                console.error('Failed to create chapter:', error);
            }
        }
    });

    // Command: Create new character card
    await joplin.commands.register({
        name: 'writingStudio.newCharacter',
        label: 'Writing Studio: 新建人物卡片',
        iconName: 'fas fa-user',
        execute: async () => {
            await createNoteWithDialog('character', '新建人物卡片', '人物名称', '新角色');
        }
    });

    // Command: Create new timeline event
    await joplin.commands.register({
        name: 'writingStudio.newTimelineEvent',
        label: 'Writing Studio: 新建时间线事件',
        iconName: 'fas fa-clock',
        execute: async () => {
            await createNoteWithDialog('timeline', '新建时间线事件', '事件标题', '新事件');
        }
    });

    // Command: Create new world setting
    await joplin.commands.register({
        name: 'writingStudio.newSetting',
        label: 'Writing Studio: 新建世界设定',
        iconName: 'fas fa-globe',
        execute: async () => {
            await createNoteWithDialog('setting', '新建世界设定', '设定名称', '新设定');
        }
    });
}

/**
 * Helper function to create a note with a simple dialog
 */
async function createNoteWithDialog(
    type: WSNoteType,
    dialogTitle: string,
    inputLabel: string,
    defaultValue: string
): Promise<void> {
    const folder = await joplin.workspace.selectedFolder();
    if (!folder) {
        console.warn('No folder selected');
        return;
    }

    const projectName = templateService.getProjectName(folder.title);

    const dialogs = joplin.views.dialogs;
    const handle = await getDialogHandle(`ws-new-${type}-dialog`);

    await dialogs.setHtml(handle, `
    <form name="note-form">
      <h3>${dialogTitle}</h3>
      <p>
        <label>${inputLabel}：</label><br/>
        <input type="text" name="title" style="width: 100%;" placeholder="${defaultValue}"/>
      </p>
    </form>
  `);
    await dialogs.setButtons(handle, [
        { id: 'ok', title: '创建' },
        { id: 'cancel', title: '取消' }
    ]);

    const dialogResult = await dialogs.open(handle);
    if (dialogResult.id !== 'ok') return;

    const title = dialogResult.formData?.['note-form']?.title || defaultValue;

    try {
        const noteId = await templateService.createFromTemplate(type, title, folder.id, projectName);
        await joplin.commands.execute('openNote', noteId);
        console.info(`Writing Studio: Created ${type} "${title}"`);
    } catch (error) {
        console.error(`Failed to create ${type}:`, error);
    }
}
