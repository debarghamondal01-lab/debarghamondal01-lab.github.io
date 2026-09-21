// Nexus AI chat widget
(function () {
    const PROXY_URL = 'https://clumsy-gannet-4014.debarghamondal01-lab.deno.net';
    const GREETING = "Hi! I'm Nexus, Debargha's AI assistant. Ask me anything about his projects, skills, or how to get in touch!";

    const SYSTEM_PROMPT = `You are Nexus, Debargha Mondal's AI assistant embedded in his portfolio. You are a helpful general-purpose AI, similar to ChatGPT. You can answer ANY question on ANY topic — coding, math, science, general knowledge, life advice, jokes, whatever the visitor asks.

You ALSO know everything about Debargha. When asked about him, use this info:

ABOUT DEBARGHA:
- 2nd-year B.Tech CSE student at Narula Institute of Technology, Kolkata (2024-2028)
- Focus: AI/ML, Deep Learning, NLP, Generative AI
- Available for AI/ML, Data Science, Full-Stack internships
- Email: debarghamondal01@gmail.com
- GitHub: github.com/debarghamondal01-lab
- LinkedIn: linkedin.com/in/debargha-mondal-226851436

HIS PROJECTS:
1. Digit Vision - CNN for handwritten digit recognition (99.12% accuracy, TensorFlow + FastAPI)
2. Alphabet Vision - CNN for digits + uppercase + lowercase letters
3. Skyscrapers CSP Game - full-stack puzzle with 6 CSP algorithms (Python, FastAPI, JS)
4. AI Resume Analyzer - uses Gemini API to match resumes with job descriptions
5. Fake Job Detector API - NLP model detecting fraudulent job posts
6. Library Manager - Python CLI with CRUD + JSON storage

TECH STACK: Python, TensorFlow, Keras, Scikit-learn, NumPy, Pandas, FastAPI, HTML/CSS/JS, Git, GitHub, Google Colab

TONE:
- Friendly, warm, conversational
- Keep answers concise (2-5 sentences) unless the question needs more depth
- If asked who you are: say you're Nexus, Debargha's AI assistant
- If you don't know something about Debargha, say "I don't have that info — reach out to him at debarghamondal01@gmail.com"
- Never invent fake facts about Debargha (no fake jobs, awards, or skills)`;

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
                        <div class="ai-title">Ask Nexus</div>
                        <div class="ai-status">
                            <span class="ai-status-dot"></span>
                            Powered by Gemini
                        </div>
                    </div>
                </div>
                <button class="ai-close" id="aiClose" aria-label="Close chat">X</button>
            </div>
            <div class="ai-messages" id="aiMessages"></div>
            <div class="ai-input-area">
                <input type="text" id="aiInput" class="ai-input" placeholder="Ask about my projects, skills..." autocomplete="off" />
                <button id="aiSend" class="ai-send" aria-label="Send">&#10148;</button>
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

    let history = [];

    function openPanel() {
        panel.classList.add('open');
        toggle.classList.add('hidden');
        input.focus();
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

    function addMessage(role, text, isTyping) {
        const bubble = document.createElement('div');
        bubble.className = 'ai-message ai-message-' + role;
        if (isTyping) {
            bubble.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
        } else {
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

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        addMessage('user', text);
        history.push({ role: 'user', parts: [{ text: text }] });

        const typing = addMessage('bot', '', true);
        sendBtn.disabled = true;
        input.disabled = true;

        try {
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: history,
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    generationConfig: { temperature: 0.8, maxOutputTokens: 500 }
                })
            });

            const data = await res.json();
            let reply = '';

            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
                reply = data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                reply = "Sorry, I'm having trouble right now. Please try again.";
                console.error('Gemini error:', data.error);
            } else {
                reply = "Sorry, I couldn't generate a response.";
            }

            typing.remove();
            addMessage('bot', reply);
            history.push({ role: 'model', parts: [{ text: reply }] });

            if (history.length > 20) {
                history = history.slice(-20);
            }
        } catch (err) {
            typing.remove();
            addMessage('bot', "Oops, I can't reach the server right now. Try again.");
            console.error(err);
        } finally {
            sendBtn.disabled = false;
            input.disabled = false;
            input.focus();
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    console.log('Nexus AI ready');
})();