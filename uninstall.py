import os
import sys
import time
import subprocess
import winreg

APP_NAME = "ChatUI"
APPDATA_DIR = os.getenv('APPDATA')
TARGET_DIR = os.path.join(APPDATA_DIR, APP_NAME)

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

def remove_registry():
	"""Löscht den Eintrag aus den Windows 'Apps & Features' Einstellungen."""
	key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\ChatUI"
	try:
		winreg.DeleteKey(winreg.HKEY_CURRENT_USER, key_path)
	except Exception:
		pass

def remove_shortcuts():
	"""Löscht die Desktop- und Startmenü-Verknüpfungen."""
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
	print(f" {APP_NAME} Deinstallation")
	print("=" * 60)
	
	confirm = input(f"Möchtest du {APP_NAME} wirklich deinstallieren? (j/n): ").strip().lower()
	if confirm != 'j':
		print("Deinstallation abgebrochen.")
		time.sleep(2)
		sys.exit(0)
		
	keep_data = input("Möchtest du die Benutzerdaten, Chatverläufe und Einstellungen behalten? (j/n): ").strip().lower()
	
	print("\nEntferne Registry-Einträge...")
	remove_registry()
	
	print("Entferne Verknüpfungen...")
	remove_shortcuts()
	
	print("Bereite das Löschen der Dateien vor...")
	
	# Da die uninstall.exe gerade läuft, kann sie sich nicht selbst löschen.
	# Wir erstellen ein temporäres .bat Skript, das kurz wartet und dann alles löscht.
	bat_path = os.path.join(os.environ["TEMP"], "chatui_uninstall.bat")
	with open(bat_path, "w", encoding="utf-8") as f:
		f.write("@echo off\n")
		f.write("ping localhost -n 3 > nul\n") # 2 Sekunden warten, bis die .exe zu ist
		
		if keep_data == 'j':
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
	
	print("\nDeinstallation erfolgreich vorbereitet!")
	print("Das Programm wird im Hintergrund in wenigen Sekunden restlos entfernt.")
	print("Dieses Fenster schließt sich nun automatisch.")
	time.sleep(4)
	sys.exit(0)

if __name__ == "__main__":
	try:
		run_uninstall()
	except KeyboardInterrupt:
		sys.exit(0)