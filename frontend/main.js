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
    const response = await fetch(`${API_BASE_URL}/report/${dimension}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
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
            }
        },
        values: {
            valueOrder: ["善行", "自主", "成就", "安全", "普世"],
            valueAnalysis: "您的价值观体系展现出强烈的人文关怀特质。'善行'作为您的核心价值观，驱动着您在人际关系中表现出极强的同理心和助人倾向，这使您在团队合作中往往扮演支持者和协调者的角色。'自主'价值观让您在决策时更倾向于独立思考，不轻易受外界影响，这种特质在创新和问题解决方面为您提供了独特优势。当这些价值观得到满足时，您会感到内心充实和幸福；反之，若长期忽视帮助他人或失去自主权，可能会产生愧疚感和焦虑情绪。",
            valueGuide: "针对您的核心价值观，建议以下实践方法：1）善行实践：每周三晚上与家人进行1次深度对话，记录对方的需求并尝试提供1个小帮助，这能强化您的关爱价值观与日常生活的联结。2）自主强化：每天早晨花10分钟独立制定当日计划，避免被他人的安排完全主导，培养独立决策的习惯。3）成就导向：设定每月一个可量化的个人目标，并记录达成过程，让成就感成为持续前进的动力。"
        },
        bigfive: {
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
        mood: {
            current: "平静",
            trend: "稳定上升",
            score: 7.2
        },
        journal: {
            entries: 15,
            lastUpdate: "2024-01-15",
            growthScore: 8.5
        }
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
        
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: AppState.reportData,
                history: AppState.chatHistory.slice(-10) // Send last 10 messages for context
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response to history
        const aiMessage = {
            type: 'ai',
            content: data.response || '抱歉，我现在无法回应。请稍后再试。',
            timestamp: new Date()
        };
        
        AppState.chatHistory.push(aiMessage);
        renderChatHistory();
        
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
    bubbleDiv.textContent = message.content;
    
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

// Export for debugging (development only)
if (typeof window !== 'undefined') {
    window.AppState = AppState;
    window.loadReportData = loadReportData;
    window.sendMessageToAI = sendMessageToAI;
    window.updateValuesPage = updateValuesPage;
    window.updateBigFivePage = updateBigFivePage;
    window.drawRadarChart = drawRadarChart;
}
