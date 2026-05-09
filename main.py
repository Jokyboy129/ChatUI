import sys
import os
import traceback
import webbrowser
import threading
import time
import ctypes
import io
import base64
import re
import uuid
import html
import json
from datetime import timedelta

# --- SPRACHERKENNUNG DES SYSTEMS ---
import locale
try:
	sys_lang, _ = locale.getdefaultlocale()
	IS_GERMAN = sys_lang and sys_lang.lower().startswith('de')
except:
	IS_GERMAN = False

# --- 0. SINGLETON CHECK (MEHRFACHSTART VERHINDERN) ---
mutex_name = "ChatUI_Server_Mutex_Unique_ID_998877"
mutex = ctypes.windll.kernel32.CreateMutexW(None, False, mutex_name)
if ctypes.windll.kernel32.GetLastError() == 183:
	msg = "ChatUI läuft bereits! Bitte prüfe den System-Tray." if IS_GERMAN else "ChatUI is already running! Please check the system tray."
	ctypes.windll.user32.MessageBoxW(0, msg, "ChatUI", 0x30)
	sys.exit(0)

# --- 1. KUGELSICHERER KONSOLEN-FIX OHNE LEERE DATEI ---
class NullWriter:
	encoding = 'utf-8'
	def write(self, text): pass
	def flush(self): pass
	def isatty(self): return False

if getattr(sys, 'frozen', False):
	sys.stdout = NullWriter()
	sys.stderr = NullWriter()

def write_crash_log(msg):
	if getattr(sys, 'frozen', False):
		try:
			log_dir = os.path.dirname(sys.executable)
			log_file = os.path.join(log_dir, "error.log")
			with open(log_file, "a", encoding="utf-8") as f:
				f.write(msg + "\n")
		except:
			pass

# --- 2. GRAFISCHER CRASH-HANDLER ---
def global_exception_handler(exctype, value, tb):
	err_msg = "".join(traceback.format_exception(exctype, value, tb))
	write_crash_log(err_msg)
	try:
		title = "ChatUI - Schwerwiegender Fehler" if IS_GERMAN else "ChatUI - Fatal Crash"
		ctypes.windll.user32.MessageBoxW(0, err_msg, title, 0x10)
	except:
		pass
	sys.exit(1)

sys.excepthook = global_exception_handler

# --- 3. IMPORTS ABSICHERN ---
try:
	import requests
	import sqlite3
	from flask import Flask, request, Response, jsonify, render_template, send_from_directory, session, redirect, url_for
	import fitz
	from PIL import Image, ImageDraw
	import pystray
	from docx import Document
	
	if os.name == 'nt':
		import pystray._win32
		
	from config import load_settings, save_settings, public_settings_for_user, apply_admin_policy, load_admin_policy, save_admin_policy, is_admin, API_KEY_FIELDS, LOCKABLE_AGENT_FIELDS, get_db_path, APP_DIR, DATA_DIR, PIPER_DIR, OLLAMA_URL, PORT, UPLOADS_DIR, load_users, save_users, hash_password, get_secret_key
	from database import init_db, get_chat_history, save_message_to_db, generate_chat_title, save_doc_chunk, search_doc_chunks
	from web_search import get_search_query, perform_web_search
	import email_agent
	
	from tts_system import tts_bp
	from ai_handlers import generate_ollama, generate_gemini, generate_openai, generate_mistral, generate_openrouter, get_chat_title
	from tools_agent import update_ytdlp, process_document_commands, process_ffmpeg_commands, process_youtube_commands, extract_email_info, parse_email_intent

except Exception as e:
	err_msg = traceback.format_exc()
	write_crash_log(err_msg)
	try:
		title = "ChatUI - Import Crash"
		msg = f"Import-Fehler (Fehlt ein Modul in PyInstaller?):\n\n{err_msg}" if IS_GERMAN else f"Import Error (Missing module in PyInstaller?):\n\n{err_msg}"
		ctypes.windll.user32.MessageBoxW(0, msg, title, 0x10)
	except:
		pass
	sys.exit(1)

app = Flask(__name__, template_folder=os.path.join(APP_DIR, 'templates'), static_folder=os.path.join(APP_DIR, 'static'))
app.secret_key = get_secret_key()
app.permanent_session_lifetime = timedelta(days=365)

app.register_blueprint(tts_bp)

# --- HELPER FÜR CHUNKING ---
def get_text_chunks(text, chunk_size=2000, overlap=400):
	"""Teilt langen Text in überlappende Chunks auf."""
	words = text.split()
	chunks = []
	current_chunk = []
	current_len = 0
	
	for word in words:
		current_chunk.append(word)
		current_len += len(word) + 1
		if current_len >= chunk_size:
			chunks.append(" ".join(current_chunk))
			overlap_words = []
			overlap_len = 0
			for w in reversed(current_chunk):
				overlap_words.insert(0, w)
				overlap_len += len(w) + 1
				if overlap_len >= overlap:
					break
			current_chunk = overlap_words
			current_len = overlap_len
			
	if current_chunk:
		chunks.append(" ".join(current_chunk))
	return chunks

# --- HELPER FÜR SPRACHE ---
def is_lang_de():
	if 'username' in session:
		user_settings = public_settings_for_user(session['username'])
		lang = user_settings.get("language", "auto")
		if lang != "auto":
			return lang == "de"
	return IS_GERMAN

@app.before_request
def require_login():
	allowed_routes = [
		'login', 'register', 'static', 'serve_media', 'download_file', 
		'tts_bp.stream_tts'
	]
	if request.endpoint not in allowed_routes and 'username' not in session:
		return redirect(url_for('login'))

@app.route("/login", methods=['GET', 'POST'])
def login():
	lang_de = IS_GERMAN
	if request.method == 'POST':
		username = request.form.get("username", "").strip()
		password = request.form.get("password", "")
		if username and password:
			users = load_users()
			if username in users and users[username] == hash_password(password):
				session.permanent = True
				session['username'] = username
				init_db(username)
				return redirect(url_for('index'))
			else:
				err = "Falscher Benutzername oder Passwort." if lang_de else "Incorrect username or password."
				return render_template('login.html', error=err)
		err = "Bitte fülle alle Felder aus." if lang_de else "Please fill in all fields."
		return render_template('login.html', error=err)
	return render_template('login.html')

@app.route("/register", methods=['GET', 'POST'])
def register():
	lang_de = IS_GERMAN
	if request.method == 'POST':
		username = request.form.get("username", "").strip()
		password = request.form.get("password", "")
		
		if username and password:
			username = "".join([c for c in username if c.isalnum() or c in " ._-"])
			if not username:
				err = "Ungültiger Benutzername." if lang_de else "Invalid username."
				return render_template('register.html', error=err)
				
			users = load_users()
			if username in users:
				err = "Dieser Benutzername ist bereits vergeben." if lang_de else "This username is already taken."
				return render_template('register.html', error=err)
				
			users[username] = hash_password(password)
			save_users(users)
			
			session.permanent = True
			session['username'] = username
			init_db(username)
			return redirect(url_for('index'))
			
		err = "Bitte fülle alle Felder aus." if lang_de else "Please fill in all fields."
		return render_template('register.html', error=err)
	return render_template('register.html')

@app.route("/logout")
def logout():
	session.pop('username', None)
	return redirect(url_for('login'))

def cleanup_uploads():
	try:
		now = time.time()
		for filename in os.listdir(UPLOADS_DIR):
			file_path = os.path.join(UPLOADS_DIR, filename)
			if os.path.isfile(file_path):
				if os.stat(file_path).st_mtime < now - 3600:
					try:
						os.remove(file_path)
					except:
						pass
	except Exception as e:
		print("Error during cleanup:", e)

@app.route("/")
def index():
	return render_template('index.html')

@app.route("/download/<path:filename>")
def download_file(filename):
	return send_from_directory(UPLOADS_DIR, filename, as_attachment=True)

@app.route("/media/<path:filename>")
def serve_media(filename):
	return send_from_directory(UPLOADS_DIR, filename)

@app.route("/models")
def models():
	user_settings = apply_admin_policy(session['username'], load_settings(session['username']))
	prov = request.args.get('provider', user_settings.get("ai_provider"))
	if prov == "gemini":
		if not user_settings.get("gemini_api_key"):
			return jsonify([])
		try:
			url = f"https://generativelanguage.googleapis.com/v1beta/models?key={user_settings['gemini_api_key']}"
			r = requests.get(url)
			r.raise_for_status()
			data = r.json()
			models_list = []
			for m in data.get("models", []):
				if "generateContent" in m.get("supportedGenerationMethods", []):
					models_list.append(m["name"].replace("models/", ""))
			return jsonify(models_list)
		except Exception:
			return jsonify(["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash"])
	elif prov == "openrouter":
		if not user_settings.get("openrouter_api_key"):
			return jsonify([])
		try:
			url = "https://openrouter.ai/api/v1/models"
			r = requests.get(url)
			r.raise_for_status()
			data = r.json()
			models_list = []
			for m in data.get("data", []):
				if user_settings.get("openrouter_free_only"):
					pricing = m.get("pricing", {})
					try:
						if float(pricing.get("prompt", 1)) > 0 or float(pricing.get("completion", 1)) > 0:
							continue
					except Exception:
						continue
				models_list.append(m["id"])
			return jsonify(models_list)
		except Exception:
			return jsonify(["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5", "meta-llama/llama-3-8b-instruct"])
	elif prov == "openai":
		if not user_settings.get("openai_api_key"):
			return jsonify([])
		try:
			url = "https://api.openai.com/v1/models"
			headers = {"Authorization": f"Bearer {user_settings.get('openai_api_key', '')}"}
			r = requests.get(url, headers=headers)
			r.raise_for_status()
			data = r.json()
			models_list = [m["id"] for m in data.get("data", []) if "gpt" in m["id"] or "o1" in m["id"] or "o3" in m["id"]]
			return jsonify(sorted(models_list))
		except Exception:
			return jsonify(["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"])
	elif prov == "mistral":
		if not user_settings.get("mistral_api_key"):
			return jsonify([])
		try:
			url = "https://api.mistral.ai/v1/models"
			headers = {"Authorization": f"Bearer {user_settings.get('mistral_api_key', '')}"}
			r = requests.get(url, headers=headers)
			r.raise_for_status()
			data = r.json()
			models_list = [m["id"] for m in data.get("data", []) if "id" in m]
			return jsonify(sorted(models_list))
		except Exception:
			return jsonify(["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"])
	else:
		try:
			r = requests.get(f"{OLLAMA_URL}/api/tags")
			r.raise_for_status()
			data = r.json()
			if "models" in data:
				return jsonify([m.get("name", "") for m in data["models"] if "name" in m])
			return jsonify([])
		except Exception:
			return jsonify([])

@app.route("/history", methods=['GET', 'DELETE'])
def handle_history():
	username = session['username']
	if request.method == 'GET':
		conn = None
		try:
			conn = sqlite3.connect(get_db_path(username), timeout=10)
			conn.row_factory = sqlite3.Row
			chats_db = conn.execute('SELECT id, title FROM chats ORDER BY updated_at DESC').fetchall()
			summary = [{"id": c["id"], "title": c["title"] or "New Chat"} for c in chats_db]
			return jsonify(summary)
		except Exception as e:
			print("Error fetching history list:", e)
			return jsonify([])
		finally:
			if conn:
				conn.close()
	
	if request.method == 'DELETE':
		chat_id = request.args.get('id')
		conn = None
		try:
			conn = sqlite3.connect(get_db_path(username), timeout=10)
			conn.execute('PRAGMA foreign_keys = ON')
			if chat_id:
				conn.execute('DELETE FROM chats WHERE id = ?', (chat_id,))
			elif request.args.get('all') == 'true':
				conn.execute('DELETE FROM chats')
			conn.commit()
			return jsonify({"status": "deleted"})
		except Exception as e:
			print("Error deleting chat:", e)
			return jsonify({"error": "Error deleting"}), 500
		finally:
			if conn:
				conn.close()

@app.route("/history/<chat_id>", methods=['GET'])
def get_chat(chat_id):
	username = session['username']
	conn = None
	try:
		conn = sqlite3.connect(get_db_path(username), timeout=10)
		conn.row_factory = sqlite3.Row
		chat_row = conn.execute('SELECT title FROM chats WHERE id = ?', (chat_id,)).fetchone()
		if not chat_row:
			return jsonify({"error": "Chat not found"}), 404
		
		messages = get_chat_history(username, chat_id)
		return jsonify({"id": chat_id, "title": chat_row["title"], "messages": messages})
	except Exception as e:
		return jsonify({"error": str(e)}), 500
	finally:
		if conn:
			conn.close()

@app.route("/settings", methods=['GET', 'POST'])
def settings():
	username = session['username']
	if request.method == 'POST':
		data = request.json
		user_settings = load_settings(username)
		user_policy = {} if is_admin(username) else load_admin_policy().get("users", {}).get(username, {})
		locked_agents = user_policy.get("locked_agents", {})
		system_prompt_locked = user_policy.get("lock_system_prompt", False)
		
		allowed_keys = [
			"show_token_count", "native_websearch", 
			"tts_download_enabled", "elevenlabs_music_enabled", 
			"language", "email_accounts", "default_email_account",
			"tool_doc_gen_enabled", "tool_email_send_enabled",
			"tool_email_read_enabled", "tool_youtube_enabled", "tool_audio_enabled",
			"web_search_enabled", "web_search_mode", "web_search_max_results", "searxng_url"
		]
		
		for key, value in data.items():
			if key in API_KEY_FIELDS and user_policy.get("shared_api_keys") and key in user_policy.get("shared_api_keys", []) and not value:
				continue
			if key in LOCKABLE_AGENT_FIELDS and key in locked_agents:
				continue
			if key == "system_prompt" and system_prompt_locked:
				continue
			if key in user_settings or key in allowed_keys:
				if key in ["web_search_max_results", "history_context_limit"]:
					try:
						user_settings[key] = int(value)
					except ValueError:
						pass
				elif key == "default_email_account":
					try:
						user_settings[key] = int(value)
					except ValueError:
						user_settings[key] = 0
				elif key in ["show_token_count", "native_websearch", "tts_download_enabled", "elevenlabs_music_enabled", "tool_doc_gen_enabled", "tool_email_send_enabled", "tool_email_read_enabled", "tool_youtube_enabled", "tool_audio_enabled", "web_search_enabled"]:
					user_settings[key] = bool(value)
				elif key == "email_accounts":
					user_settings[key] = value if isinstance(value, list) else []
				else:
					user_settings[key] = value
					
		save_settings(username, user_settings)
		return jsonify({"status": "ok"})
	else:
		return jsonify(public_settings_for_user(username))

@app.route("/admin/users", methods=['GET'])
def admin_users():
	username = session['username']
	if not is_admin(username):
		return jsonify({"error": "Forbidden"}), 403
	users = load_users()
	policy = load_admin_policy()
	result = []
	for name in users.keys():
		result.append({
			"username": name,
			"is_admin": name == policy.get("admin"),
			"policy": policy.get("users", {}).get(name, {})
		})
	return jsonify({
		"admin": policy.get("admin"),
		"users": result,
		"api_key_fields": API_KEY_FIELDS,
		"lockable_agent_fields": LOCKABLE_AGENT_FIELDS
	})

@app.route("/admin/users/<target_username>/policy", methods=['POST'])
def admin_update_user_policy(target_username):
	username = session['username']
	if not is_admin(username):
		return jsonify({"error": "Forbidden"}), 403
	users = load_users()
	if target_username not in users:
		return jsonify({"error": "User not found"}), 404
	if target_username == username:
		return jsonify({"error": "Cannot restrict the admin account"}), 400

	data = request.json or {}
	policy = load_admin_policy()
	user_policy = policy.setdefault("users", {}).setdefault(target_username, {})

	shared_api_keys = data.get("shared_api_keys", [])
	user_policy["shared_api_keys"] = [key for key in shared_api_keys if key in API_KEY_FIELDS]

	locked_agents = data.get("locked_agents", {})
	user_policy["locked_agents"] = {
		key: bool(value)
		for key, value in locked_agents.items()
		if key in LOCKABLE_AGENT_FIELDS
	}

	user_policy["lock_system_prompt"] = bool(data.get("lock_system_prompt", False))
	user_policy["system_prompt"] = data.get("system_prompt", "")

	save_admin_policy(policy)
	return jsonify({"status": "ok", "policy": user_policy})

@app.route("/transcribe", methods=['POST'])
def transcribe_audio():
	if 'file' not in request.files:
		return jsonify({"error": "No audio file found"}), 400
		
	f = request.files['file']
	lang = "de-DE" if is_lang_de() else "en-US"
	
	try:
		import speech_recognition as sr
		recognizer = sr.Recognizer()
		
		with sr.AudioFile(f) as source:
			audio_data = recognizer.record(source)
			
		text = recognizer.recognize_google(audio_data, language=lang)
		return jsonify({"text": text})
		
	except ImportError:
		msg = "Das Modul 'SpeechRecognition' fehlt. Bitte beende das Programm und führe aus: pip install SpeechRecognition" if is_lang_de() else "The module 'SpeechRecognition' is missing. Please run: pip install SpeechRecognition"
		return jsonify({"error": msg}), 500
	except Exception as e:
		msg = f"Sprache konnte nicht erkannt werden." if is_lang_de() else f"Speech could not be recognized."
		return jsonify({"error": f"{msg} (Error: {str(e)})"}), 500

@app.route("/api/email/send", methods=['POST'])
def api_send_email():
	username = session['username']
	user_settings = load_settings(username)
	de = is_lang_de()
	data = request.json
	chat_id = data.get("chat_id")
	to_email = data.get("to")
	subject = data.get("subject")
	body = data.get("body")
	attachment_filename = data.get("attachment")
	account_index = int(data.get("account_index", 0))
	
	attachments = []
	if attachment_filename:
		filepath = os.path.join(UPLOADS_DIR, attachment_filename)
		if os.path.exists(filepath):
			attachments.append(filepath)
			
	accounts = user_settings.get("email_accounts", [])
	if not accounts or account_index >= len(accounts):
		msg = "Ungültiges E-Mail-Konto." if de else "Invalid email account."
		return jsonify({"success": False, "message": msg})
		
	acc = accounts[account_index]
	
	success, msg = email_agent.send_and_save_email(
		acc,
		to_email,
		subject,
		body,
		attachments=attachments
	)
	
	if de:
		result_text = f"**Gesendete E-Mail:**\n\n**Von:** {acc.get('name', 'Standard')}\n**An:** {to_email}\n**Betreff:** {subject}\n\n{body}\n"
		if attachments:
			result_text += f"\n**Anhang:** {attachment_filename}\n"
		result_text += f"\n---\n**Status:** "
		if success:
			result_text += "Erfolgreich: " + msg
		else:
			result_text += "Fehler: " + msg
	else:
		result_text = f"**Sent E-Mail:**\n\n**From:** {acc.get('name', 'Default')}\n**To:** {to_email}\n**Subject:** {subject}\n\n{body}\n"
		if attachments:
			result_text += f"\n**Attachment:** {attachment_filename}\n"
		result_text += f"\n---\n**Status:** "
		if success:
			result_text += "Success: " + msg
		else:
			result_text += "Error: " + msg
		
	save_message_to_db(username, chat_id, "assistant", result_text)
	return jsonify({"success": success, "message": msg})

@app.route("/send", methods=['POST'])
def send_message():
	username = session['username']
	user_settings = apply_admin_policy(username, load_settings(username))
	de = is_lang_de()
	
	cleanup_uploads()
	message_text = ""
	model = ""
	chat_id = ""
	images = []
	
	if "message" in request.form:
		chat_id = request.form.get("chat_id", "")
	elif request.is_json:
		chat_id = request.json.get("chat_id", "")

	tools_json = request.form.get("tools", "[]") if "message" in request.form else request.json.get("tools", "[]")
	try:
		active_tools = json.loads(tools_json)
	except:
		active_tools = []

	if not chat_id:
		chat_id = str(uuid.uuid4())
		if user_settings.get("history_enabled", True):
			conn = None
			try:
				conn = sqlite3.connect(get_db_path(username), timeout=10)
				new_chat_title = "Neuer Chat..." if de else "New Chat..."
				conn.execute('INSERT INTO chats (id, title) VALUES (?, ?)', (chat_id, new_chat_title))
				conn.commit()
			except Exception as e:
				print("Error creating chat:", e)
			finally:
				if conn:
					conn.close()
			
			save_message_to_db(username, chat_id, "system", user_settings.get("system_prompt", ""))

	force_search = ("websearch" in active_tools) or (request.form.get("force_search") == "true")
	
	if "message" in request.form and "model" in request.form:
		message_text = request.form.get("message", "")
		model = request.form.get("model", "")
		
		if "file" in request.files:
			f = request.files["file"]
			if f and f.filename:
				filename = f.filename.lower()
				try:
					content_bytes = f.read()
					file_path = os.path.join(UPLOADS_DIR, f.filename)
					with open(file_path, "wb") as out_f:
						out_f.write(content_bytes)
					
					if filename.endswith((".jpg", ".jpeg", ".png")):
						b64 = base64.b64encode(content_bytes).decode("utf-8")
						images.append(b64)
						m = f"\n[Bild hochgeladen: {f.filename}]" if de else f"\n[Image uploaded: {f.filename}]"
						message_text += m
					elif filename.endswith(".pdf"):
						pdf_doc = fitz.open(stream=content_bytes, filetype="pdf")
						full_text = ""
						for page_num in range(len(pdf_doc)):
							full_text += pdf_doc[page_num].get_text() + "\n"
						chunks = get_text_chunks(full_text)
						for i, chunk_text in enumerate(chunks):
							full_chunk = f"Document: {f.filename} | Part {i+1}:\n{chunk_text}"
							save_doc_chunk(username, chat_id, full_chunk, [])
						m = f"\n[Das PDF-Dokument '{f.filename}' wurde in {len(chunks)} Abschnitten indiziert.]" if de else f"\n[The PDF document '{f.filename}' was indexed in {len(chunks)} sections.]"
						message_text += m
					elif filename.endswith(".docx"):
						doc = Document(io.BytesIO(content_bytes))
						full_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
						chunks = get_text_chunks(full_text)
						for i, chunk_text in enumerate(chunks):
							full_chunk = f"Document: {f.filename} | Part {i+1}:\n{chunk_text}"
							save_doc_chunk(username, chat_id, full_chunk, [])
						m = f"\n[Das Word-Dokument '{f.filename}' wurde in {len(chunks)} Abschnitten indiziert.]" if de else f"\n[The Word document '{f.filename}' was indexed in {len(chunks)} sections.]"
						message_text += m
					elif filename.endswith((".mp3", ".wav", ".flac", ".m4a", ".ogg", ".aac", ".wma", ".opus")):
						m = f"\n[Audio file uploaded: {f.filename}]"
						message_text += m
					else:
						file_content = content_bytes.decode("utf-8", errors="ignore")
						chunks = get_text_chunks(file_content)
						for i, chunk_text in enumerate(chunks):
							full_chunk = f"Document: {f.filename} | Part {i+1}:\n{chunk_text}"
							save_doc_chunk(username, chat_id, full_chunk, [])
						m = f"\n[Das Text-Dokument '{f.filename}' wurde in {len(chunks)} Abschnitten geladen.]" if de else f"\n[The text document '{f.filename}' was loaded in {len(chunks)} sections.]"
						message_text += m
				except Exception as e:
					print(f"Error reading file: {e}")

	elif request.is_json:
		data = request.json
		message_text = data.get("message", "")
		model = data.get("model", "")
		if data.get("force_search") == True:
			force_search = True

	if not message_text and not images:
		return jsonify({"error": "No message or image"}), 400

	if user_settings.get("history_enabled", True):
		current_msgs = get_chat_history(username, chat_id)
		if len(current_msgs) <= 1:
			threading.Thread(target=generate_chat_title, args=(username, chat_id, message_text, model)).start()

	final_message_text = message_text

	if "email_send" in active_tools:
		def generate_email_draft():
			yield json.dumps({"chat_id": chat_id, "title": get_chat_title(username, chat_id, de)}) + "\n"
			msg_analyzing = "Analysiere E-Mail-Auftrag und erstelle Entwurf...\n\n" if de else "Analyzing email request and creating draft...\n\n"
			yield json.dumps({"content": msg_analyzing}) + "\n"

			accounts = user_settings.get("email_accounts", [])
			if not accounts:
				err = "Fehler: **E-Mail konnte nicht gesendet werden:** Keine Konten eingerichtet. Bitte richte diese in den Einstellungen ein." if de else "Error: **E-Mail could not be sent:** No accounts configured. Please configure them in the settings."
				save_message_to_db(username, chat_id, "assistant", err)
				yield json.dumps({"content": err}) + "\n"
				return

			email_data = extract_email_info(final_message_text, model, user_settings)
			if not email_data or "to" not in email_data or "body" not in email_data:
				err = "**Fehler:** Konnte Empfänger oder Nachrichtentext nicht aus deiner Nachricht extrahieren. Bitte formuliere deinen Prompt etwas klarer." if de else "**Error:** Could not extract recipient or message body from your prompt. Please be more specific."
				save_message_to_db(username, chat_id, "assistant", err)
				yield json.dumps({"content": err}) + "\n"
				return

			safe_to = html.escape(email_data.get('to', ''))
			safe_subject = html.escape(email_data.get('subject', ''))
			safe_body = html.escape(email_data.get('body', ''))

			no_attach = "Kein Anhang" if de else "No Attachment"
			attachments_html = f'<option value="">{no_attach}</option>'
			try:
				if os.path.exists(UPLOADS_DIR):
					list_of_files = [os.path.join(UPLOADS_DIR, f) for f in os.listdir(UPLOADS_DIR) if os.path.isfile(os.path.join(UPLOADS_DIR, f))]
					latest_file = os.path.basename(max(list_of_files, key=os.path.getmtime)) if list_of_files else None
					
					for filename in os.listdir(UPLOADS_DIR):
						if os.path.isfile(os.path.join(UPLOADS_DIR, filename)):
							safe_file = html.escape(filename)
							selected_attr = ' selected' if filename == latest_file else ''
							attachments_html += f'<option value="{safe_file}"{selected_attr}>{safe_file}</option>'
			except Exception:
				pass
				
			default_acc_idx = user_settings.get("default_email_account", 0)
			account_options = ""
			for idx, acc in enumerate(accounts):
				name = acc.get("name", f"Konto {idx+1}")
				selected = " selected" if idx == default_acc_idx else ""
				account_options += f'<option value="{idx}"{selected}>{html.escape(name)}</option>'

			form_html = f"""
			<div class="email-draft-form" style="border:1px solid #ced4da; padding:1rem; border-radius:5px; margin-top:1rem; background-color:#f8f9fa;">
				<h4 style="margin-top:0; color:#333;">{"E-Mail Entwurf" if de else "E-Mail Draft"}</h4>
				<label style="display:block; margin-bottom:0.2rem; font-weight:bold;">{"Konto:" if de else "Account:"}</label>
				<select id="draft-account" style="width:100%; margin-bottom:0.8rem; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
					{account_options}
				</select>
				<label style="display:block; margin-bottom:0.2rem; font-weight:bold;">{"An:" if de else "To:"}</label>
				<input type="text" id="draft-to" value="{safe_to}" style="width:100%; margin-bottom:0.8rem; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
				<label style="display:block; margin-bottom:0.2rem; font-weight:bold;">{"Betreff:" if de else "Subject:"}</label>
				<input type="text" id="draft-subject" value="{safe_subject}" style="width:100%; margin-bottom:0.8rem; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
				<label style="display:block; margin-bottom:0.2rem; font-weight:bold;">{"Anhang aus Uploads:" if de else "Attachment from Uploads:"}</label>
				<select id="draft-attachment" style="width:100%; margin-bottom:0.8rem; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
					{attachments_html}
				</select>
				<label style="display:block; margin-bottom:0.2rem; font-weight:bold;">{"Nachricht:" if de else "Message:"}</label>
				<textarea id="draft-body" style="width:100%; height:200px; margin-bottom:0.8rem; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">{safe_body}</textarea>
				<button class="btn-primary" onclick="submitEmailDraft(this, '{chat_id}')" style="padding:0.5rem 1rem;">{"Jetzt Senden" if de else "Send Now"}</button>
			</div>
			"""
			
			yield json.dumps({"content": form_html}) + "\n"
			
		save_message_to_db(username, chat_id, "user", final_message_text, images)
		return Response(generate_email_draft(), mimetype="text/plain")

	email_agent_output = ""
	if "email_read" in active_tools:
		accounts = user_settings.get("email_accounts", [])
		if not accounts:
			email_agent_output = "\n\n[Systemhinweis: Es sind keine E-Mail-Konten konfiguriert.]"
		else:
			intent = parse_email_intent(message_text, model, user_settings)
			action = intent.get("action", "read") if intent else "read"
			
			email_agent_output += "\n\n--- E-MAIL AGENT RESULT ---\n"
			for idx, acc in enumerate(accounts):
				name = acc.get("name", f"Konto {idx+1}")
				uids_to_delete = intent.get("uids") or intent.get("uid")
				if action == "delete" and uids_to_delete:
					success, msg_str = email_agent.delete_email(acc, uids_to_delete)
					email_agent_output += f"\nKONTO: {name} - {msg_str}\n"
				else:
					keyword = intent.get("keyword") if intent else None
					success, mails = email_agent.fetch_emails(acc, limit=5, search_keyword=keyword)
					if success:
						filter_info = f"Suche nach: '{keyword}'" if keyword else "Neueste E-Mails"
						email_agent_output += f"\nKONTO: {name} ({filter_info})\n"
						if not mails:
							email_agent_output += "Keine E-Mails gefunden.\n"
						for m in mails:
							email_agent_output += f"UID: {m['uid']}\nVon: {m['from']}\nBetreff: {m['subject']}\nDatum: {m['date']}\nInhalt: {m['body']}\n---\n"
					else:
						email_agent_output += f"\nKONTO: {name} - Fehler beim Abrufen: {mails}\n"
			email_agent_output += "\n--- ENDE E-MAIL AGENT ---\n"
			email_agent_output += "[SYSTEM INSTRUCTION: Provide the user with the requested email information or confirm the deletion based on the IMAP results above. If the user wants to reply to an email, instruct them to use the 'E-Mail Senden' Tool and provide the necessary details.]\n"

	search_query = None
	past_messages = get_chat_history(username, chat_id) if user_settings.get("history_enabled", True) else []
	
	use_native_pipeline = user_settings.get("native_websearch", True) and user_settings.get("ai_provider") in ["gemini", "openrouter"]
	do_native_search = use_native_pipeline and (force_search or (user_settings.get("web_search_enabled") and user_settings.get("web_search_mode") == "auto"))
	do_custom_search = not use_native_pipeline and (force_search or (user_settings.get("web_search_enabled") and user_settings.get("web_search_mode") == "auto"))
	
	if do_custom_search:
		if force_search:
			search_query = get_search_query(message_text, model, user_settings, forced=True, history=past_messages)
		else:
			search_query = get_search_query(message_text, model, user_settings, forced=False, history=past_messages)
			
		if search_query:
			search_results = perform_web_search(search_query, user_settings.get("web_search_max_results", 2), user_settings)
			src_title = "Quellen" if de else "Sources"
			final_message_text += f"\n\n<details class=\"search-sources\">\n<summary>{src_title} (Web search for: {search_query})</summary>\n\n"
			final_message_text += f"{search_results}\n"
			final_message_text += "\n</details>"

	relevant_chunks = search_doc_chunks(username, chat_id, message_text, limit=8)
	if relevant_chunks:
		doc_title = "Relevante Dokumentenauszüge" if de else "Relevant Document Excerpts"
		final_message_text += f"\n\n<details class=\"search-sources\">\n<summary>{doc_title}</summary>\n\n"
		for i, chunk in enumerate(relevant_chunks):
			final_message_text += f"--- Excerpt {i+1} ---\n{chunk['text']}\n\n"
			if chunk['images']:
				images.extend(chunk['images'])
		final_message_text += "</details>"

	save_message_to_db(username, chat_id, "user", final_message_text, images)
	
	current_messages = get_chat_history(username, chat_id)
	
	if not user_settings.get("history_enabled", True):
		current_messages = [
			{"role": "system", "content": user_settings.get("system_prompt", "")},
			{"role": "user", "content": final_message_text}
		]
	else:
		limit = user_settings.get("history_context_limit", 10)
		if limit > 0:
			system_msgs = [m for m in current_messages if m["role"] == "system"]
			other_msgs = [m for m in current_messages if m["role"] != "system"]
			current_messages = system_msgs + other_msgs[-limit:]

	audio_instruction = ""
	if "audio" in active_tools:
		latest_audio_file = None
		for msg in current_messages:
			matches = re.findall(r'\[Audio file uploaded: (.*?)\]', msg.get("content", ""))
			if matches:
				latest_audio_file = matches[-1]
				
		if latest_audio_file:
			base_name = os.path.splitext(latest_audio_file)[0]
			audio_instruction = f"\n\n[SYSTEM INSTRUCTION: The Audio/FFmpeg tool is active. The most recent audio file is '{latest_audio_file}'. Modify the audio EXACTLY as the user requests. You MUST output your command exactly in this format: [EXECUTE_FFMPEG]-i \"{latest_audio_file}\" <args> \"{base_name}_mod.<new_extension>\"[/EXECUTE_FFMPEG]. Supported FFmpeg operations: format conversion, trimming (e.g. -ss 00:00:10 -t 5), retuning (e.g. 440Hz to 432Hz use -af \"asetrate=44100*432/440,aresample=44100\"). IMPORTANT: For audio-only files (.mp3, .m4a etc.) NEVER use video mappings like '-map 0:v:0' as they have no video stream! WARNING: The closing tag [/EXECUTE_FFMPEG] MUST NEVER BE MISSING!]"

	youtube_instruction = ""
	if "youtube" in active_tools:
		youtube_instruction = "\n\n[SYSTEM INSTRUCTION: The YouTube Tool is active. The user wants to play or download a video/song. You MUST output exactly this format: [PLAY_YOUTUBE]<Name of song or video>[/PLAY_YOUTUBE]. Replace <Name of song or video> with the requested search term. Do not apologize, just output the tag.]"

	doc_writer_instruction = ""
	if "doc_gen" in active_tools:
		doc_writer_instruction = "\n\n[SYSTEM INSTRUCTION: The Document Generator Tool is active. You MUST create a downloadable document based on the user's request. Use EXACTLY this format: [SAVE_DOC]filename.ext|||Complete document content here[/SAVE_DOC]. Supported extensions: .docx, .doc, .rtf, .txt, .md, .csv. For .docx, use standard Markdown formatting (**bold**, *italic*, # Headings). DO NOT write prose outside the tag!]"

	gen_kwargs = {
		"username": username,
		"chat_id": chat_id,
		"model": model,
		"current_messages": current_messages,
		"user_settings": user_settings,
		"de": de,
		"search_query": search_query,
		"relevant_chunks": relevant_chunks,
		"audio_instruction": audio_instruction,
		"youtube_instruction": youtube_instruction,
		"email_agent_output": email_agent_output,
		"doc_writer_instruction": doc_writer_instruction,
		"process_ffmpeg": process_ffmpeg_commands,
		"process_yt": process_youtube_commands,
		"process_doc": process_document_commands,
		"force_search": force_search,
		"do_native_search": do_native_search
	}

	if user_settings.get("ai_provider") == "gemini":
		return Response(generate_gemini(gen_kwargs), mimetype="text/plain")
	elif user_settings.get("ai_provider") == "openrouter":
		return Response(generate_openrouter(gen_kwargs), mimetype="text/plain")
	elif user_settings.get("ai_provider") == "openai":
		return Response(generate_openai(gen_kwargs), mimetype="text/plain")
	elif user_settings.get("ai_provider") == "mistral":
		return Response(generate_mistral(gen_kwargs), mimetype="text/plain")
	else:
		return Response(generate_ollama(gen_kwargs), mimetype="text/plain")

def create_tray_image(width, height):
	image = Image.new('RGB', (width, height), color=(33, 37, 41))
	dc = ImageDraw.Draw(image)
	dc.rectangle((width // 2 - 10, height // 2 - 10, width // 2 + 10, height // 2 + 10), fill=(13, 110, 253))
	return image

def on_tray_open_browser(icon, item):
	webbrowser.open(f"http://127.0.0.1:{PORT}")

def on_tray_quit(icon, item):
	icon.stop()
	os._exit(0)

def run_system_tray():
	menu_open = "Im Browser öffnen" if IS_GERMAN else "Open in Browser"
	menu_quit = "Beenden" if IS_GERMAN else "Quit"
	
	menu = pystray.Menu(
		pystray.MenuItem(menu_open, on_tray_open_browser),
		pystray.MenuItem(menu_quit, on_tray_quit)
	)
	icon = pystray.Icon("ChatUI", create_tray_image(64, 64), "ChatUI Server", menu=menu)
	icon.run()

if __name__ == "__main__":
	from waitress import serve
	
	update_ytdlp(IS_GERMAN)
	
	cleanup_uploads()
	
	server_thread = threading.Thread(target=serve, args=(app,), kwargs={"host": "0.0.0.0", "port": PORT}, daemon=True)
	server_thread.start()
	
	run_system_tray()