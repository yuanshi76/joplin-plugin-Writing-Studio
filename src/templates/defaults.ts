/**
 * Writing Studio Plugin - Default Templates
 * Contains the default template content for each note type
 * Note: Type identification now uses Joplin tags instead of frontmatter
 */

export const TEMPLATES = {
    project: `# {{TITLE}}

## 简介
（在此描述你的故事概要）

## 写作目标
- 每日目标：2000 字
- 总字数目标：100000 字

## 备注
`,

    chapter: `# {{TITLE}}

## 本章大纲
（在此描述本章内容摘要）

---

`,

    character: `# {{TITLE}}

## 基本信息
- **年龄**：
- **性别**：
- **外貌**：

## 性格特点

## 背景故事

## 人物关系
`,

    timeline: `# {{TITLE}}

## 事件日期


## 事件描述

## 涉及人物
`,

    setting: `# {{TITLE}}

## 描述

## 相关地点

## 相关人物
`
};

/**
 * Template placeholders that will be replaced when creating notes
 */
export const PLACEHOLDERS = {
    TITLE: '{{TITLE}}',
    DATE: '{{DATE}}',
    ORDER: '{{ORDER}}'
};
