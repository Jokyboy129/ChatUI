import sqlite3
import json
import requests
import time
from config import get_db_path, load_settings, OLLAMA_URL

# Stopwords filtern Füllwörter aus der FTS5 Suchanfrage heraus, um die Treffergenauigkeit bei Büchern zu maximieren.
STOPWORDS = {"und", "oder", "ist", "der", "die", "das", "ein", "eine", "zu", "in", "mit", "für", "auf", "an", "es", "von", "als", "auch", "nach", "aus", "um", "wie", "sie", "er", "ich", "wir", "du", "ihr", "was", "wer", "wo", "wann", "warum", "welche", "welcher", "welches", "dass", "the", "and", "or", "to", "of", "a", "an", "is", "it", "with", "for", "on", "at", "as", "by", "this", "that", "kannst", "bitte", "mir", "dir", "mich", "dich", "buch", "dokument", "text", "zusammenfassen", "fasse", "zusammen"}

def init_db(username):
	conn = None
	try:
		conn = sqlite3.connect(get_db_path(username), timeout=10)
		conn.execute('''CREATE TABLE IF NOT EXISTS chats (
			id TEXT PRIMARY KEY,
			title TEXT
		)''')
		try:
			conn.execute('ALTER TABLE chats ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
		except sqlite3.OperationalError:
			pass
		
		conn.execute('''CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			chat_id TEXT,
			role TEXT,
			content TEXT,
			images TEXT,
			FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
		)''')
		
		try:
			conn.execute('ALTER TABLE messages ADD COLUMN usage TEXT')
		except sqlite3.OperationalError:
			pass

		try:
			conn.execute('ALTER TABLE messages ADD COLUMN audio TEXT')
		except sqlite3.OperationalError:
			pass
			
		conn.execute('''CREATE VIRTUAL TABLE IF NOT EXISTS doc_chunks USING fts5(
			chat_id UNINDEXED,
			chunk_text,
			images UNINDEXED
		)''')
		conn.commit()
	except Exception as e:
		print("Fehler bei der Initialisierung der SQLite-Datenbank:", e)
	finally:
		if conn:
			conn.close()

def save_doc_chunk(username, chat_id, text, images=None):
	conn = None
	try:
		conn = sqlite3.connect(get_db_path(username), timeout=10)
		images_json = json.dumps(images) if images else None
		conn.execute('INSERT INTO doc_chunks (chat_id, chunk_text, images) VALUES (?, ?, ?)', (chat_id, text, images_json))
		conn.commit()
	except Exception as e:
		print("Fehler beim Speichern des Dokumenten-Chunks:", e)
	finally:
		if conn:
			conn.close()

def search_doc_chunks(username, chat_id, query, limit=8):
	conn = None
	try:
		conn = sqlite3.connect(get_db_path(username), timeout=10)
		conn.row_factory = sqlite3.Row
		
		clean_query = "".join(c if c.isalnum() or c.isspace() else " " for c in query).strip()
		# Herausfiltern von kurzen Wörtern und Stopwords, damit SQLite wirklich sinnvolle Chunks findet
		words = [w for w in clean_query.split() if w.lower() not in STOPWORDS and len(w) > 2]
		
		if not words:
			return []
		
		fts_query = " OR ".join(words)
		
		res = conn.execute(
			'SELECT chunk_text, images FROM doc_chunks WHERE chat_id = ? AND doc_chunks MATCH ? ORDER BY rank LIMIT ?',
			(chat_id, fts_query, limit)
		).fetchall()
		
		chunks = []
		for r in res:
			chunks.append({
				"text": r["chunk_text"],
				"images": json.loads(r["images"]) if r["images"] else []
			})
		return chunks
	except Exception as e:
		print("Fehler bei der Dokumentensuche:", e)
		return []
	finally:
		if conn:
			conn.close()

def get_chat_history(username, chat_id):
	conn = None
	try:
		conn = sqlite3.connect(get_db_path(username), timeout=10)
		conn.row_factory = sqlite3.Row
		msgs = conn.execute('SELECT role, content, images, usage, audio FROM messages WHERE chat_id = ? ORDER BY id ASC', (chat_id,)).fetchall()
		messages = []
		for m in msgs:
			msg = {"role": m["role"], "content": m["content"]}
			if m["images"]:
				msg["images"] = json.loads(m["images"])
			if m["usage"]:
				msg["usage"] = json.loads(m["usage"])
			if m["audio"]:
				msg["audio"] = json.loads(m["audio"])
			messages.append(msg)
		return messages
	except Exception as e:
		print(f"Fehler beim Laden der Nachrichten für Chat {chat_id}:", e)
		return []
	finally:
		if conn:
			conn.close()

def save_message_to_db(username, chat_id, role, content, images=None, usage=None, audio=None):
	settings = load_settings(username)
	if not settings.get("history_enabled", True):
		return
	conn = None
	try:
		conn = sqlite3.connect(get_db_path(username), timeout=10)
		images_json = json.dumps(images) if images else None
		usage_json = json.dumps(usage) if usage else None
		audio_json = json.dumps(audio) if audio else None
		conn.execute('INSERT INTO messages (chat_id, role, content, images, usage, audio) VALUES (?, ?, ?, ?, ?, ?)',
					 (chat_id, role, content, images_json, usage_json, audio_json))
		conn.execute('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', (chat_id,))
		conn.commit()
	except Exception as e:
		print("Fehler beim Speichern der Nachricht:", e)
	finally:
		if conn:
			conn.close()

def generate_chat_title(username, chat_id, first_message, model):
	settings = load_settings(username)
	if not settings.get("history_enabled", True) or not model or model == "KI":
		return
	time.sleep(2)
	prompt = f"Fasse die folgende Nachricht in einem sehr kurzen Titel (maximal 3-4 Wörter) zusammen. Antworte NUR mit dem Titel, ohne Anführungszeichen, Erklärungen oder Satzzeichen am Ende:\n\n{first_message}"
	try:
		title = "Neuer Chat"
		if settings.get("ai_provider") == "gemini" and settings.get("gemini_api_key"):
			url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings['gemini_api_key']}"
			payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
			r = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
			r.raise_for_status()
			j = r.json()
			title = j.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
		elif settings.get("ai_provider") == "openrouter" and settings.get("openrouter_api_key"):
			url = "https://openrouter.ai/api/v1/chat/completions"
			headers = {"Authorization": f"Bearer {settings['openrouter_api_key']}", "Content-Type": "application/json"}
			payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "stream": False}
			r = requests.post(url, json=payload, headers=headers)
			r.raise_for_status()
			j = r.json()
			title = j.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
		elif settings.get("ai_provider") == "openai" and settings.get("openai_api_key"):
			url = "https://api.openai.com/v1/chat/completions"
			headers = {"Authorization": f"Bearer {settings['openai_api_key']}", "Content-Type": "application/json"}
			payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "stream": False}
			r = requests.post(url, json=payload, headers=headers)
			r.raise_for_status()
			j = r.json()
			title = j.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
		elif settings.get("ai_provider") == "mistral" and settings.get("mistral_api_key"):
			url = "https://api.mistral.ai/v1/chat/completions"
			headers = {"Authorization": f"Bearer {settings['mistral_api_key']}", "Content-Type": "application/json"}
			payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "stream": False}
			r = requests.post(url, json=payload, headers=headers)
			r.raise_for_status()
			j = r.json()
			title = j.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
		else:
			payload = {"model": model, "prompt": prompt, "stream": False}
			r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload)
			r.raise_for_status()
			title = r.json().get("response", "").strip()
		
		if title:
			conn = None
			try:
				conn = sqlite3.connect(get_db_path(username), timeout=10)
				conn.execute('UPDATE chats SET title = ? WHERE id = ?', (title, chat_id))
				conn.commit()
			finally:
				if conn:
					conn.close()
	except Exception as e:
		print("Fehler bei der Titelgenerierung:", e)