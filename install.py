import os
import sys
import traceback

# --- NOTFALL-LOGGER FÜR BLINDE ABSTÜRZE ---
# Fängt Fehler ab, die passieren, bevor die GUI überhaupt geladen wird.
try:
	class NullWriter:
		def write(self, text): pass
		def flush(self): pass
		def isatty(self): return False

	if sys.stdout is None: sys.stdout = NullWriter()
	if sys.stderr is None: sys.stderr = NullWriter()

	import shutil
	import json
	import time
	import subprocess
	import winsound
	import urllib.request
	import winreg
	import hashlib
	import threading
	import wx
except Exception as e:
	# Wenn hier was crasht, schreibe das Log auf den Desktop!
	desktop = os.path.join(os.environ.get("USERPROFILE", ""), "Desktop")
	log_path = os.path.join(desktop, "Installer_CrashLog.txt")
	with open(log_path, "w") as f:
		f.write(traceback.format_exc())
	sys.exit(1)

# --- GLOBALE VARIABLEN ---
APP_NAME = "ChatUI"
LANG = "de"

setup_data = {
	"is_update": False,
	"ai_provider": "ollama",
	"gemini_api_key": "",
	"openrouter_api_key": "",
	"openai_api_key": "",
	"elevenlabs_api_key": "",
	"tts_enabled": False,
	"tts_provider": "sapi5",
	"web_search_enabled": False,
	"searxng_url": "http://localhost:8085",
	"web_search_mode": "auto",
	"web_search_max_results": 2,
	"system_prompt": "You are a helpful assistant.",
	"setup_user": "",
	"setup_pass": ""
}

def get_text(de_text, en_text):
	return en_text if LANG == "en" else de_text

# --- PFAD-ERKENNUNG ---
def get_resource_path(relative_path):
	if hasattr(sys, '_MEIPASS'):
		return os.path.join(sys._MEIPASS, relative_path)
	return os.path.join(os.path.abspath("."), relative_path)

def get_desktop_path():
	try:
		key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders")
		desktop_path, _ = winreg.QueryValueEx(key, "Desktop")
		winreg.CloseKey(key)
		return os.path.expandvars(desktop_path)
	except Exception:
		return os.path.join(os.environ["USERPROFILE"], "Desktop")

APPDATA_DIR = os.getenv('APPDATA')
TARGET_DIR = os.path.join(APPDATA_DIR, APP_NAME)
SOURCE_DIR = get_resource_path(APP_NAME)
MUSIC_FILE = get_resource_path("music.wav")

# --- UTILS ---
def is_ollama_installed():
	try:
		subprocess.run(["ollama", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True, creationflags=0x08000000)
		return True
	except:
		default_path = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "Ollama", "ollama.exe")
		return os.path.exists(default_path)

def play_music():
	if os.path.exists(MUSIC_FILE):
		winsound.PlaySound(MUSIC_FILE, winsound.SND_FILENAME | winsound.SND_ASYNC | winsound.SND_LOOP)

def stop_music():
	winsound.PlaySound(None, winsound.SND_PURGE)

def create_shortcut(target_exe, shortcut_path):
	vbs_script = f"""
	Set ws = WScript.CreateObject("WScript.Shell")
	Set shortcut = ws.CreateShortcut("{shortcut_path}")
	shortcut.TargetPath = "{target_exe}"
	shortcut.WorkingDirectory = "{os.path.dirname(target_exe)}"
	shortcut.Save
	"""
	vbs_path = os.path.join(os.environ["TEMP"], f"create_shortcut_{time.time()}.vbs")
	with open(vbs_path, "w") as f:
		f.write(vbs_script)
	subprocess.run(["cscript", "//nologo", vbs_path], creationflags=0x08000000)
	try:
		os.remove(vbs_path)
	except:
		pass

# --- GUI KLASSEN ---

class LanguageDialog(wx.Dialog):
	def __init__(self, parent):
		super().__init__(parent, title="Language / Sprache", size=(350, 150))
		sizer = wx.BoxSizer(wx.VERTICAL)
		
		label = wx.StaticText(self, label="Bitte wähle deine Sprache:\nPlease choose your language:")
		label.SetWindowStyle(wx.ALIGN_CENTER_HORIZONTAL)
		sizer.Add(label, 0, wx.ALL | wx.EXPAND, 15)
		
		btn_sizer = wx.BoxSizer(wx.HORIZONTAL)
		btn_de = wx.Button(self, label="Deutsch")
		btn_en = wx.Button(self, label="English")
		
		btn_de.Bind(wx.EVT_BUTTON, self.on_de)
		btn_en.Bind(wx.EVT_BUTTON, self.on_en)
		
		btn_sizer.Add(btn_de, 0, wx.ALL, 10)
		btn_sizer.Add(btn_en, 0, wx.ALL, 10)
		
		sizer.Add(btn_sizer, 0, wx.CENTER)
		self.SetSizer(sizer)
		self.CenterOnScreen()

	def on_de(self, event):
		global LANG
		LANG = "de"
		self.EndModal(wx.ID_OK)

	def on_en(self, event):
		global LANG
		LANG = "en"
		self.EndModal(wx.ID_OK)

class InstallWizard(wx.Frame):
	def __init__(self):
		super().__init__(None, title=f"{APP_NAME} Setup", size=(600, 500))
		self.current_step = 0
		
		self.panel = wx.Panel(self)
		self.main_sizer = wx.BoxSizer(wx.VERTICAL)
		
		self.content_panel = wx.Panel(self.panel)
		self.content_sizer = wx.BoxSizer(wx.VERTICAL)
		self.content_panel.SetSizer(self.content_sizer)
		
		self.main_sizer.Add(self.content_panel, 1, wx.EXPAND | wx.ALL, 10)
		
		nav_sizer = wx.BoxSizer(wx.HORIZONTAL)
		self.btn_back = wx.Button(self.panel, label=get_text("Zurück", "Back"))
		self.btn_next = wx.Button(self.panel, label=get_text("Weiter", "Next"))
		self.btn_cancel = wx.Button(self.panel, label=get_text("Abbrechen", "Cancel"))
		
		self.btn_back.Bind(wx.EVT_BUTTON, self.on_back)
		self.btn_next.Bind(wx.EVT_BUTTON, self.on_next)
		self.btn_cancel.Bind(wx.EVT_BUTTON, self.on_cancel)
		
		nav_sizer.Add(self.btn_cancel, 0, wx.ALL, 5)
		nav_sizer.AddStretchSpacer()
		nav_sizer.Add(self.btn_back, 0, wx.ALL, 5)
		nav_sizer.Add(self.btn_next, 0, wx.ALL, 5)
		
		self.main_sizer.Add(nav_sizer, 0, wx.EXPAND | wx.ALL, 10)
		self.panel.SetSizer(self.main_sizer)
		
		self.pages = [
			self.build_page_welcome,
			self.build_page_provider,
			self.build_page_tts,
			self.build_page_websearch,
			self.build_page_user,
			self.build_page_install
		]
		
		self.CenterOnScreen()
		self.load_page()

	def clear_content(self):
		self.content_sizer.Clear(True)
		
	def load_page(self):
		self.clear_content()
		self.btn_back.Enable(self.current_step > 0 and self.current_step < len(self.pages) - 1)
		
		if self.current_step == len(self.pages) - 1:
			self.btn_next.SetLabel(get_text("Beenden", "Finish"))
		else:
			self.btn_next.SetLabel(get_text("Weiter", "Next"))
			
		self.pages[self.current_step]()
		self.content_panel.Layout()
		self.panel.Layout()

	def on_next(self, event):
		if self.current_step < len(self.pages) - 1:
			current_method = self.pages[self.current_step].__name__
			
			if current_method == "build_page_welcome":
				setup_data["is_update"] = self.radio_update.GetSelection() == 0 if hasattr(self, 'radio_update') else False
				
				if setup_data["is_update"]:
					self.pages = [self.build_page_welcome, self.build_page_install]
				else:
					self.pages = [
						self.build_page_welcome,
						self.build_page_provider,
						self.build_page_tts,
						self.build_page_websearch,
						self.build_page_user,
						self.build_page_install
					]
			
			elif current_method == "build_page_provider":
				setup_data["ai_provider"] = ["ollama", "gemini", "openrouter", "openai"][self.combo_provider.GetSelection()]
				setup_data["gemini_api_key"] = self.txt_gemini.GetValue()
				setup_data["openrouter_api_key"] = self.txt_openrouter.GetValue()
				setup_data["openai_api_key"] = self.txt_openai.GetValue()
				setup_data["elevenlabs_api_key"] = self.txt_elevenlabs.GetValue()
				
			elif current_method == "build_page_tts":
				setup_data["tts_enabled"] = self.chk_tts.GetValue()
				setup_data["tts_provider"] = ["sapi5", "pyttsx3", "piper", "elevenlabs", "edge", "gtts", "espeak"][self.combo_tts.GetSelection()]
				
			elif current_method == "build_page_websearch":
				setup_data["web_search_enabled"] = self.chk_web.GetValue()
				setup_data["searxng_url"] = self.txt_searxng.GetValue()
				setup_data["web_search_mode"] = "auto" if self.combo_mode.GetSelection() == 0 else "manual"
				setup_data["web_search_max_results"] = self.spin_res.GetValue()
				
			elif current_method == "build_page_user":
				setup_data["setup_user"] = self.txt_user.GetValue()
				setup_data["setup_pass"] = self.txt_pass.GetValue()
				setup_data["system_prompt"] = self.txt_prompt.GetValue()
				
				if not setup_data["setup_user"] or not setup_data["setup_pass"]:
					wx.MessageBox(get_text("Bitte fülle Benutzername und Passwort aus.", "Please fill in username and password."), "Error", wx.ICON_ERROR)
					return
					
			self.current_step += 1
			self.load_page()
		else:
			self.Close()

	def on_back(self, event):
		if self.current_step > 0:
			self.current_step -= 1
			self.load_page()

	def on_cancel(self, event):
		stop_music()
		self.Close()

	# --- PAGE BUILDERS ---
	def build_page_welcome(self):
		title = wx.StaticText(self.content_panel, label=get_text(f"Willkommen zum {APP_NAME} Setup", f"Welcome to {APP_NAME} Setup"))
		title.SetFont(wx.Font(14, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
		self.content_sizer.Add(title, 0, wx.ALL, 10)
		
		desc = wx.StaticText(self.content_panel, label=get_text(
			"Dieses Setup führt dich durch die Konfiguration deiner lokalen KI-Umgebung.",
			"This setup will guide you through configuring your local AI environment."
		))
		self.content_sizer.Add(desc, 0, wx.ALL, 10)
		
		app_exe = os.path.join(TARGET_DIR, f"{APP_NAME}.exe")
		has_exe = os.path.exists(app_exe)
		
		if has_exe:
			self.content_sizer.Add(wx.StaticLine(self.content_panel), 0, wx.EXPAND | wx.ALL, 10)
			msg = wx.StaticText(self.content_panel, label=get_text("Eine bestehende Installation wurde gefunden.", "An existing installation was found."))
			self.content_sizer.Add(msg, 0, wx.ALL, 10)
			
			self.radio_update = wx.RadioBox(self.content_panel, label=get_text("Installationsart", "Installation Type"), 
											choices=[get_text("Update (Daten behalten)", "Update (Keep data)"), 
													 get_text("Neuinstallation (Alles löschen)", "Clean Install (Delete all)")])
			self.content_sizer.Add(self.radio_update, 0, wx.ALL | wx.EXPAND, 10)

	def build_page_provider(self):
		title = wx.StaticText(self.content_panel, label=get_text("KI-Anbieter & API-Schlüssel", "AI Provider & API Keys"))
		title.SetFont(wx.Font(12, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
		self.content_sizer.Add(title, 0, wx.ALL, 10)
		
		self.combo_provider = wx.RadioBox(self.content_panel, label=get_text("Standard-Anbieter wählen", "Choose default provider"),
										  choices=["Ollama (Lokal)", "Google Gemini (Cloud)", "OpenRouter (Cloud)", "OpenAI (Cloud)"])
		self.content_sizer.Add(self.combo_provider, 0, wx.ALL | wx.EXPAND, 10)
		
		grid = wx.FlexGridSizer(4, 2, 10, 10)
		grid.AddGrowableCol(1, 1)
		
		grid.Add(wx.StaticText(self.content_panel, label="Gemini API Key:"), 0, wx.ALIGN_CENTER_VERTICAL)
		self.txt_gemini = wx.TextCtrl(self.content_panel)
		grid.Add(self.txt_gemini, 1, wx.EXPAND)
		
		grid.Add(wx.StaticText(self.content_panel, label="OpenRouter API Key:"), 0, wx.ALIGN_CENTER_VERTICAL)
		self.txt_openrouter = wx.TextCtrl(self.content_panel)
		grid.Add(self.txt_openrouter, 1, wx.EXPAND)
		
		grid.Add(wx.StaticText(self.content_panel, label="OpenAI API Key:"), 0, wx.ALIGN_CENTER_VERTICAL)
		self.txt_openai = wx.TextCtrl(self.content_panel)
		grid.Add(self.txt_openai, 1, wx.EXPAND)
		
		grid.Add(wx.StaticText(self.content_panel, label="ElevenLabs API Key (für Musik):"), 0, wx.ALIGN_CENTER_VERTICAL)
		self.txt_elevenlabs = wx.TextCtrl(self.content_panel)
		grid.Add(self.txt_elevenlabs, 1, wx.EXPAND)
		
		self.content_sizer.Add(grid, 0, wx.ALL | wx.EXPAND, 10)
		
		if not is_ollama_installed():
			btn_ollama = wx.Button(self.content_panel, label=get_text("Hinweis zu Ollama anzeigen", "Show Ollama note"))
			btn_ollama.Bind(wx.EVT_BUTTON, self.on_download_ollama)
			self.content_sizer.Add(btn_ollama, 0, wx.ALL | wx.CENTER, 10)

	def on_download_ollama(self, event):
		wx.MessageBox(get_text("Ollama ist noch nicht installiert.\nBitte lade es dir später manuell von 'ollama.com' herunter.", 
							   "Ollama is not installed yet.\nPlease download it manually later from 'ollama.com'."), 
					  "Info", wx.OK | wx.ICON_INFORMATION)

	def build_page_tts(self):
		title = wx.StaticText(self.content_panel, label=get_text("Sprachausgabe (TTS)", "Text-to-Speech (TTS)"))
		title.SetFont(wx.Font(12, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
		self.content_sizer.Add(title, 0, wx.ALL, 10)
		
		self.chk_tts = wx.CheckBox(self.content_panel, label=get_text("Sprachausgabe (TTS) im ChatUI aktivieren", "Enable Text-to-Speech in ChatUI"))
		self.content_sizer.Add(self.chk_tts, 0, wx.ALL, 10)
		
		choices = ["SAPI5 (Windows)", "pyttsx3", "Piper", "ElevenLabs", "Edge TTS", "Google TTS", "eSpeak NG"]
		self.combo_tts = wx.RadioBox(self.content_panel, label="TTS Provider", choices=choices)
		self.content_sizer.Add(self.combo_tts, 0, wx.ALL | wx.EXPAND, 10)

	def build_page_websearch(self):
		title = wx.StaticText(self.content_panel, label=get_text("Websuche Setup", "Web Search Setup"))
		title.SetFont(wx.Font(12, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
		self.content_sizer.Add(title, 0, wx.ALL, 10)
		
		self.chk_web = wx.CheckBox(self.content_panel, label=get_text("Websuche erlauben", "Allow web search"))
		self.content_sizer.Add(self.chk_web, 0, wx.ALL, 10)
		
		grid = wx.FlexGridSizer(3, 2, 10, 10)
		grid.AddGrowableCol(1, 1)
		
		grid.Add(wx.StaticText(self.content_panel, label="SearXNG URL:"), 0, wx.ALIGN_CENTER_VERTICAL)
		self.txt_searxng = wx.TextCtrl(self.content_panel, value="http://localhost:8085")
		grid.Add(self.txt_searxng, 1, wx.EXPAND)
		
		grid.Add(wx.StaticText(self.content_panel, label=get_text("Modus:", "Mode:")), 0, wx.ALIGN_CENTER_VERTICAL)
		self.combo_mode = wx.ComboBox(self.content_panel, choices=["Auto", "Manual"], style=wx.CB_READONLY)
		self.combo_mode.SetSelection(0)
		grid.Add(self.combo_mode, 1, wx.EXPAND)
		
		grid.Add(wx.StaticText(self.content_panel, label=get_text("Max. Ergebnisse:", "Max Results:")), 0, wx.ALIGN_CENTER_VERTICAL)
		self.spin_res = wx.SpinCtrl(self.content_panel, value="2", min=1, max=5)
		grid.Add(self.spin_res, 1, wx.EXPAND)
		
		self.content_sizer.Add(grid, 0, wx.ALL | wx.EXPAND, 10)

	def build_page_user(self):
		title = wx.StaticText(self.content_panel, label=get_text("Benutzer & System Prompt", "User & System Prompt"))
		title.SetFont(wx.Font(12, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
		self.content_sizer.Add(title, 0, wx.ALL, 10)
		
		grid = wx.FlexGridSizer(2, 2, 10, 10)
		grid.AddGrowableCol(1, 1)
		
		grid.Add(wx.StaticText(self.content_panel, label=get_text("Benutzername:", "Username:")), 0, wx.ALIGN_CENTER_VERTICAL)
		self.txt_user = wx.TextCtrl(self.content_panel)
		grid.Add(self.txt_user, 1, wx.EXPAND)
		
		grid.Add(wx.StaticText(self.content_panel, label=get_text("Passwort:", "Password:")), 0, wx.ALIGN_CENTER_VERTICAL)
		self.txt_pass = wx.TextCtrl(self.content_panel, style=wx.TE_PASSWORD)
		grid.Add(self.txt_pass, 1, wx.EXPAND)
		
		self.content_sizer.Add(grid, 0, wx.ALL | wx.EXPAND, 10)
		
		self.content_sizer.Add(wx.StaticText(self.content_panel, label="System Prompt:"), 0, wx.ALL, 5)
		self.txt_prompt = wx.TextCtrl(self.content_panel, style=wx.TE_MULTILINE, value=setup_data["system_prompt"])
		self.content_sizer.Add(self.txt_prompt, 1, wx.EXPAND | wx.ALL, 5)

	def build_page_install(self):
		title = wx.StaticText(self.content_panel, label=get_text("Installation läuft...", "Installation running..."))
		title.SetFont(wx.Font(12, wx.FONTFAMILY_DEFAULT, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
		self.content_sizer.Add(title, 0, wx.ALL, 10)
		
		self.log_ctrl = wx.TextCtrl(self.content_panel, style=wx.TE_MULTILINE | wx.TE_READONLY)
		self.content_sizer.Add(self.log_ctrl, 1, wx.EXPAND | wx.ALL, 10)
		
		self.btn_back.Disable()
		self.btn_next.Disable()
		self.btn_cancel.Disable()
		
		threading.Thread(target=self.run_installation_logic, daemon=True).start()

	def log(self, text):
		wx.CallAfter(self.log_ctrl.AppendText, text + "\n")

	def run_installation_logic(self):
		self.log(get_text("Starte Installation...", "Starting installation..."))
		
		if not os.path.exists(SOURCE_DIR):
			self.log("[!] " + get_text("Fehler: Gebündelter Ordner nicht gefunden.", "Error: Bundled folder not found."))
			wx.CallAfter(self.btn_next.Enable)
			return

		try:
			is_update = setup_data["is_update"]
			backup_dir = os.path.join(os.environ["TEMP"], f"ChatUI_Backup_{int(time.time())}")
			
			if is_update:
				self.log(get_text("Erstelle Backup alter Dateien...", "Creating backup of old files..."))
				os.makedirs(backup_dir, exist_ok=True)
				for item in ["settings.json", "history.db", "users_auth.json", "secret.key"]:
					src = os.path.join(TARGET_DIR, item)
					if os.path.exists(src):
						shutil.copy2(src, backup_dir)
				
				users_dir_src = os.path.join(TARGET_DIR, "users")
				if os.path.exists(users_dir_src):
					shutil.copytree(users_dir_src, os.path.join(backup_dir, "users"))
					
			if os.path.exists(TARGET_DIR):
				shutil.rmtree(TARGET_DIR)
				
			self.log(get_text("Kopiere neue Dateien...", "Copying new files..."))
			shutil.copytree(SOURCE_DIR, TARGET_DIR)
			
			if is_update:
				self.log(get_text("Stelle Backup wieder her...", "Restoring backup..."))
				for item in ["users_auth.json", "secret.key"]:
					src = os.path.join(backup_dir, item)
					if os.path.exists(src):
						shutil.copy2(src, os.path.join(TARGET_DIR, item))
				
				backup_users_dir = os.path.join(backup_dir, "users")
				if os.path.exists(backup_users_dir):
					shutil.copytree(backup_users_dir, os.path.join(TARGET_DIR, "users"), dirs_exist_ok=True)
					
			else:
				self.log(get_text("Schreibe neue Konfiguration...", "Writing new configuration..."))
				user_dir = os.path.join(TARGET_DIR, "users", setup_data["setup_user"])
				os.makedirs(user_dir, exist_ok=True)
				
				hashed_pw = hashlib.sha256(setup_data["setup_pass"].encode('utf-8')).hexdigest()
				with open(os.path.join(TARGET_DIR, "users_auth.json"), "w", encoding="utf-8") as f:
					json.dump({setup_data["setup_user"]: hashed_pw}, f, ensure_ascii=False, indent="\t")
					
				# Die Konfiguration abspeichern
				config_to_save = {
					"ai_provider": setup_data["ai_provider"],
					"gemini_api_key": setup_data["gemini_api_key"],
					"openrouter_api_key": setup_data["openrouter_api_key"],
					"openai_api_key": setup_data["openai_api_key"],
					"elevenlabs_api_key": setup_data["elevenlabs_api_key"],
					"tts_enabled": setup_data["tts_enabled"],
					"tts_provider": setup_data["tts_provider"],
					"show_token_count": True,
					"history_enabled": True,
					"web_search_enabled": setup_data["web_search_enabled"],
					"searxng_url": setup_data["searxng_url"],
					"web_search_mode": setup_data["web_search_mode"],
					"web_search_max_results": setup_data["web_search_max_results"],
					"system_prompt": setup_data["system_prompt"]
				}
					
				with open(os.path.join(user_dir, "settings.json"), "w", encoding="utf-8") as f:
					json.dump(config_to_save, f, indent="\t")

			self.log(get_text("Erstelle Verknüpfungen...", "Creating shortcuts..."))
			target_exe = os.path.join(TARGET_DIR, f"{APP_NAME}.exe")
			desktop_shortcut = os.path.join(get_desktop_path(), f"{APP_NAME}.lnk")
			if os.path.exists(target_exe):
				create_shortcut(target_exe, desktop_shortcut)

			self.log("\n" + get_text("Installation erfolgreich abgeschlossen!", "Installation successfully completed!"))
			wx.CallAfter(self.btn_next.Enable)
			
		except Exception as e:
			self.log(f"\n[!] Fehler / Error: {e}")
			wx.CallAfter(self.btn_cancel.Enable)

if __name__ == "__main__":
	try:
		app = wx.App(False)
		
		lang_dlg = LanguageDialog(None)
		if lang_dlg.ShowModal() == wx.ID_OK:
			lang_dlg.Destroy()
			
			play_music()
			frame = InstallWizard()
			frame.Show()
			app.MainLoop()
			stop_music()
		else:
			lang_dlg.Destroy()
	except Exception as e:
		desktop = os.path.join(os.environ.get("USERPROFILE", ""), "Desktop")
		log_path = os.path.join(desktop, "Installer_CrashLog.txt")
		with open(log_path, "w") as f:
			f.write(f"wxApp failed to start:\n{traceback.format_exc()}")
		sys.exit(1)