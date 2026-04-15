import urllib.parse
import requests
import re
import html
from bs4 import BeautifulSoup
import concurrent.futures
from config import OLLAMA_URL

def get_search_query(message, model, user_settings, forced=False, history=None):
	if history is None:
		history = []
		
	context_str = ""
	if history:
		recent_msgs = [m for m in history if m["role"] != "system"][-4:]
		for m in recent_msgs:
			role_name = "Benutzer" if m["role"] == "user" else "KI"
			context_str += f"{role_name}: {m['content']}\n"

	if forced:
		prompt = f"Der Benutzer hat explizit eine Websuche angefordert. Extrahiere den optimalen Suchbegriff für eine Suchmaschine. Berücksichtige dabei den bisherigen Verlauf. WICHTIG: Erstelle präzise, eindeutige Suchbegriffe! Antworte AUSSCHLIESSLICH mit dem Suchbegriff (keine Anführungszeichen, keine weiteren Worte).\n\nBisheriger Verlauf:\n{context_str}\nAktuelle Nachricht: {message}"
	else:
		prompt = f"Du bist ein Such-Agent. Entscheide, ob für die aktuelle Benutzernachricht eine aktuelle Internet-Suche nötig ist (z.B. bei Fragen nach News, Wetter, Fakten). Berücksichtige den Verlauf für den Kontext. Wenn JA, antworte AUSSCHLIESSLICH mit dem idealen Suchbegriff. WICHTIG: Erstelle präzise, eindeutige Suchbegriffe! Wenn NEIN, antworte AUSSCHLIESSLICH mit 'NEIN'.\n\nBisheriger Verlauf:\n{context_str}\nAktuelle Nachricht: {message}"
	
	try:
		response = ""
		if user_settings["ai_provider"] == "gemini" and user_settings.get("gemini_api_key"):
			url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={user_settings['gemini_api_key']}"
			payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
			r = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
			r.raise_for_status()
			j = r.json()
			response = j.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
		elif user_settings["ai_provider"] == "openrouter" and user_settings.get("openrouter_api_key"):
			url = "https://openrouter.ai/api/v1/chat/completions"
			headers = {"Authorization": f"Bearer {user_settings['openrouter_api_key']}", "Content-Type": "application/json"}
			payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "stream": False}
			r = requests.post(url, json=payload, headers=headers)
			r.raise_for_status()
			j = r.json()
			response = j.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
		elif user_settings["ai_provider"] == "openai" and user_settings.get("openai_api_key"):
			url = "https://api.openai.com/v1/chat/completions"
			headers = {"Authorization": f"Bearer {user_settings['openai_api_key']}", "Content-Type": "application/json"}
			payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "stream": False}
			r = requests.post(url, json=payload, headers=headers)
			r.raise_for_status()
			j = r.json()
			response = j.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
		else:
			payload = {"model": model, "prompt": prompt, "stream": False}
			r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload)
			r.raise_for_status()
			response = r.json().get("response", "").strip()
		
		response = response.strip('"\'* \n')
		
		if not forced and (response.upper().startswith("NEIN") or len(response) > 50 or (" " in response and len(response.split()) > 10)):
			return None
		if forced and len(response) > 100:
			return message
		return response
	except:
		return message if forced else None

def scrape_url(url, timeout=5):
	try:
		headers = {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			"Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7"
		}
		res = requests.get(url, headers=headers, timeout=timeout)
		res.raise_for_status()
		
		soup = BeautifulSoup(res.text, 'html.parser')
		for element in soup(["script", "style", "nav", "footer", "header", "aside", "form", "noscript", "iframe"]):
			element.decompose()
			
		content = []
		for tag in soup.find_all(['p', 'h1', 'h2', 'h3', 'li']):
			text = tag.get_text(separator=' ', strip=True)
			if text and len(text) > 30:
				content.append(text)
				
		clean_text = " ".join(content)
		clean_text = re.sub(r'\s+', ' ', clean_text).strip()
		
		cookie_keywords = ["cookies", "zustimmen", "datenschutz", "akzeptieren", "privatsphäre", "einverstanden", "berechtigtes interesse"]
		if len(clean_text) < 600 and any(kw in clean_text.lower() for kw in cookie_keywords):
			return None

		if len(clean_text) > 4000:
			clean_text = clean_text[:4000] + "... [Gekürzt]"
			
		if not clean_text:
			return None
			
		return clean_text
	except Exception:
		return None

def perform_web_search(query, max_results, user_settings):
	try:
		searxng_url = user_settings.get("searxng_url", "http://localhost:8085").rstrip("/")
		if not searxng_url:
			searxng_url = "http://localhost:8085"
			
		search_endpoint = f"{searxng_url}/search"
		params = {
			"q": query,
			"format": "json",
			"language": "de"
		}
		
		res = requests.get(search_endpoint, params=params, timeout=10)
		res.raise_for_status()
		data = res.json()
		
		results = data.get("results", [])[:max_results]
		
		if not results:
			return "Keine Suchergebnisse gefunden."
			
		urls_to_scrape = [r.get("url") for r in results if r.get("url")]
		scraped_data = {}
		
		with concurrent.futures.ThreadPoolExecutor(max_workers=max_results) as executor:
			future_to_url = {executor.submit(scrape_url, url): url for url in urls_to_scrape}
			for future in concurrent.futures.as_completed(future_to_url):
				url = future_to_url[future]
				try:
					content = future.result()
					if content:
						scraped_data[url] = content
				except Exception:
					pass
		
		final_output = []
		for r in results:
			url = r.get("url", "Unbekannte URL")
			title = r.get("title", "Kein Titel")
			snippet = r.get("content", "")
			
			source_block = f"--- QUELLE: {url} ---\nTitel: {title}\nSuchmaschinen-Snippet: {snippet}"
			
			if url in scraped_data:
				source_block += f"\nGelesener Webseiten-Text:\n{scraped_data[url]}"
				
			final_output.append(source_block)
			
		return "\n\n".join(final_output)
	except Exception as e:
		return f"Fehler bei der Websuche (SearXNG): {e}"