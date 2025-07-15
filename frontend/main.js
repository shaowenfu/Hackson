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
            primary: "自主",
            secondary: "成就",
            scores: {
                autonomy: 88,
                achievement: 82,
                benevolence: 75
            }
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

// Export for debugging (development only)
if (typeof window !== 'undefined') {
    window.AppState = AppState;
    window.loadReportData = loadReportData;
    window.sendMessageToAI = sendMessageToAI;
}
