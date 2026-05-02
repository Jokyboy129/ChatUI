let piperVoicesData = [];
let googleCloudVoicesData = [];

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
	
	geminiContainer.style.display = 'none';
	openrouterContainer.style.display = 'none';
	if(openaiContainer) openaiContainer.style.display = 'none';
	
	if (provider === 'gemini') {
		geminiContainer.style.display = 'block';
	} else if (provider === 'openrouter') {
		openrouterContainer.style.display = 'block';
	} else if (provider === 'openai' && openaiContainer) {
		openaiContainer.style.display = 'block';
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
	const piperSettingsContainer = document.getElementById('piperSettingsContainer');
	const espeakSettingsContainer = document.getElementById('espeakSettingsContainer');
	const defaultVoiceContainer = document.getElementById('defaultVoiceContainer');
	const previewTtsBtn = document.getElementById('previewTtsBtn');
	
	elevenlabsKeyContainer.style.display = 'none';
	if(googleCloudSettingsContainer) googleCloudSettingsContainer.style.display = 'none';
	if(openaiTtsContainer) openaiTtsContainer.style.display = 'none';
	piperSettingsContainer.style.display = 'none';
	espeakSettingsContainer.style.display = 'none';
	defaultVoiceContainer.style.display = 'none';
	previewTtsBtn.style.display = 'inline-block';
	
	if (provider === 'elevenlabs') {
		elevenlabsKeyContainer.style.display = 'block';
		defaultVoiceContainer.style.display = 'block';
		if (document.getElementById('elevenlabsApiKey').value) {
			loadElevenLabsVoices();
		} else {
			document.getElementById('ttsVoiceSelect').innerHTML = `<option value="">${t('msgPlsKey')}</option>`;
		}
	} else if (provider === 'googlecloud') {
		if(googleCloudSettingsContainer) googleCloudSettingsContainer.style.display = 'block';
		if (document.getElementById('googleCloudApiKey').value) {
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
			<option value="alloy">Alloy (Neutral)</option>
			<option value="ash">Ash (Klar & Präzise)</option>
			<option value="ballad">Ballad (Ausdrucksstark/Erzählend)</option>
			<option value="cedar">Cedar (Warm & Geerdet)</option>
			<option value="coral">Coral (Warm & Freundlich)</option>
			<option value="echo">Echo (Klar, Männlich)</option>
			<option value="fable">Fable (Warm, Ausdrucksstark)</option>
			<option value="marin">Marin (Klar & Natürlich)</option>
			<option value="nova">Nova (Energetisch, Weiblich)</option>
			<option value="onyx">Onyx (Tief, Autorität)</option>
			<option value="sage">Sage (Ruhig & Bedacht)</option>
			<option value="shimmer">Shimmer (Weich & Hell)</option>
			<option value="verse">Verse (Vielseitig & Ausdrucksstark)</option>
		`;
		if (globalSettings.openai_voice) {
			select.value = globalSettings.openai_voice;
		}
	} else if (provider === 'gtts') {
		defaultVoiceContainer.style.display = 'block';
		const select = document.getElementById('ttsVoiceSelect');
		select.innerHTML = `
			<option value="de">Deutsch</option>
			<option value="en">Englisch</option>
			<option value="fr">Französisch</option>
			<option value="es">Spanisch</option>
			<option value="it">Italienisch</option>
			<option value="ko">Koreanisch</option>
			<option value="ja">Japanisch</option>
			<option value="zh-CN">Chinesisch (Vereinfacht)</option>
			<option value="ru">Russisch</option>
		`;
		if (globalSettings.gtts_voice) {
			select.value = globalSettings.gtts_voice;
		}
	} else if (provider === 'naver') {
		defaultVoiceContainer.style.display = 'block';
		const select = document.getElementById('ttsVoiceSelect');
		select.innerHTML = `
			<option value="en">Englisch (en)</option>
			<option value="ko">Koreanisch (ko)</option>
			<option value="ja">Japanisch (ja)</option>
			<option value="es">Spanisch (es)</option>
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
	savedDefaults[provider] = document.getElementById('defaultModelSelect').value;
}

function addEmailAccountUI(acc = null, isDefault = false) {
	const container = document.getElementById('emailAccountsContainer');
	const div = document.createElement('div');
	div.className = 'email-account-block';
	div.style.cssText = 'border:1px solid #ced4da; padding:0.8rem; border-radius:4px; margin-bottom:0.8rem; position:relative;';
	
	const defaultAcc = acc || {name: '', smtp_server: '', smtp_port: 587, imap_server: '', imap_port: 993, smtp_user: '', smtp_password: '', smtp_sender: ''};
	
	const langStr = getLang() === 'de' ? 'Als Standardkonto festlegen' : 'Set as default account';
	
	div.innerHTML = `
		<button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:5px; right:5px; background:#dc3545; color:white; border:none; border-radius:3px; cursor:pointer;">X</button>
		
		<div style="margin-bottom:0.8rem; padding-bottom:0.5rem; border-bottom:1px solid #eee;">
			<input type="radio" name="default_email" value="new" class="default-email-radio" style="margin:0; cursor:pointer;" ${isDefault ? 'checked' : ''}>
			<label style="font-weight:bold; cursor:pointer;" onclick="this.previousElementSibling.click()">${langStr}</label>
		</div>

		<label style="font-size:0.9rem; font-weight:bold;">Anzeigename (z.B. Arbeit):</label>
		<input type="text" class="mail-name" value="${defaultAcc.name}" style="width:100%; margin-bottom:0.5rem; padding:0.3rem;">
		
		<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.5rem;">
			<div><label style="font-size:0.9rem;">SMTP-Server:</label><input type="text" class="mail-smtp-server" value="${defaultAcc.smtp_server}" style="width:100%; padding:0.3rem;"></div>
			<div><label style="font-size:0.9rem;">SMTP-Port:</label><input type="number" class="mail-smtp-port" value="${defaultAcc.smtp_port}" style="width:100%; padding:0.3rem;"></div>
			<div><label style="font-size:0.9rem;">IMAP-Server:</label><input type="text" class="mail-imap-server" value="${defaultAcc.imap_server}" style="width:100%; padding:0.3rem;"></div>
			<div><label style="font-size:0.9rem;">IMAP-Port:</label><input type="number" class="mail-imap-port" value="${defaultAcc.imap_port}" style="width:100%; padding:0.3rem;"></div>
		</div>
		<label style="font-size:0.9rem;">Benutzername:</label>
		<input type="text" class="mail-user" value="${defaultAcc.smtp_user}" style="width:100%; margin-bottom:0.5rem; padding:0.3rem;">
		
		<label style="font-size:0.9rem;">Passwort:</label>
		<input type="password" class="mail-pass" value="${defaultAcc.smtp_password}" style="width:100%; margin-bottom:0.5rem; padding:0.3rem;">
		
		<label style="font-size:0.9rem;">Absender-E-Mail:</label>
		<input type="text" class="mail-sender" value="${defaultAcc.smtp_sender}" style="width:100%; padding:0.3rem;">
	`;
	container.appendChild(div);
	
	if (!document.querySelector('input[name="default_email"]:checked')) {
		div.querySelector('.default-email-radio').checked = true;
	}
}

async function updateSettingsModelList() {
	const provider = document.getElementById('providerSelect').value;
	const defaultSel = document.getElementById('defaultModelSelect');
	defaultSel.innerHTML = '<option value="">...</option>';
	try {
		const res = await fetch('/models?provider=' + provider);
		if (res.redirected) { window.location.href = res.url; return; }
		const models = await res.json();
		
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
		defaultSel.innerHTML = `<option value="">${t('msgModelErr')}</option>`;
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
	
	const langDropdown = document.getElementById('appLanguageSelect');
	if (langDropdown) langDropdown.value = appLanguage;
	
	document.getElementById('providerSelect').value = data.ai_provider || 'ollama';
	if(document.getElementById('geminiApiKey')) document.getElementById('geminiApiKey').value = data.gemini_api_key || '';
	if(document.getElementById('openrouterApiKey')) document.getElementById('openrouterApiKey').value = data.openrouter_api_key || '';
	if(document.getElementById('openaiApiKey')) document.getElementById('openaiApiKey').value = data.openai_api_key || '';
	
	if(document.getElementById('openrouterFreeToggle')) document.getElementById('openrouterFreeToggle').checked = data.openrouter_free_only || false;
	if(document.getElementById('openrouterCustomSearchToggle')) document.getElementById('openrouterCustomSearchToggle').checked = data.openrouter_use_custom_search || false;
	
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
	document.getElementById('elevenlabsApiKey').value = data.elevenlabs_api_key || '';
	if(document.getElementById('googleCloudApiKey')) document.getElementById('googleCloudApiKey').value = data.googlecloud_api_key || '';
	
	if (document.getElementById('openaiTtsModelSelect')) {
		document.getElementById('openaiTtsModelSelect').value = data.openai_tts_model || 'tts-1';
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
		emailContainer.innerHTML = '';
		const defIndex = data.default_email_account || 0;
		if (data.email_accounts && data.email_accounts.length > 0) {
			data.email_accounts.forEach((acc, idx) => addEmailAccountUI(acc, idx === defIndex));
		}
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
	const apiKey = document.getElementById('elevenlabsApiKey').value;
	if (!apiKey) {
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

async function loadGoogleCloudVoices() {
	const apiKey = document.getElementById('googleCloudApiKey').value;
	if (!apiKey) {
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
			langSelect.innerHTML = `<option value="">Error loading</option>`;
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
		langSelect.innerHTML = `<option value="">Error</option>`;
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
		langSelect.innerHTML = `<option value="">Error fetching data</option>`;
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
		previewBtn.style.display = 'inline-block';
		
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
		dlBtn.style.display = 'inline-block';
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
			status.textContent = 'Error: ' + (data.error || 'Unknown');
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
	const geminiKey = document.getElementById('geminiApiKey') ? document.getElementById('geminiApiKey').value : '';
	const openrouterKey = document.getElementById('openrouterApiKey') ? document.getElementById('openrouterApiKey').value : '';
	const openaiKey = document.getElementById('openaiApiKey') ? document.getElementById('openaiApiKey').value : '';
	const openrouterFree = document.getElementById('openrouterFreeToggle') ? document.getElementById('openrouterFreeToggle').checked : false;
	const openrouterCustomSearch = document.getElementById('openrouterCustomSearchToggle') ? document.getElementById('openrouterCustomSearchToggle').checked : false;
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
	const elApiKey = document.getElementById('elevenlabsApiKey').value;
	const gcApiKey = document.getElementById('googleCloudApiKey') ? document.getElementById('googleCloudApiKey').value : '';
	const gcLang = document.getElementById('googleCloudLangSelect') ? document.getElementById('googleCloudLangSelect').value : globalSettings.googlecloud_language;
	const gcVoice = document.getElementById('googleCloudVoiceSelect') ? document.getElementById('googleCloudVoiceSelect').value : globalSettings.googlecloud_voice;
	const voiceSelectVal = document.getElementById('ttsVoiceSelect').value;
	const pVoice = document.getElementById('piperVoiceSelect').value;
	const pSpeaker = document.getElementById('piperSpeakerSelect').value || "0";
	
	const openaiTtsModelSelect = document.getElementById('openaiTtsModelSelect');
	const openaiTtsModel = openaiTtsModelSelect ? openaiTtsModelSelect.value : 'tts-1';
	
	const emailAccounts = [];
	let defaultEmailIndex = 0;
	
	const blocks = document.querySelectorAll('.email-account-block');
	blocks.forEach((block, index) => {
		emailAccounts.push({
			name: block.querySelector('.mail-name').value,
			smtp_server: block.querySelector('.mail-smtp-server').value,
			smtp_port: parseInt(block.querySelector('.mail-smtp-port').value) || 587,
			imap_server: block.querySelector('.mail-imap-server').value,
			imap_port: parseInt(block.querySelector('.mail-imap-port').value) || 993,
			smtp_user: block.querySelector('.mail-user').value,
			smtp_password: block.querySelector('.mail-pass').value,
			smtp_sender: block.querySelector('.mail-sender').value
		});
		
		if (block.querySelector('.default-email-radio').checked) {
			defaultEmailIndex = index;
		}
	});
	
	savedDefaults[provider] = document.getElementById('defaultModelSelect').value;
	
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
				openrouter_free_only: openrouterFree,
				openrouter_use_custom_search: openrouterCustomSearch,
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
	} catch(e) { alert("Error saving settings."); }
}