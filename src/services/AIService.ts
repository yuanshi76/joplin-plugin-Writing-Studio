/**
 * Writing Studio Plugin - AI Service
 * Handles AI-powered writing assistance via OpenAI-compatible API
 */

import joplin from 'api';
import { getSettings } from '../settings/pluginSettings';

/**
 * AI response structure
 */
interface AIResponse {
    success: boolean;
    content?: string;
    error?: string;
}

/**
 * Chat message format
 */
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * AI Service class
 */
export class AIService {
    /**
     * Make a request to the AI API
     */
    private async makeRequest(messages: ChatMessage[], maxTokens: number = 1000): Promise<AIResponse> {
        const settings = await getSettings();

        if (!settings.enableAI) {
            return { success: false, error: 'AI 功能未启用，请在设置中开启' };
        }

        if (!settings.aiApiKey) {
            return { success: false, error: '请先在设置中配置 API Key' };
        }

        const url = `${settings.aiBaseUrl}/chat/completions`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.aiApiKey}`
                },
                body: JSON.stringify({
                    model: settings.aiModel,
                    messages,
                    max_tokens: maxTokens,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('AI API error:', errorText);
                return { success: false, error: `API 请求失败: ${response.status}` };
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                return { success: false, error: 'AI 返回内容为空' };
            }

            return { success: true, content };
        } catch (error) {
            console.error('AI request failed:', error);
            return { success: false, error: `请求失败: ${error}` };
        }
    }

    /**
     * Continue writing from the given context
     */
    async continueWriting(context: string, hint?: string): Promise<AIResponse> {
        const systemPrompt = `你是一位专业的小说写作助手。你的任务是根据给定的上下文继续创作。
要求：
- 保持与上下文一致的写作风格和语气
- 自然地延续故事情节
- 文笔流畅，描写生动
- 只输出续写内容，不要任何解释或标注`;

        const userPrompt = hint
            ? `请根据以下上下文续写，续写方向：${hint}\n\n上下文：\n${context}`
            : `请根据以下上下文自然地续写：\n\n${context}`;

        return this.makeRequest([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 800);
    }

    /**
     * Polish/improve the given text
     */
    async polish(text: string, style?: 'formal' | 'literary' | 'concise'): Promise<AIResponse> {
        const styleGuides: Record<string, string> = {
            formal: '使用更正式、书面化的表达',
            literary: '增加文学性，使用更优美的修辞和描写',
            concise: '精简语言，使表达更加简洁有力'
        };

        const styleHint = style ? styleGuides[style] : '提升文字质量，使表达更加流畅优美';

        const systemPrompt = `你是一位专业的文字润色专家。你的任务是改进给定的文字。
要求：
- ${styleHint}
- 保持原文的核心意思和情感
- 修正语法和用词问题
- 只输出润色后的文字，不要任何解释`;

        return this.makeRequest([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请润色以下文字：\n\n${text}` }
        ], 1000);
    }

    /**
     * Generate a chapter synopsis
     */
    async generateSynopsis(chapterContent: string): Promise<AIResponse> {
        const systemPrompt = `你是一位专业的编辑助手。请为给定的章节内容生成一个简洁的大纲摘要。
要求：
- 摘要长度在50-150字之间
- 概括主要情节和关键事件
- 提及涉及的主要人物
- 只输出摘要内容`;

        return this.makeRequest([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请为以下章节内容生成摘要：\n\n${chapterContent}` }
        ], 200);
    }

    /**
     * Expand a brief description into detailed text
     */
    async expand(brief: string, targetLength: number = 300): Promise<AIResponse> {
        const systemPrompt = `你是一位专业的小说写作助手。请将给定的简短描述扩展成详细的叙述。
要求：
- 目标长度约 ${targetLength} 字
- 添加细节描写和感官描述
- 丰富人物动作和心理
- 保持原意的同时增加可读性
- 只输出扩展后的内容`;

        return this.makeRequest([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: brief }
        ], Math.round(targetLength * 1.5));
    }

    /**
     * Get writing suggestions for the current text
     */
    async getSuggestions(text: string): Promise<AIResponse> {
        const systemPrompt = `你是一位专业的写作导师。请分析给定的文字并提供改进建议。
要求：
- 指出2-3个可以改进的地方
- 每条建议简明扼要
- 提供具体的修改方向
- 使用友好鼓励的语气`;

        return this.makeRequest([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请分析以下文字并给出写作建议：\n\n${text}` }
        ], 500);
    }
}

// Singleton instance
export const aiService = new AIService();
