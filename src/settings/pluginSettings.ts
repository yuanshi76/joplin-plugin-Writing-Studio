/**
 * Writing Studio Plugin - Plugin Settings
 * Defines and registers plugin configuration options
 */

import joplin from 'api';
import { SettingItemType } from 'api/types';

export const SETTINGS_SECTION = 'writingStudio';

export interface PluginSettings {
    aiBaseUrl: string;
    aiApiKey: string;
    aiModel: string;
    dailyGoal: number;
    enableAI: boolean;
}

/**
 * Register plugin settings section and items
 */
export async function registerSettings(): Promise<void> {
    await joplin.settings.registerSection(SETTINGS_SECTION, {
        label: 'Writing Studio',
        iconName: 'fas fa-pen-fancy',
        description: '写作工作室插件设置'
    });

    await joplin.settings.registerSettings({
        // AI Settings
        'aiEnabled': {
            section: SETTINGS_SECTION,
            type: SettingItemType.Bool,
            public: true,
            value: false,
            label: '启用 AI 功能',
            description: '启用 AI 续写和润色功能'
        },
        'aiBaseUrl': {
            section: SETTINGS_SECTION,
            type: SettingItemType.String,
            public: true,
            value: 'https://api.openai.com/v1',
            label: 'AI API Base URL',
            description: '兼容 OpenAI 接口的 API 地址'
        },
        'aiApiKey': {
            section: SETTINGS_SECTION,
            type: SettingItemType.String,
            public: true,
            value: '',
            secure: true,
            label: 'API Key',
            description: 'API 密钥（加密存储）'
        },
        'aiModel': {
            section: SETTINGS_SECTION,
            type: SettingItemType.String,
            public: true,
            value: 'gpt-4o-mini',
            label: 'AI 模型名称',
            description: '使用的 AI 模型，如 gpt-4o, gpt-4o-mini, claude-3-sonnet 等'
        },

        // Writing Goals
        'defaultDailyGoal': {
            section: SETTINGS_SECTION,
            type: SettingItemType.Int,
            public: true,
            value: 2000,
            minimum: 100,
            maximum: 50000,
            step: 100,
            label: '默认每日字数目标',
            description: '新建项目时的默认每日写作字数目标'
        },
        'defaultTotalGoal': {
            section: SETTINGS_SECTION,
            type: SettingItemType.Int,
            public: true,
            value: 100000,
            minimum: 1000,
            maximum: 1000000,
            step: 1000,
            label: '默认总字数目标',
            description: '新建项目时的默认总字数目标'
        },

        // Custom Templates (advanced)
        'customChapterTemplate': {
            section: SETTINGS_SECTION,
            type: SettingItemType.String,
            public: true,
            value: '',
            label: '自定义章节模板',
            description: '留空使用默认模板。支持占位符：{{TITLE}}, {{DATE}}, {{ORDER}}'
        },

        // Daily Records Storage (internal)
        'writingStudio.dailyRecords': {
            section: SETTINGS_SECTION,
            type: SettingItemType.String,
            public: false,
            value: '{"records":[],"lastUpdated":""}',
            label: '每日写作记录',
            description: '存储每日写作统计数据（内部使用）'
        },

        // Sensitive Words
        'sensitiveWords': {
            section: SETTINGS_SECTION,
            type: SettingItemType.String,
            public: true,
            value: '',
            label: '敏感词列表',
            description: '用逗号分隔的敏感词，如：政治,暴力,色情'
        },

        // Daily Snapshots (internal)
        'writingStudio.dailySnapshots': {
            section: SETTINGS_SECTION,
            type: SettingItemType.String,
            public: false,
            value: '[]',
            label: '每日快照',
            description: '存储每日字数快照（内部使用）'
        }
    });
}

/**
 * Get current plugin settings
 */
export async function getSettings(): Promise<PluginSettings> {
    return {
        aiBaseUrl: await joplin.settings.value('aiBaseUrl'),
        aiApiKey: await joplin.settings.value('aiApiKey'),
        aiModel: await joplin.settings.value('aiModel'),
        dailyGoal: await joplin.settings.value('defaultDailyGoal'),
        enableAI: await joplin.settings.value('aiEnabled')
    };
}
