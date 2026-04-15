import smtplib
import imaplib
import email.utils
import email
from email.message import EmailMessage
from email.header import decode_header
import traceback
import time
import os
import mimetypes

def send_and_save_email(account, to_email, subject, body, attachments=None):
	try:
		smtp_server = account.get("smtp_server")
		smtp_port = account.get("smtp_port", 587)
		imap_server = account.get("imap_server")
		imap_port = account.get("imap_port", 993)
		user = account.get("smtp_user")
		password = account.get("smtp_password")
		sender = account.get("smtp_sender")

		msg = EmailMessage()
		msg.set_content(body)
		msg['Subject'] = subject
		msg['From'] = sender
		msg['To'] = to_email
		msg['Date'] = email.utils.formatdate(localtime=True)

		if attachments:
			for filepath in attachments:
				if os.path.exists(filepath):
					ctype, encoding = mimetypes.guess_type(filepath)
					if ctype is None or encoding is not None:
						ctype = 'application/octet-stream'
					maintype, subtype = ctype.split('/', 1)
					with open(filepath, 'rb') as f:
						file_data = f.read()
					msg.add_attachment(file_data, maintype=maintype, subtype=subtype, filename=os.path.basename(filepath))

		smtp_port = int(smtp_port)
		if smtp_port == 465:
			with smtplib.SMTP_SSL(smtp_server, smtp_port) as smtp:
				smtp.login(user, password)
				smtp.send_message(msg)
		else:
			with smtplib.SMTP(smtp_server, smtp_port) as smtp:
				smtp.ehlo()
				smtp.starttls()
				smtp.login(user, password)
				smtp.send_message(msg)
				
		imap_msg = ""
		if imap_server:
			try:
				imap_port = int(imap_port)
				if imap_port == 993:
					mail = imaplib.IMAP4_SSL(imap_server, imap_port)
				else:
					mail = imaplib.IMAP4(imap_server, imap_port)
					mail.starttls()
				mail.login(user, password)
				
				folders_to_try = ["Sent", '"Sent Items"', "Gesendet", "INBOX.Sent", "Gesendete Elemente"]
				appended = False
				for folder in folders_to_try:
					status, _ = mail.select(folder)
					if status == 'OK':
						mail.append(folder, '\\Seen', imaplib.Time2Internaldate(time.time()), bytes(msg))
						appended = True
						break
				
				if not appended:
					imap_msg = " (Gesendet-Ordner nicht gefunden, Kopie konnte nicht abgelegt werden.)"
					
				mail.logout()
			except Exception as imap_e:
				imap_msg = f" (Senden erfolgreich, aber IMAP-Speicherung fehlgeschlagen: {str(imap_e)})"

		return True, "E-Mail erfolgreich gesendet." + imap_msg
	except Exception as e:
		err_msg = traceback.format_exc()
		return False, f"Fehler beim Senden der E-Mail: {str(e)}"

def fetch_emails(account, limit=5, search_keyword=None):
	try:
		imap_server = account.get("imap_server")
		imap_port = int(account.get("imap_port", 993))
		user = account.get("smtp_user")
		password = account.get("smtp_password")
		
		if not imap_server or not user or not password:
			return False, "IMAP Server, Benutzer oder Passwort fehlen."
			
		if imap_port == 993:
			mail = imaplib.IMAP4_SSL(imap_server, imap_port)
		else:
			mail = imaplib.IMAP4(imap_server, imap_port)
			mail.starttls()
			
		mail.login(user, password)
		mail.select('INBOX')
		
		if search_keyword:
			safe_keyword = search_keyword.replace('"', '')
			status, messages = mail.uid('search', None, f'TEXT "{safe_keyword}"')
		else:
			status, messages = mail.uid('search', None, 'ALL')
			
		if status != 'OK':
			return False, "Konnte INBOX nicht durchsuchen."
			
		msg_nums = messages[0].split()
		latest_nums = msg_nums[-limit:]
		
		emails = []
		for num in reversed(latest_nums):
			status, data = mail.uid('fetch', num, '(RFC822)')
			if status != 'OK': continue
			
			for response_part in data:
				if isinstance(response_part, tuple):
					msg = email.message_from_bytes(response_part[1])
					
					subject_raw = msg.get('Subject')
					subject = "Kein Betreff"
					if subject_raw:
						try:
							subject_decoded = decode_header(subject_raw)[0]
							subject = subject_decoded[0]
							if isinstance(subject, bytes):
								subject = subject.decode(subject_decoded[1] if subject_decoded[1] else 'utf-8', errors='ignore')
						except:
							subject = str(subject_raw)
							
					from_raw = msg.get('From')
					sender = "Unbekannt"
					if from_raw:
						try:
							from_decoded = decode_header(from_raw)[0]
							sender = from_decoded[0]
							if isinstance(sender, bytes):
								sender = sender.decode(from_decoded[1] if from_decoded[1] else 'utf-8', errors='ignore')
						except:
							sender = str(from_raw)
							
					date = msg.get('Date', '')
					
					body = ""
					if msg.is_multipart():
						for part in msg.walk():
							content_type = part.get_content_type()
							if content_type == "text/plain":
								try:
									payload = part.get_payload(decode=True)
									if payload:
										body = payload.decode(part.get_content_charset() or 'utf-8', errors='ignore')
									break
								except:
									pass
					else:
						try:
							payload = msg.get_payload(decode=True)
							if payload:
								body = payload.decode(msg.get_content_charset() or 'utf-8', errors='ignore')
						except:
							pass
							
					emails.append({
						"uid": num.decode('utf-8'),
						"subject": subject,
						"from": sender,
						"date": date,
						"body": body[:500]
					})
		mail.logout()
		return True, emails
	except Exception as e:
		return False, str(e)

def delete_email(account, uids):
	try:
		imap_server = account.get("imap_server")
		imap_port = int(account.get("imap_port", 993))
		user = account.get("smtp_user")
		password = account.get("smtp_password")
		
		if not imap_server or not user or not password:
			return False, "IMAP Server, Benutzer oder Passwort fehlen."
			
		if imap_port == 993:
			mail = imaplib.IMAP4_SSL(imap_server, imap_port)
		else:
			mail = imaplib.IMAP4(imap_server, imap_port)
			mail.starttls()
			
		mail.login(user, password)
		mail.select('INBOX')
		
		# Robustes Filtern: Nur Ziffern zulassen
		if isinstance(uids, str):
			uids = uids.split(',')
			
		valid_uids = []
		if isinstance(uids, list):
			for u in uids:
				clean_u = str(u).strip().replace("'", "").replace('"', "")
				if clean_u.isdigit():
					valid_uids.append(clean_u)
					
		if not valid_uids:
			return False, "Keine gültigen UIDs (Zahlen) zum Löschen gefunden."
			
		uid_str = ",".join(valid_uids)
		
		status, response = mail.uid('STORE', uid_str.encode('utf-8'), '+FLAGS', '(\\Deleted)')
		if status != 'OK':
			return False, f"IMAP Store Fehler: {response}"
			
		mail.expunge()
		
		mail.logout()
		return True, f"E-Mail(s) mit UID {uid_str} erfolgreich gelöscht."
	except Exception as e:
		return False, f"Fehler beim Löschen: {str(e)}"