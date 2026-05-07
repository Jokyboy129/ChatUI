import os
import sys
import json
import hashlib
import secrets

if getattr(sys, 'frozen', False):
	APP_DIR = sys._MEIPASS
	DATA_DIR = os.path.dirname(sys.executable)
else:
	APP_DIR = os.path.dirname(os.path.abspath(__file__))
	DATA_DIR = APP_DIR

USERS_DIR = os.path.join(DATA_DIR, "users")
PIPER_DIR = os.path.join(DATA_DIR, "piper_models")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
USERS_AUTH_FILE = os.path.join(DATA_DIR, "users_auth.json")
ADMIN_POLICY_FILE = os.path.join(DATA_DIR, "admin_policy.json")
SECRET_KEY_FILE = os.path.join(DATA_DIR, "secret.key")

os.makedirs(USERS_DIR, exist_ok=True)
os.makedirs(PIPER_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

OLLAMA_URL = "http://localhost:11434"
PORT = 5000

DEFAULT_SETTINGS = {
	"ai_provider": "ollama",
	"gemini_api_key": "",
	"openrouter_api_key": "",
	"openai_api_key": "",
	"mistral_api_key": "",
	"openrouter_free_only": False,
	"openrouter_use_custom_search": False,
	"system_prompt": "You are a helpful assistant.",
	"language": "auto",
	"history_enabled": True,
	"history_context_limit": 10,
	"default_model_ollama": "",
	"default_model_gemini": "",
	"default_model_openrouter": "",
	"default_model_openai": "",
	"default_model_mistral": "",
	"web_search_enabled": False,
	"web_search_mode": "auto",
	"web_search_max_results": 2,
	"searxng_url": "http://localhost:8085",
	"tool_doc_gen_enabled": True,
	"tool_email_send_enabled": True,
	"tool_email_read_enabled": True,
	"tool_youtube_enabled": True,
	"tool_audio_enabled": True,
	"tts_enabled": False,
	"tts_download_enabled": False,
	"elevenlabs_music_enabled": False,
	"tts_provider": "sapi5",
	"elevenlabs_api_key": "",
	"googlecloud_api_key": "",
	"googlecloud_language": "de-DE",
	"googlecloud_voice": "de-DE-Standard-A",
	"sapi5_voice": "0",
	"pyttsx3_voice": "",
	"elevenlabs_voice": "",
	"piper_voice": "",
	"piper_speaker": "0",
	"edge_voice": "de-DE-KillianNeural",
	"espeak_voice": "de",
	"espeak_variant": "",
	"navertts_voice": "en",
	"openai_voice": "alloy",
	"openai_tts_model": "tts-1",
	"mistral_voice": "",
	"mistral_tts_model": "voxtral-mini-tts-2603",
	"email_accounts": [],
	"default_email_account": 0,
	"show_token_count": True
}

API_KEY_FIELDS = [
	"gemini_api_key",
	"openrouter_api_key",
	"openai_api_key",
	"mistral_api_key",
	"elevenlabs_api_key",
	"googlecloud_api_key"
]

LOCKABLE_AGENT_FIELDS = [
	"tool_doc_gen_enabled",
	"tool_email_send_enabled",
	"tool_email_read_enabled",
	"tool_youtube_enabled",
	"tool_audio_enabled",
	"web_search_enabled"
]

def get_secret_key():
	if os.path.exists(SECRET_KEY_FILE):
		try:
			with open(SECRET_KEY_FILE, "r", encoding="utf-8") as f:
				return f.read().strip()
		except Exception:
			pass
	new_key = secrets.token_hex(32)
	try:
		with open(SECRET_KEY_FILE, "w", encoding="utf-8") as f:
			f.write(new_key)
	except Exception as e:
		pass
	return new_key

def load_users():
	if os.path.exists(USERS_AUTH_FILE):
		try:
			with open(USERS_AUTH_FILE, "r", encoding="utf-8") as f:
				users = json.load(f)
				
			cleaned = False
			active_users = {}
			for u, pwd in users.items():
				if os.path.isdir(os.path.join(USERS_DIR, u)):
					active_users[u] = pwd
				else:
					cleaned = True
					
			if cleaned:
				save_users(active_users)
				return active_users
				
			return users
		except Exception:
			return {}
	return {}

def save_users(users):
	try:
		with open(USERS_AUTH_FILE, "w", encoding="utf-8") as f:
			json.dump(users, f, ensure_ascii=False, indent="\t")
	except Exception as e:
		pass

def get_admin_username():
	users = load_users()
	return next(iter(users), None)

def load_admin_policy():
	admin_username = get_admin_username()
	default_policy = {"admin": admin_username, "users": {}}
	if os.path.exists(ADMIN_POLICY_FILE):
		try:
			with open(ADMIN_POLICY_FILE, "r", encoding="utf-8") as f:
				policy = json.load(f)
			if not policy.get("admin"):
				policy["admin"] = admin_username
			if "users" not in policy or not isinstance(policy["users"], dict):
				policy["users"] = {}
			return policy
		except Exception:
			return default_policy
	return default_policy

def save_admin_policy(policy):
	if not policy.get("admin"):
		policy["admin"] = get_admin_username()
	if "users" not in policy or not isinstance(policy["users"], dict):
		policy["users"] = {}
	try:
		with open(ADMIN_POLICY_FILE, "w", encoding="utf-8") as f:
			json.dump(policy, f, ensure_ascii=False, indent="\t")
	except Exception:
		pass

def is_admin(username):
	return username and username == load_admin_policy().get("admin")

def get_user_policy(username):
	policy = load_admin_policy()
	return policy.get("users", {}).get(username, {})

def apply_admin_policy(username, settings):
	if is_admin(username):
		settings["is_admin"] = True
		return settings

	policy = get_user_policy(username)
	admin_name = load_admin_policy().get("admin")
	admin_settings = load_settings(admin_name) if admin_name and admin_name != username else DEFAULT_SETTINGS.copy()

	for key in policy.get("shared_api_keys", []):
		if key in API_KEY_FIELDS and admin_settings.get(key):
			settings[key] = admin_settings.get(key)
			settings[f"{key}_inherited"] = True

	locked_agents = policy.get("locked_agents", {})
	for key, value in locked_agents.items():
		if key in LOCKABLE_AGENT_FIELDS:
			settings[key] = bool(value)

	if policy.get("lock_system_prompt"):
		settings["system_prompt"] = policy.get("system_prompt", settings.get("system_prompt", ""))
		settings["system_prompt_locked"] = True

	settings["is_admin"] = False
	settings["locked_agents"] = locked_agents
	settings["shared_api_keys"] = policy.get("shared_api_keys", [])
	return settings

def public_settings_for_user(username):
	settings = apply_admin_policy(username, load_settings(username))
	if not is_admin(username):
		for key in API_KEY_FIELDS:
			if settings.get(f"{key}_inherited"):
				settings[key] = ""
				settings[f"{key}_available"] = True
	return settings

def hash_password(password):
	return hashlib.sha256(password.encode('utf-8')).hexdigest()

def get_user_dir(username):
	user_dir = os.path.join(USERS_DIR, username)
	os.makedirs(user_dir, exist_ok=True)
	return user_dir

def get_settings_file(username):
	return os.path.join(get_user_dir(username), "settings.json")

def get_db_path(username):
	return os.path.join(get_user_dir(username), "history.db")

def load_settings(username):
	settings = DEFAULT_SETTINGS.copy()
	s_file = get_settings_file(username)
	if os.path.exists(s_file):
		try:
			with open(s_file, "r", encoding="utf-8") as f:
				data = json.load(f)
				
				if "smtp_server" in data and "email_accounts" not in data:
					if data.get("smtp_server"):
						data["email_accounts"] = [{
							"name": "Standard",
							"smtp_server": data.get("smtp_server", ""),
							"smtp_port": data.get("smtp_port", 587),
							"imap_server": data.get("imap_server", ""),
							"imap_port": data.get("imap_port", 993),
							"smtp_user": data.get("smtp_user", ""),
							"smtp_password": data.get("smtp_password", ""),
							"smtp_sender": data.get("smtp_sender", "")
						}]
						data["default_email_account"] = 0
						
				for k, v in data.items():
					if k in settings:
						settings[k] = v
		except Exception as e:
			pass
	return settings

def save_settings(username, new_settings):
	settings = load_settings(username)
	for k, v in new_settings.items():
		if k in settings:
			settings[k] = v
	s_file = get_settings_file(username)
	try:
		with open(s_file, "w", encoding="utf-8") as f:
			json.dump(settings, f, ensure_ascii=False, indent="\t")
	except Exception as e:
		pass

load_users()
