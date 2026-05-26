let piperVoicesData = [];
let googleCloudVoicesData = [];
let emailAccountsDraft = [];
let defaultEmailDraftIndex = 0;

function getApiKeyValue(id) {
	const el = document.getElementById(id);
	if (!el) return '';
	// Wenn das Feld deaktiviert ist (vom Admin gesteuert),
	// übergeben wir nichts (leerer String), um den Nutzer-Key nicht fälschlich zu überschreiben.
	if (el.disabled) return '';
	return el.value;
}

function switchSettingsTab(tabId) {
	document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
	document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
	
	document.getElementById(tabId).classList.add('active');
	const activeBtn = document.querySelector(`[onclick="switchSettingsTab('${tabId}')"]`);
	if (activeBtn) activeBtn.classList.add('active');
}

function openSettings() {
	const modal = document.getElementById('settingsModal');
	switchSettingsTab('tab-general');
	modal.showModal();
	document.getElementById('settingsTitle').focus();
}

function toggleWebSearchModeVisibility() {
	const webSearchToggle = document.getElementById('webSearchToggle');
	const modeContainer = document.getElementById('webSearchModeContainer');
	if (webSearchToggle.checked) {
		modeContainer.style.display = 'block';
	} else {
		modeContainer.style.display = 'none';
	}
}

function toggleProviderFields() {
	const provider = document.getElementById('providerSelect').value;
	const geminiContainer = document.getElementById('geminiKeyContainer');
	const openrouterContainer = document.getElementById('openrouterKeyContainer');
	const openaiContainer = document.getElementById('openaiKeyContainer');
	const mistralContainer = document.getElementById('mistralKeyContainer');
	
	geminiContainer.style.display = 'none';
	openrouterContainer.style.display = 'none';
	if(openaiContainer) openaiContainer.style.display = 'none';
	if(mistralContainer) mistralContainer.style.display = 'none';
	
	if (provider === 'gemini') {
		geminiContainer.style.display = 'block';
	} else if (provider === 'openrouter') {
		openrouterContainer.style.display = 'block';
	} else if (provider === 'openai' && openaiContainer) {
		openaiContainer.style.display = 'block';
	} else if (provider === 'mistral' && mistralContainer) {
		mistralContainer.style.display = 'block';
	}
	
	const providerNames = {
		'ollama': 'Ollama',
		'gemini': 'Google Gemini',
		'openrouter': 'OpenRouter',
		'openai': 'OpenAI',
		'mistral': 'Mistral'
	};
	const pName = providerNames[provider] || provider;
	const nativeTextSpan = document.getElementById('nativeWebsearchSpan');
	if (nativeTextSpan) {
		const supported = ['gemini', 'openrouter'].includes(provider);
		let text = t('nativeWebsearch').replace('{provider}', pName);
		if (!supported) {
			text += ' (' + t('notSupportedFallback') + ')';
		}
		nativeTextSpan.textContent = text;
	}
	
	updateSettingsModelList();
}

function toggleTtsFields() {
	const ttsToggle = document.getElementById('ttsToggle');
	const ttsSettingsContainer = document.getElementById('ttsSettingsContainer');
	if (ttsToggle.checked) {
		ttsSettingsContainer.style.display = 'block';
		toggleTtsProviderFields();
	} else {
		ttsSettingsContainer.style.display = 'none';
	}
}

function toggleTtsProviderFields() {
	const provider = document.getElementById('ttsProviderSelect').value;
	const elevenlabsKeyContainer = document.getElementById('elevenlabsKeyContainer');
	const googleCloudSettingsContainer = document.getElementById('googleCloudSettingsContainer');
	const openaiTtsContainer = document.getElementById('openaiTtsSettingsContainer');
	const mistralTtsContainer = document.getElementById('mistralTtsSettingsContainer');
	const piperSettingsContainer = document.getElementById('piperSettingsContainer');
	const espeakSettingsContainer = document.getElementById('espeakSettingsContainer');
	const defaultVoiceContainer = document.getElementById('defaultVoiceContainer');
	const previewTtsBtn = document.getElementById('previewTtsBtn');
	
	elevenlabsKeyContainer.style.display = 'none';
	if(googleCloudSettingsContainer) googleCloudSettingsContainer.style.display = 'none';
	if(openaiTtsContainer) openaiTtsContainer.style.display = 'none';
	if(mistralTtsContainer) mistralTtsContainer.style.display = 'none';
	piperSettingsContainer.style.display = 'none';
	espeakSettingsContainer.style.display = 'none';
	defaultVoiceContainer.style.display = 'none';
	previewTtsBtn.style.display = 'block';
	
	if (provider === 'elevenlabs') {
		elevenlabsKeyContainer.style.display = 'block';
		defaultVoiceContainer.style.display = 'block';
		if (getApiKeyValue('elevenlabsApiKey') || globalSettings.elevenlabs_api_key_available) {
			loadElevenLabsVoices();
		} else {
			document.getElementById('ttsVoiceSelect').innerHTML = `<option value="">${t('msgPlsKey')}</option>`;
		}
	} else if (provider === 'googlecloud') {
		if(googleCloudSettingsContainer) googleCloudSettingsContainer.style.display = 'block';
		if (getApiKeyValue('googleCloudApiKey') || globalSettings.googlecloud_api_key_available) {
			loadGoogleCloudVoices();
		}
	} else if (provider === 'pyttsx3') {
		defaultVoiceContainer.style.display = 'block';
		loadPyttsx3Voices();
	} else if (provider === 'piper') {
		piperSettingsContainer.style.display = 'block';
		loadPiperVoices();
	} else if (provider === 'edge') {
		defaultVoiceContainer.style.display = 'block';
		loadEdgeVoices();
	} else if (provider === 'espeak') {
		espeakSettingsContainer.style.display = 'block';
		loadEspeakData();
	} else if (provider === 'openai') {
		if(openaiTtsContainer) openaiTtsContainer.style.display = 'block';
		defaultVoiceContainer.style.display = 'block';
		const select = document.getElementById('ttsVoiceSelect');
		select.innerHTML = `
			<option value="alloy">${t('Alloy (Neutral)')}</option>
			<option value="ash">${t('Ash (Clear & Precise)')}</option>
			<option value="ballad">${t('Ballad (Expressive/Narrative)')}</option>
			<option value="cedar">${t('Cedar (Warm & Grounded)')}</option>
			<option value="coral">${t('Coral (Warm & Friendly)')}</option>
			<option value="echo">${t('Echo (Clear, Masculine)')}</option>
			<option value="fable">${t('Fable (Warm, Expressive)')}</option>
			<option value="marin">${t('Marin (Clear & Natural)')}</option>
			<option value="nova">${t('Nova (Energetic, Feminine)')}</option>
			<option value="onyx">${t('Onyx (Deep, Authority)')}</option>
			<option value="sage">${t('Sage (Calm & Thoughtful)')}</option>
			<option value="shimmer">${t('Shimmer (Soft & Bright)')}</option>
			<option value="verse">${t('Verse (Versatile & Expressive)')}</option>
		`;
		if (globalSettings.openai_voice) {
			select.value = globalSettings.openai_voice;
		}
	} else if (provider === 'mistral') {
		if(mistralTtsContainer) mistralTtsContainer.style.display = 'block';
		defaultVoiceContainer.style.display = 'block';
		if (getApiKeyValue('mistralApiKey') || globalSettings.mistral_api_key_available) {
			loadMistralVoices();
		} else {
			document.getElementById('ttsVoiceSelect').innerHTML = `<option value="">${t('msgPlsKey')}</option>`;
		}
	} else if (provider === 'gtts') {
		defaultVoiceContainer.style.display = 'block';
		const select = document.getElementById('ttsVoiceSelect');
		select.innerHTML = `
			<option value="de">${t('German')}</option>
			<option value="en">${t('English')}</option>
			<option value="fr">${t('French')}</option>
			<option value="es">${t('Spanish')}</option>
			<option value="it">${t('Italian')}</option>
			<option value="ko">${t('Korean')}</option>
			<option value="ja">${t('Japanese')}</option>
			<option value="zh-CN">${t('Chinese (Simplified)')}</option>
			<option value="ru">${t('Russian')}</option>
		`;
		if (globalSettings.gtts_voice) {
			select.value = globalSettings.gtts_voice;
		}
	} else if (provider === 'naver') {
		defaultVoiceContainer.style.display = 'block';
		const select = document.getElementById('ttsVoiceSelect');
		select.innerHTML = `
			<option value="en">${t('English (en)')}</option>
			<option value="ko">${t('Korean (ko)')}</option>
			<option value="ja">${t('Japanese (ja)')}</option>
			<option value="es">${t('Spanish (es)')}</option>
		`;
		if (globalSettings.navertts_voice) {
			select.value = globalSettings.navertts_voice;
		}
	} else {
		defaultVoiceContainer.style.display = 'block';
		populateSapi5Voices();
	}
}

function updateSavedDefault() {
	const provider = document.getElementById('providerSelect').value;
	const defaultSel = document.getElementById('defaultModelSelect');
	if (defaultSel && defaultSel.options.length > 0) {
		const opt = defaultSel.options[defaultSel.selectedIndex];
		if (opt && opt.text !== '...' && !opt.text.includes('Fehler') && !opt.text.includes('Error')) {
			savedDefaults[provider] = defaultSel.value;
		}
	}
}

function addEmailAccountUI(acc = null, isDefault = false) {
	if (acc) {
		emailAccountsDraft.push(acc);
		if (isDefault) defaultEmailDraftIndex = emailAccountsDraft.length - 1;
		renderEmailAccounts();
		return;
	}
	openEmailAccountDialog(-1);
}

function renderEmailAccounts() {
	const container = document.getElementById('emailAccountsContainer');
	const summary = document.getElementById('emailAccountSummary');
	container.innerHTML = '';
	summary.textContent = emailAccountsDraft.length ? `${emailAccountsDraft.length} ${t('account(s) configured.')}` : t('No e-mail accounts configured.');
	emailAccountsDraft.forEach((acc, idx) => {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'btn-secondary';
		btn.style.cssText = 'display:block; width:100%; text-align:left; margin-bottom:0.5rem; padding:0.6rem;';
		const name = acc.name || acc.smtp_user || `${t('Account')} ${idx + 1}`;
		btn.textContent = `${idx === defaultEmailDraftIndex ? `[${t('Default')}] ` : ''}${name}`;
		btn.setAttribute('aria-label', `${t('Edit e-mail account')} ${name}`);
		btn.onclick = () => openEmailAccountDialog(idx);
		container.appendChild(btn);
	});
}

function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text || '';
	return div.innerHTML;
}

function openEmailAccountDialog(index) {
	const dialog = document.getElementById('emailAccountDialog');
	const acc = index >= 0 ? emailAccountsDraft[index] : {name: '', smtp_server: '', smtp_port: 587, imap_server: '', imap_port: 993, smtp_user: '', smtp_password: '', smtp_sender: ''};
	document.getElementById('emailAccountIndex').value = String(index);
	document.getElementById('emailAccountDialogTitle').textContent = index >= 0 ? t('Edit e-mail account') : t('Add e-mail account');
	document.getElementById('emailAccountName').value = acc.name || '';
	document.getElementById('emailSmtpServer').value = acc.smtp_server || '';
	document.getElementById('emailSmtpPort').value = acc.smtp_port || 587;
	document.getElementById('emailImapServer').value = acc.imap_server || '';
	document.getElementById('emailImapPort').value = acc.imap_port || 993;
	document.getElementById('emailUser').value = acc.smtp_user || '';
	document.getElementById('emailPass').value = acc.smtp_password || '';
	document.getElementById('emailSender').value = acc.smtp_sender || '';
	document.getElementById('emailDefaultAccount').checked = index === defaultEmailDraftIndex || emailAccountsDraft.length === 0;
	dialog.showModal();
	document.getElementById('emailAccountDialogTitle').focus();
}

function saveEmailAccountDialog() {
	const index = parseInt(document.getElementById('emailAccountIndex').value);
	const acc = {
		name: document.getElementById('emailAccountName').value,
		smtp_server: document.getElementById('emailSmtpServer').value,
		smtp_port: parseInt(document.getElementById('emailSmtpPort').value) || 587,
		imap_server: document.getElementById('emailImapServer').value,
		imap_port: parseInt(document.getElementById('emailImapPort').value) || 993,
		smtp_user: document.getElementById('emailUser').value,
		smtp_password: document.getElementById('emailPass').value,
		smtp_sender: document.getElementById('emailSender').value
	};
	let targetIndex = index;
	if (index >= 0) {
		emailAccountsDraft[index] = acc;
	} else {
		emailAccountsDraft.push(acc);
		targetIndex = emailAccountsDraft.length - 1;
	}
	if (document.getElementById('emailDefaultAccount').checked) {
		defaultEmailDraftIndex = targetIndex;
	}
	document.getElementById('emailAccountDialog').close();
	renderEmailAccounts();
}

function deleteEmailAccountFromDialog() {
	const index = parseInt(document.getElementById('emailAccountIndex').value);
	if (index >= 0) {
		emailAccountsDraft.splice(index, 1);
		if (defaultEmailDraftIndex >= emailAccountsDraft.length) defaultEmailDraftIndex = Math.max(0, emailAccountsDraft.length - 1);
	}
	document.getElementById('emailAccountDialog').close();
	renderEmailAccounts();
}

let currentModelFetchProvider = '';

async function updateSettingsModelList() {
	const provider = document.getElementById('providerSelect').value;
	currentModelFetchProvider = provider;
	const defaultSel = document.getElementById('defaultModelSelect');
	defaultSel.innerHTML = '<option value="">...</option>';
	
	let apiKey = '';
	if (provider === 'gemini') {
		apiKey = getApiKeyValue('geminiApiKey');
	} else if (provider === 'openai') {
		apiKey = getApiKeyValue('openaiApiKey');
	} else if (provider === 'mistral') {
		apiKey = getApiKeyValue('mistralApiKey');
	} else if (provider === 'openrouter') {
		apiKey = getApiKeyValue('openrouterApiKey');
	}
	
	try {
		const res = await fetch(`/models?provider=${provider}&api_key=${encodeURIComponent(apiKey)}`);
		if (res.redirected) { window.location.href = res.url; return; }
		const models = await res.json();
		
		if (currentModelFetchProvider !== provider) return;
		
		if (models.length === 0) {
			defaultSel.innerHTML = `<option value="">${t('msgNoModel')}</option>`;
		} else {
			const optionsHtml = models.map(m => `<option value="${m}">${m}</option>`).join('');
			defaultSel.innerHTML = `<option value="">${t('msgDefModel')}</option>` + optionsHtml;
			
			if (savedDefaults[provider]) {
				const exists = Array.from(defaultSel.options).some(opt => opt.value === savedDefaults[provider]);
				if (exists) {
					defaultSel.value = savedDefaults[provider];
				}
			}
		}
	} catch(e) {
		if (currentModelFetchProvider === provider) {
			defaultSel.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
		}
	}
}

async function loadSettings() {
	const res = await fetch('/settings');
	if (res.redirected) { window.location.href = res.url; return; }
	const data = await res.json();
	
	globalSettings = data;
	appLanguage = data.language || 'auto';
	
	savedDefaults.ollama = data.default_model_ollama || '';
	savedDefaults.gemini = data.default_model_gemini || '';
	savedDefaults.openrouter = data.default_model_openrouter || '';
	savedDefaults.openai = data.default_model_openai || '';
	savedDefaults.mistral = data.default_model_mistral || '';
	
	const langDropdown = document.getElementById('appLanguageSelect');
	if (langDropdown) langDropdown.value = appLanguage;
	
	document.getElementById('providerSelect').value = data.ai_provider || 'ollama';
	
	// Dynamische Zuweisung und Sperre der API-Keys
	const handleApiKeyField = (inputId, keyField, availableField, data) => {
		const el = document.getElementById(inputId);
		if (!el) return;
		if (data[keyField]) {
			el.type = 'password';
			el.value = data[keyField];
			el.disabled = false;
		} else if (data[availableField]) {
			el.type = 'text';
			el.value = t('msgAdminKey');
			el.disabled = true;
		} else {
			el.type = 'password';
			el.value = '';
			el.disabled = false;
		}
	};

	handleApiKeyField('geminiApiKey', 'gemini_api_key', 'gemini_api_key_available', data);
	handleApiKeyField('openrouterApiKey', 'openrouter_api_key', 'openrouter_api_key_available', data);
	handleApiKeyField('openaiApiKey', 'openai_api_key', 'openai_api_key_available', data);
	handleApiKeyField('mistralApiKey', 'mistral_api_key', 'mistral_api_key_available', data);
	handleApiKeyField('elevenlabsApiKey', 'elevenlabs_api_key', 'elevenlabs_api_key_available', data);
	handleApiKeyField('googleCloudApiKey', 'googlecloud_api_key', 'googlecloud_api_key_available', data);
	
	if(document.getElementById('openrouterFreeToggle')) document.getElementById('openrouterFreeToggle').checked = data.openrouter_free_only || false;
	if(document.getElementById('nativeWebsearchToggle')) document.getElementById('nativeWebsearchToggle').checked = data.native_websearch !== false;
	
	toggleProviderFields(); 

	document.getElementById('sysPrompt').value = data.system_prompt;
	document.getElementById('historyToggle').checked = data.history_enabled;
	document.getElementById('contextLimit').value = data.history_context_limit !== undefined ? data.history_context_limit : 10;
	
	document.getElementById('webSearchToggle').checked = data.web_search_enabled;
	document.getElementById('searxngUrl').value = data.searxng_url || 'http://localhost:8085';
	document.getElementById('webSearchModeSelect').value = data.web_search_mode || "auto";
	document.getElementById('webSearchMaxResults').value = data.web_search_max_results || 2;
	toggleWebSearchModeVisibility();

	document.getElementById('toolDocGenToggle').checked = data.tool_doc_gen_enabled !== false;
	document.getElementById('toolEmailSendToggle').checked = data.tool_email_send_enabled !== false;
	document.getElementById('toolEmailReadToggle').checked = data.tool_email_read_enabled !== false;
	document.getElementById('toolYoutubeToggle').checked = data.tool_youtube_enabled !== false;
	document.getElementById('toolAudioToggle').checked = data.tool_audio_enabled !== false;
	const lockedAgents = data.locked_agents || {};
	['toolDocGenToggle', 'toolEmailSendToggle', 'toolEmailReadToggle', 'toolYoutubeToggle', 'toolAudioToggle', 'webSearchToggle'].forEach(id => {
		const el = document.getElementById(id);
		if (el) el.disabled = false;
	});
	const lockMap = {
		tool_doc_gen_enabled: 'toolDocGenToggle',
		tool_email_send_enabled: 'toolEmailSendToggle',
		tool_email_read_enabled: 'toolEmailReadToggle',
		tool_youtube_enabled: 'toolYoutubeToggle',
		tool_audio_enabled: 'toolAudioToggle',
		web_search_enabled: 'webSearchToggle'
	};
	Object.keys(lockedAgents).forEach(key => {
		const el = document.getElementById(lockMap[key]);
		if (el) el.disabled = true;
	});
	document.getElementById('sysPrompt').disabled = data.system_prompt_locked || false;
	
	document.getElementById('menu-tool-doc_gen').style.display = data.tool_doc_gen_enabled !== false ? 'block' : 'none';
	document.getElementById('menu-tool-email_send').style.display = data.tool_email_send_enabled !== false ? 'block' : 'none';
	document.getElementById('menu-tool-email_read').style.display = data.tool_email_read_enabled !== false ? 'block' : 'none';
	document.getElementById('menu-tool-youtube').style.display = data.tool_youtube_enabled !== false ? 'block' : 'none';
	document.getElementById('menu-tool-audio').style.display = data.tool_audio_enabled !== false ? 'block' : 'none';
	document.getElementById('menu-tool-websearch').style.display = data.web_search_enabled ? 'block' : 'none';

	const anyToolActive = (data.tool_doc_gen_enabled !== false) || 
						  (data.tool_email_send_enabled !== false) || 
						  (data.tool_email_read_enabled !== false) || 
						  (data.tool_youtube_enabled !== false) || 
						  (data.tool_audio_enabled !== false) || 
						  data.web_search_enabled;
						  
	document.getElementById('toolsMenuBtn').style.display = anyToolActive ? 'inline-block' : 'none';

	document.getElementById('ttsToggle').checked = data.tts_enabled || false;
	document.getElementById('ttsDownloadToggle').checked = data.tts_download_enabled || false;
	document.getElementById('elevenlabsMusicToggle').checked = data.elevenlabs_music_enabled || false;
	
	const musicBtn = document.getElementById('musicToggleBtn');
	if (musicBtn) {
		musicBtn.style.display = data.elevenlabs_music_enabled ? 'inline-block' : 'none';
	}
	
	document.getElementById('ttsProviderSelect').value = data.tts_provider || 'sapi5';
	
	if (document.getElementById('openaiTtsModelSelect')) {
		document.getElementById('openaiTtsModelSelect').value = data.openai_tts_model || 'tts-1';
	}
	if (document.getElementById('mistralTtsModelSelect')) {
		document.getElementById('mistralTtsModelSelect').value = data.mistral_tts_model || 'voxtral-mini-tts-2603';
	}
	
	if (data.tts_provider === 'gtts') {
		globalSettings.gtts_voice = data.gtts_voice || 'de';
	} else if (data.tts_provider === 'naver') {
		globalSettings.navertts_voice = data.navertts_voice || 'en';
	} else if (data.tts_provider === 'pyttsx3') {
		globalSettings.pyttsx3_voice = data.pyttsx3_voice || '';
	}
	
	toggleTtsFields();
	
	globalSettings.show_token_count = data.show_token_count !== undefined ? data.show_token_count : true;
	const tokenToggle = document.getElementById('showTokenCountToggle');
	if (tokenToggle) tokenToggle.checked = globalSettings.show_token_count;

	const emailContainer = document.getElementById('emailAccountsContainer');
	if (emailContainer) {
		emailAccountsDraft = Array.isArray(data.email_accounts) ? data.email_accounts.slice() : [];
		defaultEmailDraftIndex = data.default_email_account || 0;
		renderEmailAccounts();
	}

	const adminTabBtn = document.getElementById('adminTabBtn');
	if (adminTabBtn) {
		adminTabBtn.style.display = data.is_admin ? 'inline-block' : 'none';
		if (data.is_admin) loadAdminUsers();
	}
	
	// Dynamische API-Key Keyup Event-Listener hinzufügen
	['geminiApiKey', 'openrouterApiKey', 'openaiApiKey', 'mistralApiKey'].forEach(id => {
		const el = document.getElementById(id);
		if (el) {
			if (!el.dataset.listenerAdded) {
				el.addEventListener('change', updateSettingsModelList);
				el.dataset.listenerAdded = 'true';
			}
		}
	});
}

async function loadAdminUsers() {
	const container = document.getElementById('adminUsersContainer');
	if (!container) return;
	container.innerHTML = `<p>${t('Loading users...')}</p>`;
	try {
		const res = await fetch('/admin/users');
		if (!res.ok) {
			container.innerHTML = `<p>${t('Admin settings unavailable.')}</p>`;
			return;
		}
		const data = await res.json();
		container.innerHTML = '';
		
		const agentKeyMap = {
			'tool_doc_gen_enabled': 'toolDocGenEnable',
			'tool_email_send_enabled': 'toolEmailSendEnable',
			'tool_email_read_enabled': 'toolEmailReadEnable',
			'tool_youtube_enabled': 'toolYoutubeEnable',
			'tool_audio_enabled': 'toolAudioEnable',
			'web_search_enabled': 'webSearchEnable'
		};
		
		const apiKeyMap = {
			'gemini_api_key': 'Gemini API',
			'openrouter_api_key': 'OpenRouter API',
			'openai_api_key': 'OpenAI API',
			'mistral_api_key': 'Mistral API',
			'elevenlabs_api_key': 'ElevenLabs API',
			'googlecloud_api_key': 'Google Cloud API'
		};

		data.users.forEach(user => {
			if (user.is_admin) return;
			const policy = user.policy || {};
			const shared = new Set(policy.shared_api_keys || []);
			const locked = policy.locked_agents || {};
			const block = document.createElement('div');
			block.className = 'admin-user-block';
			block.dataset.username = user.username;
			block.style.cssText = 'border:1px solid #ced4da; border-radius:4px; padding:0.8rem; margin-bottom:0.8rem; display:block;';
			block.innerHTML = `
				<h3 style="margin-top:0; font-size:1rem;">${escapeHtml(user.username)}</h3>
				
				<div style="margin-bottom:1rem; display:block;">
					<label style="display:block; font-weight:bold; margin-bottom:0.4rem;">${t('Shared API keys')}</label>
					${data.api_key_fields.map(key => `
						<div style="display:block; margin-bottom:0.5rem;">
							<label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer;">
								<input type="checkbox" class="admin-shared-key" value="${key}" ${shared.has(key) ? 'checked' : ''} style="margin:0;">
								<span>${apiKeyMap[key] || key}</span>
							</label>
						</div>
					`).join('')}
				</div>
				
				<div style="margin-bottom:1rem; display:block;">
					<label style="display:block; font-weight:bold; margin-bottom:0.4rem;">${t('Locked agents')}</label>
					${data.lockable_agent_fields.map(key => `
						<div style="display:block; margin-bottom:0.5rem;">
							<label style="display:block; margin-bottom:0.2rem;">${agentKeyMap[key] ? t(agentKeyMap[key]) : key}</label>
							<select class="admin-lock-agent" data-key="${key}" style="width:100%; padding:0.3rem; display:block; border-radius:4px; border:1px solid #ced4da;">
								<option value="" ${Object.prototype.hasOwnProperty.call(locked, key) ? '' : 'selected'}>${t('User choice')}</option>
								<option value="true" ${locked[key] === true ? 'selected' : ''}>${t('Force enabled')}</option>
								<option value="false" ${locked[key] === false ? 'selected' : ''}>${t('Force disabled')}</option>
							</select>
						</div>
					`).join('')}
				</div>
				
				<div style="margin-bottom:1rem; display:block;">
					<div style="display:block; margin-bottom:0.5rem;">
						<label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer; font-weight:bold;">
							<input type="checkbox" class="admin-lock-prompt" ${policy.lock_system_prompt ? 'checked' : ''} style="margin:0;">
							<span>${t('Lock system prompt')}</span>
						</label>
					</div>
					<textarea class="admin-system-prompt" style="width:100%; height:80px; margin-bottom:0.5rem; display:block; border-radius:4px; border:1px solid #ced4da; padding:0.5rem;">${escapeHtml(policy.system_prompt || '')}</textarea>
				</div>
				
				<div style="display:block;">
					<button type="button" class="btn-primary" style="width:100%; display:block;" onclick="saveAdminUserPolicy(this)">${t('Save user policy')}</button>
				</div>
			`;
			container.appendChild(block);
		});
		if (!container.innerHTML) {
			container.innerHTML = `<p>${t('No regular users yet.')}</p>`;
		}
	} catch(e) {
		container.innerHTML = `<p>${t('Admin settings unavailable.')}</p>`;
	}
}

async function saveAdminUserPolicy(btn) {
	const block = btn.closest('.admin-user-block');
	const username = block.dataset.username;
	const shared_api_keys = Array.from(block.querySelectorAll('.admin-shared-key:checked')).map(el => el.value);
	const locked_agents = {};
	block.querySelectorAll('.admin-lock-agent').forEach(el => {
		if (el.value !== '') locked_agents[el.dataset.key] = el.value === 'true';
	});
	const payload = {
		shared_api_keys,
		locked_agents,
		lock_system_prompt: block.querySelector('.admin-lock-prompt').checked,
		system_prompt: block.querySelector('.admin-system-prompt').value
	};
	btn.disabled = true;
	btn.textContent = t('Saving...');
	try {
		const res = await fetch(`/admin/users/${encodeURIComponent(username)}/policy`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(payload)
		});
		btn.textContent = res.ok ? t('Saved') : t('Error');
		setTimeout(() => { btn.textContent = t('Save user policy'); btn.disabled = false; }, 1200);
	} catch(e) {
		btn.textContent = t('Error');
		setTimeout(() => { btn.textContent = t('Save user policy'); btn.disabled = false; }, 1200);
	}
}

async function populateSapi5Voices() {
	const select = document.getElementById('ttsVoiceSelect');
	select.innerHTML = '<option value="">...</option>';
	try {
		const res = await fetch('/tts/sapi5/voices');
		if (res.redirected) { window.location.href = res.url; return; }
		const voices = await res.json();
		select.innerHTML = '';
		if (voices.error) {
			select.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
			return;
		}
		voices.forEach(voice => {
			const option = document.createElement('option');
			option.value = voice.id;
			option.textContent = voice.name;
			select.appendChild(option);
		});
		if (globalSettings.sapi5_voice) {
			const exists = Array.from(select.options).some(opt => opt.value === globalSettings.sapi5_voice);
			if (exists) select.value = globalSettings.sapi5_voice;
		}
	} catch(e) {
		select.innerHTML = `<option value="">${t('msgNetErr')}</option>`;
	}
}

async function loadPyttsx3Voices() {
	const select = document.getElementById('ttsVoiceSelect');
	select.innerHTML = '<option value="">...</option>';
	try {
		const res = await fetch('/tts/pyttsx3/voices');
		if (res.redirected) { window.location.href = res.url; return; }
		const voices = await res.json();
		select.innerHTML = '';
		if (voices.error) {
			select.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
			return;
		}
		voices.forEach(voice => {
			const option = document.createElement('option');
			option.value = voice.id;
			option.textContent = voice.name;
			select.appendChild(option);
		});
		if (globalSettings.pyttsx3_voice) {
			const exists = Array.from(select.options).some(opt => opt.value === globalSettings.pyttsx3_voice);
			if (exists) select.value = globalSettings.pyttsx3_voice;
		}
	} catch (e) {
		select.innerHTML = `<option value="">${t('msgNetErr')}</option>`;
	}
}

async function loadEdgeVoices() {
	const select = document.getElementById('ttsVoiceSelect');
	select.innerHTML = '<option value="">...</option>';
	try {
		const res = await fetch('/tts/edge/voices');
		if (res.redirected) { window.location.href = res.url; return; }
		const voices = await res.json();
		select.innerHTML = '';
		if (voices.error) {
			select.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
			return;
		}
		voices.forEach(voice => {
			const option = document.createElement('option');
			option.value = voice.id;
			option.textContent = voice.name;
			select.appendChild(option);
		});
		if (globalSettings.edge_voice) {
			const exists = Array.from(select.options).some(opt => opt.value === globalSettings.edge_voice);
			if (exists) select.value = globalSettings.edge_voice;
		}
	} catch(e) {
		select.innerHTML = `<option value="">${t('msgNetErr')}</option>`;
	}
}

async function loadElevenLabsVoices() {
	const apiKey = getApiKeyValue('elevenlabsApiKey');
	if (!apiKey && !globalSettings.elevenlabs_api_key_available) {
		alert(t('msgPlsKey'));
		return;
	}
	const select = document.getElementById('ttsVoiceSelect');
	select.innerHTML = '<option value="">...</option>';
	try {
		const res = await fetch('/tts/elevenlabs/voices', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ api_key: apiKey })
		});
		if (res.redirected) { window.location.href = res.url; return; }
		const voices = await res.json();
		if (voices.error) {
			select.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
			alert(voices.error);
			return;
		}
		select.innerHTML = '';
		voices.forEach(voice => {
			const option = document.createElement('option');
			option.value = voice.voice_id;
			option.textContent = voice.name;
			select.appendChild(option);
		});
		if (globalSettings.elevenlabs_voice) {
			const exists = Array.from(select.options).some(opt => opt.value === globalSettings.elevenlabs_voice);
			if (exists) select.value = globalSettings.elevenlabs_voice;
		}
	} catch(e) {
		select.innerHTML = `<option value="">${t('msgNetErr')}</option>`;
	}
}

async function loadMistralVoices() {
	const apiKey = getApiKeyValue('mistralApiKey');
	if (!apiKey && !globalSettings.mistral_api_key_available) {
		alert(t('msgPlsKey'));
		return;
	}
	const select = document.getElementById('ttsVoiceSelect');
	select.innerHTML = '<option value="">...</option>';
	try {
		const res = await fetch('/tts/mistral/voices', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ api_key: apiKey })
		});
		if (res.redirected) { window.location.href = res.url; return; }
		const voices = await res.json();
		if (voices.error) {
			select.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
			alert(voices.error);
			document.getElementById('mistralDeleteVoiceBtn').style.display = 'none';
			return;
		}
		select.innerHTML = '';
		if (voices.length > 0) {
			document.getElementById('mistralDeleteVoiceBtn').style.display = 'block';
		} else {
			document.getElementById('mistralDeleteVoiceBtn').style.display = 'none';
		}
		voices.forEach(voice => {
			const option = document.createElement('option');
			option.value = voice.id;
			option.textContent = voice.name || voice.id;
			select.appendChild(option);
		});
		if (globalSettings.mistral_voice) {
			const exists = Array.from(select.options).some(opt => opt.value === globalSettings.mistral_voice);
			if (exists) select.value = globalSettings.mistral_voice;
		}
	} catch(e) {
		select.innerHTML = `<option value="">${t('msgNetErr')}</option>`;
		document.getElementById('mistralDeleteVoiceBtn').style.display = 'none';
	}
}

async function createMistralVoice() {
	const apiKey = getApiKeyValue('mistralApiKey');
	const name = document.getElementById('mistralVoiceName').value.trim();
	const languages = document.getElementById('mistralVoiceLanguages').value.trim();
	const gender = document.getElementById('mistralVoiceGender').value;
	const sampleInput = document.getElementById('mistralVoiceSample');
	const consent = document.getElementById('mistralVoiceConsent').checked;
	const status = document.getElementById('mistralVoiceCreateStatus');
	const sample = sampleInput.files ? sampleInput.files[0] : null;

	if (!apiKey && !globalSettings.mistral_api_key_available) {
		alert(t('msgPlsKey'));
		return;
	}

	if (!name || !sample || !consent) {
		alert(t('msgMissInput'));
		return;
	}

	status.style.display = 'block';
	status.textContent = t('Creating voice...');

	const formData = new FormData();
	formData.append('api_key', apiKey);
	formData.append('name', name);
	formData.append('languages', languages);
	formData.append('gender', gender);
	formData.append('sample', sample);

	try {
		const res = await fetch('/tts/mistral/voices/create', {
			method: 'POST',
			body: formData
		});
		if (res.redirected) { window.location.href = res.url; return; }
		const data = await res.json();
		if (!res.ok || data.error) {
			status.textContent = `${t('Error')}: ${data.error || res.status}`;
			return;
		}
		status.textContent = t('Voice created.');
		globalSettings.mistral_voice = data.id || '';
		await loadMistralVoices();
		if (data.id) document.getElementById('ttsVoiceSelect').value = data.id;
	} catch(e) {
		status.textContent = t('msgNetErr');
	}
}

async function deleteMistralVoice() {
	const apiKey = getApiKeyValue('mistralApiKey');
	const voiceSelect = document.getElementById('ttsVoiceSelect');
	const voiceId = voiceSelect.value;
	
	if (!apiKey && !globalSettings.mistral_api_key_available) {
		alert(t('msgPlsKey'));
		return;
	}
	if (!voiceId) return;

	if (!confirm(t('msgDelVoiceConf'))) return;

	try {
		const res = await fetch('/tts/mistral/voices/delete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ api_key: apiKey, voice_id: voiceId })
		});
		if (res.redirected) { window.location.href = res.url; return; }
		const data = await res.json();
		if (!res.ok || data.error) {
			alert(`${t('Error')}: ${data.error || res.status}`);
			return;
		}
		alert(t('msgVoiceDeleted'));
		if (globalSettings.mistral_voice === voiceId) globalSettings.mistral_voice = '';
		await loadMistralVoices();
	} catch(e) {
		alert(t('msgNetErr'));
	}
}

async function loadGoogleCloudVoices() {
	const apiKey = getApiKeyValue('googleCloudApiKey');
	if (!apiKey && !globalSettings.googlecloud_api_key_available) {
		alert(t('msgPlsKey'));
		return;
	}
	const langSelect = document.getElementById('googleCloudLangSelect');
	langSelect.innerHTML = '<option value="">...</option>';
	try {
		const res = await fetch('/tts/googlecloud/voices', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ api_key: apiKey })
		});
		if (res.redirected) { window.location.href = res.url; return; }
		const voices = await res.json();
		if (voices.error) {
			langSelect.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
			alert(voices.error);
			return;
		}

		googleCloudVoicesData = voices;
		const langs = new Set();
		voices.forEach(v => {
			if (v.languageCodes && v.languageCodes.length > 0) {
				langs.add(v.languageCodes[0]);
			}
		});

		const sortedLangs = Array.from(langs).sort();
		langSelect.innerHTML = '';
		sortedLangs.forEach(l => {
			const opt = document.createElement('option');
			opt.value = l;
			opt.textContent = l;
			langSelect.appendChild(opt);
		});

		if (globalSettings.googlecloud_language) {
			const exists = sortedLangs.includes(globalSettings.googlecloud_language);
			if (exists) langSelect.value = globalSettings.googlecloud_language;
		}

		updateGoogleCloudVoiceUI();
	} catch(e) {
		langSelect.innerHTML = `<option value="">${t('msgNetErr')}</option>`;
	}
}

function updateGoogleCloudVoiceUI() {
	const lang = document.getElementById('googleCloudLangSelect').value;
	const voiceSelect = document.getElementById('googleCloudVoiceSelect');
	voiceSelect.innerHTML = '';

	if (!lang) return;

	const filtered = googleCloudVoicesData.filter(v => v.languageCodes && v.languageCodes.includes(lang));
	filtered.sort((a, b) => a.name.localeCompare(b.name));

	filtered.forEach(v => {
		const opt = document.createElement('option');
		opt.value = v.name;
		opt.textContent = `${v.name} (${v.ssmlGender})`;
		voiceSelect.appendChild(opt);
	});

	if (globalSettings.googlecloud_voice) {
		const exists = filtered.some(v => v.name === globalSettings.googlecloud_voice);
		if (exists) voiceSelect.value = globalSettings.googlecloud_voice;
	}
}

async function loadEspeakData() {
	const langSelect = document.getElementById('espeakVoiceSelect');
	const variantSelect = document.getElementById('espeakVariantSelect');
	langSelect.innerHTML = '<option value="">...</option>';
	variantSelect.innerHTML = '<option value="">...</option>';
	
	try {
		const res = await fetch('/tts/espeak/info');
		if (res.redirected) { window.location.href = res.url; return; }
		const data = await res.json();
		
		if (data.error) {
			langSelect.innerHTML = `<option value="">${data.error}</option>`;
			return;
		}
		
		langSelect.innerHTML = '';
		data.languages.forEach(l => {
			const opt = document.createElement('option');
			opt.value = l.id;
			opt.textContent = l.name;
			langSelect.appendChild(opt);
		});
		
		variantSelect.innerHTML = '';
		data.variants.forEach(v => {
			const opt = document.createElement('option');
			opt.value = v.id;
			opt.textContent = v.name;
			variantSelect.appendChild(opt);
		});
		
		if (globalSettings.espeak_voice) {
			const exists = Array.from(langSelect.options).some(opt => opt.value === globalSettings.espeak_voice);
			if (exists) langSelect.value = globalSettings.espeak_voice;
		}
		if (globalSettings.espeak_variant) {
			const exists = Array.from(variantSelect.options).some(opt => opt.value === globalSettings.espeak_variant);
			if (exists) variantSelect.value = globalSettings.espeak_variant;
		}
		
	} catch (e) {
		langSelect.innerHTML = `<option value="">${t('msgNetErr')}</option>`;
	}
}

async function loadPiperVoices() {
	const select = document.getElementById('piperVoiceSelect');
	select.innerHTML = '<option value="">...</option>';
	try {
		const res = await fetch('/tts/piper/voices');
		if (res.redirected) { window.location.href = res.url; return; }
		piperVoicesData = await res.json();
		if (piperVoicesData.error) {
			select.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
			return;
		}
		select.innerHTML = '';
		
		piperVoicesData.forEach(voice => {
			const option = document.createElement('option');
			option.value = voice.key;
			option.textContent = (voice.downloaded ? '[OK] ' : '[DL] ') + voice.name;
			select.appendChild(option);
		});
		
		if (globalSettings.piper_voice) {
			const exists = Array.from(select.options).some(opt => opt.value === globalSettings.piper_voice);
			if (exists) select.value = globalSettings.piper_voice;
		}
		
		updatePiperVoiceUI();
	} catch(e) {
		select.innerHTML = `<option value="">${t('msgNetErr')}</option>`;
	}
}

function updatePiperVoiceUI() {
	const select = document.getElementById('piperVoiceSelect');
	const dlBtn = document.getElementById('piperDownloadBtn');
	const speakerContainer = document.getElementById('piperSpeakerContainer');
	const speakerSelect = document.getElementById('piperSpeakerSelect');
	const previewBtn = document.getElementById('previewTtsBtn');
	
	const selectedKey = select.value;
	const voiceData = piperVoicesData.find(v => v.key === selectedKey);
	
	if (!voiceData) return;
	
	if (voiceData.downloaded) {
		dlBtn.style.display = 'none';
		previewBtn.style.display = 'block';
		
		const speakersKeys = Object.keys(voiceData.speakers);
		if (speakersKeys.length > 1) {
			speakerContainer.style.display = 'block';
			speakerSelect.innerHTML = '';
			speakersKeys.forEach(id => {
				const opt = document.createElement('option');
				opt.value = id;
				opt.textContent = voiceData.speakers[id];
				speakerSelect.appendChild(opt);
			});
			if (globalSettings.piper_speaker) {
				const exists = Array.from(speakerSelect.options).some(opt => opt.value === globalSettings.piper_speaker);
				if (exists) speakerSelect.value = globalSettings.piper_speaker;
			}
		} else {
			speakerContainer.style.display = 'none';
			speakerSelect.innerHTML = `<option value="${speakersKeys[0]}">${voiceData.speakers[speakersKeys[0]]}</option>`;
		}
	} else {
		dlBtn.style.display = 'block';
		previewBtn.style.display = 'none';
		speakerContainer.style.display = 'none';
	}
}

async function downloadPiperVoice() {
	const key = document.getElementById('piperVoiceSelect').value;
	if (!key) return;
	
	const btn = document.getElementById('piperDownloadBtn');
	const status = document.getElementById('piperDownloadStatus');
	
	btn.disabled = true;
	status.style.display = 'block';
	status.textContent = t('msgWaitDl');
	
	try {
		const res = await fetch('/tts/piper/download', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key: key })
		});
		if (res.redirected) { window.location.href = res.url; return; }
		const data = await res.json();
		
		if (!res.ok) {
			status.textContent = t('Error') + ': ' + (data.error || 'Unknown');
		} else {
			status.textContent = t('msgDlSuccess');
			await loadPiperVoices(); 
			setTimeout(() => { status.style.display = 'none'; }, 3000);
		}
	} catch (e) {
		status.textContent = t('msgNetErr');
	} finally {
		btn.disabled = false;
	}
}

async function saveSettings() {
	const language = document.getElementById('appLanguageSelect').value;
	const provider = document.getElementById('providerSelect').value;
	
	// API Keys sicher auslesen (deaktivierte Felder als leerer String)
	const geminiKey = getApiKeyValue('geminiApiKey');
	const openrouterKey = getApiKeyValue('openrouterApiKey');
	const openaiKey = getApiKeyValue('openaiApiKey');
	const mistralKey = getApiKeyValue('mistralApiKey');
	const elApiKey = getApiKeyValue('elevenlabsApiKey');
	const gcApiKey = getApiKeyValue('googleCloudApiKey');
	
	const openrouterFree = document.getElementById('openrouterFreeToggle') ? document.getElementById('openrouterFreeToggle').checked : false;
	const nativeWebSearch = document.getElementById('nativeWebsearchToggle') ? document.getElementById('nativeWebsearchToggle').checked : true;
	const prompt = document.getElementById('sysPrompt').value;
	const hist = document.getElementById('historyToggle').checked;
	const ctxLimit = parseInt(document.getElementById('contextLimit').value) || 0;
	
	const webSearch = document.getElementById('webSearchToggle').checked;
	const searxngUrl = document.getElementById('searxngUrl').value;
	const webMode = document.getElementById('webSearchModeSelect').value;
	const maxResults = document.getElementById('webSearchMaxResults').value;
	
	const toolDocGen = document.getElementById('toolDocGenToggle').checked;
	const toolEmailSend = document.getElementById('toolEmailSendToggle').checked;
	const toolEmailRead = document.getElementById('toolEmailReadToggle').checked;
	const toolYoutube = document.getElementById('toolYoutubeToggle').checked;
	const toolAudio = document.getElementById('toolAudioToggle').checked;
	
	const showTokens = document.getElementById('showTokenCountToggle') ? document.getElementById('showTokenCountToggle').checked : true;
	
	const ttsActive = document.getElementById('ttsToggle').checked;
	const ttsDownloadActive = document.getElementById('ttsDownloadToggle').checked;
	const elMusicActive = document.getElementById('elevenlabsMusicToggle').checked;
	const ttsProvider = document.getElementById('ttsProviderSelect').value;

	const gcLang = document.getElementById('googleCloudLangSelect') ? document.getElementById('googleCloudLangSelect').value : globalSettings.googlecloud_language;
	const gcVoice = document.getElementById('googleCloudVoiceSelect') ? document.getElementById('googleCloudVoiceSelect').value : globalSettings.googlecloud_voice;
	const voiceSelectVal = document.getElementById('ttsVoiceSelect').value;
	const pVoice = document.getElementById('piperVoiceSelect').value;
	const pSpeaker = document.getElementById('piperSpeakerSelect').value || "0";
	
	const openaiTtsModelSelect = document.getElementById('openaiTtsModelSelect');
	const openaiTtsModel = openaiTtsModelSelect ? openaiTtsModelSelect.value : 'tts-1';
	const mistralTtsModelSelect = document.getElementById('mistralTtsModelSelect');
	const mistralTtsModel = mistralTtsModelSelect ? mistralTtsModelSelect.value : 'voxtral-mini-tts-2603';
	
	const emailAccounts = emailAccountsDraft;
	let defaultEmailIndex = defaultEmailDraftIndex;
	
	const defaultSel = document.getElementById('defaultModelSelect');
	if (defaultSel && defaultSel.options.length > 0) {
		const opt = defaultSel.options[defaultSel.selectedIndex];
		if (opt && opt.text !== '...' && !opt.text.includes('Fehler') && !opt.text.includes('Error')) {
			savedDefaults[provider] = defaultSel.value;
		}
	}
	
	try {
		await fetch('/settings', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({ 
				language: language,
				ai_provider: provider,
				gemini_api_key: geminiKey,
				openrouter_api_key: openrouterKey,
				openai_api_key: openaiKey,
				mistral_api_key: mistralKey,
				openrouter_free_only: openrouterFree,
				native_websearch: nativeWebSearch,
				system_prompt: prompt, 
				history_enabled: hist,
				history_context_limit: ctxLimit,
				web_search_enabled: webSearch,
				searxng_url: searxngUrl,
				web_search_mode: webMode,
				web_search_max_results: maxResults,
				tool_doc_gen_enabled: toolDocGen,
				tool_email_send_enabled: toolEmailSend,
				tool_email_read_enabled: toolEmailRead,
				tool_youtube_enabled: toolYoutube,
				tool_audio_enabled: toolAudio,
				show_token_count: showTokens,
				default_model_ollama: savedDefaults.ollama,
				default_model_gemini: savedDefaults.gemini,
				default_model_openrouter: savedDefaults.openrouter,
				default_model_openai: savedDefaults.openai,
				default_model_mistral: savedDefaults.mistral,
				tts_enabled: ttsActive,
				tts_download_enabled: ttsDownloadActive,
				elevenlabs_music_enabled: elMusicActive,
				tts_provider: ttsProvider,
				elevenlabs_api_key: elApiKey,
				googlecloud_api_key: gcApiKey,
				googlecloud_language: ttsProvider === 'googlecloud' ? gcLang : globalSettings.googlecloud_language,
				googlecloud_voice: ttsProvider === 'googlecloud' ? gcVoice : globalSettings.googlecloud_voice,
				sapi5_voice: ttsProvider === 'sapi5' ? voiceSelectVal : globalSettings.sapi5_voice,
				pyttsx3_voice: ttsProvider === 'pyttsx3' ? voiceSelectVal : globalSettings.pyttsx3_voice,
				elevenlabs_voice: ttsProvider === 'elevenlabs' ? voiceSelectVal : globalSettings.elevenlabs_voice,
				edge_voice: ttsProvider === 'edge' ? voiceSelectVal : globalSettings.edge_voice,
				espeak_voice: ttsProvider === 'espeak' ? document.getElementById('espeakVoiceSelect').value : globalSettings.espeak_voice,
				espeak_variant: ttsProvider === 'espeak' ? document.getElementById('espeakVariantSelect').value : globalSettings.espeak_variant,
				piper_voice: ttsProvider === 'piper' ? pVoice : globalSettings.piper_voice,
				piper_speaker: ttsProvider === 'piper' ? pSpeaker : globalSettings.piper_speaker,
				gtts_voice: ttsProvider === 'gtts' ? voiceSelectVal : globalSettings.gtts_voice,
				navertts_voice: ttsProvider === 'naver' ? voiceSelectVal : globalSettings.navertts_voice,
				openai_voice: ttsProvider === 'openai' ? voiceSelectVal : globalSettings.openai_voice,
				openai_tts_model: ttsProvider === 'openai' ? openaiTtsModel : globalSettings.openai_tts_model,
				mistral_voice: ttsProvider === 'mistral' ? voiceSelectVal : globalSettings.mistral_voice,
				mistral_tts_model: ttsProvider === 'mistral' ? mistralTtsModel : globalSettings.mistral_tts_model,
				email_accounts: emailAccounts,
				default_email_account: defaultEmailIndex
			})
		});
		document.getElementById('settingsModal').close();
		loadSettings(); 
		loadModels();
		if(appLanguage !== language) {
			appLanguage = language;
			applyTranslations();
		}
	} catch(e) { alert(t('Error saving settings.')); }
}

document.addEventListener('keydown', function(e) {
	if (e.key !== 'ArrowDown') return;
	const dialog = document.getElementById('emailAccountDialog');
	if (!dialog || !dialog.open || !e.target.matches('[data-email-field]')) return;
	e.preventDefault();
	const fields = Array.from(dialog.querySelectorAll('[data-email-field]'));
	const idx = fields.indexOf(e.target);
	const next = fields[idx + 1];
	if (next) next.focus();
});