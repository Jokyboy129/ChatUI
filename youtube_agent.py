import os
import subprocess

def search_and_download_audio(query, download_dir, ffmpeg_path, ytdlp_path):
	"""
	Searches YouTube for the query, downloads the audio track
	and converts it via ffmpeg ideally to mp3. Uses external yt-dlp.exe.
	"""
	if not os.path.exists(ytdlp_path):
		return None, "Error: yt-dlp.exe was not found in the application directory."
		
	# Befehl für yt-dlp zusammensetzen (bevorzugt mp3 für maximale Browser-Kompatibilität)
	cmd = [
		ytdlp_path,
		f"ytsearch1:{query}",
		"-x",
		"--audio-format", "mp3",
		"--audio-quality", "192",
		"-o", os.path.join(download_dir, "yt_%(id)s.%(ext)s"),
		"--no-playlist",
		# Wir zwingen yt-dlp, uns ID und Titel durch einen Trenner ||| auszugeben
		"--print", "%(id)s|||%(title)s",
		# WICHTIG: Überschreibt das standardmäßige Simulieren von --print!
		"--no-simulate"
	]
	
	if ffmpeg_path and os.path.exists(ffmpeg_path):
		cmd.extend(["--ffmpeg-location", ffmpeg_path])
		
	try:
		# Verstecke das Konsolenfenster unter Windows
		creationflags = 0x08000000 if os.name == 'nt' else 0
		result = subprocess.run(cmd, capture_output=True, text=True, creationflags=creationflags)
		
		if result.returncode == 0 and result.stdout.strip():
			# Den Output zeilenweise durchsuchen (falls yt-dlp Warnungen ausgibt)
			output_lines = result.stdout.strip().split('\n')
			for line in reversed(output_lines):
				if "|||" in line:
					vid_id, title = line.split("|||", 1)
					
					# Dynamische Dateisuche: Falls ffmpeg fehlt, bleibt es ggf. webm/m4a
					possible_exts = ['mp3', 'm4a', 'webm', 'opus', 'ogg', 'wav']
					final_filename = None
					for ext in possible_exts:
						if os.path.exists(os.path.join(download_dir, f"yt_{vid_id}.{ext}")):
							final_filename = f"yt_{vid_id}.{ext}"
							break
							
					if final_filename:
						return final_filename, title
					else:
						return None, "Video found, but the audio file could not be saved (ffmpeg blocked?)."
						
		err_msg = result.stderr.strip() if result.stderr else "Unknown error during download."
		return None, f"yt-dlp error: {err_msg}"
	except Exception as e:
		return None, f"System error executing yt-dlp: {str(e)}"