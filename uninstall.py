import os
import sys
import time
import subprocess
import winreg
import locale

# --- SPRACHERKENNUNG ---
try:
	sys_lang, _ = locale.getdefaultlocale()
	IS_GERMAN = sys_lang and sys_lang.lower().startswith('de')
except:
	IS_GERMAN = False

APP_NAME = "ChatUI"
APPDATA_DIR = os.getenv('APPDATA')
TARGET_DIR = os.path.join(APPDATA_DIR, APP_NAME)

def get_desktop_path():
	"""Liest den echten Desktop-Pfad aus der Windows-Registry aus / Reads real desktop path."""
	try:
		key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders")
		desktop_path, _ = winreg.QueryValueEx(key, "Desktop")
		winreg.CloseKey(key)
		return os.path.expandvars(desktop_path)
	except Exception:
		# Fallback
		return os.path.join(os.environ["USERPROFILE"], "Desktop")

def remove_registry():
	"""Löscht den Eintrag aus den Windows 'Apps & Features' Einstellungen / Removes uninstall registry entry."""
	key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\ChatUI"
	try:
		winreg.DeleteKey(winreg.HKEY_CURRENT_USER, key_path)
	except Exception:
		pass

def remove_shortcuts():
	"""Löscht die Desktop- und Startmenü-Verknüpfungen / Deletes shortcuts."""
	desktop_dir = get_desktop_path()
	start_menu_dir = os.path.join(os.environ["APPDATA"], "Microsoft", "Windows", "Start Menu", "Programs")
	
	desktop_shortcut = os.path.join(desktop_dir, f"{APP_NAME}.lnk")
	start_menu_shortcut = os.path.join(start_menu_dir, f"{APP_NAME}.lnk")
	
	for shortcut in [desktop_shortcut, start_menu_shortcut]:
		if os.path.exists(shortcut):
			try:
				os.remove(shortcut)
			except:
				pass

def run_uninstall():
	os.system('cls' if os.name == 'nt' else 'clear')
	print("=" * 60)
	title = f" {APP_NAME} Deinstallation" if IS_GERMAN else f" {APP_NAME} Uninstallation"
	print(title)
	print("=" * 60)
	
	q_uninstall = f"Möchtest du {APP_NAME} wirklich deinstallieren? (j/n): " if IS_GERMAN else f"Do you really want to uninstall {APP_NAME}? (y/n): "
	confirm = input(q_uninstall).strip().lower()
	if confirm not in ['j', 'y']:
		msg_abort = "Deinstallation abgebrochen." if IS_GERMAN else "Uninstallation canceled."
		print(msg_abort)
		time.sleep(2)
		sys.exit(0)
		
	q_keep = "Möchtest du die Benutzerdaten, Chatverläufe und Einstellungen behalten? (j/n): " if IS_GERMAN else "Do you want to keep user data, chat history, and settings? (y/n): "
	keep_data = input(q_keep).strip().lower()
	
	msg_reg = "\nEntferne Registry-Einträge..." if IS_GERMAN else "\nRemoving registry entries..."
	print(msg_reg)
	remove_registry()
	
	msg_short = "Entferne Verknüpfungen..." if IS_GERMAN else "Removing shortcuts..."
	print(msg_short)
	remove_shortcuts()
	
	msg_prep = "Bereite das Löschen der Dateien vor..." if IS_GERMAN else "Preparing to delete files..."
	print(msg_prep)
	
	# Da die uninstall.exe gerade läuft, kann sie sich nicht selbst löschen.
	# Wir erstellen ein temporäres .bat Skript, das kurz wartet und dann alles löscht.
	bat_path = os.path.join(os.environ["TEMP"], "chatui_uninstall.bat")
	with open(bat_path, "w", encoding="utf-8") as f:
		f.write("@echo off\n")
		f.write("ping localhost -n 3 > nul\n") # 2 Sekunden warten, bis die .exe zu ist
		
		if keep_data in ['j', 'y']:
			# Löscht alle Unterordner AUSSER dem 'users' Ordner
			f.write(f'for /d %%x in ("{TARGET_DIR}\\*") do if /i not "%%~nxx"=="users" rmdir /s /q "%%x"\n')
			# Löscht alle Dateien AUSSER den neuen und alten Konfigurationsdateien
			f.write(f'for %%x in ("{TARGET_DIR}\\*.*") do if /i not "%%~nxx"=="settings.json" if /i not "%%~nxx"=="history.db" if /i not "%%~nxx"=="users_auth.json" if /i not "%%~nxx"=="secret.key" del /q "%%x"\n')
		else:
			# Löscht den kompletten Ordner restlos
			f.write(f'rmdir /s /q "{TARGET_DIR}"\n')
			
		f.write(f'del "%~f0"\n') # Das Skript zerstört sich am Ende selbst
		
	# Batch-Skript versteckt im Hintergrund starten
	subprocess.Popen(bat_path, creationflags=0x08000000)
	
	msg_succ = "\nDeinstallation erfolgreich vorbereitet!" if IS_GERMAN else "\nUninstallation successfully prepared!"
	msg_bg = "Das Programm wird im Hintergrund in wenigen Sekunden restlos entfernt." if IS_GERMAN else "The program will be completely removed in the background in a few seconds."
	msg_close = "Dieses Fenster schließt sich nun automatisch." if IS_GERMAN else "This window will now close automatically."
	
	print(msg_succ)
	print(msg_bg)
	print(msg_close)
	time.sleep(4)
	sys.exit(0)

if __name__ == "__main__":
	try:
		run_uninstall()
	except KeyboardInterrupt:
		sys.exit(0)