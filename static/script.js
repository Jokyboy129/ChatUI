const i18n = {
	de: {
		closeBtn: "Schließen",
		voiceState: "Bereit...",
		sidebarBtn: "Sidebar anzeigen",
		modelLabel: "Modell:",
		statusReady: "Bereit",
		settingsBtn: "Einstellungen",
		chatHistory: "Chatverlauf",
		newChatBtn: "+ Neuer Chat",
		sysWelcome: "Hallo! Wie kann ich dir heute helfen?",
		placeholder: "Nachricht eingeben...",
		attachBtn: "Anhängen",
		voiceBtn: "Voice starten",
		musicBtn: "Musik",
		toolsBtn: "Tools",
		toolDocGen: "Dokument erstellen",
		toolWeb: "Websuche",
		toolEmailSend: "E-Mail Senden",
		toolEmailRead: "Posteingang lesen",
		toolYoutube: "YouTube Agent",
		toolAudio: "Audio/FFmpeg Agent",
		sendBtn: "Senden",
		copyBtn: "Kopieren",
		cancelBtn: "Abbrechen",
		settingsTitle: "Einstellungen",
		tabGeneral: "Allgemein",
		tabProvider: "KI Provider",
		tabAgents: "Agenten",
		tabEmail: "E-Mail",
		tabTts: "Sprachausgabe",
		langLabel: "Sprache / Language:",
		langAuto: "Automatisch (Browser)",
		providerLabel: "KI-Anbieter:",
		orFreeOnly: "Nur kostenlose Modelle laden (Free)",
		orCustomSearch: "Eigene Websuche statt OpenRouter-Suche nutzen",
		agentSettings: "Agenten Einstellungen",
		toolDocGenEnable: "Dokument-Generator aktivieren",
		toolEmailSendEnable: "E-Mail-Versand aktivieren",
		toolEmailReadEnable: "Posteingang-Leser aktivieren",
		toolYoutubeEnable: "YouTube Agent aktivieren",
		toolAudioEnable: "Audio/FFmpeg Agent aktivieren",
		mailTitle: "E-Mail Konten (SMTP/IMAP)",
		mailAddBtn: "+ Konto hinzufügen",
		mailUser: "Benutzername:",
		mailPass: "Passwort:",
		mailSender: "Absender:",
		ttsTitle: "Sprachausgabe (Vorlesen)",
		ttsEnable: "Text-to-Speech aktivieren",
		ttsProvider: "TTS-Anbieter:",
		ttsSapi: "Server SAPI5 (PC Systemstimmen)",
		ttsElevenLoad: "ElevenLabs Stimmen laden",
		ttsPiperVoice: "Piper Stimme:",
		ttsPiperDl: "Herunterladen",
		ttsPiperSpeaker: "Sprecher:",
		ttsVoice: "Stimme:",
		ttsDlEnable: "TTS Audio-Downloads erlauben",
		ttsPreview: "Beispiel vorhören",
		musicEnable: "Musik-/Soundgenerierung (ElevenLabs) in Chat-Leiste anzeigen",
		histSave: "Verlauf speichern",
		histLimit: "Nachrichten im Kontext behalten (0 = alle):",
		webSearchEnable: "Websuche erlauben",
		webSearchMode: "Suchmodus:",
		modeAuto: "Automatisch",
		modeManual: "Manuell",
		webSearchPages: "Ergebnisse laden (Seiten):",
		defModel: "Standardmodell für diesen Anbieter:",
		showTokens: "Token-Zähler unter Nachrichten anzeigen",
		clearHistoryBtn: "Alle Verläufe löschen",
		logoutBtn: "Abmelden",
		saveBtn: "Speichern",
		
		msgSidebarShow: "Seitenleiste eingeblendet",
		msgSidebarHide: "Seitenleiste ausgeblendet",
		msgNoModel: "Keine Modelle gefunden",
		msgModelErr: "Fehler beim Laden",
		msgDefModel: "Zuletzt installiertes (Standard)",
		msgPlsKey: "Bitte API Key eingeben & Stimmen laden",
		msgWaitDl: "Lade ca. 20-60 MB herunter... Bitte warten...",
		msgDlSuccess: "Erfolgreich heruntergeladen!",
		msgNetErr: "Netzwerkfehler.",
		msgNoAudio: "Fehler beim Abspielen",
		msgAskMusic: "Beschreibe die Musik (ElevenLabs ElevenMusic):",
		msgAskDur: "Gewünschte Dauer in Sekunden (z.B. 15):",
		msgInvalidNum: "Bitte eine gültige Zahl für die Sekunden eingeben.",
		msgMusicGen: "Generiere Musik über ElevenLabs... (Das kann einen Moment dauern)",
		msgMusicHere: "Hier ist deine generierte Musik für:",
		msgMusicDl: "Audio herunterladen",
		msgNoChats: "Keine gespeicherten Chats.",
		msgLoadingChat: "Lade Chat...",
		msgChatLoaded: "Chat geladen.",
		msgNewChat: "Neuer Chat...",
		msgNewStarted: "Neuer Chat gestartet.",
		msgSendErr: "Netzwerkfehler beim Senden.",
		msgNoModelAlert: "Es ist kein Modell ausgewählt. Bitte stelle sicher, dass dein Anbieter korrekt konfiguriert und Modelle geladen wurden.",
		msgSearchCheck: "Prüfe Websuche...",
		msgSearchCheckD: "Prüfe automatische Websuche...",
		msgGenerating: "Generiere...",
		msgWaitResp: "Nachricht gesendet. Warte auf Antwort...",
		msgDoneResp: "Antwort vollständig.",
		msgTransErr: "Fehler bei der Übertragung.",
		msgFileSel: "Ausgewählt:",
		msgFileNotSel: "Datei ausgewählt",
		msgDelConfirm: "Chat wirklich löschen?",
		msgChatDeleted: "Chat gelöscht.",
		msgDelAllConf: "ALLES löschen?",
		msgAllDeleted: "Alle Chats gelöscht.",
		msgTtsReq: "Bitte aktiviere Text-to-Speech in den Einstellungen, um den kontinuierlichen Voice-Modus zu nutzen.",
		msgListen: "Höre zu...",
		msgMicDeny: "Mikrofon-Zugriff verweigert oder nicht möglich:",
		msgTranscribing: "Transkribiere...",
		msgSendVoice: "Sende Nachricht...",
		msgNotUnderstood: "Nichts verstanden.",
		msgStopVoice: "Voice stoppen",
		msgStartVoice: "Voice starten",
		msgRead: "Vorlesen",
		msgStop: "Stop",
		msgCopied: "Kopiert!",
		msgCopy: "Kopieren",
		msgVoiceTest: "Hallo, das ist ein kurzer Test für die Sprachausgabe.",
		
		ariaSidebar: "Chat Verlauf",
		ariaChatList: "Liste der vergangenen Chats",
		ariaChatLog: "Chat Nachrichten",
		ariaUserInput: "Deine Nachricht",
		ariaAttach: "Datei oder Bild anhängen",
		ariaVoiceStart: "Voice-Modus starten",
		ariaVoiceStop: "Voice-Modus stoppen",
		ariaMusic: "Musik generieren",
		ariaTools: "Werkzeuge",
		ariaSend: "Nachricht senden",
		ariaDeleteChat: "Chat löschen"
	},
	en: {
		closeBtn: "Close",
		voiceState: "Ready...",
		sidebarBtn: "Toggle Sidebar",
		modelLabel: "Model:",
		statusReady: "Ready",
		settingsBtn: "Settings",
		chatHistory: "Chat History",
		newChatBtn: "+ New Chat",
		sysWelcome: "Hello! How can I help you today?",
		placeholder: "Type a message...",
		attachBtn: "Attach",
		voiceBtn: "Start Voice",
		musicBtn: "Music",
		toolsBtn: "Tools",
		toolDocGen: "Create Document",
		toolWeb: "Web Search",
		toolEmailSend: "Send E-Mail",
		toolEmailRead: "Read Inbox",
		toolYoutube: "YouTube Agent",
		toolAudio: "Audio/FFmpeg Agent",
		sendBtn: "Send",
		copyBtn: "Copy",
		cancelBtn: "Cancel",
		settingsTitle: "Settings",
		tabGeneral: "General",
		tabProvider: "AI Provider",
		tabAgents: "Agents",
		tabEmail: "E-Mail",
		tabTts: "Speech (TTS)",
		langLabel: "Language / Sprache:",
		langAuto: "Automatic (Browser)",
		providerLabel: "AI Provider:",
		orFreeOnly: "Only load free models",
		orCustomSearch: "Use custom web search instead of OpenRouter's",
		agentSettings: "Agent Settings",
		toolDocGenEnable: "Enable Document Generator",
		toolEmailSendEnable: "Enable E-Mail Sender",
		toolEmailReadEnable: "Enable Inbox Reader",
		toolYoutubeEnable: "Enable YouTube Agent",
		toolAudioEnable: "Enable Audio/FFmpeg Agent",
		mailTitle: "Email Accounts (SMTP/IMAP)",
		mailAddBtn: "+ Add Account",
		mailUser: "Username:",
		mailPass: "Password:",
		mailSender: "Sender:",
		ttsTitle: "Text-to-Speech (Read Aloud)",
		ttsEnable: "Enable Text-to-Speech",
		ttsProvider: "TTS Provider:",
		ttsSapi: "Server SAPI5 (PC System Voices)",
		ttsElevenLoad: "Load ElevenLabs Voices",
		ttsPiperVoice: "Piper Voice:",
		ttsPiperDl: "Download",
		ttsPiperSpeaker: "Speaker:",
		ttsVoice: "Voice:",
		ttsDlEnable: "Allow TTS Audio Downloads",
		ttsPreview: "Preview audio",
		musicEnable: "Show Music/Sound Generation (ElevenLabs) in chat bar",
		histSave: "Save chat history",
		histLimit: "Messages to keep in context (0 = all):",
		webSearchEnable: "Enable Web Search",
		webSearchMode: "Search Mode:",
		modeAuto: "Automatic",
		modeManual: "Manual",
		webSearchPages: "Results to load (Pages):",
		defModel: "Default model for this provider:",
		showTokens: "Show token counter below messages",
		clearHistoryBtn: "Clear all history",
		logoutBtn: "Logout",
		saveBtn: "Save",
		
		msgSidebarShow: "Sidebar shown",
		msgSidebarHide: "Sidebar hidden",
		msgNoModel: "No models found",
		msgModelErr: "Error loading models",
		msgDefModel: "Last installed (Default)",
		msgPlsKey: "Please enter API Key & load voices",
		msgWaitDl: "Downloading approx. 20-60 MB... Please wait...",
		msgDlSuccess: "Successfully downloaded!",
		msgNetErr: "Network error.",
		msgNoAudio: "Error playing audio",
		msgAskMusic: "Describe the music (ElevenLabs ElevenMusic):",
		msgAskDur: "Desired duration in seconds (e.g. 15):",
		msgInvalidNum: "Please enter a valid number for seconds.",
		msgMusicGen: "Generating music via ElevenLabs... (This might take a moment)",
		msgMusicHere: "Here is your generated music for:",
		msgMusicDl: "Download Audio",
		msgNoChats: "No saved chats.",
		msgLoadingChat: "Loading chat...",
		msgChatLoaded: "Chat loaded.",
		msgNewChat: "New Chat...",
		msgNewStarted: "New chat started.",
		msgSendErr: "Network error while sending.",
		msgNoModelAlert: "No model selected. Please ensure your provider is correctly configured and models are loaded.",
		msgSearchCheck: "Checking web search...",
		msgSearchCheckD: "Checking automatic web search...",
		msgGenerating: "Generating...",
		msgWaitResp: "Message sent. Waiting for response...",
		msgDoneResp: "Response complete.",
		msgTransErr: "Error during transmission.",
		msgFileSel: "Selected:",
		msgFileNotSel: "File selected",
		msgDelConfirm: "Really delete chat?",
		msgChatDeleted: "Chat deleted.",
		msgDelAllConf: "Delete EVERYTHING?",
		msgAllDeleted: "All chats deleted.",
		msgTtsReq: "Please enable Text-to-Speech in settings to use continuous Voice Mode.",
		msgListen: "Listening...",
		msgMicDeny: "Microphone access denied or not possible:",
		msgTranscribing: "Transcribing...",
		msgSendVoice: "Sending message...",
		msgNotUnderstood: "Did not catch that.",
		msgStopVoice: "Stop Voice",
		msgStartVoice: "Start Voice",
		msgRead: "Read Aloud",
		msgStop: "Stop",
		msgCopied: "Copied!",
		msgCopy: "Copy",
		msgVoiceTest: "Hello, this is a short test for text-to-speech.",
		
		ariaSidebar: "Chat history",
		ariaChatList: "List of past chats",
		ariaChatLog: "Chat messages",
		ariaUserInput: "Your message",
		ariaAttach: "Attach file or image",
		ariaVoiceStart: "Start voice mode",
		ariaVoiceStop: "Stop voice mode",
		ariaMusic: "Generate music",
		ariaTools: "Tools",
		ariaSend: "Send message",
		ariaDeleteChat: "Delete chat"
	}
};

let appLanguage = 'auto';

function getLang() {
	if (appLanguage === 'auto') {
		return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en';
	}
	return appLanguage;
}

function t(key) {
	const l = getLang();
	return (i18n[l] && i18n[l][key]) ? i18n[l][key] : (i18n['en'][key] || key);
}

function applyTranslations() {
	const l = getLang();
	const dict = i18n[l] || i18n['en'];

	document.querySelectorAll('[data-i18n]').forEach(el => {
		const key = el.getAttribute('data-i18n');
		if (dict[key]) el.innerHTML = dict[key];
	});

	document.querySelectorAll('[data-i18n-ph]').forEach(el => {
		const key = el.getAttribute('data-i18n-ph');
		if (dict[key]) el.setAttribute('placeholder', dict[key]);
	});

	document.querySelectorAll('[data-i18n-aria]').forEach(el => {
		const key = el.getAttribute('data-i18n-aria');
		if (dict[key]) el.setAttribute('aria-label', dict[key]);
	});
}

let currentChatId = null;
let savedDefaults = { ollama: "", gemini: "", openrouter: "", openai: "" };
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
	show_token_count: true, 
	email_accounts: [], 
	default_email_account: 0 
};
let currentAudio = null;
let piperVoicesData = [];
let googleCloudVoicesData = [];

// TTS Streaming & Queue Variables
let ttsQueue = [];
let ttsAudioQueue = [];
let isPlayingQueue = false;
let isFetchingTts = false;
let ttsAbortController = null;
let currentTtsBtn = null;
let ttsFinishCallback = null;

let dictationActive = false;
let isVoiceRecording = false;
let audioContext = null;
let silenceTimer = null;
let hasSpoken = false;
let streamRef = null;

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
		toggleBtn.textContent = getLang() === 'de' ? 'Sidebar ausblenden' : 'Hide Sidebar';
		toggleBtn.setAttribute('aria-expanded', 'true');
		announce(t('msgSidebarShow'));
	} else {
		sidebar.style.display = 'none';
		toggleBtn.textContent = getLang() === 'de' ? 'Sidebar anzeigen' : 'Show Sidebar';
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

function stopTTS() {
	isPlayingQueue = false;
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
		currentAudio = null;
	}
	if (ttsAbortController) {
		ttsAbortController.abort();
		ttsAbortController = null;
	}
	ttsQueue = [];
	ttsAudioQueue = [];
	isFetchingTts = false;

	document.querySelectorAll('.tts-btn').forEach(b => {
		if (b.dataset.playing === 'true') {
			b.textContent = t('msgRead');
			b.dataset.playing = 'false';
		}
	});

	if (ttsFinishCallback) {
		ttsFinishCallback();
		ttsFinishCallback = null;
	}
	currentTtsBtn = null;
}

function playTTS(btn, customText = null, onFinishCallback = null) {
	if (btn && btn.textContent === t('msgStop')) {
		stopTTS();
		return;
	}
	stopTTS();

	let text = customText;
	if (!text) {
		const div = btn.closest('.message');
		text = div ? div.rawText : null;
	}
	if (!text) return;

	text = text.replace(/<(think|thinking)[^>]*>[\s\S]*?<\/(think|thinking)>/gi, '');
	text = text.replace(/<(think|thinking)[^>]*>[\s\S]*/gi, '');
	const plainText = text.replace(/[*#_`~>]/g, '').trim();

	if (!plainText) {
		if(btn) btn.textContent = t('msgRead');
		if(onFinishCallback) onFinishCallback();
		return;
	}

	if (btn) {
		btn.textContent = t('msgStop');
		btn.dataset.playing = 'true';
	}

	currentTtsBtn = btn;
	ttsFinishCallback = onFinishCallback;
	isPlayingQueue = true;
	ttsAbortController = new AbortController();

	const isPreview = customText !== null && !onFinishCallback;
	const provider = isPreview ? document.getElementById('ttsProviderSelect').value : globalSettings.tts_provider;
	
	const canNativeStream = ['openai', 'elevenlabs', 'googlecloud'].includes(provider);

	if (canNativeStream) {
		ttsQueue.push(plainText);
	} else {
		const rawChunks = plainText.match(/[^.!?\n]+[.!?\n]+/g) || [plainText];
		let currentChunk = "";
		for (let chunk of rawChunks) {
			currentChunk += chunk + " ";
			if (currentChunk.length > 80) {
				ttsQueue.push(currentChunk.trim());
				currentChunk = "";
			}
		}
		if (currentChunk.trim().length > 0) {
			ttsQueue.push(currentChunk.trim());
		}
	}

	prefetchNextTts(provider, isPreview);
	playNextTtsAudio();
}

async function prefetchNextTts(provider, isPreview) {
	if (ttsQueue.length === 0 || isFetchingTts || !isPlayingQueue) return;
	isFetchingTts = true;

	const chunkText = ttsQueue.shift();
	let body = { text: chunkText, provider: provider };

	if (provider === 'sapi5') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.sapi5_voice;
	} else if (provider === 'pyttsx3') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.pyttsx3_voice;
	} else if (provider === 'piper') {
		body.voice_id = isPreview ? document.getElementById('piperVoiceSelect').value : globalSettings.piper_voice;
		body.speaker_id = isPreview ? (document.getElementById('piperSpeakerSelect').value || "0") : globalSettings.piper_speaker;
	} else if (provider === 'edge') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.edge_voice;
	} else if (provider === 'gtts') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.gtts_voice;
	} else if (provider === 'naver') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.navertts_voice;
	} else if (provider === 'openai') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.openai_voice;
		body.model_id = isPreview ? document.getElementById('openaiTtsModelSelect').value : globalSettings.openai_tts_model;
		body.api_key = isPreview ? (document.getElementById('openaiApiKey') ? document.getElementById('openaiApiKey').value : '') : globalSettings.openai_api_key;
		if (!body.api_key || !body.voice_id) {
			stopTTS();
			alert("Bitte OpenAI API Key eingeben");
			return;
		}
	} else if (provider === 'espeak') {
		body.voice_id = isPreview ? document.getElementById('espeakVoiceSelect').value : globalSettings.espeak_voice;
		body.variant_id = isPreview ? document.getElementById('espeakVariantSelect').value : globalSettings.espeak_variant;
	} else if (provider === 'elevenlabs') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.elevenlabs_voice;
		body.api_key = isPreview ? document.getElementById('elevenlabsApiKey').value : globalSettings.elevenlabs_api_key;
		if (!body.api_key || !body.voice_id) {
			stopTTS();
			alert(t('msgPlsKey'));
			return;
		}
	} else if (provider === 'googlecloud') {
		body.api_key = isPreview ? document.getElementById('googleCloudApiKey').value : globalSettings.googlecloud_api_key;
		body.language_code = isPreview ? document.getElementById('googleCloudLangSelect').value : globalSettings.googlecloud_language;
		body.voice_id = isPreview ? document.getElementById('googleCloudVoiceSelect').value : globalSettings.googlecloud_voice;

		if (!body.api_key || !body.voice_id) {
			stopTTS();
			alert("Bitte Google Cloud API Key eingeben");
			return;
		}
	}

	try {
		const res = await fetch('/tts/prepare', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(body),
			signal: ttsAbortController.signal
		});

		if (res.redirected) { window.location.href = res.url; return; }
		if(!res.ok) {
			const errData = await res.json().catch(() => ({}));
			throw new Error(errData.error || `HTTP ${res.status}`);
		}

		const data = await res.json();
		if (data.stream_url && isPlayingQueue) {
			ttsAudioQueue.push(data.stream_url);
		}
	} catch(err) {
		if (err.name !== 'AbortError') {
			console.error(err);
			alert(`${t('msgNoAudio')} (${provider}): ` + err.message);
			stopTTS();
			return;
		}
	}

	isFetchingTts = false;
	prefetchNextTts(provider, isPreview);
}

function playNextTtsAudio() {
	if (!isPlayingQueue) return;

	if (ttsAudioQueue.length === 0) {
		if (ttsQueue.length === 0 && !isFetchingTts) {
			stopTTS();
		} else {
			setTimeout(playNextTtsAudio, 50);
		}
		return;
	}

	const audioUrl = ttsAudioQueue.shift();
	currentAudio = new Audio(audioUrl);
	currentAudio.onended = () => {
		currentAudio = null;
		playNextTtsAudio();
	};
	currentAudio.play().catch(e => {
		console.error("Audio play error", e);
		playNextTtsAudio();
	});
}

function previewTTS() {
	playTTS(null, t('msgVoiceTest'));
}

async function promptMusicGeneration() {
	if (!globalSettings.elevenlabs_music_enabled) return;
	const promptText = window.prompt(t('msgAskMusic'));
	if (!promptText) return;
	
	const durationInput = window.prompt(t('msgAskDur'), "15");
	if (!durationInput) return;
	const durationSec = parseInt(durationInput);
	if (isNaN(durationSec) || durationSec <= 0) {
		alert(t('msgInvalidNum'));
		return;
	}
	
	const durationMs = durationSec * 1000;

	const currentModel = document.getElementById('modelSelect').value;
	appendMessage('user', `Music (${durationSec}s): ${promptText}`, null, true, currentModel);

	const botMessageContainer = appendMessage('assistant', t('msgMusicGen'), null, false, 'ElevenLabs');
	const botContentDiv = botMessageContainer.querySelector('.message-content');

	try {
		const res = await fetch('/music/elevenlabs/generate', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({ prompt: promptText, duration_ms: durationMs })
		});
		
		if (res.redirected) { window.location.href = res.url; return; }

		if (!res.ok) {
			const err = await res.json();
			botContentDiv.innerHTML = `<span style="color:red">Error: ${err.error || res.status}</span>`;
			return;
		}

		const blob = await res.blob();
		const audioUrl = URL.createObjectURL(blob);

		let downloadHtml = '';
		if (globalSettings.tts_download_enabled) {
			downloadHtml = `<br><a href="${audioUrl}" download="elevenlabs_music.mp3" style="display:inline-block; margin-top:10px; padding:5px 10px; background:#198754; color:#fff; text-decoration:none; border-radius:4px; font-size:0.9rem;">${t('msgMusicDl')}</a>`;
		}

		botContentDiv.innerHTML = `
			<p>${t('msgMusicHere')} <em>"${promptText}"</em></p>
			<audio controls src="${audioUrl}" style="width:100%; margin-top:10px; outline:none;"></audio>
			${downloadHtml}
		`;
	} catch(e) {
		botContentDiv.innerHTML = `<span style="color:red">Error: ${e.message}</span>`;
	}
}

function parseContent(text) {
	if (!text) return "";
	
	let t = text;
	
	t = t.replace(/<(think|thinking)[^>]*>/gi, '\n\n:::THINK_START:::\n\n');
	t = t.replace(/<\/(think|thinking)>/gi, '\n\n:::THINK_END:::\n\n');
	
	t = t.replace(/\[SAVE_DOC\][\s\S]*?\[\/SAVE_DOC\]/gi, '\n\n*[Dokument generiert]*\n\n');
	
	let html = marked.parse(t);
	
	html = html.replace(/(<p>)?:::THINK_START:::(<\/p>)?/g, '<details class="think-box" style="margin-bottom: 1rem; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 5px; background: #f8f9fa;"><summary style="cursor: pointer; font-weight: bold; color: #495057;">Thinking Process</summary><div style="margin-top: 0.8rem; font-size: 0.9em; color: #6c757d; border-top: 1px solid #e9ecef; padding-top: 0.5rem;">');
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
			container.innerHTML = `<p style="color:green; font-weight:bold;">Success: ${data.message}</p>`;
		} else {
			container.innerHTML += `<p style="color:red; font-weight:bold;">Error: ${data.message}</p>`;
			btn.disabled = false;
			btn.textContent = "Retry";
		}
		
		setTimeout(() => loadChat(chatId), 500);
	} catch(e) {
		btn.disabled = false;
		btn.textContent = "Retry";
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

	const userMsgElement = appendMessage('user', msg + (file ? ` [File: ${file.name}]` : ''), null, true, currentModel);
	
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
		botContentDiv.innerHTML = "Connection Error.";
		statusDisplay.textContent = "Error";
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
		headerHtml = '<h5>You</h5>';
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
		span.textContent = t('msgFileSel') + " " + f.name;
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

function toggleDictationMode() {
	if (!globalSettings.tts_enabled) {
		alert(t('msgTtsReq'));
		return;
	}

	if (dictationActive) {
		stopDictationMode();
	} else {
		dictationActive = true;
		document.getElementById('voiceModeOverlay').style.display = 'flex';
		startDictation();
	}
}

function stopDictationMode() {
	dictationActive = false;
	isVoiceRecording = false;
	document.getElementById('voiceModeOverlay').style.display = 'none';
	document.getElementById('voiceStateText').textContent = t('msgStopVoice');
	document.getElementById('voiceVisualizer').className = "voice-visualizer";
	
	if (silenceTimer) {
		clearTimeout(silenceTimer);
		silenceTimer = null;
	}
	
	if (streamRef) {
		streamRef.getTracks().forEach(track => track.stop());
		streamRef = null;
	}
	
	if (audioContext) {
		audioContext.close();
		audioContext = null;
	}

	stopTTS();
}

async function startDictation() {
	if (!dictationActive) return;
	
	document.getElementById('voiceStateText').textContent = t('msgListen');
	document.getElementById('voiceVisualizer').className = "voice-visualizer listening";
	
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		streamRef = stream;
		
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const mediaRecorder = new MediaRecorder(stream);
		const audioChunks = [];
		
		const analyser = audioContext.createAnalyser();
		const source = audioContext.createMediaStreamSource(stream);
		source.connect(analyser);
		analyser.fftSize = 256;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		
		isVoiceRecording = true;
		hasSpoken = false;
		mediaRecorder.start();

		const checkSilence = () => {
			if (!isVoiceRecording) return;
			
			analyser.getByteFrequencyData(dataArray);
			let sum = 0;
			for(let i = 0; i < bufferLength; i++) {
				sum += dataArray[i];
			}
			const average = sum / bufferLength;

			if (average > 15) { 
				hasSpoken = true;
				if (silenceTimer) {
					clearTimeout(silenceTimer);
					silenceTimer = null;
				}
			} else if (hasSpoken) {
				if (!silenceTimer) {
					silenceTimer = setTimeout(() => {
						if (isVoiceRecording) {
							mediaRecorder.stop();
						}
					}, 1500); 
				}
			}

			if (isVoiceRecording) {
				requestAnimationFrame(checkSilence);
			}
		};
		
		checkSilence();

		mediaRecorder.ondataavailable = event => {
			audioChunks.push(event.data);
		};

		mediaRecorder.onstop = () => {
			isVoiceRecording = false;
			if (silenceTimer) {
				clearTimeout(silenceTimer);
				silenceTimer = null;
			}
			
			stream.getTracks().forEach(track => track.stop());
			streamRef = null;
			audioContext.close();
			audioContext = null;

			if (dictationActive) {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				processDictationAudio(audioBlob);
			}
		};
		
	} catch (err) {
		console.error(err);
		alert(t('msgMicDeny') + " " + err.message);
		stopDictationMode();
	}
}

async function processDictationAudio(blob) {
	document.getElementById('voiceStateText').textContent = t('msgTranscribing');
	document.getElementById('voiceVisualizer').className = "voice-visualizer";

	const formData = new FormData();
	formData.append('file', blob, 'dictation.wav');

	try {
		const res = await fetch('/transcribe', {
			method: 'POST',
			body: formData
		});

		if (res.redirected) { window.location.href = res.url; return; }

		const data = await res.json();
		
		if (data.text && data.text.trim().length > 0) {
			document.getElementById('userInput').value = data.text;
			document.getElementById('voiceStateText').textContent = t('msgSendVoice');
			sendMessage(true); 
		} else {
			document.getElementById('voiceStateText').textContent = t('msgNotUnderstood');
			setTimeout(() => {
				if (dictationActive) startDictation();
			}, 2000);
		}

	} catch (e) {
		console.error("Transcription Error:", e);
		document.getElementById('voiceStateText').textContent = "Fehler bei der Transkription.";
		setTimeout(() => {
			if (dictationActive) startDictation();
		}, 2000);
	}
}

window.addEventListener('DOMContentLoaded', init);
