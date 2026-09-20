// ai-agent.js — Floating AI chat widget for portfolio
(function () {
    // ===== CONFIG =====
    const PROXY_URL = 'https://clumsy-gannet-4014.debarghamondal01-lab.deno.net';
    const GREETING = "Hi! I'm Debargha's AI assistant. Ask me anything about his projects, skills, or how to get in touch! 🚀";

    const SYSTEM_PROMPT = `You are a friendly AI assistant for Debargha Mondal's personal portfolio. Answer visitors' questions about him briefly, warmly, and helpfully.

ABOUT DEBARGHA:
- Name: Debargha Mondal
- 2nd-year B.Tech CSE student at Narula Institute of Technology, Kolkata (2024-2028)
- Focus: AI/ML, Deep Learning, NLP, Generative AI
- Available for AI/ML, Data Science, and Full-Stack internships
- Email: debarghamondal01@gmail.com
- GitHub: github.com/debarghamondal01-lab
- LinkedIn: linkedin.com/in/debargha-mondal-226851436
- Portfolio: debarghamondal01-lab.github.io

HIS PROJECTS:
1. Digit Vision — CNN handwritten digit recognition, 99.12% accuracy (TensorFlow, FastAPI)
2. Alphabet Vision — CNN for digits + uppercase + lowercase letters (TensorFlow, FastAPI)
3. Skyscrapers CSP Game — Full-stack puzzle game with 6 CSP algorithms (Python, FastAPI, JS). Live demo: skyscrapers-csp.onrender.com
4. AI Resume Analyzer — Uses Google Gemini API to compare resumes with job descriptions
5. Fake Job Detector API — NLP model detecting fraudulent job postings (Scikit-learn, FastAPI)
6. Library Manager — Python CLI with CRUD + JSON storage

HIS TECH STACK:
Python, TensorFlow, Keras, Scikit-learn, NumPy, Pandas, FastAPI, REST APIs, HTML/CSS/JavaScript, Git, GitHub, Google Colab, Prompt Engineering, CSP Algorithms, Backtracking, AC-3

TONE:
- Friendly, concise, professional
- Never more than 3-4 short sentences per response
- If asked something you don't know, say "I don't have that info — reach out to Debargha directly at debarghamondal01@gmail.com"
- Never invent projects, skills, or facts not listed above
- If asked something unrelated to Debargha, gently redirect: "I'm here to answer questions about Debargha — what would you like to know?"`;

    // ===== Create widget HTML =====
    const widget = document.createElement('div');
    widget.className = 'ai-widget';
    widget.innerHTML = `
        <button class="ai-toggle" id="aiToggle" aria-label="Open AI chat">
            <span class="ai-toggle-icon">🤖</span>
            <span class="ai-toggle-pulse"></span>
        </button>

        <div class="ai-panel" id="aiPanel">
            <div class="ai-header">
                <div class="ai-header-left">
                    <div class="ai-avatar">🤖</div>
                    <div>
                        <div class="ai-title">Ask My AI</div>
                        <div class="ai-status">
                            <span class="ai-status-dot"></span>
                            Powered by Gemini
                        </div>
                    </div>
                </div>
                <button class="ai-close" id="aiClose" aria-label="Close chat">✕</button>
            </div>

            <div class="ai-messages" id="aiMessages"></div>

            <div class="ai-input-area">
                <input
                    type="text"
                    id="aiInput"
                    class="ai-input"
                    placeholder="Ask about my projects, skills..."
                    autocomplete="off"
                />
                <button id="aiSend" class="ai-send" aria-label="Send">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    const toggle = document.getElementById('aiToggle');
    const panel = document.getElementById('aiPanel');
    const closeBtn = document.getElementById('aiClose');
    const messages = document.getElementById('aiMessages');
    const input = document.getElementById('aiInput');
    const sendBtn = document.getElementById('aiSend');

    // ===== Conversation history =====
    let history = []; // array of { role, parts: [{ text }] }

    // ===== Open / close =====
    function openPanel() {
        panel.classList.add('open');
        toggle.classList.add('hidden');
        input.focus();

        // Show greeting on first open
        if (messages.children.length === 0) {
            addMessage('bot', GREETING);
        }
    }

    function closePanel() {
        panel.classList.remove('open');
        toggle.classList.remove('hidden');
    }

    toggle.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);

    // ===== Add message bubble =====
    function addMessage(role, text, isTyping = false) {
        const bubble = document.createElement('div');
        bubble.className = `ai-message ai-message-${role}`;

        if (isTyping) {
            bubble.innerHTML = `
                <div class="ai-typing">
                    <span></span><span></span><span></span>
                </div>
            `;
        } else {
            // Convert markdown-like formatting to HTML safely
            const safe = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
            bubble.innerHTML = safe;
        }

        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    }

    // ===== Send message =====
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        addMessage('user', text);

        // Add to history
        history.push({ role: 'user', parts: [{ text }] });

        // Show typing indicator
        const typing = addMessage('bot', '', true);
        sendBtn.disabled = true;
        input.disabled = true;

        try {
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: history,
                    systemInstruction: {
                        parts: [{ text: SYSTEM_PROMPT }]
                    },
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 500,
                    }
                })
            });

            const data = await res.json();

            // Extract text from Gemini response
            let reply = '';
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                reply = data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                reply = "Sorry, I'm having trouble right now. Please try again in a moment.";
                console.error('Gemini error:', data.error);
            } else {
                reply = "Sorry, I couldn't generate a response.";
            }

            // Remove typing
            typing.remove();

            // Show reply
            addMessage('bot', reply);

            // Add to history
            history.push({ role: 'model', parts: [{ text: reply }] });

            // Keep history manageable (last 20 messages)
            if (history.length > 20) {
                history = history.slice(-20);
            }

        } catch (err) {
            typing.remove();
            addMessage('bot', "Oops, I can't reach the server right now. Check your internet and try again.");
            console.error(err);
        } finally {
            sendBtn.disabled = false;
            input.disabled = false;
            input.focus();
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    console.log('🤖 AI agent ready');
})();