import os
import sys
import shutil
import json
import time
import subprocess
import winsound
import urllib.request
import winreg
import hashlib

# --- GLOBALE VARIABLEN ---
APP_NAME = "ChatUI"
current_tts_process = None
LANG = "de"

def get_text(de_text, en_text):
	"""Gibt den Text in der gewählten Sprache zurück."""
	return en_text if LANG == "en" else de_text

# --- PFAD-ERKENNUNG (FÜR GEBUNDELTE DATEIEN IN DER .EXE) ---
def get_resource_path(relative_path):
	"""
	Gibt den absoluten Pfad zur Ressource zurück.
	Wenn als .exe gebündelt, liegen die Dateien im temporären _MEIPASS Ordner.
	"""
	if hasattr(sys, '_MEIPASS'):
		return os.path.join(sys._MEIPASS, relative_path)
	return os.path.join(os.path.abspath("."), relative_path)

def get_desktop_path():
	"""Liest den echten Desktop-Pfad aus der Windows-Registry aus (wichtig bei OneDrive)."""
	try:
		key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders")
		desktop_path, _ = winreg.QueryValueEx(key, "Desktop")
		winreg.CloseKey(key)
		return os.path.expandvars(desktop_path)
	except Exception:
		# Fallback, falls die Registry aus irgendeinem Grund blockiert ist
		return os.path.join(os.environ["USERPROFILE"], "Desktop")

APPDATA_DIR = os.getenv('APPDATA')
TARGET_DIR = os.path.join(APPDATA_DIR, APP_NAME)
SOURCE_DIR = get_resource_path(APP_NAME)
MUSIC_FILE = get_resource_path("music.wav")

# --- SPRACHAUSGABE (UNTERBRECHBAR) ---
def speak(text):
	"""Startet die Sprachausgabe im Hintergrund und wählt die passende Systemstimme."""
	global current_tts_process, LANG
	stop_tts() # Vorherigen Sprecher stoppen, falls noch aktiv
	
	safe_text = text.replace("'", "''").replace('"', '')
	voice_match = "English" if LANG == "en" else "German"
	
	script = f"""
	[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
	try {{
		$spVoice = New-Object -ComObject SAPI.SpVoice
		# Suche nach einer Stimme, die zur ausgewählten Sprache passt
		foreach ($voice in $spVoice.GetVoices()) {{
			if ($voice.GetDescription() -match '{voice_match}') {{
				$spVoice.Voice = $voice
				break
			}}
		}}
		$spVoice.Speak('{safe_text}')
	}} catch {{ }}
	"""
	# Powershell im Hintergrund starten
	current_tts_process = subprocess.Popen(["powershell", "-NoProfile", "-Command", script], creationflags=0x08000000)

def stop_tts():
	"""Bricht die aktuelle Sprachausgabe sofort ab."""
	global current_tts_process
	if current_tts_process is not None:
		try:
			if current_tts_process.poll() is None:
				current_tts_process.kill()
		except:
			pass
		current_tts_process = None

def ask(prompt_text, tts_text, valid_options=None, to_lower=False):
	"""
	Liest eine Frage vor und wartet auf Eingabe. 
	Sobald Enter gedrückt wird, stoppt die Stimme sofort.
	"""
	speak(tts_text)
	while True:
		val = input(prompt_text).strip()
		check_val = val.lower() if to_lower else val
		
		if valid_options is not None:
			if check_val in valid_options:
				stop_tts()
				return check_val
		else:
			stop_tts()
			return val

# --- OLLAMA DOWNLOAD LOGIK ---
def is_ollama_installed():
	try:
		# Versuche Ollama in der Kommandozeile aufzurufen
		subprocess.run(["ollama", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True, creationflags=0x08000000)
		return True
	except:
		# Prüfe zusätzlich den Standard-Installationspfad
		default_path = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "Ollama", "ollama.exe")
		return os.path.exists(default_path)

def download_and_install_ollama():
	try:
		print("\n" + "-"*50)
		print(get_text("Suche nach dem neuesten Ollama-Release auf GitHub...", "Searching for the latest Ollama release on GitHub..."))
		speak(get_text("Ich suche jetzt nach der aktuellsten Version von Ollama.", "I am now searching for the latest version of Ollama."))
		
		req = urllib.request.Request("https://api.github.com/repos/ollama/ollama/releases/latest")
		req.add_header('User-Agent', 'Mozilla/5.0') # GitHub API erfordert einen User-Agent
		
		with urllib.request.urlopen(req) as response:
			data = json.loads(response.read().decode())
		
		download_url = None
		for asset in data.get("assets", []):
			if asset.get("name") == "OllamaSetup.exe":
				download_url = asset.get("browser_download_url")
				break
		
		if download_url:
			print(get_text(f"Lade OllamaSetup.exe herunter...\n({download_url})", f"Downloading OllamaSetup.exe...\n({download_url})"))
			speak(get_text("Der Download wurde gestartet. Das kann je nach Internetverbindung einen Moment dauern.", "The download has started. This might take a moment depending on your internet connection."))
			
			setup_path = os.path.join(os.environ["TEMP"], "OllamaSetup.exe")
			urllib.request.urlretrieve(download_url, setup_path)
			
			print(get_text("\nDownload abgeschlossen!", "\nDownload complete!"))
			ask(
				get_text("Drücke Enter, um den Ollama-Installer zu starten... ", "Press Enter to start the Ollama installer... "),
				get_text("Download abgeschlossen. Drücke nun Enter, um die Ollama-Installation zu starten.", "Download complete. Press Enter now to start the Ollama installation.")
			)
			
			# Setup starten
			print(get_text("Starte Ollama-Setup...", "Starting Ollama setup..."))
			subprocess.run([setup_path], creationflags=0x08000000)
			
			# Blockieren, bis Nutzer fertig ist
			ask(
				get_text("Drücke Enter, sobald du die Ollama-Installation abgeschlossen hast... ", "Press Enter once you have finished the Ollama installation... "),
				get_text("Bitte führe die Installation von Ollama durch. Drücke danach hier Enter, um mit dem Setup fortzufahren.", "Please complete the Ollama installation. After that, press Enter here to continue with the setup.")
			)
		else:
			print(get_text("\n[!] Kein passendes Windows-Release (OllamaSetup.exe) in der neuesten Version gefunden.", "\n[!] No matching Windows release (OllamaSetup.exe) found in the latest version."))
			speak(get_text("Es konnte leider keine passende Windows-Version gefunden werden.", "Unfortunately, no matching Windows version could be found."))
			
	except Exception as e:
		print(get_text(f"\n[!] Fehler beim Herunterladen von Ollama: {e}", f"\n[!] Error downloading Ollama: {e}"))
		speak(get_text("Es gab leider einen Fehler beim Herunterladen von Ollama.", "There was unfortunately an error downloading Ollama."))

# --- ESPEAK NG DOWNLOAD LOGIK ---
def is_espeak_installed():
	paths = [
		r"C:\Program Files\eSpeak NG\espeak-ng.exe",
		r"C:\Program Files (x86)\eSpeak NG\espeak-ng.exe",
		r"C:\Program Files\eSpeak\command_line\espeak.exe",
		r"C:\Program Files (x86)\eSpeak\command_line\espeak.exe"
	]
	for p in paths:
		if os.path.exists(p):
			return True
	return False

def download_and_install_espeak():
	try:
		print("\n" + "-"*50)
		print(get_text("Suche nach dem neuesten eSpeak NG-Release auf GitHub...", "Searching for the latest eSpeak NG release on GitHub..."))
		speak(get_text("Ich suche jetzt nach der aktuellsten Version von eSpeak.", "I am now searching for the latest version of eSpeak."))
		
		req = urllib.request.Request("https://api.github.com/repos/espeak-ng/espeak-ng/releases/latest")
		req.add_header('User-Agent', 'Mozilla/5.0')
		
		with urllib.request.urlopen(req) as response:
			data = json.loads(response.read().decode())
		
		download_url = None
		for asset in data.get("assets", []):
			if asset.get("name", "").endswith(".msi"):
				download_url = asset.get("browser_download_url")
				break
		
		if download_url:
			print(get_text(f"Lade eSpeak NG herunter...\n({download_url})", f"Downloading eSpeak NG...\n({download_url})"))
			speak(get_text("Der Download von eSpeak wurde gestartet. Bitte warten.", "The download of eSpeak has started. Please wait."))
			
			setup_path = os.path.join(os.environ["TEMP"], "espeak-ng-setup.msi")
			urllib.request.urlretrieve(download_url, setup_path)
			
			print(get_text("\nDownload abgeschlossen!", "\nDownload complete!"))
			ask(
				get_text("Drücke Enter, um den eSpeak NG-Installer zu starten... ", "Press Enter to start the eSpeak NG installer... "),
				get_text("Download abgeschlossen. Drücke nun Enter, um die eSpeak Installation zu starten.", "Download complete. Press Enter now to start the eSpeak installation.")
			)
			
			print(get_text("Starte eSpeak NG-Setup...", "Starting eSpeak NG setup..."))
			subprocess.run(["msiexec.exe", "/i", setup_path], creationflags=0x08000000)
			
			ask(
				get_text("Drücke Enter, sobald du die eSpeak NG-Installation abgeschlossen hast... ", "Press Enter once you have finished the eSpeak NG installation... "),
				get_text("Bitte führe die Installation von eSpeak durch. Drücke danach hier Enter, um fortzufahren.", "Please complete the installation of eSpeak. After that, press Enter here to continue.")
			)
		else:
			print(get_text("\n[!] Kein passendes Windows-Release (.msi) gefunden.", "\n[!] No matching Windows release (.msi) found."))
			speak(get_text("Es konnte leider keine passende Installationsdatei für eSpeak gefunden werden.", "Unfortunately, no suitable installation file for eSpeak could be found."))
			
	except Exception as e:
		print(get_text(f"\n[!] Fehler beim Herunterladen von eSpeak NG: {e}", f"\n[!] Error downloading eSpeak NG: {e}"))
		speak(get_text("Es gab leider einen Fehler beim Herunterladen von eSpeak.", "There was unfortunately an error downloading eSpeak."))

# --- MUSIK & UTILS ---
def play_music():
	if os.path.exists(MUSIC_FILE):
		winsound.PlaySound(MUSIC_FILE, winsound.SND_FILENAME | winsound.SND_ASYNC | winsound.SND_LOOP)

def stop_music():
	winsound.PlaySound(None, winsound.SND_PURGE)

def clear_screen():
	os.system('cls' if os.name == 'nt' else 'clear')

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
	os.remove(vbs_path)

# --- SETUP ROUTINE ---
def run_setup():
	global LANG
	
	clear_screen()
	print("Bitte wähle deine Sprache / Please choose your language:")
	print("1) Deutsch")
	print("2) English")
	lang_choice = input("\nWahl / Choice (1/2): ").strip()
	
	if lang_choice == "2":
		LANG = "en"
	else:
		LANG = "de"
		
	clear_screen()
	play_music()
	
	print("=" * 60)
	print(get_text(f"                Willkommen beim Setup für {APP_NAME}", f"                Welcome to the setup for {APP_NAME}"))
	print("=" * 60)
	print(get_text("(Du kannst jederzeit tippen und Enter drücken, um das Vorlesen zu überspringen!)\n", "(You can type and press Enter at any time to skip the reading!)\n"))
	
	# Intro
	ask(
		get_text("Drücke [ENTER], um zu starten... ", "Press [ENTER] to start... "),
		get_text("Willkommen beim Setup für Chat U I. Ich werde dich nun durch die Einrichtung führen. Du kannst mich jederzeit unterbrechen, indem du deine Eingabe machst und Enter drückst. Drücke nun Enter, um zu beginnen.",
				 "Welcome to the Chat U I setup. I will now guide you through the configuration. You can interrupt me anytime by typing and pressing Enter. Press Enter now to begin.")
	)
	
	if not os.path.exists(SOURCE_DIR):
		print(get_text(f"\n[!] Fehler: Der gebündelte Ordner '{APP_NAME}' wurde nicht im Installer gefunden.", f"\n[!] Error: Bundled folder '{APP_NAME}' not found in installer."))
		ask(
			get_text("Drücke Enter zum Beenden...", "Press Enter to exit..."),
			get_text("Fehler. Der Installationsordner wurde in der Exe nicht gefunden. Setup wird abgebrochen.", "Error. The installation folder was not found in the executable. Setup will be aborted.")
		)
		stop_music()
		sys.exit(1)

	is_update = False
	
	# Überprüfung der bestehenden Dateien (Inklusive Multi-User Dateien)
	app_exe = os.path.join(TARGET_DIR, f"{APP_NAME}.exe")
	has_exe = os.path.exists(app_exe)
	has_settings = os.path.exists(os.path.join(TARGET_DIR, "settings.json"))
	has_history = os.path.exists(os.path.join(TARGET_DIR, "history.db"))
	has_users_auth = os.path.exists(os.path.join(TARGET_DIR, "users_auth.json"))
	has_users_dir = os.path.exists(os.path.join(TARGET_DIR, "users"))
	
	print("\n" + "="*60)
	if has_exe:
		print(get_text("[INFO] Eine bestehende ChatUI-Installation wurde gefunden.", "[INFO] An existing ChatUI installation was found."))
		update_choice = ask(
			get_text("Update durchführen und Daten behalten? (j/n): ", "Perform update and keep data? (y/n): "),
			get_text("Ich habe eine bereits installierte Version von Chat U I gefunden. Möchtest du nur ein Update durchführen und deine Einstellungen sowie den Chatverlauf behalten? J für Ja, N für eine komplette Neuinstallation.",
					 "I found an already installed version of Chat U I. Would you like to just perform an update and keep your settings and chat history? Y for Yes, N for a clean installation."),
			["j", "n", "y"], to_lower=True
		)
		if update_choice in ['j', 'y']:
			is_update = True
	elif has_settings or has_history or has_users_auth or has_users_dir:
		print(get_text("[INFO] Reste einer vorherigen Installation wurden gefunden.", "[INFO] Leftovers of a previous installation were found."))
		update_choice = ask(
			get_text("Alte Daten übernehmen und Setup überspringen? (j/n): ", "Keep old data and skip setup? (y/n): "),
			get_text("Ich habe Daten einer vorherigen Installation gefunden. Möchtest du diese wieder übernehmen und die neue Konfiguration überspringen? J für Ja, N für eine saubere Neuinstallation.",
					 "I found data from a previous installation. Would you like to keep this data and skip the new configuration? Y for Yes, N for a clean installation."),
			["j", "n", "y"], to_lower=True
		)
		if update_choice in ['j', 'y']:
			is_update = True

	if not is_update:
		# --- SCHRITT 1: KI-ANBIETER & APIS ---
		print("\n" + "="*60)
		print(get_text("--- Schritt 1: KI-Anbieter & API-Schlüssel ---", "--- Step 1: AI Provider & API Keys ---"))
		print(get_text("1) Ollama (Lokal, kostenlos)", "1) Ollama (Local, free)"))
		print("2) Google Gemini (Cloud)")
		print("3) OpenRouter (Cloud)")
		print("-" * 60)
		
		provider_choice = ask(
			get_text("Wähle deinen Standard-Anbieter (1/2/3): ", "Choose your default provider (1/2/3): "),
			get_text("Bitte wähle deinen bevorzugten Standard-KI-Anbieter. 1 für Ollama, 2 für Google Gemini, oder 3 für Open Router.",
					 "Please choose your preferred default AI provider. 1 for Ollama, 2 for Google Gemini, or 3 for Open Router."),
			["1", "2", "3"]
		)
		
		provider_map = {"1": "ollama", "2": "gemini", "3": "openrouter"}
		ai_provider = provider_map[provider_choice]
		
		print(get_text("\n(Du kannst API-Schlüssel eintragen, auch wenn du den Anbieter nicht als Standard gewählt hast.)", "\n(You can enter API keys even if you didn't choose the provider as default.)"))
		gemini_key = ask(
			get_text("Gemini API-Schlüssel (Enter für Überspringen): ", "Gemini API Key (Enter to skip): "),
			get_text("Bitte gib nun deinen Gemini API-Schlüssel ein. Wenn du keinen hast oder ihn später eintragen willst, drücke einfach Enter.",
					 "Please enter your Gemini API key now. If you don't have one or want to enter it later, just press Enter.")
		)
		openrouter_key = ask(
			get_text("OpenRouter API-Schlüssel (Enter für Überspringen): ", "OpenRouter API Key (Enter to skip): "),
			get_text("Bitte gib deinen Open Router API-Schlüssel ein. Auch hier kannst du mit Enter überspringen.",
					 "Please enter your Open Router API key. You can skip this by pressing Enter as well.")
		)
		elevenlabs_api_key = ask(
			get_text("ElevenLabs API-Schlüssel (Enter für Überspringen): ", "ElevenLabs API Key (Enter to skip): "),
			get_text("Bitte gib deinen ElevenLabs API-Schlüssel für Premium-Sprachausgabe ein. Wenn du keinen hast, drücke Enter.",
					 "Please enter your ElevenLabs API key for premium voice output. If you don't have one, press Enter.")
		)
		
		if not is_ollama_installed():
			print(get_text("\n[INFO] Ollama wurde auf diesem System nicht gefunden.", "\n[INFO] Ollama was not found on this system."))
			dl_choice = ask(
				get_text("Ollama jetzt automatisch herunterladen und installieren? (j/n): ", "Download and install Ollama automatically now? (y/n): "),
				get_text("Ollama scheint auf deinem System nicht installiert zu sein. Möchtest du, dass ich die neueste Version jetzt automatisch herunterlade und das Setup starte? J für Ja, N für Nein.",
						 "Ollama does not seem to be installed on your system. Would you like me to automatically download the latest version now and start the setup? Y for Yes, N for No."),
				["j", "n", "y"], to_lower=True
			)
			if dl_choice in ['j', 'y']:
				download_and_install_ollama()
		else:
			print(get_text("\n[INFO] Ollama ist bereits auf deinem System installiert.", "\n[INFO] Ollama is already installed on your system."))
			
		# --- SCHRITT 2: SPRACHAUSGABE (TTS) ---
		print("\n" + "="*60)
		print(get_text("--- Schritt 2: Sprachausgabe (Vorlesen) ---", "--- Step 2: Voice Output (TTS) ---"))
		tts_choice = ask(
			get_text("Sprachausgabe aktivieren? (j/n): ", "Enable voice output? (y/n): "),
			get_text("Möchtest du das automatische Vorlesen von Nachrichten standardmäßig aktivieren? J für Ja, N für Nein.",
					 "Would you like to enable automatic reading of messages by default? Y for Yes, N for No."),
			["j", "n", "y"], to_lower=True
		)
		tts_enabled = tts_choice in ['j', 'y']
		
		tts_provider = "sapi5"
		
		if tts_enabled:
			print(get_text("\nWelcher TTS-Anbieter soll genutzt werden?", "\nWhich TTS provider should be used?"))
			print(get_text("1) SAPI5 (Windows Systemstimmen - schnell & offline)", "1) SAPI5 (Windows system voices - fast & offline)"))
			print(get_text("2) pyttsx3 (Lokal & Offline)", "2) pyttsx3 (Local & offline)"))
			print(get_text("3) Piper (Hochwertige Offline-Stimmen)", "3) Piper (High-quality offline voices)"))
			print(get_text("4) ElevenLabs (Premium Cloud-Stimmen)", "4) ElevenLabs (Premium cloud voices)"))
			print(get_text("5) Edge TTS (Kostenlose Microsoft Cloud-Stimmen)", "5) Edge TTS (Free Microsoft cloud voices)"))
			print(get_text("6) Google TTS (gTTS - Kostenlos & schnell)", "6) Google TTS (gTTS - Free & fast)"))
			print(get_text("7) eSpeak NG (Retro & Maschinell)", "7) eSpeak NG (Retro & Robotic)"))
			print("-" * 60)
			
			tts_prov_choice = ask(
				get_text("Deine Wahl (1/2/3/4/5/6/7): ", "Your choice (1/2/3/4/5/6/7): "),
				get_text("Welcher Anbieter soll für die Sprachausgabe genutzt werden? 1 für Windows Systemstimmen. 2 für Piper. 3 für ElevenLabs. 4 für Edge T T S. 5 für Google T T S. Oder 6 für eSpeak N G.",
						 "Which provider should be used for voice output? 1 for Windows system voices. 2 for pyttsx3. 3 for Piper. 4 for ElevenLabs. 5 for Edge T T S. 6 for Google T T S. Or 7 for eSpeak N G."),
				["1", "2", "3", "4", "5", "6", "7"]
			)
				
			if tts_prov_choice == "1":
				tts_provider = "sapi5"
			elif tts_prov_choice == "2":
				tts_provider = "pyttsx3"
			elif tts_prov_choice == "3":
				tts_provider = "piper"
				print(get_text("\n[WICHTIG] Bitte lade später in den ChatUI Einstellungen eine Stimme herunter!", "\n[IMPORTANT] Please download a voice later in the ChatUI settings!"))
				ask(
					get_text("Drücke Enter zum Bestätigen... ", "Press Enter to confirm... "),
					get_text("Wichtig: Bitte vergiss nicht, später in den Einstellungen eine Stimme herunterzuladen, da das Programm sonst stumm bleibt. Drücke Enter zum Bestätigen.",
							 "Important: Please do not forget to download a voice later in the settings, otherwise the program will remain silent. Press Enter to confirm.")
				)
			elif tts_prov_choice == "4":
				tts_provider = "elevenlabs"
			elif tts_prov_choice == "5":
				tts_provider = "edge"
			elif tts_prov_choice == "6":
				tts_provider = "gtts"
			elif tts_prov_choice == "7":
				tts_provider = "espeak"
				
				if not is_espeak_installed():
					print(get_text("\n[INFO] eSpeak NG wurde auf diesem System nicht gefunden.", "\n[INFO] eSpeak NG was not found on this system."))
					dl_choice = ask(
						get_text("eSpeak NG jetzt automatisch herunterladen und installieren? (j/n): ", "Download and install eSpeak NG automatically now? (y/n): "),
						get_text("eSpeak scheint nicht installiert zu sein. Möchtest du, dass ich die neueste Version jetzt herunterlade und installiere? J für Ja, N für Nein.",
								 "eSpeak does not seem to be installed. Would you like me to automatically download and install the latest version now? Y for Yes, N for No."),
						["j", "n", "y"], to_lower=True
					)
					if dl_choice in ['j', 'y']:
						download_and_install_espeak()
				else:
					print(get_text("\n[INFO] eSpeak NG ist bereits installiert.", "\n[INFO] eSpeak NG is already installed."))

		# --- SCHRITT 3: WEBSUCHE ---
		print("\n" + "="*60)
		print(get_text("--- Schritt 3: Websuche ---", "--- Step 3: Web Search ---"))
		web_choice = ask(
			get_text("Websuche (Internet-Zugriff) erlauben? (j/n): ", "Allow web search (internet access)? (y/n): "),
			get_text("Möchtest du der KI den Zugriff auf das Internet erlauben, um aktuelle Informationen zu finden? J für Ja, N für Nein.",
					 "Would you like to allow the AI access to the internet to find current information? Y for Yes, N for No."),
			["j", "n", "y"], to_lower=True
		)
		web_search_enabled = web_choice in ['j', 'y']
		web_search_mode = "auto"
		web_search_max_results = 2
		searxng_url = "http://localhost:8085"
		
		if web_search_enabled:
			print("\n[INFO] " + get_text("Für die Websuche wird eine SearXNG Instanz benötigt.", "A SearXNG instance is required for web search."))
			print(get_text("Eine docker-compose.yaml für SearXNG wird auf deinem Desktop erstellt...", "A docker-compose.yaml for SearXNG is being created on your Desktop..."))
			
			desktop_dir = get_desktop_path()
			searxng_dir = os.path.join(desktop_dir, "searxng")
			os.makedirs(searxng_dir, exist_ok=True)
			compose_path = os.path.join(searxng_dir, "docker-compose.yaml")
			
			compose_content = (
				"services:\n"
				"  searxng:\n"
				"    image: searxng/searxng\n"
				"    environment:\n"
				"      - INSTANCE_NAME=searxng\n"
				"      - 'BASE_URL=http://192.168.1.40:8080/'\n"
				"      - PUID=1000\n"
				"      - PGID=1000\n"
				"    volumes:\n"
				"      - ./data:/etc/searxng\n"
				"    ports:\n"
				"      - '8085:8080'\n"
				"    cap_add:\n"
				"      - CHOWN\n"
				"      - SETGID\n"
				"      - SETUID\n"
				"    user: 1000:1000\n"
			)
			with open(compose_path, "w", encoding="utf-8") as f:
				f.write(compose_content)
			
			print(get_text(f"Datei erstellt: {compose_path}", f"File created: {compose_path}"))
			
			print(get_text(
				"\n[WICHTIG] Nach dem ersten Start des Containers muss in der Datei 'data/settings.yml'\nunter 'formats' das Format 'json' hinzugefügt werden!\n",
				"\n[IMPORTANT] After the first start of the container, the format 'json' must be added\nunder 'formats' in the 'data/settings.yml' file!\n"
			))
			
			searxng_url_input = ask(
				get_text("SearXNG URL [Standard: http://localhost:8085]: ", "SearXNG URL [Default: http://localhost:8085]: "),
				get_text("Du benötigst eine SearXNG Instanz für die Websuche. Die Anleitung zum selbst hosten steht nun auf deinem Bildschirm. Bitte gib die URL deiner SearXNG Instanz ein, oder drücke Enter für den lokalen Standardwert.",
						 "You need a SearXNG instance for web search. The self-hosting instructions are now on your screen. Please enter the URL of your SearXNG instance, or press Enter for the local default.")
			)
			if searxng_url_input:
				searxng_url = searxng_url_input
			
			print(get_text("\nSuchmodus: 'auto' (KI entscheidet) oder 'manual' (Button klicken)", "\nSearch mode: 'auto' (AI decides) or 'manual' (click button)"))
			mode_choice = ask(
				get_text("Suchmodus (auto/manual) [Standard: auto]: ", "Search mode (auto/manual) [Default: auto]: "),
				get_text("Soll die KI selbst entscheiden, wann sie im Web sucht, oder möchtest du die Suche nur manuell per Knopfdruck auslösen? Tippe auto für automatisch, oder manual für manuell. Drücke Enter für auto.",
						 "Should the AI decide for itself when to search the web, or do you only want to trigger the search manually? Type auto for automatic, or manual for manual. Press Enter for auto."),
				["auto", "manual", ""], to_lower=True
			)
			if mode_choice == "manual":
				web_search_mode = "manual"
			else:
				web_search_mode = "auto"
				
			res_choice = ask(
				get_text("Maximale Suchergebnisse (1-5) [Standard: 2]: ", "Max search results (1-5) [Default: 2]: "),
				get_text("Wie viele Webseiten sollen pro Suche maximal gelesen werden? Wähle eine Zahl zwischen 1 und 5. Drücke Enter für 2.",
						 "What is the maximum number of websites that should be read per search? Choose a number between 1 and 5. Press Enter for 2."),
				["1", "2", "3", "4", "5", ""]
			)
			if res_choice:
				web_search_max_results = int(res_choice)

		# --- SCHRITT 4: SYSTEM PROMPT ---
		print("\n" + "="*60)
		print(get_text("--- Schritt 4: System Prompt ---", "--- Step 4: System Prompt ---"))
		default_prompt = "You are a helpful assistant."
		print(get_text(f"Standard: {default_prompt}", f"Default: {default_prompt}"))
		custom_prompt = ask(
			get_text("System Prompt (Enter für Standard): ", "System Prompt (Enter for default): "),
			get_text("Möchtest du einen eigenen System Prompt festlegen? Tippe ihn ein, oder drücke einfach Enter, um den Standard zu behalten.",
					 "Would you like to set a custom System Prompt? Type it in, or simply press Enter to keep the default.")
		)
		system_prompt = custom_prompt if custom_prompt else default_prompt

		# --- SCHRITT 5: BENUTZERKONTO ---
		print("\n" + "="*60)
		print(get_text("--- Schritt 5: Benutzerkonto erstellen ---", "--- Step 5: Create User Account ---"))
		setup_user = ask(
			get_text("Benutzername: ", "Username: "),
			get_text("Bitte lege nun einen Benutzernamen für dein neues Konto fest. Damit meldest du dich später in der Weboberfläche an.",
					 "Please set a username for your new account. You will use this to log into the web interface later.")
		)
		setup_pass = ask(
			get_text("Passwort: ", "Password: "),
			get_text("Bitte gib ein Passwort für dieses Konto ein.", "Please enter a password for this account.")
		)

	# --- SCHRITT 6: KOPIEREN & INSTALLATION ---
	print("\n" + "="*60)
	print(get_text("--- Schritt 6: Installation ---", "--- Step 6: Installation ---"))
	print(get_text(f"Kopiere Dateien nach {TARGET_DIR} ... Bitte warten.", f"Copying files to {TARGET_DIR} ... Please wait."))
	
	if is_update:
		speak(get_text("Das Update wird nun installiert. Bitte einen Moment Geduld.", "The update is now being installed. Please wait a moment."))
	else:
		speak(get_text("Perfekt. Die Einstellungen sind gespeichert. Die Dateien werden nun installiert. Bitte einen Moment Geduld.", "Perfect. The settings have been saved. The files are now being installed. Please wait a moment."))
	
	try:
		backup_dir = os.path.join(os.environ["TEMP"], f"ChatUI_Backup_{int(time.time())}")
		
		# Backup von alten und neuen Konfigurationsdateien erstellen
		if is_update:
			os.makedirs(backup_dir, exist_ok=True)
			
			for item in ["settings.json", "history.db", "users_auth.json", "secret.key"]:
				src = os.path.join(TARGET_DIR, item)
				if os.path.exists(src):
					shutil.copy2(src, backup_dir)
					
			# Backup Benutzer-Ordner
			users_dir_src = os.path.join(TARGET_DIR, "users")
			if os.path.exists(users_dir_src):
				shutil.copytree(users_dir_src, os.path.join(backup_dir, "users"))
				
			# Backup Piper Modelle (damit diese nicht gelöscht werden)
			piper_dir_src = os.path.join(TARGET_DIR, "piper_models")
			if os.path.exists(piper_dir_src):
				shutil.copytree(piper_dir_src, os.path.join(backup_dir, "piper_models"))
			
		if os.path.exists(TARGET_DIR):
			shutil.rmtree(TARGET_DIR)
			
		shutil.copytree(SOURCE_DIR, TARGET_DIR)
		
		# Backup Dateien wiederherstellen und ggf. alte Dateien migrieren
		if is_update:
			for item in ["users_auth.json", "secret.key"]:
				src = os.path.join(backup_dir, item)
				if os.path.exists(src):
					shutil.copy2(src, os.path.join(TARGET_DIR, item))
					
			backup_users_dir = os.path.join(backup_dir, "users")
			if os.path.exists(backup_users_dir):
				shutil.copytree(backup_users_dir, os.path.join(TARGET_DIR, "users"), dirs_exist_ok=True)
				
			# Piper Modelle wiederherstellen
			backup_piper_dir = os.path.join(backup_dir, "piper_models")
			if os.path.exists(backup_piper_dir):
				shutil.copytree(backup_piper_dir, os.path.join(TARGET_DIR, "piper_models"), dirs_exist_ok=True)
				
			# MIGRATION: Falls die alten globalen Dateien da sind, aber noch kein Multi-User-System
			backup_settings = os.path.join(backup_dir, "settings.json")
			backup_history = os.path.join(backup_dir, "history.db")
			
			if (os.path.exists(backup_settings) or os.path.exists(backup_history)) and not has_users_auth:
				print(get_text("\n[INFO] Alte Daten (vor dem Multi-User Update) gefunden.", "\n[INFO] Old data (before multi-user update) found."))
				speak(get_text("Ich habe alte Daten gefunden und migriere diese jetzt in das neue System.", "I found old data and am now migrating it to the new system."))
				mig_user = ask(
					get_text("Neuer Benutzername für deine alten Daten: ", "New username for your old data: "),
					get_text("Bitte gib einen Benutzernamen ein, dem deine bisherigen Einstellungen und Chatverläufe zugeordnet werden sollen.",
							 "Please enter a username to which your previous settings and chat histories should be assigned.")
				)
				mig_pass = ask(
					get_text("Passwort für diesen Benutzer: ", "Password for this user: "),
					get_text("Bitte vergib ein Passwort für dieses Konto.", "Please assign a password for this account.")
				)
				
				new_user_dir = os.path.join(TARGET_DIR, "users", mig_user)
				os.makedirs(new_user_dir, exist_ok=True)
				
				if os.path.exists(backup_settings):
					shutil.copy2(backup_settings, os.path.join(new_user_dir, "settings.json"))
				if os.path.exists(backup_history):
					shutil.copy2(backup_history, os.path.join(new_user_dir, "history.db"))
					
				mig_hash = hashlib.sha256(mig_pass.encode('utf-8')).hexdigest()
				with open(os.path.join(TARGET_DIR, "users_auth.json"), "w", encoding="utf-8") as f:
					json.dump({mig_user: mig_hash}, f, ensure_ascii=False, indent="\t")
				print(get_text(f"-> Daten erfolgreich zu Benutzer '{mig_user}' migriert!", f"-> Data successfully migrated to user '{mig_user}'!"))
			
	except Exception as e:
		print(get_text(f"\n[!] Fehler beim Kopieren: {e}", f"\n[!] Error during copying: {e}"))
		ask(
			get_text("Drücke Enter zum Beenden...", "Press Enter to exit..."),
			get_text("Es gab einen kritischen Fehler beim Kopieren der Dateien. Setup wird abgebrochen.", "There was a critical error copying the files. Setup will be aborted.")
		)
		stop_music()
		sys.exit(1)
		
	# --- SCHRITT 7: KONFIGURATION SCHREIBEN (NUR NEUINSTALLATION) ---
	if not is_update:
		config_data = {
			"ai_provider": ai_provider,
			"gemini_api_key": gemini_key,
			"openrouter_api_key": openrouter_key,
			"tts_enabled": tts_enabled,
			"tts_provider": tts_provider,
			"elevenlabs_api_key": elevenlabs_api_key,
			"show_token_count": True,
			"history_enabled": True,
			"web_search_enabled": web_search_enabled,
			"searxng_url": searxng_url if web_search_enabled else "http://localhost:8085",
			"web_search_mode": web_search_mode,
			"web_search_max_results": web_search_max_results,
			"system_prompt": system_prompt
		}
		
		# Benutzerverzeichnis anlegen
		user_dir = os.path.join(TARGET_DIR, "users", setup_user)
		os.makedirs(user_dir, exist_ok=True)
		
		# Passwort hashen und Authentifizierungs-Datei schreiben
		hashed_pw = hashlib.sha256(setup_pass.encode('utf-8')).hexdigest()
		with open(os.path.join(TARGET_DIR, "users_auth.json"), "w", encoding="utf-8") as f:
			json.dump({setup_user: hashed_pw}, f, ensure_ascii=False, indent="\t")
		
		# Einstellungen im neuen Benutzerverzeichnis abspeichern
		with open(os.path.join(user_dir, "settings.json"), "w", encoding="utf-8") as f:
			json.dump(config_data, f, indent="\t")
		
	# --- SCHRITT 8: VERKNÜPFUNGEN (DESKTOP & STARTMENÜ) ---
	desktop_dir = get_desktop_path()
	start_menu_dir = os.path.join(os.environ["APPDATA"], "Microsoft", "Windows", "Start Menu", "Programs")
	
	desktop_shortcut = os.path.join(desktop_dir, f"{APP_NAME}.lnk")
	start_menu_shortcut = os.path.join(start_menu_dir, f"{APP_NAME}.lnk")
	target_exe = os.path.join(TARGET_DIR, f"{APP_NAME}.exe")
	
	if os.path.exists(target_exe):
		create_shortcut(target_exe, desktop_shortcut)
		create_shortcut(target_exe, start_menu_shortcut)

	# --- SCHRITT 9: WINDOWS REGISTRY (APPS & FEATURES) ---
	print(get_text("Trage App in die Windows-Einstellungen ein...", "Registering app in Windows settings..."))
	try:
		key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\ChatUI"
		key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
		winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, APP_NAME)
		winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f'"{os.path.join(TARGET_DIR, "uninstall.exe")}"')
		winreg.SetValueEx(key, "DisplayIcon", 0, winreg.REG_SZ, f'"{target_exe}"')
		winreg.SetValueEx(key, "Publisher", 0, winreg.REG_SZ, "ChatUI")
		winreg.SetValueEx(key, "NoModify", 0, winreg.REG_DWORD, 1)
		winreg.SetValueEx(key, "NoRepair", 0, winreg.REG_DWORD, 1)
		winreg.CloseKey(key)
	except Exception as e:
		print(get_text(f"\n[!] Warnung: Konnte Registry-Eintrag nicht erstellen: {e}", f"\n[!] Warning: Could not create registry entry: {e}"))

	# --- ABSCHLUSS ---
	print("\n" + "="*60)
	if is_update:
		if has_exe:
			print(get_text(f"*** Update erfolgreich abgeschlossen! ***", f"*** Update successfully completed! ***"))
			ask(
				get_text("Drücke Enter, um das Setup zu beenden... ", "Press Enter to finish setup... "),
				get_text("Das Update ist abgeschlossen! Du kannst das Setup jetzt beenden.", "The update is complete! You can exit the setup now.")
			)
		else:
			print(get_text(f"*** Installation erfolgreich abgeschlossen! ***", f"*** Installation successfully completed! ***"))
			print(get_text(f"Du kannst {APP_NAME} nun über die Desktop-Verknüpfung oder das Startmenü starten.", f"You can now start {APP_NAME} via the desktop shortcut or start menu."))
			ask(
				get_text("Drücke Enter, um das Setup zu beenden... ", "Press Enter to finish setup... "),
				get_text("Die Installation mit deinen alten Daten ist abgeschlossen! Eine Verknüpfung liegt auf deinem Desktop. Drücke Enter, um das Setup zu beenden. Viel Spaß!",
						 "The installation with your old data is complete! A shortcut is on your desktop. Press Enter to exit the setup. Have fun!")
			)
	else:
		print(get_text(f"*** Installation erfolgreich abgeschlossen! ***", f"*** Installation successfully completed! ***"))
		print(get_text(f"Du kannst {APP_NAME} nun über die Desktop-Verknüpfung oder das Startmenü starten.", f"You can now start {APP_NAME} via the desktop shortcut or start menu."))
		ask(
			get_text("Drücke Enter, um das Setup zu beenden... ", "Press Enter to finish setup... "),
			get_text("Die Installation ist abgeschlossen! Eine Verknüpfung liegt auf deinem Desktop und im Startmenü. Drücke Enter, um das Setup zu beenden. Viel Spaß!",
					 "The installation is complete! A shortcut is on your desktop and in the start menu. Press Enter to exit the setup. Have fun!")
		)
	
	stop_music()

if __name__ == "__main__":
	try:
		run_setup()
	except KeyboardInterrupt:
		stop_tts()
		stop_music()
		print(get_text("\nSetup abgebrochen.", "\nSetup aborted."))
		sys.exit(0)
