// Application State
const AppState = {
    currentDimension: 'mind-overview',
    reportData: {},
    chatHistory: [],
    isLoading: false
};

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const elements = {
    navItems: document.querySelectorAll('.nav-item'),
    dimensionContents: document.querySelectorAll('.dimension-content'),
    messageStream: document.getElementById('message-stream'),
    chatInput: document.getElementById('chat-input'),
    sendButton: document.getElementById('send-button'),
    suggestionChips: document.querySelectorAll('.suggestion-chip'),
    keywordCloud: document.getElementById('keyword-cloud')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log('Initializing Mind Elixir Application...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    await loadReportData();
    
    // Initialize chat
    initializeChat();
    
    console.log('Application initialized successfully');
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation items
    elements.navItems.forEach(item => {
        item.addEventListener('click', handleDimensionSwitch);
    });
    
    // Chat input
    elements.chatInput.addEventListener('keypress', handleChatInputKeypress);
    elements.sendButton.addEventListener('click', handleSendMessage);
    
    // Suggestion chips
    elements.suggestionChips.forEach(chip => {
        chip.addEventListener('click', handleSuggestionClick);
    });
    
    // Action button
    const actionButton = document.querySelector('.action-button');
    if (actionButton) {
        actionButton.addEventListener('click', handleActionButtonClick);
    }
}

// Navigation Functions
function handleDimensionSwitch(event) {
    const clickedItem = event.currentTarget;
    const dimension = clickedItem.dataset.dimension;
    
    if (dimension === AppState.currentDimension) return;
    
    // Update navigation state
    elements.navItems.forEach(item => item.classList.remove('active'));
    clickedItem.classList.add('active');
    
    // Switch content
    elements.dimensionContents.forEach(content => {
        content.style.display = 'none';
    });
    
    const targetContent = document.getElementById(dimension);
    if (targetContent) {
        targetContent.style.display = 'block';
        AppState.currentDimension = dimension;
        
        // Load dimension-specific data if needed
        loadDimensionData(dimension);
    }
    
    console.log(`Switched to dimension: ${dimension}`);
}

// Data Loading Functions
async function loadReportData() {
    console.log('Loading report data from backend...');
    
    try {
        AppState.isLoading = true;
        
        // Load data for all five dimensions
        const dimensions = ['overview', 'bigfive', 'values', 'mood', 'journal'];
        const promises = dimensions.map(dimension => fetchDimensionData(dimension));
        
        const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
            const dimension = dimensions[index];
            if (result.status === 'fulfilled') {
                AppState.reportData[dimension] = result.value;
                console.log(`Loaded ${dimension} data successfully`);
            } else {
                console.error(`Failed to load ${dimension} data:`, result.reason);
                // Use mock data as fallback
                AppState.reportData[dimension] = getMockData(dimension);
            }
        });
        
        // Update UI with loaded data
        updateUIWithReportData();
        
    } catch (error) {
        console.error('Error loading report data:', error);
        // Use mock data as fallback
        loadMockData();
    } finally {
        AppState.isLoading = false;
    }
}

async function fetchDimensionData(dimension) {
    // Map frontend dimension names to backend API endpoints
    const dimensionEndpoints = {
        'overview': 'overview',
        'bigfive': 'big_five',
        'values': 'core_values', 
        'mood': 'mood',
        'journal': 'update'
    };
    
    const endpoint = dimensionEndpoints[dimension] || dimension;
    
    const response = await fetch(`${API_BASE_URL}/report/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

function loadDimensionData(dimension) {
    // This function can be used to load specific data when switching dimensions
    // For now, we'll just log the action
    console.log(`Loading data for dimension: ${dimension}`);
    
    // Future implementation: load dimension-specific visualizations, etc.
}

// Mock Data Functions (for development/fallback)
function loadMockData() {
    console.log('Loading mock data...');
    
    AppState.reportData = {
        overview: getMockData('overview'),
        bigfive: getMockData('bigfive'),
        values: getMockData('values'),
        mood: getMockData('mood'),
        journal: getMockData('journal')
    };
    
    updateUIWithReportData();
}

function getMockData(dimension) {
    const mockData = {
        overview: {
            title: "您的心灵画像",
            description: "一个充满好奇心和创造力的探索者",
            keywords: ["探索者", "创造力", "同理心", "成长", "平衡", "智慧", "温暖"],
            analysis: "您展现出强烈的好奇心和开放性，这使您能够从多个角度看待问题。您的同理心让您在人际关系中表现出色，而您对成长的渴望推动着您不断前进。",
            actionGuide: "今天尝试与一位陌生人进行一次有意义的对话，或者花10分钟时间反思今天学到的新知识。"
        },
        bigfive: {
            scores: {
                openness: 85,
                conscientiousness: 72,
                extraversion: 68,
                agreeableness: 79,
                neuroticism: 45
            },
            radarLabels: ["开放性", "尽责性", "外向性", "宜人性", "神经质"],
            radarData: [4.2, 3.6, 3.4, 4.0, 2.8],
            personalityType: "平衡型实干家",
            personalityDescription: "您是一个富有创造力且脚踏实地的人。高开放性让您对新事物充满好奇，愿意尝试不同的想法和体验，这使您在面对变化时能够保持灵活性。适中的尽责性表明您既有计划性又不过分拘泥于细节，能够在目标导向和灵活应变之间找到平衡。您的宜人性较高，表现出对他人的关心和合作精神，这让您在团队中备受欢迎。相对较低的神经质水平显示您情绪稳定，能够在压力下保持冷静。总体而言，您是一个既有创新思维又能务实执行的人。",
            lifestyleSuggestions: [
                "保持学习新技能的习惯，每月尝试一个新的兴趣爱好",
                "建立灵活的日程安排，为突发的创意想法留出时间",
                "定期与朋友聚会，维护良好的社交关系",
                "创建一个舒适的工作环境，激发创造力",
                "保持工作与生活的平衡，避免过度承诺"
            ],
            actionSuggestions: [
                "每周花2小时探索一个全新的领域或话题",
                "建立每日反思习惯，记录当天的收获和感悟",
                "主动参与团队项目，发挥您的协调能力",
                "设定可达成的短期目标，逐步建立成就感",
                "练习正念冥想，进一步提升情绪稳定性"
            ],
            developmentShortTerm: "在接下来的1-4周内，建议您专注于提升时间管理技能。可以尝试使用番茄工作法来提高专注度，同时每天安排30分钟的创意时间，用于探索新想法或学习新技能。此外，主动在工作中承担一个小型协调任务，发挥您的团队合作优势。",
            developmentLongTerm: "未来1-6个月的发展重点是建立个人品牌和专业影响力。利用您的开放性和创造力，开始一个个人项目或博客，分享您的见解和经验。同时，寻找导师或加入专业社群，扩展您的人际网络。考虑参加相关的培训课程，将您的创新思维转化为具体的专业技能。",
            developmentCareerIntegration: "结合您当前的职业发展，建议在现有岗位上寻找更多创新机会，提出改进建议或新的解决方案。您的平衡型特质使您适合担任项目协调或跨部门合作的角色。",
            careerOverview: "您的人格特质使您特别适合需要创新思维和团队协作的职业环境。您既能够独立思考产生新想法，又能够与他人有效合作将想法付诸实践。适合在变化较快、需要持续学习和适应的行业中发展，如科技、创意、咨询或教育领域。",
            careerRecommendations: [
                "产品经理 - 结合创新思维和执行能力",
                "用户体验设计师 - 发挥创造力和同理心",
                "项目协调员 - 利用团队合作和组织能力",
                "培训师或教育工作者 - 结合开放性和宜人性",
                "创业顾问 - 平衡创新和实用性"
            ],
            careerAvoid: [
                "高度重复性的流水线工作 - 可能限制您的创造力发挥",
                "极度高压的销售岗位 - 可能与您的协作风格不符",
                "严格等级制度的传统机构 - 可能限制您的灵活性"
            ],
            socialPrediction: "在社交场合中，您很可能是那个既能提出有趣想法又能照顾他人感受的人。您的高开放性使您对不同的观点和文化保持好奇，容易与各种背景的人建立联系。适中的外向性意味着您既享受社交也需要独处时间来充电。您的高宜人性让您成为很好的倾听者和调解者，朋友们经常向您寻求建议。在冲突情况下，您倾向于寻找双赢的解决方案而非对抗。",
            socialTips: [
                "利用您的开放性，主动了解他人的不同观点和经历",
                "在团队讨论中发挥调解作用，帮助化解分歧",
                "定期安排独处时间，平衡社交活动和个人充电",
                "分享您的创意想法，但也要倾听他人的反馈",
                "在社交场合中主动介绍不同的人相互认识",
                "保持对新社交圈子的开放态度，扩展人际网络"
            ],
            disclaimer: "此分析由AI模型生成，仅供参考和自我探索，不构成专业的心理诊断或建议。如有需要，请咨询专业心理咨询师。"
        },
        values: {
            valueOrder: ["善行", "自主", "成就", "安全", "普世"],
            valueAnalysis: "您的价值观体系展现出强烈的人文关怀特质。'善行'作为您的核心价值观，驱动着您在人际关系中表现出极强的同理心和助人倾向，这使您在团队合作中往往扮演支持者和协调者的角色。'自主'价值观让您在决策时更倾向于独立思考，不轻易受外界影响，这种特质在创新和问题解决方面为您提供了独特优势。当这些价值观得到满足时，您会感到内心充实和幸福；反之，若长期忽视帮助他人或失去自主权，可能会产生愧疚感和焦虑情绪。",
            valueGuide: "针对您的核心价值观，建议以下实践方法：1）善行实践：每周三晚上与家人进行1次深度对话，记录对方的需求并尝试提供1个小帮助，这能强化您的关爱价值观与日常生活的联结。2）自主强化：每天早晨花10分钟独立制定当日计划，避免被他人的安排完全主导，培养独立决策的习惯。3）成就导向：设定每月一个可量化的个人目标，并记录达成过程，让成就感成为持续前进的动力。"
        },
        mood: {
            reportGeneratedDate: "2023-10-27",
            overallCurrentMood: "平静与满足",
            moodHistory: [
                { "date": "2023-10-14", "moodScore": 8.0, "moodDescription": "周末愉快，精力充沛" },
                { "date": "2023-10-15", "moodScore": 8.5, "moodDescription": "享受家庭时光，感觉平和" },
                { "date": "2023-10-16", "moodScore": 7.5, "moodDescription": "周一工作顺利，略有挑战但应对自如" },
                { "date": "2023-10-17", "moodScore": 8.2, "moodDescription": "完成重要任务，成就感满满" },
                { "date": "2023-10-18", "moodScore": 7.8, "moodDescription": "日常平稳，保持积极心态" },
                { "date": "2023-10-19", "moodScore": 8.0, "moodDescription": "与同事交流融洽，工作效率高" },
                { "date": "2023-10-20", "moodScore": 8.5, "moodDescription": "期待周末，心情轻松" },
                { "date": "2023-10-21", "moodScore": 9.0, "moodDescription": "户外活动，身心放松" },
                { "date": "2023-10-22", "moodScore": 8.8, "moodDescription": "享受阅读，沉浸在自我空间" },
                { "date": "2023-10-23", "moodScore": 7.7, "moodDescription": "新一周开始，充满活力" },
                { "date": "2023-10-24", "moodScore": 8.1, "moodDescription": "解决一个长期问题，感觉轻松" },
                { "date": "2023-10-25", "moodScore": 7.9, "moodDescription": "日常有序，情绪稳定" },
                { "date": "2023-10-26", "moodScore": 8.3, "moodDescription": "与朋友聚餐，心情愉悦" },
                { "date": "2023-10-27", "moodScore": 8.0, "moodDescription": "对未来充满期待，保持平和" }
            ],
            chartDetails: {
                chartTitle: "近两周情绪波动趋势：积极且稳定",
                moodScoreScale: "情绪评分范围1-10，分数越高代表情绪越积极、稳定。"
            },
            emotionalToolbox: {
                moodAnalysis: "我们发现，你近期的情绪状态非常积极和稳定，这表明你拥有很强的心理韧性和良好的情绪管理能力。即使面对挑战，你也能保持乐观并迅速调整。你的情绪模式非常健康，值得称赞。",
                actionGuide: "情绪工具箱：请继续保持你当前健康的生活习惯，如规律作息、适度运动和积极社交。可以尝试引入一些新的爱好或小目标，为生活增添更多乐趣和新鲜感，让积极的情绪保持流动。同时，记得定期记录那些让你感到满足和快乐的瞬间，强化积极的心理循环。"
            },
            disclaimer: "此分析由AI模型生成，仅供参考和自我探索，不构成专业的心理诊断或建议。如有需要，请咨询专业心理咨询师。"
        },
        journal: [
            {
                timeline: [
                    {"date": "2025-03-12", "updateReason": "首次焦虑情绪基线记录"},
                    {"date": "2025-04-05", "updateReason": "认知重构练习初期反馈"},
                    {"date": "2025-05-20", "updateReason": "惊恐发作频率下降记录"},
                    {"date": "2025-07-01", "updateReason": "应对策略自主应用复盘"}
                ],
                keyWordsOfPastChatHistory: ["灾难化思维", "呼吸调节", "认知解离", "安全感建立", "情绪耐受"],
                guideToAction: {
                    prompt: "结合时间线中情绪变化节点和关键词，你发现哪种心理调节方法最适合自己？如何进一步强化？",
                    textBox: "记录你的应对心得..."
                }
            },
            {
                timeline: [
                    {"date": "2025-01-20", "updateReason": "童年创伤记忆初步梳理"},
                    {"date": "2025-03-08", "updateReason": "依恋模式识别报告"},
                    {"date": "2025-05-15", "updateReason": "内在小孩对话练习记录"},
                    {"date": "2025-06-30", "updateReason": "创伤闪回频率下降复盘"}
                ],
                keyWordsOfPastChatHistory: ["情感隔离", "安全感缺失", "自我关怀", "情绪宣泄", "和解尝试"],
                guideToAction: {
                    prompt: "观察时间线中创伤相关记录的变化，哪些关键词对应的练习让你感受到内在力量的增长？",
                    textBox: "点击'写下感悟'展开输入框"
                }
            },
            {
                timeline: [
                    {"date": "2025-04-10", "updateReason": "人际关系模式卡点记录"},
                    {"date": "2025-04-28", "updateReason": "边界感建立练习反馈"},
                    {"date": "2025-06-05", "updateReason": "冲突应对方式改善记录"},
                    {"date": "2025-07-12", "updateReason": "亲密关系信任重建进展"}
                ],
                keyWordsOfPastChatHistory: ["讨好型人格", "拒绝困难", "情绪勒索", "自我价值感", "健康边界"],
                guideToAction: {
                    prompt: "从人际关系卡点到信任重建，哪些关键词对应的改变让你觉得最有疗愈意义？如何巩固这种变化？",
                    textBox: "支持500字内输入，自动保存为私密笔记"
                }
            }
        ]
    };
    
    return mockData[dimension] || {};
}

// UI Update Functions
function updateUIWithReportData() {
    console.log('Updating UI with report data...');
    
    // Update keyword cloud
    updateKeywordCloud();
    
    // Update analysis and action content
    updateInsightActionCard();
    
    // Update values page
    updateValuesPage();
    
    // Update big five page
    updateBigFivePage();
    
    // Update growth journal page
    updateGrowthJournalPage();
    
    // Update mood barometer page
    updateMoodBarometerPage();
    
    console.log('UI updated successfully');
}

function updateKeywordCloud() {
    const overviewData = AppState.reportData.overview;
    if (!overviewData || !overviewData.keywords) return;
    
    const keywordCloud = elements.keywordCloud;
    if (!keywordCloud) return;
    
    // Clear existing keywords
    keywordCloud.innerHTML = '';
    
    // Add new keywords
    overviewData.keywords.forEach((keyword, index) => {
        const keywordElement = document.createElement('span');
        keywordElement.className = 'keyword';
        keywordElement.textContent = keyword;
        keywordElement.style.animationDelay = `${index * 0.2}s`;
        keywordCloud.appendChild(keywordElement);
    });
}

function updateInsightActionCard() {
    const overviewData = AppState.reportData.overview;
    if (!overviewData) return;
    
    // Update analysis content
    const analysisContent = document.querySelector('.analysis-content');
    if (analysisContent && overviewData.analysis) {
        analysisContent.textContent = overviewData.analysis;
    }
    
    // Update action content
    const actionContent = document.querySelector('.action-content');
    if (actionContent && overviewData.actionGuide) {
        actionContent.textContent = overviewData.actionGuide;
    }
}

// Chat Functions
function initializeChat() {
    console.log('Initializing chat system...');
    
    // Add welcome message if not already present
    if (AppState.chatHistory.length === 0) {
        const welcomeMessage = {
            type: 'ai',
            content: '您好！我是您的AI心理助手。我可以帮助您更好地理解心理报告，或者与您探讨任何心理健康相关的话题。有什么我可以帮助您的吗？',
            timestamp: new Date()
        };
        
        AppState.chatHistory.push(welcomeMessage);
        renderChatHistory();
    }
}

function handleChatInputKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
}

async function handleSendMessage() {
    const input = elements.chatInput;
    const message = input.value.trim();
    
    if (!message || AppState.isLoading) return;
    
    // Add user message to history
    const userMessage = {
        type: 'user',
        content: message,
        timestamp: new Date()
    };
    
    AppState.chatHistory.push(userMessage);
    input.value = '';
    
    // Render updated chat
    renderChatHistory();
    
    // Send message to backend
    await sendMessageToAI(message);
}

async function sendMessageToAI(message) {
    try {
        AppState.isLoading = true;
        elements.sendButton.disabled = true;
        
        // Add typing indicator
        addTypingIndicator();
        
        // Prepare history in the format expected by backend
        const history = AppState.chatHistory
            .slice(-10) // Send last 10 messages for context
            .map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
        
        const response = await fetch(`${API_BASE_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: history
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Handle streaming response
        await handleStreamingResponse(response);
        
    } catch (error) {
        console.error('Error sending message to AI:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add error message
        const errorMessage = {
            type: 'ai',
            content: '抱歉，我现在无法连接到服务器。请检查网络连接后重试。',
            timestamp: new Date()
        };
        
        AppState.chatHistory.push(errorMessage);
        renderChatHistory();
        
    } finally {
        AppState.isLoading = false;
        elements.sendButton.disabled = false;
    }
}

function handleSuggestionClick(event) {
    const suggestion = event.target.textContent;
    elements.chatInput.value = suggestion;
    handleSendMessage();
}

function renderChatHistory() {
    const messageStream = elements.messageStream;
    if (!messageStream) return;
    
    // Clear existing messages (except typing indicator)
    const typingIndicator = messageStream.querySelector('.typing-indicator');
    messageStream.innerHTML = '';
    
    // Render all messages
    AppState.chatHistory.forEach(message => {
        const messageElement = createMessageElement(message);
        messageStream.appendChild(messageElement);
    });
    
    // Re-add typing indicator if it existed
    if (typingIndicator) {
        messageStream.appendChild(typingIndicator);
    }
    
    // Scroll to bottom
    messageStream.scrollTop = messageStream.scrollHeight;
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}-message`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    // Render markdown for AI messages, plain text for user messages
    if (message.type === 'ai' && typeof marked !== 'undefined') {
        bubbleDiv.innerHTML = renderMarkdown(message.content);
    } else {
        bubbleDiv.textContent = message.content;
    }
    
    messageDiv.appendChild(bubbleDiv);
    return messageDiv;
}

function addTypingIndicator() {
    const messageStream = elements.messageStream;
    if (!messageStream) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = '正在思考<span class="dots">...</span>';
    
    typingDiv.appendChild(bubbleDiv);
    messageStream.appendChild(typingDiv);
    messageStream.scrollTop = messageStream.scrollHeight;
    
    // Add CSS animation for dots
    const style = document.createElement('style');
    style.textContent = `
        .dots {
            animation: typing 1.5s infinite;
        }
        @keyframes typing {
            0%, 60% { opacity: 1; }
            30% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
}

function removeTypingIndicator() {
    const typingIndicator = elements.messageStream.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle streaming response from AI
async function handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Remove typing indicator and prepare for streaming
    removeTypingIndicator();
    
    // Create AI message placeholder
    const aiMessage = {
        type: 'ai',
        content: '',
        timestamp: new Date()
    };
    
    AppState.chatHistory.push(aiMessage);
    
    // Create streaming message element
    const streamingMessageElement = createStreamingMessageElement();
    elements.messageStream.appendChild(streamingMessageElement);
    elements.messageStream.scrollTop = elements.messageStream.scrollHeight;
    
    let accumulatedContent = '';
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    
                    if (data === '[DONE]') {
                        // Stream completed
                        break;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        
                        if (parsed.type === 'content' && parsed.content) {
                            accumulatedContent += parsed.content;
                            updateStreamingMessage(streamingMessageElement, accumulatedContent);
                        } else if (parsed.type === 'error') {
                            throw new Error(parsed.error || 'Unknown streaming error');
                        }
                    } catch (parseError) {
                        if (parseError.message.includes('streaming error')) {
                            throw parseError;
                        }
                        // Ignore JSON parse errors for malformed chunks
                        console.warn('Failed to parse streaming chunk:', data);
                    }
                }
            }
        }
        
        // Update the message in history with final content
        aiMessage.content = accumulatedContent || '抱歉，我现在无法回应。请稍后再试。';
        
        // Replace streaming element with final message
        streamingMessageElement.remove();
        renderChatHistory();
        
    } catch (error) {
        console.error('Error in streaming response:', error);
        
        // Remove streaming element and add error message
        streamingMessageElement.remove();
        
        // Update the message in history with error
        aiMessage.content = '抱歉，处理回复时出现错误。请稍后再试。';
        renderChatHistory();
    }
}

// Create streaming message element for real-time display
function createStreamingMessageElement() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message streaming-message';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble streaming-bubble';
    bubbleDiv.textContent = '';
    
    // Add cursor indicator
    const cursor = document.createElement('span');
    cursor.className = 'streaming-cursor';
    cursor.textContent = '|';
    bubbleDiv.appendChild(cursor);
    
    messageDiv.appendChild(bubbleDiv);
    return messageDiv;
}

// Markdown rendering function
function renderMarkdown(content) {
    if (typeof marked === 'undefined') {
        return content; // Fallback to plain text if marked is not available
    }
    
    // Configure marked options
    marked.setOptions({
        breaks: true, // Convert line breaks to <br>
        gfm: true, // GitHub Flavored Markdown
        sanitize: false, // Allow HTML (be careful in production)
        smartLists: true,
        smartypants: true
    });
    
    try {
        return marked.parse(content);
    } catch (error) {
        console.warn('Markdown parsing error:', error);
        return content; // Fallback to plain text
    }
}

// Update streaming message content
function updateStreamingMessage(messageElement, content) {
    const bubble = messageElement.querySelector('.message-bubble');
    const cursor = bubble.querySelector('.streaming-cursor');
    
    if (bubble && cursor) {
        // For streaming, we'll render markdown in real-time
        if (typeof marked !== 'undefined') {
            bubble.innerHTML = renderMarkdown(content);
            bubble.appendChild(cursor);
        } else {
            bubble.textContent = content;
            bubble.appendChild(cursor);
        }
        
        // Scroll to bottom
        elements.messageStream.scrollTop = elements.messageStream.scrollHeight;
    }
}

// Action Button Handler
function handleActionButtonClick() {
    const button = event.target;
    const originalText = button.textContent;
    
    // Visual feedback
    button.textContent = '已完成！';
    button.style.backgroundColor = '#77BFA3';
    
    // Reset after 2 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '#B4C7D9';
    }, 2000);
    
    console.log('Action button clicked - task completed');
}

// Utility Functions
function formatTimestamp(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error Handling
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Values Page Functions
function updateValuesPage() {
    const valuesData = AppState.reportData.values;
    if (!valuesData) return;
    
    // Update values ranking
    updateValuesRanking(valuesData.valueOrder);
    
    // Update values circle diagram
    updateValuesCircle(valuesData.valueOrder);
    
    // Update top values cards
    updateTopValuesCards(valuesData.valueOrder);
    
    // Update values analysis and guide
    updateValuesInsight(valuesData);
}

function updateValuesRanking(valueOrder) {
    const rankingContainer = document.getElementById('values-ranking');
    if (!rankingContainer || !valueOrder) return;
    
    // Clear existing content
    rankingContainer.innerHTML = '';
    
    // Schwartz values definitions
    const valuesDefinitions = {
        '自主': '独立思考与行动，追求创造力、自由和好奇心',
        '刺激': '追求新奇与挑战，享受多样化生活和冒险精神',
        '享乐': '追求快乐与满足，享受生活和自我放纵',
        '成就': '通过社会认可的方式取得成功，追求能力和影响力',
        '权力': '追求社会地位与控制力，渴望财富、权威和社会影响',
        '安全': '维护社会秩序和人际关系稳定，重视社会秩序和国家安全',
        '顺从': '遵守社会规范，避免冲突，重视服从、自律和尊敬长辈',
        '传统': '尊重文化和宗教习俗，保持谦逊、虔诚和接受命运',
        '善行': '关心身边人的福祉，重视诚实、责任感和忠诚',
        '普世': '关心所有人的福祉，保护环境，追求社会正义和平等'
    };
    
    // Create ranking items
    valueOrder.forEach((value, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = `value-rank-item rank-${index + 1}`;
        
        rankItem.innerHTML = `
            <div class="value-rank-number">${index + 1}</div>
            <div class="value-rank-content">
                <div class="value-rank-name">${value}</div>
                <div class="value-rank-description">${valuesDefinitions[value] || '核心价值观'}</div>
            </div>
        `;
        
        rankingContainer.appendChild(rankItem);
    });
}

function updateValuesCircle(valueOrder) {
    const valuePointsGroup = document.getElementById('value-points');
    if (!valuePointsGroup || !valueOrder) return;
    
    // Clear existing points
    valuePointsGroup.innerHTML = '';
    
    // Schwartz circle positions (10 values arranged in circle)
    const allValues = ['权力', '成就', '享乐', '刺激', '自主', '普世', '善行', '传统', '顺从', '安全'];
    const angleStep = (2 * Math.PI) / 10;
    const radius = 100;
    const centerX = 150;
    const centerY = 150;
    
    allValues.forEach((value, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Check if this value is in user's top 5
        const userRank = valueOrder.indexOf(value);
        const isTopValue = userRank !== -1;
        const intensity = isTopValue ? (6 - userRank) / 5 : 0.2; // Higher rank = higher intensity
        
        // Create value point
        const pointGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pointGroup.setAttribute('class', 'value-point');
        if (isTopValue) pointGroup.classList.add('highlighted');
        
        // Create circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', isTopValue ? 8 : 4);
        circle.setAttribute('fill', `rgba(180, 199, 217, ${intensity})`);
        circle.setAttribute('stroke', '#B4C7D9');
        circle.setAttribute('stroke-width', isTopValue ? 2 : 1);
        
        // Create label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y - 15);
        text.setAttribute('class', 'value-label');
        text.textContent = value;
        
        pointGroup.appendChild(circle);
        pointGroup.appendChild(text);
        valuePointsGroup.appendChild(pointGroup);
        
        // Add rank indicator for top values
        if (isTopValue) {
            const rankText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rankText.setAttribute('x', x);
            rankText.setAttribute('y', y + 4);
            rankText.setAttribute('class', 'value-label');
            rankText.setAttribute('font-size', '10');
            rankText.setAttribute('fill', '#FFFFFF');
            rankText.textContent = userRank + 1;
            pointGroup.appendChild(rankText);
        }
    });
}

function updateTopValuesCards(valueOrder) {
    const cardsContainer = document.getElementById('values-cards-container');
    if (!cardsContainer || !valueOrder) return;
    
    // Clear existing cards
    cardsContainer.innerHTML = '';
    
    // Values details
    const valuesDetails = {
        '自主': {
            icon: '🎨',
            description: '您重视独立思考和创造性表达，喜欢按照自己的方式做事。',
            impact: '这种价值观让您在面对选择时更倾向于相信自己的判断，在创新和解决问题方面表现出色。'
        },
        '刺激': {
            icon: '⚡',
            description: '您渴望新鲜体验和挑战，不喜欢一成不变的生活。',
            impact: '这驱动您主动寻求变化和冒险，让生活充满活力和可能性。'
        },
        '享乐': {
            icon: '🌟',
            description: '您认为享受生活的美好时光是重要的，追求快乐和满足感。',
            impact: '这让您更容易发现生活中的美好，保持积极乐观的心态。'
        },
        '成就': {
            icon: '🏆',
            description: '您追求卓越表现，希望通过能力和努力获得认可。',
            impact: '这激励您不断提升自己，在工作和学习中表现出强烈的进取心。'
        },
        '权力': {
            icon: '👑',
            description: '您希望在社会中拥有影响力和地位，能够影响他人和环境。',
            impact: '这推动您承担领导责任，在团队中发挥引导和决策作用。'
        },
        '安全': {
            icon: '🛡️',
            description: '您重视稳定和安全，希望生活和环境是可预测和可控的。',
            impact: '这让您在做决定时更加谨慎，注重风险管理和长期规划。'
        },
        '顺从': {
            icon: '🤝',
            description: '您尊重规则和权威，避免与他人发生冲突。',
            impact: '这使您在团队中表现出良好的协作精神，维护和谐的人际关系。'
        },
        '传统': {
            icon: '🏛️',
            description: '您尊重文化传统和既定的做事方式，重视历史和传承。',
            impact: '这让您在变化中保持稳定的价值观，成为文化和智慧的传承者。'
        },
        '善行': {
            icon: '❤️',
            description: '您关心他人的福祉，愿意帮助身边的人。',
            impact: '这让您在人际关系中表现出温暖和同理心，成为他人的支持者。'
        },
        '普世': {
            icon: '🌍',
            description: '您关心全人类的福祉和环境保护，追求公平正义。',
            impact: '这驱动您关注社会问题，为创造更美好的世界贡献力量。'
        }
    };
    
    // Create cards for top 3 values
    const topThreeValues = valueOrder.slice(0, 3);
    topThreeValues.forEach((value, index) => {
        const details = valuesDetails[value];
        if (!details) return;
        
        const card = document.createElement('div');
        card.className = 'value-card';
        
        card.innerHTML = `
            <div class="value-card-header">
                <div class="value-card-icon">${details.icon}</div>
                <div class="value-card-title">${value}</div>
                <div class="value-card-rank">第${index + 1}位</div>
            </div>
            <div class="value-card-description">${details.description}</div>
            <div class="value-card-impact">
                <div class="value-card-impact-title">对您的影响</div>
                <div class="value-card-impact-text">${details.impact}</div>
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });
}

function updateValuesInsight(valuesData) {
    // Update analysis content
    const analysisContent = document.getElementById('values-analysis-content');
    if (analysisContent && valuesData.valueAnalysis) {
        analysisContent.textContent = valuesData.valueAnalysis;
    }
    
    // Update guide content
    const guideContent = document.getElementById('values-guide-content');
    if (guideContent && valuesData.valueGuide) {
        guideContent.textContent = valuesData.valueGuide;
    }
}

// Big Five Personality Page Functions
function updateBigFivePage() {
    const bigFiveData = AppState.reportData.bigfive;
    if (!bigFiveData) return;
    
    // Update personality overview
    updatePersonalityOverview(bigFiveData);
    
    // Draw radar chart
    drawRadarChart(bigFiveData);
    
    // Update suggestions
    updateSuggestions(bigFiveData);
    
    // Update development plans
    updateDevelopmentPlans(bigFiveData);
    
    // Update career insights
    updateCareerInsights(bigFiveData);
    
    // Update social insights
    updateSocialInsights(bigFiveData);
    
    // Update disclaimer
    updateDisclaimer(bigFiveData);
}

function updatePersonalityOverview(data) {
    // Update personality type badge
    const typeBadge = document.getElementById('personality-type-badge');
    if (typeBadge && data.personalityType) {
        typeBadge.textContent = data.personalityType;
    }
    
    // Update personality description
    const description = document.getElementById('personality-description');
    if (description && data.personalityDescription) {
        description.textContent = data.personalityDescription;
    }
}

function drawRadarChart(data) {
    const canvas = document.getElementById('personality-radar-chart');
    if (!canvas || !data.radarLabels || !data.radarData) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    drawRadarGrid(ctx, centerX, centerY, radius, data.radarLabels.length);
    
    // Draw data polygon
    drawRadarData(ctx, centerX, centerY, radius, data.radarData, data.radarLabels.length);
    
    // Draw labels
    drawRadarLabels(ctx, centerX, centerY, radius, data.radarLabels);
    
    // Update legend
    updateRadarLegend(data.radarLabels, data.radarData);
}

function drawRadarGrid(ctx, centerX, centerY, radius, numPoints) {
    const angleStep = (2 * Math.PI) / numPoints;
    
    // Draw concentric circles
    ctx.strokeStyle = '#EFEFEF';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
        const r = (radius * i) / 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Draw radial lines
    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function drawRadarData(ctx, centerX, centerY, radius, data, numPoints) {
    const angleStep = (2 * Math.PI) / numPoints;
    
    // Draw filled polygon
    ctx.fillStyle = 'rgba(180, 199, 217, 0.3)';
    ctx.strokeStyle = '#B4C7D9';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    
    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = data[i] || 0;
        const distance = (radius * value) / 5; // Scale to 1-5 range
        const x = centerX + distance * Math.cos(angle);
        const y = centerY + distance * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#B4C7D9';
    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = data[i] || 0;
        const distance = (radius * value) / 5;
        const x = centerX + distance * Math.cos(angle);
        const y = centerY + distance * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawRadarLabels(ctx, centerX, centerY, radius, labels) {
    const angleStep = (2 * Math.PI) / labels.length;
    
    ctx.fillStyle = '#2C3E50';
    ctx.font = '12px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    labels.forEach((label, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelRadius = radius + 30;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        
        ctx.fillText(label, x, y);
    });
}

function updateRadarLegend(labels, data) {
    const legendContainer = document.getElementById('radar-legend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = '';
    
    labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const score = data[index] ? data[index].toFixed(1) : '0.0';
        
        legendItem.innerHTML = `
            <div class="legend-color"></div>
            <span>${label}: ${score}/5.0</span>
        `;
        
        legendContainer.appendChild(legendItem);
    });
}

function updateSuggestions(data) {
    // Update lifestyle suggestions
    const lifestyleList = document.getElementById('lifestyle-suggestions');
    if (lifestyleList && data.lifestyleSuggestions) {
        lifestyleList.innerHTML = '';
        data.lifestyleSuggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            lifestyleList.appendChild(li);
        });
    }
    
    // Update action suggestions
    const actionList = document.getElementById('action-suggestions');
    if (actionList && data.actionSuggestions) {
        actionList.innerHTML = '';
        data.actionSuggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            actionList.appendChild(li);
        });
    }
}

function updateDevelopmentPlans(data) {
    // Update short-term development
    const shortTerm = document.getElementById('development-short-term');
    if (shortTerm && data.developmentShortTerm) {
        shortTerm.textContent = data.developmentShortTerm;
    }
    
    // Update long-term development
    const longTerm = document.getElementById('development-long-term');
    if (longTerm && data.developmentLongTerm) {
        longTerm.textContent = data.developmentLongTerm;
    }
    
    // Update career integration
    const careerIntegration = document.getElementById('development-career-integration');
    const careerCard = document.getElementById('career-integration-card');
    if (careerIntegration && data.developmentCareerIntegration) {
        careerIntegration.textContent = data.developmentCareerIntegration;
        if (careerCard) {
            careerCard.style.display = data.developmentCareerIntegration ? 'block' : 'none';
        }
    }
}

function updateCareerInsights(data) {
    // Update career overview
    const careerOverview = document.getElementById('career-overview');
    if (careerOverview && data.careerOverview) {
        careerOverview.textContent = data.careerOverview;
    }
    
    // Update career recommendations
    const recommendationsList = document.getElementById('career-recommendations');
    if (recommendationsList && data.careerRecommendations) {
        recommendationsList.innerHTML = '';
        data.careerRecommendations.forEach(career => {
            const li = document.createElement('li');
            li.textContent = career;
            recommendationsList.appendChild(li);
        });
    }
    
    // Update career avoidance
    const avoidList = document.getElementById('career-avoid');
    if (avoidList && data.careerAvoid) {
        avoidList.innerHTML = '';
        data.careerAvoid.forEach(career => {
            const li = document.createElement('li');
            li.textContent = career;
            avoidList.appendChild(li);
        });
    }
}

function updateSocialInsights(data) {
    // Update social prediction
    const socialPrediction = document.getElementById('social-prediction');
    if (socialPrediction && data.socialPrediction) {
        socialPrediction.textContent = data.socialPrediction;
    }
    
    // Update social tips
    const socialTips = document.getElementById('social-tips');
    if (socialTips && data.socialTips) {
        socialTips.innerHTML = '';
        data.socialTips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            socialTips.appendChild(li);
        });
    }
}

function updateDisclaimer(data) {
    const disclaimer = document.getElementById('personality-disclaimer');
    if (disclaimer && data.disclaimer) {
        disclaimer.textContent = data.disclaimer;
    }
}

// Growth Journal Page Functions
function updateGrowthJournalPage() {
    const journalData = AppState.reportData.journal;
    if (!journalData || !Array.isArray(journalData)) return;
    
    // Combine all timeline data
    const allTimelines = journalData.flatMap(entry => entry.timeline);
    const allKeywords = journalData.flatMap(entry => entry.keyWordsOfPastChatHistory);
    
    // Update timeline
    updateGrowthTimeline(allTimelines);
    
    // Update keywords cloud
    updateGrowthKeywords(allKeywords);
    
    // Update reflection module (use first entry's prompt)
    updateReflectionModule(journalData[0]?.guideToAction);
    
    // Update statistics
    updateGrowthStatistics(journalData);
    
    // Setup reflection interactions
    setupReflectionInteractions();
}

function updateGrowthTimeline(timelineData) {
    const timelineWrapper = document.getElementById('timeline-wrapper');
    if (!timelineWrapper || !timelineData) return;
    
    // Clear existing timeline
    timelineWrapper.innerHTML = '';
    
    // Sort timeline by date
    const sortedTimeline = timelineData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Create timeline items
    sortedTimeline.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.style.animationDelay = `${index * 0.1}s`;
        
        // Determine category based on content
        const category = categorizeTimelineEntry(item.updateReason);
        
        timelineItem.innerHTML = `
            <div class="timeline-date">${formatDate(item.date)}</div>
            <div class="timeline-content">
                <div class="timeline-reason">${item.updateReason}</div>
                <div class="timeline-category">${category}</div>
            </div>
        `;
        
        timelineWrapper.appendChild(timelineItem);
    });
}

function updateGrowthKeywords(keywords) {
    const keywordsCloud = document.getElementById('growth-keywords-cloud');
    if (!keywordsCloud || !keywords) return;
    
    // Clear existing keywords
    keywordsCloud.innerHTML = '';
    
    // Remove duplicates and create keyword elements
    const uniqueKeywords = [...new Set(keywords)];
    
    uniqueKeywords.forEach((keyword, index) => {
        const keywordElement = document.createElement('span');
        keywordElement.className = 'growth-keyword';
        keywordElement.textContent = keyword;
        keywordElement.style.animationDelay = `${index * 0.1}s`;
        
        // Add click interaction
        keywordElement.addEventListener('click', () => {
            handleKeywordClick(keyword);
        });
        
        keywordsCloud.appendChild(keywordElement);
    });
}

function updateReflectionModule(guideToAction) {
    const reflectionPrompt = document.getElementById('reflection-prompt');
    const reflectionTextarea = document.getElementById('reflection-textarea');
    
    if (reflectionPrompt && guideToAction?.prompt) {
        reflectionPrompt.textContent = guideToAction.prompt;
    }
    
    if (reflectionTextarea && guideToAction?.textBox) {
        reflectionTextarea.placeholder = guideToAction.textBox;
    }
}

function updateGrowthStatistics(journalData) {
    // Calculate statistics
    const totalEntries = journalData.reduce((sum, entry) => sum + entry.timeline.length, 0);
    const keyInsights = journalData.length; // Number of different growth themes
    const milestoneCount = journalData.filter(entry => 
        entry.timeline.some(item => 
            item.updateReason.includes('复盘') || 
            item.updateReason.includes('进展') ||
            item.updateReason.includes('下降')
        )
    ).length;
    
    // Update DOM elements
    const totalEntriesElement = document.getElementById('total-entries');
    const keyInsightsElement = document.getElementById('key-insights');
    const milestoneCountElement = document.getElementById('milestone-count');
    
    if (totalEntriesElement) {
        animateNumber(totalEntriesElement, totalEntries);
    }
    
    if (keyInsightsElement) {
        animateNumber(keyInsightsElement, keyInsights);
    }
    
    if (milestoneCountElement) {
        animateNumber(milestoneCountElement, milestoneCount);
    }
}

function setupReflectionInteractions() {
    const toggleBtn = document.getElementById('reflection-toggle-btn');
    const textarea = document.getElementById('reflection-textarea');
    const saveBtn = document.getElementById('reflection-save-btn');
    const cancelBtn = document.getElementById('reflection-cancel-btn');
    const actions = document.querySelector('.reflection-actions');
    
    if (!toggleBtn || !textarea || !saveBtn || !cancelBtn || !actions) return;
    
    // Toggle textarea visibility
    toggleBtn.addEventListener('click', () => {
        const isVisible = textarea.style.display !== 'none';
        
        if (isVisible) {
            // Hide textarea
            textarea.style.display = 'none';
            actions.style.display = 'none';
            toggleBtn.textContent = '写下感悟';
            toggleBtn.style.display = 'block';
        } else {
            // Show textarea
            textarea.style.display = 'block';
            actions.style.display = 'flex';
            toggleBtn.style.display = 'none';
            textarea.focus();
        }
    });
    
    // Save reflection
    saveBtn.addEventListener('click', () => {
        const content = textarea.value.trim();
        if (content) {
            saveReflection(content);
            // Reset UI
            textarea.value = '';
            textarea.style.display = 'none';
            actions.style.display = 'none';
            toggleBtn.style.display = 'block';
            toggleBtn.textContent = '已保存感悟';
            
            // Reset button text after 2 seconds
            setTimeout(() => {
                toggleBtn.textContent = '写下感悟';
            }, 2000);
        }
    });
    
    // Cancel reflection
    cancelBtn.addEventListener('click', () => {
        textarea.value = '';
        textarea.style.display = 'none';
        actions.style.display = 'none';
        toggleBtn.style.display = 'block';
    });
}

// Helper Functions for Growth Journal
function categorizeTimelineEntry(reason) {
    if (reason.includes('焦虑') || reason.includes('情绪') || reason.includes('惊恐')) {
        return '情绪管理';
    } else if (reason.includes('创伤') || reason.includes('依恋') || reason.includes('内在')) {
        return '创伤疗愈';
    } else if (reason.includes('人际') || reason.includes('关系') || reason.includes('边界')) {
        return '人际关系';
    } else if (reason.includes('抑郁') || reason.includes('动力') || reason.includes('兴趣')) {
        return '情绪调节';
    } else if (reason.includes('自我') || reason.includes('批判') || reason.includes('接纳')) {
        return '自我成长';
    } else {
        return '心理成长';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
    });
}

function handleKeywordClick(keyword) {
    // Add keyword to chat input as a suggestion
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = `请帮我深入分析"${keyword}"这个关键词在我的成长过程中的意义。`;
        chatInput.focus();
    }
}

function animateNumber(element, targetNumber) {
    const startNumber = 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutQuart);
        
        element.textContent = currentNumber;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = targetNumber;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function saveReflection(content) {
    // In a real application, this would save to backend
    console.log('Saving reflection:', content);
    
    // For now, just store in localStorage
    const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
    reflections.push({
        content: content,
        timestamp: new Date().toISOString(),
        dimension: 'growth-journal'
    });
    localStorage.setItem('reflections', JSON.stringify(reflections));
    
    // Could also send to backend API
    // await fetch(`${API_BASE_URL}/reflections`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ content, dimension: 'growth-journal' })
    // });
}

// Mood Barometer Page Functions
function updateMoodBarometerPage() {
    const moodData = AppState.reportData.mood;
    if (!moodData) return;
    
    // Update current mood status
    updateCurrentMoodStatus(moodData);
    
    // Draw mood chart
    drawMoodChart(moodData);
    
    // Update emotional toolbox
    updateEmotionalToolbox(moodData);
    
    // Update mood statistics
    updateMoodStatistics(moodData);
    
    // Setup toolbox interactions
    setupToolboxInteractions();
}

function updateCurrentMoodStatus(data) {
    // Update mood icon based on current mood
    const moodIcon = document.getElementById('mood-icon');
    if (moodIcon && data.overallCurrentMood) {
        const icon = getMoodIcon(data.overallCurrentMood);
        moodIcon.textContent = icon;
    }
    
    // Update current mood text
    const currentMoodText = document.getElementById('current-mood-text');
    if (currentMoodText && data.overallCurrentMood) {
        currentMoodText.textContent = data.overallCurrentMood;
    }
    
    // Update mood date
    const moodDate = document.getElementById('mood-date');
    if (moodDate && data.reportGeneratedDate) {
        const formattedDate = formatMoodDate(data.reportGeneratedDate);
        moodDate.textContent = formattedDate;
    }
    
    // Update mood score
    const moodScoreNumber = document.getElementById('mood-score-number');
    if (moodScoreNumber && data.moodHistory && data.moodHistory.length > 0) {
        const latestScore = data.moodHistory[data.moodHistory.length - 1].moodScore;
        moodScoreNumber.textContent = latestScore.toFixed(1);
    }
}

function drawMoodChart(data) {
    const canvas = document.getElementById('mood-chart');
    if (!canvas || !data.moodHistory) return;
    
    const ctx = canvas.getContext('2d');
    const chartData = data.moodHistory;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Data processing
    const minScore = 1;
    const maxScore = 10;
    const scoreRange = maxScore - minScore;
    
    // Draw grid
    drawMoodChartGrid(ctx, padding, chartWidth, chartHeight, minScore, maxScore);
    
    // Draw mood line
    drawMoodLine(ctx, chartData, padding, chartWidth, chartHeight, minScore, scoreRange);
    
    // Draw trend line
    drawTrendLine(ctx, chartData, padding, chartWidth, chartHeight, minScore, scoreRange);
    
    // Draw data points
    drawMoodDataPoints(ctx, chartData, padding, chartWidth, chartHeight, minScore, scoreRange);
    
    // Draw labels
    drawMoodChartLabels(ctx, chartData, padding, chartWidth, chartHeight);
    
    // Update chart title and subtitle
    updateChartTitleAndSubtitle(data);
}

function drawMoodChartGrid(ctx, padding, width, height, minScore, maxScore) {
    ctx.strokeStyle = '#EFEFEF';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (score levels)
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height * i) / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
        
        // Score labels
        const score = maxScore - (i * (maxScore - minScore)) / 5;
        ctx.fillStyle = '#999999';
        ctx.font = '12px PingFang SC, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(score.toFixed(0), padding - 10, y);
    }
    
    // Vertical grid lines (time)
    const dataPoints = 7; // Show every other day for clarity
    for (let i = 0; i <= dataPoints; i++) {
        const x = padding + (width * i) / dataPoints;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + height);
        ctx.stroke();
    }
}

function drawMoodLine(ctx, chartData, padding, width, height, minScore, scoreRange) {
    if (chartData.length < 2) return;
    
    ctx.strokeStyle = '#B4C7D9';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#B4C7D9');
    gradient.addColorStop(1, '#9EADC0');
    ctx.strokeStyle = gradient;
    
    ctx.beginPath();
    
    chartData.forEach((point, index) => {
        const x = padding + (width * index) / (chartData.length - 1);
        const normalizedScore = (point.moodScore - minScore) / scoreRange;
        const y = padding + height - (normalizedScore * height);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

function drawTrendLine(ctx, chartData, padding, width, height, minScore, scoreRange) {
    if (chartData.length < 2) return;
    
    // Calculate linear regression for trend line
    const trend = calculateTrendLine(chartData);
    
    ctx.strokeStyle = 'rgba(180, 199, 217, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    
    const startY = padding + height - ((trend.start - minScore) / scoreRange * height);
    const endY = padding + height - ((trend.end - minScore) / scoreRange * height);
    
    ctx.moveTo(padding, startY);
    ctx.lineTo(padding + width, endY);
    ctx.stroke();
    
    ctx.setLineDash([]); // Reset dash
}

function drawMoodDataPoints(ctx, chartData, padding, width, height, minScore, scoreRange) {
    chartData.forEach((point, index) => {
        const x = padding + (width * index) / (chartData.length - 1);
        const normalizedScore = (point.moodScore - minScore) / scoreRange;
        const y = padding + height - (normalizedScore * height);
        
        // Draw point
        ctx.fillStyle = '#B4C7D9';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw highlight on hover (simplified)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawMoodChartLabels(ctx, chartData, padding, width, height) {
    ctx.fillStyle = '#999999';
    ctx.font = '10px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Show date labels for every few points to avoid crowding
    const labelInterval = Math.max(1, Math.floor(chartData.length / 7));
    
    chartData.forEach((point, index) => {
        if (index % labelInterval === 0 || index === chartData.length - 1) {
            const x = padding + (width * index) / (chartData.length - 1);
            const date = new Date(point.date);
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            ctx.fillText(label, x, padding + height + 10);
        }
    });
}

function updateChartTitleAndSubtitle(data) {
    const chartTitle = document.getElementById('chart-title');
    const chartSubtitle = document.getElementById('chart-subtitle');
    
    if (chartTitle && data.chartDetails?.chartTitle) {
        chartTitle.textContent = data.chartDetails.chartTitle;
    }
    
    if (chartSubtitle && data.chartDetails?.moodScoreScale) {
        chartSubtitle.textContent = data.chartDetails.moodScoreScale;
    }
}

function updateEmotionalToolbox(data) {
    // Update mood analysis
    const moodAnalysis = document.getElementById('mood-analysis');
    if (moodAnalysis && data.emotionalToolbox?.moodAnalysis) {
        moodAnalysis.textContent = data.emotionalToolbox.moodAnalysis;
    }
    
    // Update action guide
    const moodActionGuide = document.getElementById('mood-action-guide');
    if (moodActionGuide && data.emotionalToolbox?.actionGuide) {
        moodActionGuide.textContent = data.emotionalToolbox.actionGuide;
    }
}

function updateMoodStatistics(data) {
    if (!data.moodHistory || data.moodHistory.length === 0) return;
    
    const scores = data.moodHistory.map(entry => entry.moodScore);
    
    // Calculate statistics
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const stableDays = calculateStableDays(scores);
    const trackingDays = data.moodHistory.length;
    
    // Update DOM elements with animation
    const avgElement = document.getElementById('avg-mood-score');
    const peakElement = document.getElementById('peak-mood');
    const stableElement = document.getElementById('stable-days');
    const trackingElement = document.getElementById('tracking-days');
    
    if (avgElement) {
        animateDecimalNumber(avgElement, avgScore, 1);
    }
    
    if (peakElement) {
        animateDecimalNumber(peakElement, maxScore, 1);
    }
    
    if (stableElement) {
        animateNumber(stableElement, stableDays);
    }
    
    if (trackingElement) {
        animateNumber(trackingElement, trackingDays);
    }
}

function setupToolboxInteractions() {
    // Setup breathing exercise button
    const breathingBtn = document.getElementById('breathing-exercise');
    if (breathingBtn) {
        breathingBtn.addEventListener('click', () => {
            handleToolboxAction('breathing', '开始4-7-8呼吸练习：吸气4秒，屏息7秒，呼气8秒。');
        });
    }
    
    // Setup mood journal button
    const journalBtn = document.getElementById('mood-journal');
    if (journalBtn) {
        journalBtn.addEventListener('click', () => {
            handleToolboxAction('journal', '记录当前情绪和触发因素，有助于识别情绪模式。');
        });
    }
    
    // Setup mindfulness button
    const mindfulnessBtn = document.getElementById('mindfulness');
    if (mindfulnessBtn) {
        mindfulnessBtn.addEventListener('click', () => {
            handleToolboxAction('mindfulness', '进行5分钟正念冥想：专注于呼吸，观察当下的感受。');
        });
    }
}

// Helper Functions for Mood Barometer
function getMoodIcon(moodText) {
    const moodIcons = {
        '平静': '😌',
        '满足': '😊',
        '快乐': '😄',
        '兴奋': '🤩',
        '焦虑': '😰',
        '沮丧': '😔',
        '愤怒': '😠',
        '疲惫': '😴',
        '平静与满足': '🌤️',
        '积极': '☀️',
        '稳定': '🌈'
    };
    
    // Find matching icon or return default
    for (const [mood, icon] of Object.entries(moodIcons)) {
        if (moodText.includes(mood)) {
            return icon;
        }
    }
    
    return '🌤️'; // Default icon
}

function formatMoodDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateTrendLine(chartData) {
    const n = chartData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    chartData.forEach((point, index) => {
        sumX += index;
        sumY += point.moodScore;
        sumXY += index * point.moodScore;
        sumXX += index * index;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return {
        start: intercept,
        end: intercept + slope * (n - 1)
    };
}

function calculateStableDays(scores) {
    if (scores.length < 2) return 0;
    
    let stableDays = 0;
    const threshold = 1.0; // Consider stable if change is less than 1 point
    
    for (let i = 1; i < scores.length; i++) {
        if (Math.abs(scores[i] - scores[i - 1]) <= threshold) {
            stableDays++;
        }
    }
    
    return stableDays;
}

function animateDecimalNumber(element, targetNumber, decimals = 1) {
    const startNumber = 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = startNumber + (targetNumber - startNumber) * easeOutQuart;
        
        element.textContent = currentNumber.toFixed(decimals);
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = targetNumber.toFixed(decimals);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function handleToolboxAction(actionType, message) {
    // Visual feedback for button
    const button = event.target.closest('.toolbox-button');
    if (button) {
        const originalBg = button.style.backgroundColor;
        button.style.backgroundColor = 'rgba(119, 191, 163, 0.2)';
        button.style.transform = 'translateY(-2px)';
        
        // Reset after animation
        setTimeout(() => {
            button.style.backgroundColor = originalBg;
            button.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // Add message to chat
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = `我想了解更多关于${actionType === 'breathing' ? '呼吸练习' : actionType === 'journal' ? '情绪日记' : '正念冥想'}的技巧。`;
        chatInput.focus();
    }
    
    console.log(`Toolbox action: ${actionType} - ${message}`);
}


// Export for debugging (development only)
if (typeof window !== 'undefined') {
    window.AppState = AppState;
    window.loadReportData = loadReportData;
    window.sendMessageToAI = sendMessageToAI;
    window.updateValuesPage = updateValuesPage;
    window.updateBigFivePage = updateBigFivePage;
    window.updateGrowthJournalPage = updateGrowthJournalPage;
    window.updateMoodBarometerPage = updateMoodBarometerPage;
    window.drawRadarChart = drawRadarChart;
    window.drawMoodChart = drawMoodChart;
}
