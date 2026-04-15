import os
import sys
import uuid
import time
import base64
import subprocess
import json
import requests
import tempfile
import asyncio
from flask import Blueprint, request, Response, jsonify, session, current_app

# Externe TTS-Module (werden von main.py try/except gefangen, falls sie fehlen)
import edge_tts
from gtts import gTTS

from config import load_settings, PIPER_DIR

tts_bp = Blueprint('tts_bp', __name__)

tts_stream_requests = {}
PIPER_VOICES_JSON_URL = "https://huggingface.co/rhasspy/piper-voices/raw/v1.0.0/voices.json"
PIPER_DATA_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/"

def is_lang_de_local():
	if 'username' in session:
		user_settings = load_settings(session['username'])
		lang = user_settings.get("language", "auto")
		if lang != "auto":
			return lang == "de"
	try:
		import locale
		sys_lang, _ = locale.getdefaultlocale()
		return sys_lang and sys_lang.lower().startswith('de')
	except:
		return False

@tts_bp.route("/tts/prepare", methods=['POST'])
def prepare_tts():
	data = request.json
	req_id = uuid.uuid4().hex
	tts_stream_requests[req_id] = {
		"data": data,
		"timestamp": time.time()
	}
	
	now = time.time()
	keys_to_del = [k for k, v in tts_stream_requests.items() if now - v["timestamp"] > 3600]
	for k in keys_to_del:
		del tts_stream_requests[k]
		
	return jsonify({"stream_url": f"/tts/stream/{req_id}"})

@tts_bp.route("/tts/stream/<req_id>", methods=['GET'])
def stream_tts(req_id):
	entry = tts_stream_requests.get(req_id)
	if not entry:
		return "Stream not found or expired", 404
		
	data = entry["data"]
	provider = data.get("provider", "")
	
	if provider == "sapi5": return process_sapi5(data)
	elif provider == "pyttsx3": return process_pyttsx3(data)
	elif provider == "gtts": return process_gtts(data)
	elif provider == "naver": return process_naver(data)
	elif provider == "openai": return process_openai(data)
	elif provider == "espeak": return process_espeak(data)
	elif provider == "elevenlabs": return process_elevenlabs(data)
	elif provider == "googlecloud": return process_googlecloud(data)
	elif provider == "piper": return process_piper(data)
	elif provider == "edge": return process_edge(data)
	else: return jsonify({"error": "Unknown provider"}), 400

# --- TTS PROCESS FUNCTIONS ---
def get_pyttsx3_module():
	try:
		import pyttsx3
		return pyttsx3, None
	except ImportError:
		msg = "Das Modul 'pyttsx3' fehlt. Bitte beende das Programm und führe aus: pip install pyttsx3" if is_lang_de_local() else "The module 'pyttsx3' is missing. Please run: pip install pyttsx3"
		return None, msg

def get_windows_voices(bitness=64):
	ps_path = r"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" if bitness == 64 else r"C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"
	if not os.path.exists(ps_path):
		return []
	
	script = """
	[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
	try {
		$spVoice = New-Object -ComObject SAPI.SpVoice
		$result = @()
		$voices = $spVoice.GetVoices()
		for ($i=0; $i -lt $voices.Count; $i++) {
			$v = $voices.Item($i)
			$name = $v.GetDescription()
			$result += [PSCustomObject]@{
				Id = $name
				Name = $name
			}
		}
		$result | ConvertTo-Json -Compress
	} catch { }
	"""
	try:
		encoded = base64.b64encode(script.encode('utf-16le')).decode('utf-8')
		creationflags = 0x08000000 if os.name == 'nt' else 0
		res = subprocess.run([ps_path, "-NoProfile", "-EncodedCommand", encoded], capture_output=True, text=True, creationflags=creationflags)
		if res.stdout.strip():
			data = json.loads(res.stdout)
			if isinstance(data, dict):
				data = [data]
			return data
		return []
	except Exception as e:
		print(f"PowerShell error ({bitness}bit):", e)
		return []

@tts_bp.route("/tts/sapi5/voices", methods=['GET'])
def get_sapi5_voices():
	voices_64 = get_windows_voices(64)
	voices_32 = get_windows_voices(32)
	
	combined = []
	seen = set()
	
	for v in voices_64:
		v_name = f"{v['Name']} (64-bit)"
		v_id = f"64|{v['Id']}"
		seen.add(v['Id'])
		combined.append({"id": v_id, "name": v_name})
		
	for v in voices_32:
		if v['Id'] not in seen:
			v_name = f"{v['Name']} (32-bit)"
			v_id = f"32|{v['Id']}"
			combined.append({"id": v_id, "name": v_name})
			
	return jsonify(combined)

@tts_bp.route("/tts/pyttsx3/voices", methods=['GET'])
def get_pyttsx3_voices():
	pyttsx3, err = get_pyttsx3_module()
	if err:
		return jsonify({"error": err}), 500
	engine = None
	try:
		engine = pyttsx3.init()
		voices = engine.getProperty("voices") or []
		result = []
		for voice in voices:
			name = getattr(voice, "name", "") or getattr(voice, "id", "")
			voice_id = getattr(voice, "id", "")
			languages = getattr(voice, "languages", []) or []
			lang_str = ""
			for lang in languages:
				if isinstance(lang, bytes):
					try:
						lang = lang.decode("utf-8", errors="ignore")
					except Exception:
						lang = ""
				if lang:
					lang_str = str(lang).strip()
					break
			display_name = name
			if lang_str:
				display_name = f"{name} ({lang_str})"
			result.append({"id": voice_id, "name": display_name})
		result.sort(key=lambda x: x["name"])
		return jsonify(result)
	except Exception as e:
		return jsonify({"error": str(e)}), 500
	finally:
		try:
			engine.stop()
		except Exception:
			pass

def process_sapi5(data):
	text = data.get("text", "")
	voice_id_raw = data.get("voice_id", "")
	
	if not text:
		return jsonify({"error": "No text provided"}), 400
		
	bitness = 64
	voice_name = ""
	if "|" in voice_id_raw:
		parts = voice_id_raw.split("|", 1)
		try:
			bitness = int(parts[0])
		except:
			pass
		voice_name = parts[1]
		
	ps_path = r"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" if bitness == 64 else r"C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"
	
	temp_dir = tempfile.gettempdir()
	temp_path = os.path.join(temp_dir, f"tts_{uuid.uuid4().hex}.wav")
	
	safe_text = text.replace("'", "''")
	safe_voice = voice_name.replace("'", "''")
	
	script = f"""
	[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
	try {{
		$spVoice = New-Object -ComObject SAPI.SpVoice
		$spStream = New-Object -ComObject SAPI.SpFileStream
		$spStream.Open('{temp_path}', 3, $false)
		$spVoice.AudioOutputStream = $spStream
		
		if ('{safe_voice}') {{
			$voices = $spVoice.GetVoices()
			for ($i=0; $i -lt $voices.Count; $i++) {{
				$v = $voices.Item($i)
				if ($v.GetDescription() -eq '{safe_voice}') {{
					$spVoice.Voice = $v
					break
				}}
			}}
		}}
		$spVoice.Speak('{safe_text}')
		$spStream.Close()
	}} catch {{
		Write-Output $_.Exception.Message
	}}
	"""
	
	try:
		encoded = base64.b64encode(script.encode('utf-16le')).decode('utf-8')
		creationflags = 0x08000000 if os.name == 'nt' else 0
		subprocess.run([ps_path, "-NoProfile", "-EncodedCommand", encoded], check=True, creationflags=creationflags)
		with open(temp_path, "rb") as f:
			wav_data = f.read()
		os.remove(temp_path)
		return Response(wav_data, mimetype="audio/wav")
	except Exception as e:
		if os.path.exists(temp_path):
			os.remove(temp_path)
		return jsonify({"error": str(e)}), 500

def process_pyttsx3(data):
	text = data.get("text", "")
	voice_id = data.get("voice_id", "")
	if not text:
		return jsonify({"error": "No text provided"}), 400

	pyttsx3, err = get_pyttsx3_module()
	if err:
		return jsonify({"error": err}), 500

	temp_dir = tempfile.gettempdir()
	temp_wav = os.path.join(temp_dir, f"pyttsx3_{uuid.uuid4().hex}.wav")
	engine = None

	try:
		engine = pyttsx3.init()
		voices = engine.getProperty("voices") or []
		selected_voice_id = voice_id
		if voice_id and any(getattr(v, "id", "") == voice_id for v in voices):
			engine.setProperty("voice", voice_id)
		elif voice_id and voices:
			selected_voice_id = ""

		engine.save_to_file(text, temp_wav)
		engine.runAndWait()
		engine.stop()

		if not os.path.exists(temp_wav):
			fallback_msg = f"pyttsx3 could not create audio output{f' for voice {selected_voice_id}' if selected_voice_id else ''}."
			return jsonify({"error": fallback_msg}), 500

		with open(temp_wav, "rb") as f:
			wav_data = f.read()
		return Response(wav_data, mimetype="audio/wav")
	except Exception as e:
		return jsonify({"error": str(e)}), 500
	finally:
		if engine is not None:
			try:
				engine.stop()
			except Exception:
				pass
		if os.path.exists(temp_wav):
			try:
				os.remove(temp_wav)
			except Exception:
				pass

def process_gtts(data):
	text = data.get("text", "")
	lang = data.get("voice_id", "de")
	
	if not text:
		return jsonify({"error": "No text provided"}), 400
		
	temp_dir = tempfile.gettempdir()
	temp_audio = os.path.join(temp_dir, f"gtts_{uuid.uuid4().hex}.mp3")
	
	try:
		tts = gTTS(text=text, lang=lang)
		tts.save(temp_audio)
		
		with open(temp_audio, "rb") as f:
			audio_data = f.read()
		os.remove(temp_audio)
		return Response(audio_data, mimetype="audio/mpeg")
	except Exception as e:
		if os.path.exists(temp_audio):
			os.remove(temp_audio)
		return jsonify({"error": str(e)}), 500

def process_naver(data):
	text = data.get("text", "")
	lang = data.get("voice_id", "en")
	
	if not text:
		return jsonify({"error": "No text provided"}), 400
		
	temp_dir = tempfile.gettempdir()
	temp_audio = os.path.join(temp_dir, f"naver_{uuid.uuid4().hex}.mp3")
	
	try:
		from navertts import NaverTTS
		tts = NaverTTS(text=text, lang=lang)
		tts.save(temp_audio)
		
		with open(temp_audio, "rb") as f:
			audio_data = f.read()
		os.remove(temp_audio)
		return Response(audio_data, mimetype="audio/mpeg")
	except ImportError:
		msg = "Das Modul 'NaverTTS' fehlt. Bitte beende das Programm und führe aus: pip install NaverTTS" if is_lang_de_local() else "The module 'NaverTTS' is missing. Please run: pip install NaverTTS"
		return jsonify({"error": msg}), 500
	except Exception as e:
		if os.path.exists(temp_audio):
			try:
				os.remove(temp_audio)
			except:
				pass
		return jsonify({"error": str(e)}), 500

def process_openai(data):
	text = data.get("text", "")
	voice = data.get("voice_id", "alloy")
	model = data.get("model_id", "tts-1")
	api_key = data.get("api_key", "")
	
	if not api_key or not text:
		return jsonify({"error": "Missing parameters or API key"}), 400
		
	try:
		headers = {
			"Authorization": f"Bearer {api_key}",
			"Content-Type": "application/json"
		}
		payload = {
			"model": model,
			"input": text,
			"voice": voice
		}
		url = "https://api.openai.com/v1/audio/speech"
		r = requests.post(url, json=payload, headers=headers, stream=True)
		
		if not r.ok:
			return jsonify({"error": f"OpenAI Error: {r.text}"}), r.status_code
			
		return Response(r.iter_content(chunk_size=4096), mimetype="audio/mpeg")
	except Exception as e:
		return jsonify({"error": str(e)}), 500

@tts_bp.route("/tts/googlecloud/voices", methods=['POST'])
def get_googlecloud_voices():
	data = request.json
	api_key = data.get("api_key", "")
	if not api_key: 
		return jsonify({"error": "No API Key"}), 400
	try:
		url = f"https://texttospeech.googleapis.com/v1/voices?key={api_key}"
		r = requests.get(url)
		r.raise_for_status()
		return jsonify(r.json().get("voices", []))
	except Exception as e:
		return jsonify({"error": str(e)}), 500

def process_googlecloud(data):
	text = data.get("text", "")
	voice_name = data.get("voice_id", "")
	lang_code = data.get("language_code", "en-US")
	api_key = data.get("api_key", "")

	if not api_key or not text or not voice_name:
		return jsonify({"error": "Missing parameters"}), 400

	try:
		url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}"
		payload = {
			"input": {"text": text},
			"voice": {"languageCode": lang_code, "name": voice_name},
			"audioConfig": {"audioEncoding": "MP3"}
		}
		r = requests.post(url, json=payload)
		if not r.ok:
			return jsonify({"error": f"Google Cloud TTS Error: {r.text}"}), r.status_code

		audio_b64 = r.json().get("audioContent", "")
		audio_bytes = base64.b64decode(audio_b64)
		return Response(audio_bytes, mimetype="audio/mpeg")
	except Exception as e:
		return jsonify({"error": str(e)}), 500

def get_espeak_exe_path():
	base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	espeak_paths = [
		os.path.join(base_dir, "espeak-ng", "espeak-ng.exe"),
		os.path.join(base_dir, "espeak", "espeak.exe"),
		os.path.join(base_dir, "espeak.exe"),
		r"C:\Program Files\eSpeak NG\espeak-ng.exe",
		r"C:\Program Files (x86)\eSpeak NG\espeak-ng.exe",
		r"C:\Program Files\eSpeak\command_line\espeak.exe",
		r"C:\Program Files (x86)\eSpeak\command_line\espeak.exe"
	]
	for p in espeak_paths:
		if os.path.exists(p):
			return p
	return None

@tts_bp.route("/tts/espeak/info", methods=['GET'])
def get_espeak_info():
	exe_path = get_espeak_exe_path()
	if not exe_path:
		return jsonify({"error": "espeak-ng.exe nicht gefunden", "languages": [], "variants": []})
		
	langs = []
	try:
		creationflags = 0x08000000 if os.name == 'nt' else 0
		res = subprocess.run([exe_path, "--voices"], capture_output=True, text=True, encoding='utf-8', errors='replace', creationflags=creationflags)
		lines = res.stdout.split('\n')[1:]
		seen = set()
		for line in lines:
			parts = line.strip().split()
			if len(parts) >= 2:
				lang_code = parts[1]
				if lang_code not in seen:
					seen.add(lang_code)
					name_col = parts[3] if len(parts) > 3 else lang_code
					langs.append({"id": lang_code, "name": f"{lang_code} ({name_col})"})
	except Exception as e:
		pass
		
	variants = [{"id": "", "name": "Standard (Keine Variante)"}]
	try:
		base_dir = os.path.dirname(exe_path)
		if base_dir.lower().endswith("command_line"):
			base_dir = os.path.dirname(base_dir)
		
		v_dir = os.path.join(base_dir, "espeak-ng-data", "voices", "!v")
		if not os.path.exists(v_dir):
			v_dir = os.path.join(base_dir, "espeak-data", "voices", "!v")
			
		if os.path.exists(v_dir):
			for f in os.listdir(v_dir):
				if os.path.isfile(os.path.join(v_dir, f)):
					variants.append({"id": f, "name": f})
	except Exception as e:
		pass
		
	if len(variants) <= 1:
		for v in ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "f1", "f2", "f3", "f4", "f5", "croak", "whisper", "klatt", "klatt2", "klatt3", "adam"]:
			variants.append({"id": v, "name": v})
			
	langs.sort(key=lambda x: x["name"])
	return jsonify({"languages": langs, "variants": variants})

def process_espeak(data):
	text = data.get("text", "")
	voice = data.get("voice_id", "de")
	variant = data.get("variant_id", "")
	
	if variant:
		voice = f"{voice}+{variant}"
	
	if not text:
		return jsonify({"error": "No text provided"}), 400
		
	temp_dir = tempfile.gettempdir()
	temp_wav = os.path.join(temp_dir, f"espeak_{uuid.uuid4().hex}.wav")
	
	exe_path = get_espeak_exe_path()
	if not exe_path:
		return jsonify({"error": "espeak-ng.exe wurde nicht gefunden. Bitte installiere eSpeak NG oder lege die .exe neben die App."}), 500
		
	cmd = [exe_path, "-v", voice, "-w", temp_wav, text]
	
	try:
		creationflags = 0x08000000 if os.name == 'nt' else 0
		subprocess.run(cmd, check=True, capture_output=True, creationflags=creationflags)
		
		with open(temp_wav, "rb") as f:
			wav_data = f.read()
		return Response(wav_data, mimetype="audio/wav")
	except subprocess.CalledProcessError as e:
		return jsonify({"error": f"eSpeak Error: {e.stderr.decode('utf-8', errors='ignore')}"}), 500
	except Exception as e:
		return jsonify({"error": str(e)}), 500
	finally:
		if os.path.exists(temp_wav):
			try:
				os.remove(temp_wav)
			except:
				pass

@tts_bp.route("/tts/elevenlabs/voices", methods=['POST'])
def get_elevenlabs_voices():
	username = session['username']
	user_settings = load_settings(username)
	data = request.json
	api_key = data.get("api_key", user_settings.get("elevenlabs_api_key"))
	if not api_key:
		return jsonify({"error": "No API Key"}), 400
	try:
		headers = {"xi-api-key": api_key}
		r = requests.get("https://api.elevenlabs.io/v1/voices?show_legacy=true", headers=headers)
		r.raise_for_status()
		return jsonify(r.json().get("voices", []))
	except requests.exceptions.HTTPError as e:
		return jsonify({"error": f"ElevenLabs API error: {e.response.text}"}), e.response.status_code
	except Exception as e:
		return jsonify({"error": str(e)}), 500

def process_elevenlabs(data):
	text = data.get("text", "")
	voice_id = data.get("voice_id", "")
	api_key = data.get("api_key", "")
	
	if not api_key or not text or not voice_id:
		return jsonify({"error": "Missing parameters or API key"}), 400
		
	try:
		headers = {
			"xi-api-key": api_key,
			"Content-Type": "application/json"
		}
		payload = {
			"text": text,
			"model_id": "eleven_multilingual_v2" 
		}
		url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
		r = requests.post(url, json=payload, headers=headers, stream=True)
		
		if not r.ok:
			err_text = r.text
			try:
				err_json = r.json()
				if "detail" in err_json:
					err_text = str(err_json["detail"])
			except:
				pass
			return jsonify({"error": f"ElevenLabs Error ({r.status_code}): {err_text}"}), r.status_code
			
		return Response(r.iter_content(chunk_size=4096), mimetype="audio/mpeg")
	except Exception as e:
		return jsonify({"error": str(e)}), 500

@tts_bp.route("/music/elevenlabs/generate", methods=['POST'])
def generate_elevenlabs_music():
	username = session['username']
	user_settings = load_settings(username)
	data = request.json
	prompt = data.get("prompt", "")
	duration_ms = data.get("duration_ms", 15000)
	api_key = data.get("api_key", user_settings.get("elevenlabs_api_key"))
	
	if not api_key or not prompt:
		return jsonify({"error": "Missing parameters or API key (ElevenLabs API Key required)"}), 400
		
	try:
		headers = {
			"xi-api-key": api_key,
			"Content-Type": "application/json"
		}
		payload = {
			"prompt": prompt,
			"music_length_ms": int(duration_ms)
		}
		url = "https://api.elevenlabs.io/v1/music/stream"
		r = requests.post(url, json=payload, headers=headers)
		
		if not r.ok:
			err_text = r.text
			try:
				err_json = r.json()
				if "detail" in err_json:
					err_text = str(err_json["detail"])
			except:
				pass
			return jsonify({"error": f"ElevenLabs Music Error ({r.status_code}): {err_text}"}), r.status_code
			
		return Response(r.content, mimetype="audio/mpeg")
	except Exception as e:
		return jsonify({"error": str(e)}), 500

@tts_bp.route("/tts/piper/voices", methods=['GET'])
def get_piper_voices():
	try:
		if not hasattr(current_app, 'piper_voices_cache'):
			r = requests.get(PIPER_VOICES_JSON_URL, timeout=10)
			r.raise_for_status()
			current_app.piper_voices_cache = r.json()
			
		data = current_app.piper_voices_cache
		result = []
		
		for key, info in data.items():
			onnx_path = os.path.join(PIPER_DIR, f"{key}.onnx")
			downloaded = os.path.exists(onnx_path)
			
			speakers = info.get("speaker_id_map", {})
			num_speakers = info.get("num_speakers", 1)
			
			if not speakers and num_speakers > 1:
				speakers = {str(i): f"Speaker {i}" for i in range(num_speakers)}
			elif not speakers:
				speakers = {"0": "Standard"}
			else:
				speakers = {str(v): k for k, v in speakers.items()}
				
			lang = info.get("language", {}).get("code", "unknown")
			name = info.get("name", "unknown")
			quality = info.get("quality", "")
			display_name = f"[{lang}] {name} ({quality})"
			
			result.append({
				"key": key,
				"name": display_name,
				"downloaded": downloaded,
				"speakers": speakers
			})
			
		result.sort(key=lambda x: x["name"])
		return jsonify(result)
	except Exception as e:
		return jsonify({"error": str(e)}), 500

@tts_bp.route("/tts/piper/download", methods=['POST'])
def download_piper_voice():
	voice_key = request.json.get("key")
	if not voice_key or not hasattr(current_app, 'piper_voices_cache'):
		return jsonify({"error": "Voice Key missing or Cache not ready"}), 400
		
	info = current_app.piper_voices_cache.get(voice_key)
	if not info:
		return jsonify({"error": "Voice not found"}), 404
		
	files = info.get("files", {})
	onnx_remote = None
	json_remote = None
	
	for file_path in files.keys():
		if file_path.endswith(".onnx"):
			onnx_remote = file_path
		elif file_path.endswith(".onnx.json"):
			json_remote = file_path
			
	if not onnx_remote or not json_remote:
		return jsonify({"error": "Model files not found in registry"}), 404
		
	onnx_local = os.path.join(PIPER_DIR, f"{voice_key}.onnx")
	json_local = os.path.join(PIPER_DIR, f"{voice_key}.onnx.json")
	
	try:
		r_onnx = requests.get(PIPER_DATA_URL + onnx_remote, stream=True)
		r_onnx.raise_for_status()
		with open(onnx_local, 'wb') as f:
			for chunk in r_onnx.iter_content(chunk_size=8192):
				f.write(chunk)
				
		r_json = requests.get(PIPER_DATA_URL + json_remote)
		r_json.raise_for_status()
		with open(json_local, 'wb') as f:
			f.write(r_json.content)
			
		return jsonify({"status": "ok"})
	except Exception as e:
		if os.path.exists(onnx_local): os.remove(onnx_local)
		if os.path.exists(json_local): os.remove(json_local)
		return jsonify({"error": str(e)}), 500

def process_piper(data):
	text = data.get("text", "")
	voice_key = data.get("voice_id", "")
	speaker_id = data.get("speaker_id", "0")
	
	if not text or not voice_key:
		return jsonify({"error": "Missing parameters"}), 400
		
	onnx_local = os.path.join(PIPER_DIR, f"{voice_key}.onnx")
	if not os.path.exists(onnx_local):
		return jsonify({"error": "Model is not yet downloaded"}), 400
		
	temp_dir = tempfile.gettempdir()
	temp_wav = os.path.join(temp_dir, f"piper_{uuid.uuid4().hex}.wav")
	
	base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	local_piper = os.path.join(base_dir, "piper", "piper.exe")
	
	piper_executable = "piper"
	if os.path.exists(local_piper):
		piper_executable = local_piper
	
	cmd = [
		piper_executable, 
		"--model", onnx_local, 
		"--output_file", temp_wav
	]
	
	json_local = onnx_local + ".json"
	if os.path.exists(json_local):
		try:
			with open(json_local, "r", encoding="utf-8") as f:
				conf = json.load(f)
				if conf.get("num_speakers", 1) > 1:
					cmd.extend(["--speaker", str(speaker_id)])
		except Exception:
			pass
			
	try:
		creationflags = 0x08000000 if os.name == 'nt' else 0
		
		run_env = os.environ.copy()
		run_env["PYTHONIOENCODING"] = "utf-8"
		
		subprocess.run(cmd, input=text.encode('utf-8'), capture_output=True, check=True, creationflags=creationflags, env=run_env)
		
		with open(temp_wav, "rb") as f:
			wav_data = f.read()
			
		return Response(wav_data, mimetype="audio/wav")
	except subprocess.CalledProcessError as e:
		err_out = e.stderr.decode('utf-8', errors='ignore') if e.stderr else str(e)
		return jsonify({"error": f"Piper Exit {e.returncode}: {err_out}"}), 500
	except FileNotFoundError:
		return jsonify({"error": "Piper was not found. Please check if piper.exe is in the 'piper' folder."}), 500
	except Exception as e:
		return jsonify({"error": str(e)}), 500
	finally:
		if os.path.exists(temp_wav):
			try:
				os.remove(temp_wav)
			except:
				pass

@tts_bp.route("/tts/edge/voices", methods=['GET'])
def get_edge_voices():
	try:
		loop = asyncio.new_event_loop()
		asyncio.set_event_loop(loop)
		voices = loop.run_until_complete(edge_tts.list_voices())
		loop.close()
		
		formatted_voices = []
		for v in voices:
			formatted_voices.append({
				"id": v["ShortName"],
				"name": f"{v['FriendlyName']} ({v['Locale']})"
			})
		
		formatted_voices.sort(key=lambda x: x["name"])
		return jsonify(formatted_voices)
	except Exception as e:
		return jsonify({"error": str(e)}), 500

def process_edge(data):
	text = data.get("text", "")
	voice = data.get("voice_id", "de-DE-KillianNeural")
	
	if not text:
		return jsonify({"error": "No text provided"}), 400
		
	temp_dir = tempfile.gettempdir()
	temp_audio = os.path.join(temp_dir, f"edge_{uuid.uuid4().hex}.mp3")
	
	try:
		loop = asyncio.new_event_loop()
		asyncio.set_event_loop(loop)
		communicate = edge_tts.Communicate(text, voice)
		loop.run_until_complete(communicate.save(temp_audio))
		loop.close()
		
		with open(temp_audio, "rb") as f:
			audio_data = f.read()
		os.remove(temp_audio)
		return Response(audio_data, mimetype="audio/mpeg")
	except Exception as e:
		if os.path.exists(temp_audio):
			os.remove(temp_audio)
		return jsonify({"error": str(e)}), 50
