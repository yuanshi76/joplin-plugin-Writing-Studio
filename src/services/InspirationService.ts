/**
 * Writing Studio Plugin - Inspiration Service
 * Manages inspiration notes as a separate collection that AI can reference
 */

import joplin from 'api';
import { tagService } from './TagService';

/**
 * Inspiration prompt categories
 */
export type InspirationCategory =
    | 'scene'      // 场景
    | 'character'  // 人物
    | 'conflict'   // 冲突
    | 'emotion'    // 情感
    | 'opening'    // 开头
    | 'twist';     // 转折

/**
 * Inspiration prompt templates
 */
const PROMPTS: Record<InspirationCategory, string[]> = {
    scene: [
        '一个荒废的图书馆，书架上长满了苔藓',
        '午夜的地铁站，只有一个神秘的乘客',
        '暴风雨中的灯塔，灯光忽明忽暗',
        '一座古老的钟楼，时钟永远停在十二点',
        '废弃的游乐园，旋转木马突然转动起来',
        '被遗忘的阁楼，布满灰尘的镜子',
        '大雪封山的寺庙，传来木鱼声',
        '荒芜的庭院，一棵枯死的老树',
        '海边的悬崖，一座孤独的灯塔',
        '繁华都市中的一条幽深小巷'
    ],
    character: [
        '一个失去记忆的老人，口袋里有一把神秘的钥匙',
        '能听懂动物语言的自闭症少年',
        '白天是普通职员，夜晚变成另一个人的中年男子',
        '一位拥有预知能力却无人相信的盲人',
        '死后才发现自己是鬼魂的年轻女孩',
        '能看透谎言却选择沉默的心理医生',
        '每次入睡就会穿越到不同时代的失眠患者',
        '被诅咒永远保持十八岁的千年少女',
        '拥有完美记忆却只想遗忘的大学教授',
        '能修复一切却无法修复自己心灵的工匠'
    ],
    conflict: [
        '最信任的人是最大的背叛者',
        '拯救世界需要牺牲最爱的人',
        '揭露真相意味着毁掉自己的一切',
        '选择复仇还是原谅，两者都有代价',
        '为了保护秘密，不得不伤害无辜的人',
        '两个挚友必须为同一个职位竞争',
        '真爱与家族的期望完全矛盾',
        '坚持正义会让全家陷入危险',
        '承认错误意味着失去所有地位',
        '帮助陌生人可能会暴露自己的秘密身份'
    ],
    emotion: [
        '久别重逢后发现彼此已经面目全非',
        '在葬礼上突然想起逝者从未说出口的话',
        '多年后回到故乡，一切物是人非',
        '发现父母一直隐瞒的重大秘密',
        '意识到自己一直追求的东西毫无意义',
        '在绝望中收到一封改变命运的信',
        '终于向暗恋多年的人告白',
        '独自面对无法与人分享的巨大痛苦',
        '在最低谷时遇到改变人生的贵人',
        '为了梦想放弃安稳生活的那一刻'
    ],
    opening: [
        '"如果你正在读这封信，那说明我已经死了。"',
        '那一天，天空下起了红色的雨。',
        '她第一百次从同一个噩梦中惊醒。',
        '没有人知道那扇门通向哪里，直到有人打开了它。',
        '我杀死了那个人，但我不后悔。',
        '时钟正走着，突然逆转了方向。',
        '他们说这座城市没有秘密，但我知道他们在撒谎。',
        '那本日记的第一页只写了一个字：逃。',
        '镜子里的自己微微笑了，但我并没有笑。',
        '火车开动的那一刻，我知道再也回不去了。'
    ],
    twist: [
        '主人公发现「对手」其实是多年前失散的亲人',
        '所谓的「现实」不过是临死前的走马灯',
        '拯救者才是真正的幕后黑手',
        '时间在这个故事里是倒流的',
        '主角以为自己在营救人质，其实自己才是人质',
        '那个「想象中的朋友」其实一直都是真实存在的',
        '整个故事其实是一本书中书',
        '以为死去的人其实一直都活着',
        '可靠的叙述者被证明一直在说谎',
        '敌人的动机其实比主角更正义'
    ]
};

const CATEGORY_NAMES: Record<InspirationCategory, string> = {
    scene: '🏞️ 场景',
    character: '👤 人物',
    conflict: '⚔️ 冲突',
    emotion: '💭 情感',
    opening: '📖 开头',
    twist: '🔄 转折'
};

/**
 * Inspiration note in user's collection
 */
export interface InspirationNote {
    id: string;
    title: string;
    content: string;
}

/**
 * Inspiration Service class
 */
export class InspirationService {
    private readonly INSPIRATION_TAG = 'ws/inspiration';

    /**
     * Get random prompt from a category
     */
    getRandomPrompt(category: InspirationCategory): string {
        const prompts = PROMPTS[category];
        const index = Math.floor(Math.random() * prompts.length);
        return prompts[index];
    }

    /**
     * Get random prompt from any category
     */
    getRandomAnyPrompt(): { category: InspirationCategory; prompt: string } {
        const categories = Object.keys(PROMPTS) as InspirationCategory[];
        const category = categories[Math.floor(Math.random() * categories.length)];
        return {
            category,
            prompt: this.getRandomPrompt(category)
        };
    }

    /**
     * Get multiple random prompts
     */
    getMultiplePrompts(count: number = 3): Array<{ category: InspirationCategory; prompt: string }> {
        const results: Array<{ category: InspirationCategory; prompt: string }> = [];
        const usedPrompts = new Set<string>();

        while (results.length < count) {
            const item = this.getRandomAnyPrompt();
            if (!usedPrompts.has(item.prompt)) {
                usedPrompts.add(item.prompt);
                results.push(item);
            }
        }

        return results;
    }

    /**
     * Get category display name
     */
    getCategoryName(category: InspirationCategory): string {
        return CATEGORY_NAMES[category];
    }

    /**
     * Save an inspiration to user's collection
     */
    async saveInspiration(title: string, content: string, folderId: string): Promise<string> {
        // Create the note
        const note = await joplin.data.post(['notes'], null, {
            title: `💡 ${title}`,
            body: content,
            parent_id: folderId
        });

        // Add inspiration tag
        const tagId = await tagService.getOrCreateTag(this.INSPIRATION_TAG);
        await joplin.data.post(['tags', tagId, 'notes'], null, { id: note.id });

        return note.id;
    }

    /**
     * Get all user's saved inspirations
     */
    async getSavedInspirations(): Promise<InspirationNote[]> {
        const notes: InspirationNote[] = [];

        // Find the inspiration tag
        let tagId: string | null = null;
        let page = 1;
        let hasMore = true;

        while (hasMore && !tagId) {
            const result = await joplin.data.get(['tags'], {
                fields: ['id', 'title'],
                page
            });

            for (const tag of result.items) {
                if (tag.title === this.INSPIRATION_TAG) {
                    tagId = tag.id;
                    break;
                }
            }

            hasMore = result.has_more;
            page++;
        }

        if (!tagId) return notes;

        // Get all notes with this tag
        page = 1;
        hasMore = true;

        while (hasMore) {
            const result = await joplin.data.get(['tags', tagId, 'notes'], {
                fields: ['id', 'title', 'body'],
                page
            });

            for (const note of result.items) {
                notes.push({
                    id: note.id,
                    title: note.title.replace(/^💡\s*/, ''),
                    content: note.body
                });
            }

            hasMore = result.has_more;
            page++;
        }

        return notes;
    }

    /**
     * Get inspiration context for AI (combines all saved inspirations)
     */
    async getInspirationContext(): Promise<string> {
        const inspirations = await this.getSavedInspirations();
        if (inspirations.length === 0) return '';

        const context = inspirations.map(i => `【${i.title}】\n${i.content}`).join('\n\n---\n\n');
        return `\n\n## 作者的灵感库\n${context}`;
    }
}

// Singleton instance
export const inspirationService = new InspirationService();
