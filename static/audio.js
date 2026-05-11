let currentAudio = null;
let ttsQueue = [];
let ttsAudioQueue = [];
let currentTtsBlobs = [];
let isPlayingQueue = false;
let isFetchingTts = false;
let ttsAbortController = null;
let currentTtsBtn = null;
let ttsFinishCallback = null;
let lastAudioUrl = null;

let dictationActive = false;
let isVoiceRecording = false;
let audioContext = null;
let silenceTimer = null;
let hasSpoken = false;
let streamRef = null;

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
	currentTtsBlobs = [];
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

	lastAudioUrl = null;
	currentTtsBlobs = [];

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
	
	const canNativeStream = ['openai', 'elevenlabs', 'googlecloud', 'mistral'].includes(provider);

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
		if (!body.api_key && !globalSettings.openai_api_key_available || !body.voice_id) {
			stopTTS();
			alert("Bitte OpenAI API Key eingeben");
			return;
		}
	} else if (provider === 'mistral') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.mistral_voice;
		body.model_id = isPreview ? document.getElementById('mistralTtsModelSelect').value : globalSettings.mistral_tts_model;
		body.api_key = isPreview ? (document.getElementById('mistralApiKey') ? document.getElementById('mistralApiKey').value : '') : globalSettings.mistral_api_key;
		if ((!body.api_key && !globalSettings.mistral_api_key_available) || !body.voice_id) {
			stopTTS();
			alert(t('msgPlsKey'));
			return;
		}
	} else if (provider === 'espeak') {
		body.voice_id = isPreview ? document.getElementById('espeakVoiceSelect').value : globalSettings.espeak_voice;
		body.variant_id = isPreview ? document.getElementById('espeakVariantSelect').value : globalSettings.espeak_variant;
	} else if (provider === 'elevenlabs') {
		body.voice_id = isPreview ? document.getElementById('ttsVoiceSelect').value : globalSettings.elevenlabs_voice;
		body.api_key = isPreview ? document.getElementById('elevenlabsApiKey').value : globalSettings.elevenlabs_api_key;
		
		const elModelSelect = document.getElementById('elevenlabsTtsModelSelect');
		body.model_id = isPreview ? (elModelSelect ? elModelSelect.value : '') : globalSettings.elevenlabs_tts_model;

		if ((!body.api_key && !globalSettings.elevenlabs_api_key_available) || !body.voice_id) {
			stopTTS();
			alert(t('msgPlsKey'));
			return;
		}
	} else if (provider === 'googlecloud') {
		body.api_key = isPreview ? document.getElementById('googleCloudApiKey').value : globalSettings.googlecloud_api_key;
		body.language_code = isPreview ? document.getElementById('googleCloudLangSelect').value : globalSettings.googlecloud_language;
		body.voice_id = isPreview ? document.getElementById('googleCloudVoiceSelect').value : globalSettings.googlecloud_voice;

		if ((!body.api_key && !globalSettings.googlecloud_api_key_available) || !body.voice_id) {
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
			const audioRes = await fetch(data.stream_url, { signal: ttsAbortController.signal });
			if (!audioRes.ok) throw new Error("Audio stream failed");
			const blob = await audioRes.blob();
			const objUrl = URL.createObjectURL(blob);
			
			ttsAudioQueue.push({ url: objUrl, blob: blob });
			currentTtsBlobs.push(blob);
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
			
			if (globalSettings.tts_download_enabled && currentTtsBtn && currentTtsBlobs.length > 0) {
				const messageDiv = currentTtsBtn.closest('.message');
				if (messageDiv && !messageDiv.querySelector('.tts-download-link')) {
					
					const combinedBlob = new Blob(currentTtsBlobs, { type: currentTtsBlobs[0].type });
					const finalUrl = URL.createObjectURL(combinedBlob);
					
					let ext = "mp3";
					if (combinedBlob.type.includes("wav")) ext = "wav";

					const dlLink = document.createElement('a');
					dlLink.href = finalUrl;
					dlLink.download = `tts_audio.${ext}`;
					dlLink.className = 'tts-download-link';
					dlLink.textContent = 'Audio herunterladen';
					dlLink.style.cssText = 'display: block; margin-top: 10px; font-size: 0.85em; text-decoration: underline; cursor: pointer; color: inherit;';
					
					const contentDiv = messageDiv.querySelector('.message-content');
					if (contentDiv) {
						contentDiv.appendChild(dlLink);
					}
				}
			}

			stopTTS();
		} else {
			setTimeout(playNextTtsAudio, 50);
		}
		return;
	}

	const audioItem = ttsAudioQueue.shift();
	lastAudioUrl = audioItem.url; 
	
	currentAudio = new Audio(audioItem.url);
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