import json
import re
import requests
import sqlite3
from config import OLLAMA_URL, get_db_path
from database import save_message_to_db

def get_chat_title(username, cid, de):
	conn = None
	try:
		conn = sqlite3.connect(get_db_path(username), timeout=10)
		row = conn.execute('SELECT title FROM chats WHERE id = ?', (cid,)).fetchone()
		return row[0] if row else ("Neuer Chat" if de else "New Chat")
	except:
		return "Neuer Chat" if de else "New Chat"
	finally:
		if conn:
			conn.close()

def generate_ollama(kwargs):
	username = kwargs['username']
	chat_id = kwargs['chat_id']
	model = kwargs['model']
	current_messages = kwargs['current_messages']
	user_settings = kwargs['user_settings']
	de = kwargs['de']
	search_query = kwargs['search_query']
	relevant_chunks = kwargs['relevant_chunks']
	audio_instruction = kwargs['audio_instruction']
	youtube_instruction = kwargs['youtube_instruction']
	email_agent_output = kwargs['email_agent_output']
	doc_writer_instruction = kwargs['doc_writer_instruction']
	process_ffmpeg = kwargs['process_ffmpeg']
	process_yt = kwargs['process_yt']
	process_doc = kwargs['process_doc']

	full_response = ""
	is_reasoning = False
	usage_dict = None
	try:
		api_messages = []
		for msg in current_messages:
			api_msg = {"role": msg["role"]}
			if "images" in msg:
				api_msg["images"] = msg["images"]
			clean_content = msg["content"]
			if '<details class="search-sources">' in clean_content:
				clean_content = re.sub(r'<details class="search-sources">.*?<summary>[^<]*</summary>\s*', '\n\n--- DOCUMENT / WEB INFO ---\n', clean_content, flags=re.DOTALL)
				clean_content = clean_content.replace('</details>', '\n--- END INFO ---\n')
			api_msg["content"] = clean_content
			api_messages.append(api_msg)

		if (user_settings.get("web_search_enabled") and search_query) or relevant_chunks or audio_instruction or youtube_instruction or email_agent_output or doc_writer_instruction:
			hidden_prompt = ""
			if search_query or relevant_chunks or email_agent_output:
				hidden_prompt += "\n\n[SYSTEM INSTRUCTION: Answer the request using the provided INFO blocks. DO NOT output or repeat the raw info blocks in your response. Respond in the same language as the user.]"
			if audio_instruction:
				hidden_prompt += audio_instruction
			if youtube_instruction:
				hidden_prompt += youtube_instruction
			if email_agent_output:
				hidden_prompt += email_agent_output
			if doc_writer_instruction:
				hidden_prompt += doc_writer_instruction
			api_messages[-1]["content"] += hidden_prompt

		payload = {"model": model, "messages": api_messages, "stream": True}
		r = requests.post(f"{OLLAMA_URL}/api/chat", json=payload, stream=True)
		r.raise_for_status()

		yield json.dumps({"chat_id": chat_id, "title": get_chat_title(username, chat_id, de)}) + "\n"

		for line in r.iter_lines():
			if line:
				try:
					j = json.loads(line)
					if "message" in j:
						msg_data = j["message"]
						res_chunk = ""
						
						reasoning_delta = msg_data.get("thinking", "") or msg_data.get("reasoning", "")
						content_delta = msg_data.get("content", "")
						
						if reasoning_delta:
							if not is_reasoning:
								is_reasoning = True
								res_chunk += "<think>\n" + reasoning_delta
							else:
								res_chunk += reasoning_delta
								
						if content_delta:
							if is_reasoning:
								is_reasoning = False
								res_chunk += "\n</think>\n" + content_delta
							else:
								res_chunk += content_delta
								
						if res_chunk:
							full_response += res_chunk
							yield json.dumps({"content": res_chunk}) + "\n"
					
					if "prompt_eval_count" in j and "eval_count" in j:
						usage_dict = {
							"prompt": j["prompt_eval_count"],
							"completion": j["eval_count"],
							"total": j["prompt_eval_count"] + j["eval_count"]
						}
						yield json.dumps({"usage": usage_dict}) + "\n"
						
				except:
					continue
		
		ffmpeg_results = process_ffmpeg(full_response, de)
		if ffmpeg_results:
			full_response += ffmpeg_results
			yield json.dumps({"content": ffmpeg_results}) + "\n"
			
		yt_results = process_yt(full_response, de)
		if yt_results:
			full_response += yt_results
			yield json.dumps({"content": yt_results}) + "\n"

		doc_results = process_doc(full_response, de)
		if doc_results:
			full_response += doc_results
			yield json.dumps({"content": doc_results}) + "\n"
		
		save_message_to_db(username, chat_id, "assistant", full_response, usage=usage_dict)
		
	except requests.exceptions.HTTPError as e:
		err_msg = str(e)
		if e.response is not None:
			err_msg += f" - Server response: {e.response.text}"
		yield json.dumps({"content": f"\n\n**API Error:** {err_msg}"}) + "\n"
	except Exception as e:
		yield json.dumps({"content": f"\n\n**System Error:** {str(e)}"}) + "\n"

def generate_gemini(kwargs):
	username = kwargs['username']
	chat_id = kwargs['chat_id']
	model = kwargs['model']
	current_messages = kwargs['current_messages']
	user_settings = kwargs['user_settings']
	de = kwargs['de']
	search_query = kwargs['search_query']
	relevant_chunks = kwargs['relevant_chunks']
	audio_instruction = kwargs['audio_instruction']
	youtube_instruction = kwargs['youtube_instruction']
	email_agent_output = kwargs['email_agent_output']
	doc_writer_instruction = kwargs['doc_writer_instruction']
	process_ffmpeg = kwargs['process_ffmpeg']
	process_yt = kwargs['process_yt']
	process_doc = kwargs['process_doc']

	full_response = ""
	usage_dict = None
	try:
		url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={user_settings.get('gemini_api_key', '')}"
		headers = {"Content-Type": "application/json"}
		
		contents = []
		for msg in current_messages:
			if msg["role"] == "system":
				continue
			role = "model" if msg["role"] == "assistant" else "user"
			
			clean_content = msg["content"]
			if '<details class="search-sources">' in clean_content:
				clean_content = re.sub(r'<details class="search-sources">.*?<summary>[^<]*</summary>\s*', '\n\n--- DOCUMENT / WEB INFO ---\n', clean_content, flags=re.DOTALL)
				clean_content = clean_content.replace('</details>', '\n--- END INFO ---\n')
				
			parts = [{"text": clean_content}]
			
			if "images" in msg:
				for b64 in msg["images"]:
					parts.append({
						"inlineData": {
							"mimeType": "image/jpeg",
							"data": b64
						}
					})
			contents.append({"role": role, "parts": parts})

		if (user_settings.get("web_search_enabled") and search_query) or relevant_chunks or audio_instruction or youtube_instruction or email_agent_output or doc_writer_instruction:
			hidden_prompt = ""
			if search_query or relevant_chunks or email_agent_output:
				hidden_prompt += "\n\n[SYSTEM INSTRUCTION: Answer the request using the provided INFO blocks. DO NOT output or repeat the raw info blocks in your response. Respond in the same language as the user.]"
			if audio_instruction:
				hidden_prompt += audio_instruction
			if youtube_instruction:
				hidden_prompt += youtube_instruction
			if email_agent_output:
				hidden_prompt += email_agent_output
			if doc_writer_instruction:
				hidden_prompt += doc_writer_instruction
			contents[-1]["parts"][0]["text"] += hidden_prompt

		payload = {
			"systemInstruction": {"parts": [{"text": user_settings.get("system_prompt", "")}]},
			"contents": contents
		}

		r = requests.post(url, headers=headers, json=payload, stream=True)
		r.raise_for_status()

		yield json.dumps({"chat_id": chat_id, "title": get_chat_title(username, chat_id, de)}) + "\n"

		for line in r.iter_lines():
			if line.startswith(b"data: "):
				data_str = line.decode('utf-8')[6:]
				if data_str.strip() == "": continue
				try:
					j = json.loads(data_str)
					if "candidates" in j and len(j["candidates"]) > 0:
						c_parts = j["candidates"][0].get("content", {}).get("parts", [])
						for p in c_parts:
							if "text" in p:
								content_delta = p["text"]
								full_response += content_delta
								yield json.dumps({"content": content_delta}) + "\n"
					
					if "usageMetadata" in j:
						um = j["usageMetadata"]
						usage_dict = {
							"prompt": um.get("promptTokenCount", 0),
							"completion": um.get("candidatesTokenCount", 0),
							"total": um.get("totalTokenCount", 0)
						}
						yield json.dumps({"usage": usage_dict}) + "\n"
						
				except Exception:
					continue
		
		ffmpeg_results = process_ffmpeg(full_response, de)
		if ffmpeg_results:
			full_response += ffmpeg_results
			yield json.dumps({"content": ffmpeg_results}) + "\n"
			
		yt_results = process_yt(full_response, de)
		if yt_results:
			full_response += yt_results
			yield json.dumps({"content": yt_results}) + "\n"

		doc_results = process_doc(full_response, de)
		if doc_results:
			full_response += doc_results
			yield json.dumps({"content": doc_results}) + "\n"
		
		save_message_to_db(username, chat_id, "assistant", full_response, usage=usage_dict)
			
	except requests.exceptions.HTTPError as e:
		err_msg = str(e)
		if e.response is not None:
			err_msg += f" - Server response: {e.response.text}"
		yield json.dumps({"content": f"\n\n**API Error:** {err_msg}"}) + "\n"
	except Exception as e:
		yield json.dumps({"content": f"\n\n**System Error:** {str(e)}"}) + "\n"

def generate_openai(kwargs):
	username = kwargs['username']
	chat_id = kwargs['chat_id']
	model = kwargs['model']
	current_messages = kwargs['current_messages']
	user_settings = kwargs['user_settings']
	de = kwargs['de']
	search_query = kwargs['search_query']
	relevant_chunks = kwargs['relevant_chunks']
	audio_instruction = kwargs['audio_instruction']
	youtube_instruction = kwargs['youtube_instruction']
	email_agent_output = kwargs['email_agent_output']
	doc_writer_instruction = kwargs['doc_writer_instruction']
	process_ffmpeg = kwargs['process_ffmpeg']
	process_yt = kwargs['process_yt']
	process_doc = kwargs['process_doc']

	full_response = ""
	usage_dict = None
	try:
		url = "https://api.openai.com/v1/chat/completions"
		headers = {
			"Authorization": f"Bearer {user_settings.get('openai_api_key', '')}",
			"Content-Type": "application/json"
		}
		
		api_messages = []
		for msg in current_messages:
			clean_content = msg["content"]
			if '<details class="search-sources">' in clean_content:
				clean_content = re.sub(r'<details class="search-sources">.*?<summary>[^<]*</summary>\s*', '\n\n--- DOCUMENT / WEB INFO ---\n', clean_content, flags=re.DOTALL)
				clean_content = clean_content.replace('</details>', '\n--- END INFO ---\n')
				
			has_media = bool(msg.get("images"))
			
			if has_media:
				content_parts = [{"type": "text", "text": clean_content}]
				if msg.get("images"):
					for b64 in msg["images"]:
						content_parts.append({
							"type": "image_url",
							"image_url": {"url": f"data:image/jpeg;base64,{b64}"}
						})
				api_messages.append({"role": msg["role"], "content": content_parts})
			else:
				api_messages.append({"role": msg["role"], "content": clean_content})

		if relevant_chunks or audio_instruction or youtube_instruction or email_agent_output or doc_writer_instruction:
			hidden_prompt = ""
			if relevant_chunks or email_agent_output:
				hidden_prompt += "\n\n[SYSTEM INSTRUCTION: Answer the request using the provided INFO blocks. DO NOT output or repeat the raw info blocks in your response. Respond in the same language as the user.]"
			if audio_instruction:
				hidden_prompt += audio_instruction
			if youtube_instruction:
				hidden_prompt += youtube_instruction
			if email_agent_output:
				hidden_prompt += email_agent_output
			if doc_writer_instruction:
				hidden_prompt += doc_writer_instruction
				
			if isinstance(api_messages[-1]["content"], list):
				api_messages[-1]["content"][0]["text"] += hidden_prompt
			else:
				api_messages[-1]["content"] += hidden_prompt

		payload = {
			"model": model,
			"messages": api_messages,
			"stream": True,
			"stream_options": {"include_usage": True}
		}
		
		r = requests.post(url, headers=headers, json=payload, stream=True)
		r.raise_for_status()

		yield json.dumps({"chat_id": chat_id, "title": get_chat_title(username, chat_id, de)}) + "\n"

		for line in r.iter_lines():
			if line.startswith(b"data: "):
				data_str = line.decode('utf-8')[6:]
				if data_str.strip() == "[DONE]":
					continue
				if data_str.strip() == "": 
					continue
				try:
					j = json.loads(data_str)
					if "choices" in j and len(j["choices"]) > 0:
						delta = j["choices"][0].get("delta", {})
						content_delta = delta.get("content", "")
						if content_delta:
							full_response += content_delta
							yield json.dumps({"content": content_delta}) + "\n"
					
					if "usage" in j and j["usage"]:
						usage_data = j["usage"]
						usage_dict = {
							"prompt": usage_data.get("prompt_tokens", 0),
							"completion": usage_data.get("completion_tokens", 0),
							"total": usage_data.get("total_tokens", 0)
						}
						yield json.dumps({"usage": usage_dict}) + "\n"
						
				except Exception:
					continue
					
		ffmpeg_results = process_ffmpeg(full_response, de)
		if ffmpeg_results:
			full_response += ffmpeg_results
			yield json.dumps({"content": ffmpeg_results}) + "\n"
			
		yt_results = process_yt(full_response, de)
		if yt_results:
			full_response += yt_results
			yield json.dumps({"content": yt_results}) + "\n"

		doc_results = process_doc(full_response, de)
		if doc_results:
			full_response += doc_results
			yield json.dumps({"content": doc_results}) + "\n"
			
		save_message_to_db(username, chat_id, "assistant", full_response, usage=usage_dict)
			
	except requests.exceptions.HTTPError as e:
		err_msg = str(e)
		if e.response is not None:
			err_msg += f" - Server response: {e.response.text}"
		yield json.dumps({"content": f"\n\n**API Error:** {err_msg}"}) + "\n"
	except Exception as e:
		yield json.dumps({"content": f"\n\n**System Error:** {str(e)}"}) + "\n"

def generate_openrouter(kwargs):
	username = kwargs['username']
	chat_id = kwargs['chat_id']
	model = kwargs['model']
	current_messages = kwargs['current_messages']
	user_settings = kwargs['user_settings']
	de = kwargs['de']
	search_query = kwargs['search_query']
	relevant_chunks = kwargs['relevant_chunks']
	audio_instruction = kwargs['audio_instruction']
	youtube_instruction = kwargs['youtube_instruction']
	email_agent_output = kwargs['email_agent_output']
	doc_writer_instruction = kwargs['doc_writer_instruction']
	process_ffmpeg = kwargs['process_ffmpeg']
	process_yt = kwargs['process_yt']
	process_doc = kwargs['process_doc']
	force_search = kwargs.get('force_search', False)

	full_response = ""
	is_reasoning = False
	usage_dict = None
	try:
		url = "https://openrouter.ai/api/v1/chat/completions"
		headers = {
			"Authorization": f"Bearer {user_settings.get('openrouter_api_key', '')}",
			"HTTP-Referer": "http://localhost:5000",
			"X-Title": "ChatUI",
			"Content-Type": "application/json"
		}
		
		api_messages = []
		for msg in current_messages:
			clean_content = msg["content"]
			if '<details class="search-sources">' in clean_content:
				clean_content = re.sub(r'<details class="search-sources">.*?<summary>[^<]*</summary>\s*', '\n\n--- DOCUMENT / WEB INFO ---\n', clean_content, flags=re.DOTALL)
				clean_content = clean_content.replace('</details>', '\n--- END INFO ---\n')
				
			has_media = bool(msg.get("images"))
			
			if has_media:
				content_parts = [{"type": "text", "text": clean_content}]
				if msg.get("images"):
					for b64 in msg["images"]:
						content_parts.append({
							"type": "image_url",
							"image_url": {"url": f"data:image/jpeg;base64,{b64}"}
						})
				api_messages.append({"role": msg["role"], "content": content_parts})
			else:
				api_messages.append({"role": msg["role"], "content": clean_content})

		if relevant_chunks or audio_instruction or youtube_instruction or email_agent_output or doc_writer_instruction:
			hidden_prompt = ""
			if relevant_chunks or email_agent_output:
				hidden_prompt += "\n\n[SYSTEM INSTRUCTION: Answer the request using the provided INFO blocks. DO NOT output or repeat the raw info blocks in your response. Respond in the same language as the user.]"
			if audio_instruction:
				hidden_prompt += audio_instruction
			if youtube_instruction:
				hidden_prompt += youtube_instruction
			if email_agent_output:
				hidden_prompt += email_agent_output
			if doc_writer_instruction:
				hidden_prompt += doc_writer_instruction
				
			if isinstance(api_messages[-1]["content"], list):
				api_messages[-1]["content"][0]["text"] += hidden_prompt
			else:
				api_messages[-1]["content"] += hidden_prompt

		payload = {
			"model": model,
			"messages": api_messages,
			"stream": True,
			"stream_options": {"include_usage": True}
		}
		
		if force_search or (user_settings.get("web_search_enabled") and user_settings.get("web_search_mode") == "auto" and not user_settings.get("openrouter_use_custom_search")):
			payload["plugins"] = [{"id": "web", "max_results": user_settings.get("web_search_max_results", 5)}]
		
		r = requests.post(url, headers=headers, json=payload, stream=True)
		r.raise_for_status()

		yield json.dumps({"chat_id": chat_id, "title": get_chat_title(username, chat_id, de)}) + "\n"

		for line in r.iter_lines():
			if line.startswith(b"data: "):
				data_str = line.decode('utf-8')[6:]
				if data_str.strip() == "[DONE]":
					continue
				if data_str.strip() == "": 
					continue
				try:
					j = json.loads(data_str)
					if "choices" in j and len(j["choices"]) > 0:
						delta = j["choices"][0].get("delta", {})
						res_chunk = ""
						
						reasoning_delta = delta.get("reasoning", "") or delta.get("reasoning_content", "") or delta.get("thinking", "")
						content_delta = delta.get("content", "")
						
						if reasoning_delta:
							if not is_reasoning:
								is_reasoning = True
								res_chunk += "<think>\n" + reasoning_delta
							else:
								res_chunk += reasoning_delta
								
						if content_delta:
							if is_reasoning:
								is_reasoning = False
								res_chunk += "\n</think>\n" + content_delta
							else:
								res_chunk += content_delta
								
						if res_chunk:
							full_response += res_chunk
							yield json.dumps({"content": res_chunk}) + "\n"
					
					if "usage" in j and j["usage"]:
						usage_data = j["usage"]
						usage_dict = {
							"prompt": usage_data.get("prompt_tokens", 0),
							"completion": usage_data.get("completion_tokens", 0),
							"total": usage_data.get("total_tokens", 0)
						}
						yield json.dumps({"usage": usage_dict}) + "\n"
						
				except Exception:
					continue
					
		ffmpeg_results = process_ffmpeg(full_response, de)
		if ffmpeg_results:
			full_response += ffmpeg_results
			yield json.dumps({"content": ffmpeg_results}) + "\n"
			
		yt_results = process_yt(full_response, de)
		if yt_results:
			full_response += yt_results
			yield json.dumps({"content": yt_results}) + "\n"

		doc_results = process_doc(full_response, de)
		if doc_results:
			full_response += doc_results
			yield json.dumps({"content": doc_results}) + "\n"
			
		save_message_to_db(username, chat_id, "assistant", full_response, usage=usage_dict)
			
	except requests.exceptions.HTTPError as e:
		err_msg = str(e)
		if e.response is not None:
			err_msg += f" - Server response: {e.response.text}"
		yield json.dumps({"content": f"\n\n**API Error:** {err_msg}"}) + "\n"
	except Exception as e:
		yield json.dumps({"content": f"\n\n**System Error:** {str(e)}"}) + "\n"