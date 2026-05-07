let currentChatId = null;
let savedDefaults = { ollama: "", gemini: "", openrouter: "", openai: "", mistral: "" };
let globalSettings = { 
	tts_enabled: false, 
	tts_download_enabled: false, 
	elevenlabs_music_enabled: false, 
	tts_provider: 'sapi5', 
	elevenlabs_voice: '', 
	googlecloud_api_key: '',
	googlecloud_language: 'de-DE',
	googlecloud_voice: 'de-DE-Standard-A',
	sapi5_voice: '0', 
	pyttsx3_voice: '',
	piper_voice: '', 
	piper_speaker: '0', 
	edge_voice: 'de-DE-KillianNeural', 
	espeak_voice: 'de',
	espeak_variant: '',
	gtts_voice: 'de',
	navertts_voice: 'en',
	openai_voice: 'alloy',
	openai_tts_model: 'tts-1',
	mistral_voice: '',
	mistral_tts_model: 'voxtral-mini-tts-2603',
	show_token_count: true, 
	email_accounts: [], 
	default_email_account: 0 
};

function announce(text) {
	const el = document.getElementById('a11y-status');
	el.textContent = text;
	setTimeout(() => el.textContent = '', 3000);
}

function toggleSidebar() {
	const sidebar = document.getElementById('sidebar');
	const toggleBtn = document.getElementById('sidebarToggleBtn');
	
	if (sidebar.style.display === '' || sidebar.style.display === 'none') {
		sidebar.style.display = 'flex';
		toggleBtn.textContent = t('Hide Sidebar');
		toggleBtn.setAttribute('aria-expanded', 'true');
		announce(t('msgSidebarShow'));
	} else {
		sidebar.style.display = 'none';
		toggleBtn.textContent = t('Show Sidebar');
		toggleBtn.setAttribute('aria-expanded', 'false');
		announce(t('msgSidebarHide'));
	}
}

function toggleToolsMenu() {
	const menu = document.getElementById('toolsMenuDropdown');
	const btn = document.getElementById('toolsMenuBtn');
	const isExpanded = btn.getAttribute('aria-expanded') === 'true';

	if (isExpanded) {
		menu.style.display = 'none';
		btn.setAttribute('aria-expanded', 'false');
		btn.focus();
	} else {
		menu.style.display = 'block';
		btn.setAttribute('aria-expanded', 'true');
		const firstItem = menu.querySelector('[role="menuitemcheckbox"]:not([style*="display: none"])');
		if(firstItem) firstItem.focus();
	}
}

function toggleToolItem(item) {
	const isChecked = item.getAttribute('aria-checked') === 'true';
	item.setAttribute('aria-checked', !isChecked);
}

function handleToolKeydown(e, item) {
	const menu = document.getElementById('toolsMenuDropdown');
	const items = Array.from(menu.querySelectorAll('[role="menuitemcheckbox"]:not([style*="display: none"])'));
	const idx = items.indexOf(item);

	if (e.key === 'ArrowDown') {
		e.preventDefault();
		const next = items[idx + 1] || items[0];
		if (next) next.focus();
	} else if (e.key === 'ArrowUp') {
		e.preventDefault();
		const prev = items[idx - 1] || items[items.length - 1];
		if (prev) prev.focus();
	} else if (e.key === 'Enter' || e.key === ' ') {
		e.preventDefault();
		toggleToolItem(item);
	} else if (e.key === 'Escape') {
		e.preventDefault();
		toggleToolsMenu();
	}
}

document.addEventListener('click', function(event) {
	const container = document.querySelector('.tools-menu-container');
	const menu = document.getElementById('toolsMenuDropdown');
	const btn = document.getElementById('toolsMenuBtn');
	if (container && !container.contains(event.target)) {
		menu.style.display = 'none';
		if (btn) btn.setAttribute('aria-expanded', 'false');
	}
});

function addCopyButtons(container) {
	const pres = container.querySelectorAll('pre');
	pres.forEach(pre => {
		if(pre.querySelector('.copy-code-btn')) return;
		const btn = document.createElement('button');
		btn.className = 'copy-code-btn';
		btn.textContent = t('msgCopy');
		btn.onclick = () => {
			const code = pre.querySelector('code');
			const text = code ? code.innerText : pre.innerText;
			navigator.clipboard.writeText(text);
			btn.textContent = t('msgCopied');
			setTimeout(() => btn.textContent = t('msgCopy'), 2000);
		};
		pre.appendChild(btn);
	});
}

function copyMessageText(btn) {
	const div = btn.closest('.message');
	if(div && div.rawText !== undefined) {
		navigator.clipboard.writeText(div.rawText);
		const originalText = btn.innerHTML;
		btn.innerHTML = t('msgCopied');
		setTimeout(() => btn.innerHTML = originalText, 2000);
	}
}

document.getElementById('userInput').addEventListener('keydown', function(e) {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
});

async function init() {
	await loadSettings();
	
	const ttsProvSelect = document.getElementById('ttsProviderSelect');
	if (ttsProvSelect && !ttsProvSelect.querySelector('option[value="gtts"]')) {
		const opt = document.createElement('option');
		opt.value = 'gtts';
		opt.textContent = 'Google TTS (gTTS - Kostenlos)';
		ttsProvSelect.appendChild(opt);
	}
	if (ttsProvSelect && !ttsProvSelect.querySelector('option[value="naver"]')) {
		const opt2 = document.createElement('option');
		opt2.value = 'naver';
		opt2.textContent = 'NaverTTS / Papago (Cloud, Kostenlos)';
		ttsProvSelect.appendChild(opt2);
	}
	
	applyTranslations();
	await loadModels();
	await loadHistory();
	document.getElementById('userInput').focus();
}

async function loadModels() {
	try {
		const activeProvider = document.getElementById('providerSelect').value;
		const res = await fetch('/models?provider=' + activeProvider);
		if (res.redirected) { window.location.href = res.url; return; }
		const models = await res.json();
		
		const sel = document.getElementById('modelSelect');
		if (models.length === 0) {
			sel.innerHTML = `<option value="">${t('msgNoModel')}</option>`;
		} else {
			const optionsHtml = models.map(m => `<option value="${m}">${m}</option>`).join('');
			sel.innerHTML = optionsHtml;
			
			const defModel = savedDefaults[activeProvider];
			if (defModel) {
				const exists = Array.from(sel.options).some(opt => opt.value === defModel);
				if (exists) {
					sel.value = defModel;
				}
			}
		}
	} catch(e) { 
		const sel = document.getElementById('modelSelect');
		sel.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
	}
}

function parseContent(text) {
	if (!text) return "";
	
	let tString = text;
	
	tString = tString.replace(/<(think|thinking)[^>]*>/gi, '\n\n:::THINK_START:::\n\n');
	tString = tString.replace(/<\/(think|thinking)>/gi, '\n\n:::THINK_END:::\n\n');
	
	tString = tString.replace(/\[SAVE_DOC\][\s\S]*?\[\/SAVE_DOC\]/gi, `\n\n*[${t('Document generated')}]*\n\n`);
	
	let html = marked.parse(tString);
	
	html = html.replace(/(<p>)?:::THINK_START:::(<\/p>)?/g, `<details class="think-box" style="margin-bottom: 1rem; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 5px; background: #f8f9fa;"><summary style="cursor: pointer; font-weight: bold; color: #495057;">${t('Thinking Process')}</summary><div style="margin-top: 0.8rem; font-size: 0.9em; color: #6c757d; border-top: 1px solid #e9ecef; padding-top: 0.5rem;">`);
	html = html.replace(/(<p>)?:::THINK_END:::(<\/p>)?/g, '</div></details>');
	
	const openTags = (html.match(/<details/g) || []).length;
	const closeTags = (html.match(/<\/details>/g) || []).length;
	if (openTags > closeTags) {
		html += '</div></details>';
	}
	
	return html;
}

async function loadHistory() {
	const res = await fetch('/history');
	if (res.redirected) { window.location.href = res.url; return; }
	const chats = await res.json();
	const list = document.getElementById('chatList');
	list.innerHTML = '';
	
	if(chats.length === 0) {
		list.innerHTML = `<li style="padding:1rem; color:#aaa;">${t('msgNoChats')}</li>`;
	}

	chats.forEach(chat => {
		const li = document.createElement('li');
		li.className = 'chat-item';
		
		const btn = document.createElement('button');
		btn.className = `chat-btn ${chat.id === currentChatId ? 'active' : ''}`;
		btn.textContent = chat.title || t('msgNewChat');
		btn.onclick = () => {
			loadChat(chat.id);
			if(window.innerWidth < 768 && document.getElementById('sidebar').style.display === 'flex') {
				toggleSidebar();
			}
		};
		
		if(chat.id === currentChatId) btn.setAttribute('aria-current', 'true');
		
		const del = document.createElement('button');
		del.className = 'delete-btn';
		del.innerHTML = '×<span class="sr-only">Del</span>';
		del.onclick = (e) => { e.stopPropagation(); deleteChat(chat.id); };
		del.setAttribute('aria-label', t('ariaDeleteChat'));

		li.appendChild(btn);
		li.appendChild(del);
		list.appendChild(li);
	});
}

async function loadChat(id) {
	currentChatId = id;
	announce(t('msgLoadingChat'));
	const res = await fetch(`/history/${id}`);
	if (res.redirected) { window.location.href = res.url; return; }
	if(res.ok) {
		const data = await res.json();
		const container = document.getElementById('chat-log');
		container.innerHTML = '';
		
		const currentModel = document.getElementById('modelSelect').value;
		
		data.messages.forEach(msg => {
			if(msg.role === 'system') return;
			appendMessage(msg.role, msg.content, msg.images, false, currentModel || 'AI', msg.usage);
		});
		loadHistory();
		announce(t('msgChatLoaded'));
	}
}

function startNewChat() {
	currentChatId = null;
	document.getElementById('chat-log').innerHTML = '';
	document.getElementById('userInput').value = '';
	
	loadModels(); 
	loadHistory();
	announce(t('msgNewStarted'));
	if(window.innerWidth < 768 && document.getElementById('sidebar').style.display === 'flex') {
		toggleSidebar();
	}
}

async function submitEmailDraft(btn, chatId) {
	btn.disabled = true;
	btn.textContent = "...";
	const container = btn.closest('.email-draft-form');
	const accountIndex = container.querySelector('#draft-account').value;
	const to = container.querySelector('#draft-to').value;
	const subject = container.querySelector('#draft-subject').value;
	const body = container.querySelector('#draft-body').value;
	const attachment = container.querySelector('#draft-attachment').value;
	
	try {
		const res = await fetch('/api/email/send', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({chat_id: chatId, account_index: accountIndex, to: to, subject: subject, body: body, attachment: attachment})
		});
		if (res.redirected) { window.location.href = res.url; return; }
		const data = await res.json();
		if(data.success) {
			container.innerHTML = `<p style="color:green; font-weight:bold;">${t('Success')}: ${data.message}</p>`;
		} else {
			container.innerHTML += `<p style="color:red; font-weight:bold;">${t('Error')}: ${data.message}</p>`;
			btn.disabled = false;
			btn.textContent = t('Retry');
		}
		
		setTimeout(() => loadChat(chatId), 500);
	} catch(e) {
		btn.disabled = false;
		btn.textContent = t('Retry');
		alert(t('msgSendErr'));
	}
}

async function sendMessage(isVoice = false) {
	const currentModel = document.getElementById('modelSelect').value;
	if (!currentModel || currentModel === "") {
		alert(t('msgNoModelAlert'));
		return;
	}

	const input = document.getElementById('userInput');
	const fileInput = document.getElementById('fileInput');
	const msg = input.value.trim();
	const file = fileInput.files[0];
	
	const activeTools = [];
	document.querySelectorAll('#toolsMenuDropdown [role="menuitemcheckbox"][aria-checked="true"]').forEach(item => {
		activeTools.push(item.dataset.value);
	});

	if (!msg && !file) return;

	input.value = '';
	fileInput.value = ''; 
	document.getElementById('fileName').style.display = 'none';

	const userMsgElement = appendMessage('user', msg + (file ? ` [${t('File')}: ${file.name}]` : ''), null, true, currentModel);
	
	const statusDisplay = document.getElementById('status-display');
	
	if (activeTools.includes("websearch")) {
		statusDisplay.textContent = t('msgSearchCheck');
		announce(t('msgSearchCheck'));
	} else if (document.getElementById('webSearchToggle').checked && document.getElementById('webSearchModeSelect').value === "auto") {
		statusDisplay.textContent = t('msgSearchCheckD');
		announce(t('msgSearchCheckD'));
	} else {
		statusDisplay.textContent = t('msgGenerating');
		announce(t('msgWaitResp'));
	}

	const formData = new FormData();
	formData.append('message', msg);
	formData.append('model', currentModel);
	formData.append('tools', JSON.stringify(activeTools));
	if (currentChatId) formData.append('chat_id', currentChatId);
	if (file) formData.append('file', file);

	const botMessageContainer = appendMessage('assistant', '...', null, false, currentModel);
	const botContentDiv = botMessageContainer.querySelector('.message-content');
	
	let fullText = "";
	let currentUsage = null;

	try {
		const response = await fetch('/send', { method: 'POST', body: formData });
		if (response.redirected) { window.location.href = response.url; return; }
		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		botContentDiv.innerHTML = ""; 

		let searchAppended = false;
		
		let buffer = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				if (buffer.trim()) {
					try {
						const json = JSON.parse(buffer);
						if (json.content) fullText += json.content;
						if (json.usage) currentUsage = json.usage;
					} catch(e) { console.error(e); }
				}
				break;
			}
			
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop();
			
			for (const line of lines) {
				if (!line) continue;
				try {
					const json = JSON.parse(line);
					
					if (json.chat_id && !searchAppended) {
						currentChatId = json.chat_id;
						statusDisplay.textContent = t('msgGenerating');
						searchAppended = true; 
					}
					if (json.content) {
						fullText += json.content;
						
						if (fullText.includes('<div class="email-draft-form"')) {
							botContentDiv.innerHTML = fullText;
						} else {
							botContentDiv.innerHTML = parseContent(fullText);
						}
						
						botMessageContainer.rawText = fullText;
						addCopyButtons(botMessageContainer);
					}
					if (json.usage) {
						currentUsage = json.usage;
					}
				} catch (e) { console.error(e); }
			}
		}
		
		if (currentUsage && globalSettings.show_token_count !== false) {
			const actionsDiv = botMessageContainer.querySelector('.msg-actions');
			if (actionsDiv) {
				const usageSpan = document.createElement('span');
				usageSpan.className = 'token-count';
				usageSpan.textContent = `Tokens: ${currentUsage.total} (${currentUsage.prompt} In / ${currentUsage.completion} Out)`;
				actionsDiv.insertBefore(usageSpan, actionsDiv.firstChild);
			}
		}

		statusDisplay.textContent = t('statusReady');
		announce(t('msgDoneResp'));
		
		setTimeout(() => {
			if (!fullText.includes('<div class="email-draft-form"')) {
				loadChat(currentChatId);
			}
		}, 500);

		if (dictationActive && isVoice) {
			document.getElementById('voiceStateText').textContent = t('msgGenerating');
			document.getElementById('voiceVisualizer').className = "voice-visualizer speaking";
			
			playTTS(null, fullText, () => {
				if (dictationActive) startDictation();
			});
		}

	} catch (e) {
		botContentDiv.innerHTML = t('Connection Error.');
		statusDisplay.textContent = t('Error');
		announce(t('msgTransErr'));
	}
}

function appendMessage(role, text, images, isNew, modelName = 'AI', usage = null) {
	const container = document.getElementById('chat-log');
	const div = document.createElement('div');
	div.className = `message ${role}`;
	
	div.rawText = text;
	
	let headerHtml = '';
	if (role === 'user') {
		headerHtml = `<h5>${t('You')}</h5>`;
	} else {
		headerHtml = `<h6>${modelName}</h6>`;
	}
	
	let contentHtml = "";
	if (text && text.includes('<div class="email-draft-form"')) {
		contentHtml = `<div class="message-content">${text}</div>`;
	} else {
		contentHtml = `<div class="message-content">${parseContent(text)}</div>`;
	}
	
	if (images && images.length > 0) {
		contentHtml += '<div style="margin-top: 0.5rem;">';
		images.forEach(img => {
			contentHtml += `<img src="data:image/jpeg;base64,${img}" alt="Uploaded image">`;
		});
		contentHtml += '</div>';
	}
	
	let actionsHtml = `
		<div class="msg-actions">
			${(usage && globalSettings.show_token_count !== false) ? `<span class="token-count">Tokens: ${usage.total} (${usage.prompt} In / ${usage.completion} Out)</span>` : ''}
			${(role === 'assistant' && globalSettings.tts_enabled && !text.includes('<div class="email-draft-form"')) ? `<button class="tts-btn" onclick="playTTS(this)">${t('msgRead')}</button>` : ''}
			<button class="copy-msg-btn" onclick="copyMessageText(this)">${t('msgCopy')}</button>
		</div>
	`;
	
	div.innerHTML = headerHtml + contentHtml + actionsHtml;
	container.appendChild(div);
	addCopyButtons(div);
	container.scrollTop = container.scrollHeight;
	return div;
}

function updateFileStatus() {
	const f = document.getElementById('fileInput').files[0];
	const span = document.getElementById('fileName');
	if(f) {
		span.textContent = `${t('msgFileSel')} ${f.name}`;
		span.style.display = 'inline';
		announce(`${t('msgFileNotSel')} ${f.name}`);
	} else {
		span.style.display = 'none';
	}
}

async function deleteChat(id) {
	if(!confirm(t('msgDelConfirm'))) return;
	await fetch(`/history?id=${id}`, { method: 'DELETE' });
	if(id === currentChatId) startNewChat();
	else loadHistory();
	announce(t('msgChatDeleted'));
}

async function clearAllHistory() {
	if(!confirm(t('msgDelAllConf'))) return;
	await fetch(`/history?all=true`, { method: 'DELETE' });
	startNewChat();
	document.getElementById('settingsModal').close();
	announce(t('msgAllDeleted'));
}

window.addEventListener('DOMContentLoaded', init);