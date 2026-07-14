from flask import Flask, request, jsonify, send_file, session,stream_with_context,Response,send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import requests
import os
import spacy
import pandas as pd
import matplotlib  # ✅ Import matplotlib first
matplotlib.use('Agg')  # ✅ Set backend BEFORE importing pyplot
import matplotlib.pyplot as plt
import io
import queue
import base64
try:
    import sounddevice as sd
except Exception:
    sd = None
import speech_recognition as sr
try:
    import vosk
except Exception:
    vosk = None
import uuid,math, random,textwrap
import json
import numpy as np
from datetime import datetime
from scipy.signal import find_peaks
from gtts import gTTS
from deep_translator import GoogleTranslator
from PIL import Image
import pytesseract
import torch
from bs4 import BeautifulSoup
from readability import Document
from sklearn.feature_extraction.text import TfidfVectorizer
from textblob import TextBlob
from wordcloud import WordCloud
import seaborn as sns
from fpdf import FPDF
from PIL import Image, ImageDraw, ImageFont, ImageStat, ImageFilter
import cv2
import colorsys
from collections import Counter
import nltk
from nltk.corpus import wordnet as wn
from werkzeug.utils import secure_filename
from langdetect import detect, LangDetectException
import threading
phi3_lock = threading.Lock()



# Flask setup
app = Flask(__name__)
CORS(app)
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "message": "AI Ecosystem backend is running"
    })

AUDIO_DIR = os.path.join(os.getcwd(), "static", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

nlp = spacy.load("en_core_web_sm")

# ------------------- Stable Diffusion Config -------------------
STABLE_DIFFUSION_URL = "http://127.0.0.1:7860/sdapi/v1/txt2img"
SD_OUTPUT_DIR = "generated_images"

# ✅ Define Upload Folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Tesseract Path
# Use Windows Tesseract path only on the local Windows computer.
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

# Paths
AUDIO_OUTPUT = "translated_audio.mp3"
# Load offline Vosk models only on the local Windows computer.
VOSK_MODELS = {}

if os.name == "nt" and vosk is not None:
    vosk_paths = {
        "en": r"C:\Users\mohammed yasir ahmed\MY_AI_PROJECT\backend\vosk-model-small-en-us-0.15",
        "hi": r"C:\Users\mohammed yasir ahmed\MY_AI_PROJECT\backend\vosk-model-small-hi-0.22",
        "ru": r"C:\Users\mohammed yasir ahmed\MY_AI_PROJECT\backend\vosk-model-small-ru-0.22",
    }

    for language, model_path in vosk_paths.items():
        if os.path.exists(model_path):
            VOSK_MODELS[language] = vosk.Model(model_path)
        else:
            print(f"Vosk model missing: {model_path}")

# Queues
q = queue.Queue()

# ------------------- Languages -------------------
LANGUAGES = {
    'afrikaans': 'af', 'albanian': 'sq', 'amharic': 'am', 'arabic': 'ar', 'armenian': 'hy',
    'assamese': 'as', 'aymara': 'ay', 'azerbaijani': 'az', 'bambara': 'bm', 'basque': 'eu',
    'belarusian': 'be', 'bengali': 'bn', 'bhojpuri': 'bho', 'bosnian': 'bs', 'bulgarian': 'bg',
    'catalan': 'ca', 'cebuano': 'ceb', 'chichewa': 'ny', 'chinese (simplified)': 'zh-CN',
    'chinese (traditional)': 'zh-TW', 'corsican': 'co', 'croatian': 'hr', 'czech': 'cs',
    'danish': 'da', 'dhivehi': 'dv', 'dogri': 'doi', 'dutch': 'nl', 'english': 'en',
    'esperanto': 'eo', 'estonian': 'et', 'ewe': 'ee', 'filipino': 'tl', 'finnish': 'fi',
    'french': 'fr', 'frisian': 'fy', 'galician': 'gl', 'georgian': 'ka', 'german': 'de',
    'greek': 'el', 'guarani': 'gn', 'gujarati': 'gu', 'haitian creole': 'ht', 'hausa': 'ha',
    'hawaiian': 'haw', 'hebrew': 'iw', 'hindi': 'hi', 'hmong': 'hmn', 'hungarian': 'hu',
    'icelandic': 'is', 'igbo': 'ig', 'ilocano': 'ilo', 'indonesian': 'id', 'irish': 'ga',
    'italian': 'it', 'japanese': 'ja', 'javanese': 'jw', 'kannada': 'kn', 'kazakh': 'kk',
    'khmer': 'km', 'kinyarwanda': 'rw', 'konkani': 'gom', 'korean': 'ko', 'krio': 'kri',
    'kurdish (kurmanji)': 'ku', 'kurdish (sorani)': 'ckb', 'kyrgyz': 'ky', 'lao': 'lo',
    'latin': 'la', 'latvian': 'lv', 'lingala': 'ln', 'lithuanian': 'lt', 'luganda': 'lg',
    'luxembourgish': 'lb', 'macedonian': 'mk', 'maithili': 'mai', 'malagasy': 'mg',
    'malay': 'ms', 'malayalam': 'ml', 'maltese': 'mt', 'maori': 'mi', 'marathi': 'mr',
    'meiteilon (manipuri)': 'mni-Mtei', 'mizo': 'lus', 'mongolian': 'mn', 'myanmar': 'my',
    'nepali': 'ne', 'norwegian': 'no', 'odia (oriya)': 'or', 'oromo': 'om', 'pashto': 'ps',
    'persian': 'fa', 'polish': 'pl', 'portuguese': 'pt', 'punjabi': 'pa', 'quechua': 'qu',
    'romanian': 'ro', 'russian': 'ru', 'samoan': 'sm', 'sanskrit': 'sa', 'scots gaelic': 'gd',
    'sepedi': 'nso', 'serbian': 'sr', 'sesotho': 'st', 'shona': 'sn', 'sindhi': 'sd',
    'sinhala': 'si', 'slovak': 'sk', 'slovenian': 'sl', 'somali': 'so', 'spanish': 'es',
    'sundanese': 'su', 'swahili': 'sw', 'swedish': 'sv', 'tajik': 'tg', 'tamil': 'ta',
    'tatar': 'tt', 'telugu': 'te', 'thai': 'th', 'tigrinya': 'ti', 'tsonga': 'ts',
    'turkish': 'tr', 'turkmen': 'tk', 'twi': 'ak', 'ukrainian': 'uk', 'urdu': 'ur',
    'uyghur': 'ug', 'uzbek': 'uz', 'vietnamese': 'vi', 'welsh': 'cy', 'xhosa': 'xh',
    'yiddish': 'yi', 'yoruba': 'yo', 'zulu': 'zu'
}

@app.route("/languages", methods=["GET"])
def get_languages():
    return jsonify(LANGUAGES)

def recognize_speech(language="en", audio_file=None):

    """
    Recognizes speech either from a live microphone stream (default)
    or from an uploaded audio file (if provided).
    """
    if vosk is None or not VOSK_MODELS:
        raise RuntimeError(
            "Offline voice recognition is available only in the local version."
        )

    if audio_file is None and sd is None:
        raise RuntimeError(
            "Live microphone access is not available on the cloud server."
        )
    global q
    q.queue.clear()
    model = VOSK_MODELS.get(language, VOSK_MODELS["en"])
    recognizer = vosk.KaldiRecognizer(model, 16000)


    # 🎧 CASE 1: From uploaded audio file (used in /voice_translate_dual)
    if audio_file:
        print("🎙️ Processing uploaded audio file...")
        # Save the file temporarily
        temp_path = "temp_input.wav"
        audio_file.save(temp_path)

        import wave
        wf = wave.open(temp_path, "rb")

        import time

        start_time = time.time()
        while True:
            data = q.get()
            audio_data += data

            if recognizer.AcceptWaveform(data):
                break

            # ⏱️ safety timeout (3 seconds)
            if time.time() - start_time > 3:
                break

        final_result = json.loads(recognizer.FinalResult())
        return final_result.get("text", ""), audio_data


    # 🎤 CASE 2: Live microphone mode (used in other routes)
    def callback(indata, frames, time, status):
        if status:
            print(status)
        q.put(bytes(indata))

    audio_data = b""
    with sd.RawInputStream(samplerate=16000, channels=1, dtype="int16", callback=callback):
        print("🎧 Listening (live mic)...")
        while True:
            data = q.get()
            audio_data += data
            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())
                return result.get("text", ""), audio_data


def analyze_emotion(audio_data):
    audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32)
    audio_np /= np.max(np.abs(audio_np))

    energy = np.mean(np.abs(audio_np))
    variance = np.var(audio_np)
    peaks, _ = find_peaks(audio_np, height=0.1)
    pitch = len(peaks) / (len(audio_np) / 16000)

    if energy > 0.07 and pitch > 250:
        return "Angry"
    elif energy < 0.03 and pitch < 150:
        return "Calm"
    elif variance > 0.05:
        return "Excited"
    return "Neutral"

# ------------------- Translation -------------------
def translate_text(text, target_language="hi"):
    return GoogleTranslator(source="auto", target=target_language).translate(text)

# ✅ gTTS supported languages (full mapping with fallbacks)
GTT_LANGS = {
    "en": "en", "hi": "hi", "kn": "kn", "ta": "ta", "te": "te", "ml": "ml",
    "gu": "gu", "mr": "mr", "bn": "bn", "pa": "pa", "ur": "ur", "or": "or", "ne": "ne",
    "ar": "ar", "fr": "fr", "de": "de", "es": "es", "it": "it", "ja": "ja", "ko": "ko",
    "zh-CN": "zh-CN", "ru": "ru", "pt": "pt", "tr": "tr", "fa": "fa", "pl": "pl"
}

def text_to_speech(text, lang="en"):
    cleaned = " ".join(text.strip().split())
    if not cleaned.endswith((".", "!", "?")):
        cleaned += "."

    gtts_lang = GTT_LANGS.get(lang, "en")

    # 🎧 Create a unique filename to avoid overwriting
    filename = f"translated_{uuid.uuid4().hex}.mp3"
    file_path = os.path.join(AUDIO_DIR, filename)

    # Save TTS file inside static/audio/
    tts = gTTS(text=cleaned, lang=gtts_lang, slow=False)
    tts.save(file_path)

    # Return a browser-accessible path
    return f"static/audio/{filename}"

def extract_text_from_image(image_path):
    image = Image.open(image_path)

    # MULTI-LANGUAGE OCR (uses all your installed models)
    lang_list = "eng+hin+tam+tel+kan+mal+urd+rus+jpn+spa"

    extracted_text = pytesseract.image_to_string(image, lang=lang_list)

    return extracted_text.strip()


# ------------------- Routes -------------------
@app.route("/translate/text", methods=["POST"])
def translate_text_route():
    data = request.json
    translated = translate_text(data["text"], data.get("target", "hi"))
    return jsonify({"translated": translated})

@app.route("/translate/text/speak", methods=["POST"])
def speak_translated_text():
    data = request.json
    text = data.get("text", "")
    target_lang = data.get("target", "hi")

    translated = translate_text(text, target_lang)
    audio_file = text_to_speech(translated, lang=target_lang)

    return send_file(audio_file, mimetype="audio/mpeg")


@app.route("/translate/voice", methods=["POST"])
def translate_voice_route():
    try:
        data = request.json
        source_lang = data.get("source", "en")   # 👈 ADD
        target_lang = data.get("target", "hi")

        # 👇 PASS SOURCE LANGUAGE HERE
        text, audio_data = recognize_speech(language=source_lang)

        emotion = analyze_emotion(audio_data)
        translated = translate_text(text, target_language=target_lang)

        output_text = f"[Emotion: {emotion}] {translated}"
        audio_file = text_to_speech(output_text, lang=target_lang)

        return jsonify({
            "original_text": text,
            "translated_text": translated,
            "emotion": emotion,
            "audio_url": f"/get_audio?file={audio_file}"
        })

    except Exception as e:
        print("Voice Translation Error:", e)
        return jsonify({"error": "Voice translation failed"}), 500




@app.route("/translate/image", methods=["POST"])
def translate_image_route():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = "uploaded_image.png"
    file.save(file_path)

    target_lang = request.form.get("target", "hi")
    extracted = extract_text_from_image(file_path)
    translated = translate_text(extracted, target_lang)
    audio_file = text_to_speech(translated, lang=target_lang)

    return jsonify({
        "extracted": extracted,
        "translated": translated,
        "audio_url": f"/get_audio?file={AUDIO_OUTPUT}"
    })
@app.route("/translate/image/speak", methods=["POST"])
def speak_image_translation():
    data = request.get_json()
    text = data.get("text", "")
    lang = data.get("target", "en")

    audio_file = text_to_speech(text, lang)
    return send_file(audio_file, mimetype="audio/mpeg")
@app.route("/speak", methods=["POST"])
def speak():
    data = request.get_json()
    text = data.get("text", "")
    lang = data.get("lang", "en")
    print("Received lang:", lang)
    text_to_speech(text, lang)
    return jsonify({"status": "success"})
    

@app.route("/get_audio")
def get_audio():
    file = request.args.get("file")

    # 🩵 Remove anything after '?' (like ?t=timestamp)
    if file and "?" in file:
        file = file.split("?")[0]

    # Make sure it’s an absolute path
    if not os.path.exists(file):
        file = os.path.join(os.getcwd(), file.lstrip("/"))

    return send_file(file, mimetype="audio/mpeg")

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    user_input = data.get("message", "").strip()
    mode = data.get("mode", "medium")

    question = user_input.lower()

    # -------------------------------
    # Length control ONLY
    # -------------------------------
    if mode == "short":
        num_predict = 120
        style_prompt = "Answer briefly in 1–2 sentences."
    elif mode == "detailed":
        num_predict = 520
        style_prompt = "Answer clearly and in detail."
    else:
        num_predict = 280
        style_prompt = "Give a clear and balanced answer."

    # -------------------------------
    # Structure ONLY if user asks
    # -------------------------------
    wants_list = any(w in question for w in ["list", "advantages", "applications", "benefits", "uses"])
    wants_definition = "what is" in question or "define" in question

    structure_prompt = ""
    if wants_definition and wants_list:
        structure_prompt = """
Start with a short definition (2–3 lines),
then list the requested points clearly.
Do not skip any part.
"""
    elif wants_list:
        structure_prompt = "List the requested points clearly."
    else:
        structure_prompt = "Answer naturally."

    # -------------------------------
    # Final prompt
    # -------------------------------
    full_prompt = f"""
You are a helpful AI assistant.

Rules:
- Answer naturally.
- Do not repeat or skip parts.
- Finish sentences properly.

{style_prompt}
{structure_prompt}

User question:
{user_input}

Answer:
"""

    try:
        # 🔒 LOCKED PHI-3 CALL (ONLY CHANGE)
        with phi3_lock:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "phi3",
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "num_predict": num_predict,
                        "temperature": 0.7,
                        "top_p": 0.9
                    },
                },
                timeout=90
            )

        reply = response.json().get("response", "").strip()

        if not reply:
            reply = "Sorry, I couldn’t generate a response."

        return jsonify({"reply": reply})

    except Exception as e:
        print("❌ Chatbot error:", e)
        return jsonify({"reply": "Server error occurred."})



@app.route("/voice_input_v2", methods=["POST", "OPTIONS"])
def voice_input_v2():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"})  # ✅ skip recording for preflight request

    try:
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            print("🎙 Recording started...")
            audio = recognizer.listen(source, timeout=3, phrase_time_limit=3)

        print("✅ Recording saved as input.wav")
        text = recognizer.recognize_google(audio, language="en-IN")
        print("🗣 Recognized Speech:", text)

        # Send to chatbot
        response = requests.post(
            "http://127.0.0.1:5000/chatbot",
            json={"message": text, "mode": "medium"},
        )

        bot_data = response.json()
        reply = bot_data.get("reply", "Sorry, I couldn’t process that.")

        # Convert reply to audio
        tts = gTTS(reply, lang="en")
        audio_path = "bot_reply.mp3"
        tts.save(audio_path)

        print("🗣️ AI Reply:", reply)
        return jsonify({
            "recognized_text": text,
            "bot_reply": reply,
            "audio": f"/get_audio_v2?file={audio_path}"
        })

    except Exception as e:
        print("❌ Voice input error:", e)
        return jsonify({"error": str(e)})


# 🎧 Audio serving route
@app.route("/get_audio_v2")
def get_audio_v2():
    file = request.args.get("file")
    if not file:
        return jsonify({"error": "Missing file parameter"}), 400
    if not os.path.exists(file):
        return jsonify({"error": "File not found"}), 404
    return send_file(file, mimetype="audio/mpeg")


@app.route("/realtime_translate", methods=["POST"])
def realtime_translate():
    data = request.json
    text = data.get("text", "")
    target_lang = data.get("target_lang", "en")

    # Auto-detect language
    try:
        detected = detect(text)
    except LangDetectException:
        detected = "en"

    # Translate the text
    translated_text = GoogleTranslator(source=detected, target=target_lang).translate(text)

    audio_file = text_to_speech(translated_text, lang=target_lang)

    return jsonify({
        "detected_lang": detected,
        "translated_text": translated_text,
        "audio_file": audio_file
    })

@app.route("/realtime_chat/text", methods=["POST"])
def realtime_chat_text():
    data = request.json
    message = data.get("message", "")
    to_lang = data.get("to_lang", "en")

    # Auto-detect language
    try:
        detected = detect(message)
    except LangDetectException:
        detected = "en"

    translated = GoogleTranslator(source=detected, target=to_lang).translate(message)
    audio_file = text_to_speech(translated, lang=to_lang)

    return jsonify({
        "original": message,
        "detected_lang": detected,
        "translated": translated,
        "audio_url": f"/get_audio?file={audio_file}"
    })

@app.route("/realtime_chat/voice", methods=["POST"])
def realtime_chat_voice():
    data = request.json
    to_lang = data.get("to_lang", "en")

    source_lang = data.get("source", "en")
    text, audio_data = recognize_speech(language=source_lang)

    emotion = analyze_emotion(audio_data)

    # Auto-detect spoken language
    try:
        detected = detect(text)
    except LangDetectException:
        detected = "en"

    translated = GoogleTranslator(source=detected, target=to_lang).translate(text)
    audio_file = text_to_speech(translated, lang=to_lang)

    return jsonify({
        "original": text,
        "detected_lang": detected,
        "emotion": emotion,
        "translated": translated,
        "audio_url": f"/get_audio?file={audio_file}"
    })

@app.route("/voice_input", methods=["POST"])
def voice_input():
    """
    Records user's speech, translates it to target language, and returns JSON.
    """
    # Default target language (can be changed by React later)
    target_lang = request.json.get("target_lang", "en")

    # Recognize speech
    text, audio_data = recognize_speech()

    # Analyze emotion (optional)
    emotion = analyze_emotion(audio_data)

    # Translate text
    translated = translate_text(text, target_language=target_lang)

    # Generate audio
    audio_file = text_to_speech(translated, lang=target_lang)

    return jsonify({
        "text": translated,
        "original": text,
        "emotion": emotion,
        "audio_url": f"/get_audio?file={audio_file}"
    })
@app.route("/voice_translate_dual", methods=["POST"])
def voice_translate_dual():
    """
    Handles two-speaker real-time chat — both sides can speak, 
    AI translates voice → text → translated voice with emotion tags.
    """
    langA = request.form.get("langA", "en")
    langB = request.form.get("langB", "hi")

    speakerA_audio = request.files.get("speakerA")
    speakerB_audio = request.files.get("speakerB")

    response = {"speakerA": None, "speakerB": None}

    # 🎙️ Speaker A
    if speakerA_audio:
        text_A, audio_data_A = recognize_speech(language=langA) # same logic (live capture)
        emotion_A = analyze_emotion(audio_data_A)
        translated_A = translate_text(text_A, target_language=langB)
        output_text_A = f"[Emotion: {emotion_A}] {translated_A}"
        audio_A = text_to_speech(output_text_A, lang=langB)
        response["speakerA"] = {
            "input": text_A,
            "translation": translated_A,
            "audio": f"/{audio_A}"
        }

    # 🎙️ Speaker B
    if speakerB_audio:
        text_B, audio_data_B = recognize_speech(language=langB)
        emotion_B = analyze_emotion(audio_data_B)
        translated_B = translate_text(text_B, target_language=langA)
        output_text_B = f"[Emotion: {emotion_B}] {translated_B}"
        audio_B = text_to_speech(output_text_B, lang=langA)
        response["speakerB"] = {
            "input": text_B,
            "translation": translated_B,
            "audio": f"/{audio_B}"
        }

    return jsonify(response)



@app.route("/summarize", methods=["POST"])
def summarize():
    try:
        data = request.get_json()
        text = data.get("text", "")
        output_lang = data.get("output_lang", "en")  # 👈 NEW

        if not text.strip():
            return jsonify({"summary": "No text provided."})

        prompt = f"""
Summarize the following text clearly in 4-5 lines,
keeping the meaning and tone intact:

{text}
"""

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "phi3",
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": 180}  # ✅ stable length
            },
            timeout=120,
        )

        result = response.json()
        summary_en = result.get("response", "").strip()

        if not summary_en:
            return jsonify({"summary": "Summary generation failed."})

        # 🔁 TRANSLATE SUMMARY OUTPUT ONLY
        if output_lang != "en":
            summary_final = GoogleTranslator(
                source="auto",
                target=output_lang
            ).translate(summary_en)
        else:
            summary_final = summary_en

        return jsonify({
            "summary": summary_final,
            "language": output_lang
        })

    except Exception as e:
        print("❌ Summarizer Error:", e)
        return jsonify({"summary": "Error processing text."})

@app.route("/generate_image", methods=["POST"])
def generate_image():
    """
    Generate an image using Stable Diffusion WebUI API (DreamShaper 8)
    Example JSON:
    {
        "prompt": "a futuristic AI translator dashboard glowing in neon lights",
        "use_hires": true
    }
    """
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        use_hires = data.get("use_hires", False)  # 👈 NEW TOGGLE

        if not prompt.strip():
            return jsonify({"error": "Prompt cannot be empty"}), 400

        # 🔹 Base payload (Fast Mode)
        payload = {
            "prompt": prompt,
            "steps": 20,
            "sampler_name": "DPM++ 2M",
            "cfg_scale": 7.5,
            "width": 512,
            "height": 512,
            "batch_size": 1,
        }

        # 🔹 If Hires Mode is enabled
        if use_hires:
            payload.update({
                "enable_hr": True,
                "hr_upscaler": "Latent (antialiased)",
                "hr_scale": 1.8,           # upscale 512 → ~900
                "denoising_strength": 0.4,
                "hr_second_pass_steps": 10  # light second pass
            })
        else:
            payload["enable_hr"] = False  # normal 1-pass render

        # 🔹 Call Stable Diffusion WebUI API
        response = requests.post(STABLE_DIFFUSION_URL, json=payload)
        result = response.json()

        if "images" not in result or not result["images"]:
            return jsonify({"error": "No image returned from Stable Diffusion"}), 500

        # Decode Base64 → Save image
        image_base64 = result["images"][0]
        image_data = base64.b64decode(image_base64)

        # Separate folders for fast and hires
        folder = "generated_images/hires" if use_hires else "generated_images/fast"
        os.makedirs(folder, exist_ok=True)
        file_path = os.path.join(folder, "generated_image.png")

        with open(file_path, "wb") as f:
            f.write(image_data)

        return jsonify({
            "status": "success",
            "mode": "Hires" if use_hires else "Fast",
            "prompt": prompt,
            "image_path": f"/get_generated_image?file={file_path}"
        })

    except Exception as e:
        print("❌ Image generation error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/get_generated_image", methods=["GET"])
def get_generated_image():
    file = request.args.get("file")
    return send_file(file, mimetype="image/png")

@app.route("/generate_concept_map", methods=["POST"])
def generate_concept_map():
    """
    🧠 Dynamically generate a knowledge graph for any topic.
    """
    try:
        data = request.get_json()
        topic = data.get("topic", "").strip()
        limit = int(data.get("limit", 10))  # default 10, drill-down will send 5

        if not topic:
            return jsonify({"error": "Topic cannot be empty"}), 400

        print(f"⚙️ Generating concept map for: {topic} | limit={limit}")

        # Step 1️⃣ Ask Phi-3 for strict academic subtopics
        phi_prompt = f"""
You are a university professor and curriculum designer.

Task:
List ONLY the direct academic subfields or branches of "{topic}".

STRICT RULES (MANDATORY):
- Return EXACTLY {limit} items
- Each item MUST be a recognized subfield, branch, or domain
- DO NOT repeat the topic itself
- Each item must be at most 3 words
- Output must be ONE SINGLE LINE
- Use ONLY comma-separated values
- NO numbering, bullets, or new lines

If "{topic}" has fewer than {limit} true subfields,
include only the closest academically accepted branches.

Correct example:
Topic: Artificial Intelligence
Output:
Machine Learning, Computer Vision, Natural Language Processing, Expert Systems, Robotics

Incorrect examples (DO NOT DO THIS):
Neural Networks
Backpropagation
Chatbots
Python
Image Classification

Return ONLY the list.
"""


        import re

        nodes = []
        attempts = 0

        while len(nodes) < limit and attempts < 3:
            attempts += 1

            # 🔒 THREAD-SAFE PHI-3 CALL (ONLY CHANGE)
            with phi3_lock:
                phi_response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "phi3",
                        "prompt": phi_prompt,
                        "stream": False,
                        "options": {"temperature": 0.2}
                    },
                    timeout=120
                )

            phi_text = phi_response.json().get("response", "")

            if not phi_text:
                continue

            # cleanup
            phi_text = re.sub(r"^\s*[\d\-\)\.]+\s*", "", phi_text)
            phi_text = phi_text.replace("\n", " ")
            phi_text = phi_text[:500]

            new_nodes = [
                n.strip()
                for n in phi_text.split(",")
                if len(n.strip()) > 2 and topic.lower() not in n.lower()
            ]

            nodes.extend(new_nodes)
            nodes = list(dict.fromkeys(nodes))  # remove duplicates

        # final guarantee
        nodes = nodes[:limit]

        if len(nodes) < limit:
            print("⚠️ Phi returned fewer nodes than expected:", nodes)

        print("🧠 Phi-3 subtopics:", nodes)

        # Step 3️⃣ Build JSON graph
        graph_data = {
            "topic": topic,
            "nodes": [{"id": topic, "group": "core"}]
                     + [{"id": n, "group": "subtopic"} for n in nodes],
            "edges": [{"source": topic, "target": n} for n in nodes],
        }

        # Step 4️⃣ (Optional) Save for debugging
        os.makedirs("concept_graphs", exist_ok=True)
        with open(
            f"concept_graphs/{topic.replace(' ', '_')}.json",
            "w",
            encoding="utf-8"
        ) as f:
            json.dump(graph_data, f, indent=2)

        print(f"✅ Graph generated for: {topic}")
        return jsonify(graph_data)

    except Exception as e:
        print("❌ Concept map generation error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/generate_concept_description", methods=["POST"])
def generate_concept_description():
    data = request.get_json()
    subtopic = data.get("subtopic", "")
    if not subtopic:
        return jsonify({"error": "No subtopic provided"}), 400

    prompt = f"Explain the concept of {subtopic} in one concise line."

    try:
        # 🔒 THREAD-SAFE STREAMING PHI-3 CALL
        with phi3_lock:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": "phi3", "prompt": prompt},
                stream=True,
                timeout=100
            )

        description = ""
        for line in response.iter_lines():
            if line:
                try:
                    obj = json.loads(line.decode("utf-8"))
                    description += obj.get("response", "")
                except Exception:
                    continue

        description = description.strip() or "No description available."
        return jsonify({"description": description})

    except requests.exceptions.Timeout:
        return jsonify({"description": "Timeout while generating description."})
    except Exception as e:
        print("❌ Phi-3 description error:", e)
        return jsonify({"description": "Error generating description."})

@app.route("/dataintelligence", methods=["POST"])
def data_intelligence():
    try:
        import os, pandas as pd, matplotlib.pyplot as plt, seaborn as sns
        from werkzeug.utils import secure_filename

        os.makedirs("uploads", exist_ok=True)

        # ================= FILE UPLOAD =================
        file = request.files["file"]
        filename = secure_filename(file.filename)
        filepath = os.path.join("uploads", filename)
        file.save(filepath)

        # ================= READ FILE =================
        if filename.lower().endswith(".csv"):
            df = pd.read_csv(filepath)
        elif filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(filepath)
        elif filename.lower().endswith(".json"):
            df = pd.read_json(filepath)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        # ================= CLEAN DATA =================
        df = df.dropna(axis=0, how="all").dropna(axis=1, how="all")
        df.columns = [c.strip().lower() for c in df.columns]
        cols = list(df.columns)
        colset = set(cols)

        # ================= CLEAR OLD CHARTS =================
        for f in os.listdir("uploads"):
            if f.endswith(".png"):
                os.remove(os.path.join("uploads", f))

        charts, kpi_data, summary_parts = [], {}, []
        dataset_type = "UNKNOWN"

        # =====================================================
        # 🎓 STUDENT DATASET
        # =====================================================
        # =====================================================
# 🎓 STUDENT DATASET (6 KPIs + 6 LABELED CHARTS)
# =====================================================
        if {"math","science","english","attendance_%","study_hours_per_week","result"}.issubset(colset):

            dataset_type = "STUDENT"

            # --------- CLEAN DATA ----------
            df["result"] = df["result"].astype(str).str.strip().str.lower()

            # --------- DERIVED METRIC ----------
            df["avg_marks"] = df[["math","science","english"]].mean(axis=1)

            # --------- KPI DATA (6) ----------
            kpi_data = {
                "average_marks": round(df["avg_marks"].mean(), 2),
                "highest_marks": round(df["avg_marks"].max(), 2),
                "lowest_marks": round(df["avg_marks"].min(), 2),
                "average_attendance_%": round(df["attendance_%"].mean(), 2),
                "pass_rate_%": round((df["result"] == "pass").mean() * 100, 2),
                "student_count": len(df)
            }

            # --------- DETAILED SUMMARY ----------
            summary_parts.append(
                f"This student dataset analyzes academic performance for {kpi_data['student_count']} students. "
                f"The average score across core subjects is {kpi_data['average_marks']}, "
                f"with marks ranging from {kpi_data['lowest_marks']} to {kpi_data['highest_marks']}. "
                f"Students maintain an average attendance of {kpi_data['average_attendance_%']}%, "
                f"and the overall pass rate stands at {kpi_data['pass_rate_%']}%. "
                f"Study hours per week show a clear relationship with academic performance, "
                f"indicating that consistent effort positively impacts results."
            )

            # =====================================================
            # 📊 1. Bar Chart – Average Marks by Subject
            # =====================================================
            plt.figure(figsize=(6,4))
            df[["math","science","english"]].mean().plot(kind="bar")
            plt.title("Average Marks by Subject")
            plt.xlabel("Subject")
            plt.ylabel("Average Marks")
            plt.tight_layout()
            plt.savefig("uploads/student_bar_subject.png")
            plt.close()
            charts.append("/uploads/student_bar_subject.png")

            # =====================================================
            # 📊 2. Pie Chart – Pass vs Fail
            # =====================================================
            plt.figure(figsize=(5,5))
            df["result"].value_counts().plot(kind="pie", autopct="%1.1f%%", startangle=90)
            plt.title("Pass vs Fail Distribution")
            plt.ylabel("")
            plt.tight_layout()
            plt.savefig("uploads/student_pie_pass_fail.png")
            plt.close()
            charts.append("/uploads/student_pie_pass_fail.png")

            # =====================================================
            # 📊 3. Histogram – Attendance Distribution
            # =====================================================
            plt.figure(figsize=(6,4))
            plt.hist(df["attendance_%"], bins=15)
            plt.title("Attendance Distribution")
            plt.xlabel("Attendance Percentage")
            plt.ylabel("Number of Students")
            plt.tight_layout()
            plt.savefig("uploads/student_hist_attendance.png")
            plt.close()
            charts.append("/uploads/student_hist_attendance.png")

            # =====================================================
            # 📊 4. Scatter Plot – Study Hours vs Average Marks
            # =====================================================
            plt.figure(figsize=(6,4))
            plt.scatter(df["study_hours_per_week"], df["avg_marks"])
            plt.title("Study Hours vs Academic Performance")
            plt.xlabel("Study Hours per Week")
            plt.ylabel("Average Marks")
            plt.tight_layout()
            plt.savefig("uploads/student_scatter_study_marks.png")
            plt.close()
            charts.append("/uploads/student_scatter_study_marks.png")

            # =====================================================
            # 📊 5. Boxplot – Marks Distribution by Subject
            # =====================================================
            plt.figure(figsize=(6,4))
            df[["math","science","english"]].boxplot()
            plt.title("Marks Distribution by Subject")
            plt.ylabel("Marks")
            plt.tight_layout()
            plt.savefig("uploads/student_box_marks.png")
            plt.close()
            charts.append("/uploads/student_box_marks.png")

            # =====================================================
            # 📊 6. Heatmap – Subject Correlation
            # =====================================================
            plt.figure(figsize=(4,4))
            sns.heatmap(df[["math","science","english"]].corr(), annot=True, cmap="YlGnBu")
            plt.title("Correlation Between Subjects")
            plt.tight_layout()
            plt.savefig("uploads/student_heatmap_corr.png")
            plt.close()
            charts.append("/uploads/student_heatmap_corr.png")

        # =====================================================
# 💰 SALES DATASET (6 KPIs + 6 LABELED CHARTS)
# =====================================================
        elif {"revenue","quantity","product","region","order_date"}.issubset(colset):

            dataset_type = "SALES"

            # --------- CLEAN DATA ----------
            df["product"] = df["product"].astype(str).str.strip()
            df["region"] = df["region"].astype(str).str.strip()
            df["order_date"] = pd.to_datetime(df["order_date"])

            # --------- KPI DATA (6) ----------
            kpi_data = {
                "total_revenue": int(df["revenue"].sum()),
                "avg_revenue_per_order": round(df["revenue"].mean(), 2),
                "max_revenue_order": int(df["revenue"].max()),
                "total_quantity_sold": int(df["quantity"].sum()),
                "top_product": df["product"].value_counts().idxmax(),
                "top_region": df["region"].value_counts().idxmax()
            }

            # --------- DETAILED SUMMARY ----------
            summary_parts.append(
                f"This sales dataset contains {len(df)} customer orders recorded over time. "
                f"The total revenue generated is {kpi_data['total_revenue']}, with an average "
                f"revenue per order of {kpi_data['avg_revenue_per_order']}. "
                f"The highest single order value reached {kpi_data['max_revenue_order']}. "
                f"A total of {kpi_data['total_quantity_sold']} items were sold. "
                f"The most frequently purchased product is {kpi_data['top_product']}, "
                f"and the region contributing the highest number of sales is {kpi_data['top_region']}. "
                f"Overall, the dataset highlights clear trends in product performance, regional demand, "
                f"and revenue growth patterns."
            )

            # =====================================================
            # 📊 1. Bar Chart – Top 5 Products by Revenue
            # =====================================================
            plt.figure(figsize=(6,4))
            df.groupby("product")["revenue"].sum().sort_values(ascending=False).head(5).plot(kind="bar")
            plt.title("Top 5 Products by Revenue")
            plt.xlabel("Product")
            plt.ylabel("Total Revenue")
            plt.tight_layout()
            plt.savefig("uploads/sales_bar_product.png")
            plt.close()
            charts.append("/uploads/sales_bar_product.png")

            # =====================================================
            # 📊 2. Line Chart – Monthly Revenue Trend
            # =====================================================
            plt.figure(figsize=(6,4))
            df.set_index("order_date").resample("M")["revenue"].sum().plot()
            plt.title("Monthly Revenue Trend")
            plt.xlabel("Month")
            plt.ylabel("Total Revenue")
            plt.tight_layout()
            plt.savefig("uploads/sales_line_trend.png")
            plt.close()
            charts.append("/uploads/sales_line_trend.png")

            # =====================================================
            # 📊 3. Scatter Plot – Quantity vs Revenue
            # =====================================================
            plt.figure(figsize=(6,4))
            plt.scatter(df["quantity"], df["revenue"])
            plt.title("Quantity Sold vs Revenue")
            plt.xlabel("Quantity Sold")
            plt.ylabel("Revenue")
            plt.tight_layout()
            plt.savefig("uploads/sales_scatter_qty_revenue.png")
            plt.close()
            charts.append("/uploads/sales_scatter_qty_revenue.png")

            # =====================================================
            # 📊 4. Pie Chart – Sales Distribution by Region
            # =====================================================
            plt.figure(figsize=(5,5))
            df["region"].value_counts().plot(kind="pie", autopct="%1.1f%%", startangle=90)
            plt.title("Sales Distribution by Region")
            plt.ylabel("")
            plt.tight_layout()
            plt.savefig("uploads/sales_pie_region.png")
            plt.close()
            charts.append("/uploads/sales_pie_region.png")

            # =====================================================
            # 📊 5. Boxplot – Revenue Distribution
            # =====================================================
            plt.figure(figsize=(6,4))
            plt.boxplot(df["revenue"])
            plt.title("Revenue Distribution Across Orders")
            plt.ylabel("Revenue")
            plt.tight_layout()
            plt.savefig("uploads/sales_box_revenue.png")
            plt.close()
            charts.append("/uploads/sales_box_revenue.png")

            # =====================================================
            # 📊 6. Heatmap – Quantity vs Revenue Correlation
            # =====================================================
            plt.figure(figsize=(4,4))
            sns.heatmap(df[["quantity","revenue"]].corr(), annot=True, cmap="YlOrBr")
            plt.title("Correlation: Quantity vs Revenue")
            plt.tight_layout()
            plt.savefig("uploads/sales_heatmap_corr.png")
            plt.close()
            charts.append("/uploads/sales_heatmap_corr.png")

  # =====================================================
# 👨‍💼 EMPLOYEE DATASET (6 KPIs + 6 LABELED CHARTS)
# =====================================================
        elif {"salary","performance_score","department","experience_years","promotion_status"}.issubset(colset):

            dataset_type = "EMPLOYEE"

            # --------- CLEAN DATA ----------
            df["promotion_status"] = df["promotion_status"].astype(str).str.strip().str.lower()
            df["department"] = df["department"].astype(str).str.strip()

            # --------- KPI DATA (6) ----------
            kpi_data = {
                "avg_salary": int(df["salary"].mean()),
                "median_salary": int(df["salary"].median()),
                "max_salary": int(df["salary"].max()),
                "avg_performance_score": round(df["performance_score"].mean(), 2),
                "promotion_rate_%": round((df["promotion_status"] == "yes").mean() * 100, 2),
                "total_employees": len(df)
            }

            # --------- DETAILED SUMMARY ----------
            summary_parts.append(
                f"This employee dataset analyzes organizational data for "
                f"{kpi_data['total_employees']} employees across multiple departments. "
                f"The average salary is {kpi_data['avg_salary']}, while the median salary "
                f"stands at {kpi_data['median_salary']}, indicating overall compensation trends. "
                f"The highest recorded salary is {kpi_data['max_salary']}. "
                f"Employee performance scores average at {kpi_data['avg_performance_score']}, "
                f"providing insight into workforce productivity. "
                f"The promotion rate is {kpi_data['promotion_rate_%']}%, "
                f"which reflects internal growth and career advancement opportunities."
            )

            # =====================================================
            # 📊 1. Bar Chart – Average Salary by Department
            # =====================================================
            plt.figure(figsize=(6,4))
            df.groupby("department")["salary"].mean().plot(kind="bar")
            plt.title("Average Salary by Department")
            plt.xlabel("Department")
            plt.ylabel("Average Salary")
            plt.tight_layout()
            plt.savefig("uploads/emp_bar_salary_dept.png")
            plt.close()
            charts.append("/uploads/emp_bar_salary_dept.png")

            # =====================================================
            # 📊 2. Histogram – Performance Score Distribution
            # =====================================================
            plt.figure(figsize=(6,4))
            plt.hist(df["performance_score"], bins=15)
            plt.title("Performance Score Distribution")
            plt.xlabel("Performance Score")
            plt.ylabel("Number of Employees")
            plt.tight_layout()
            plt.savefig("uploads/emp_hist_performance.png")
            plt.close()
            charts.append("/uploads/emp_hist_performance.png")

            # =====================================================
            # 📊 3. Scatter – Experience vs Salary
            # =====================================================
            plt.figure(figsize=(6,4))
            plt.scatter(df["experience_years"], df["salary"])
            plt.title("Experience vs Salary")
            plt.xlabel("Experience (Years)")
            plt.ylabel("Salary")
            plt.tight_layout()
            plt.savefig("uploads/emp_scatter_experience_salary.png")
            plt.close()
            charts.append("/uploads/emp_scatter_experience_salary.png")

            # =====================================================
            # 📊 4. Scatter – Performance Score vs Salary
            # =====================================================
            plt.figure(figsize=(6,4))
            plt.scatter(df["performance_score"], df["salary"])
            plt.title("Performance Score vs Salary")
            plt.xlabel("Performance Score")
            plt.ylabel("Salary")
            plt.tight_layout()
            plt.savefig("uploads/emp_scatter_performance_salary.png")
            plt.close()
            charts.append("/uploads/emp_scatter_performance_salary.png")

            # =====================================================
            # 📊 5. Pie Chart – Promotion Status
            # =====================================================
            plt.figure(figsize=(5,5))
            df["promotion_status"].value_counts().plot(
                kind="pie",
                autopct="%1.1f%%",
                startangle=90
            )
            plt.title("Promotion Status Distribution")
            plt.ylabel("")
            plt.tight_layout()
            plt.savefig("uploads/emp_pie_promotion.png")
            plt.close()
            charts.append("/uploads/emp_pie_promotion.png")

            # =====================================================
            # 📊 6. Boxplot – Salary Distribution by Department
            # =====================================================
            plt.figure(figsize=(6,4))
            df.boxplot(column="salary", by="department")
            plt.title("Salary Distribution by Department")
            plt.xlabel("Department")
            plt.ylabel("Salary")
            plt.suptitle("")
            plt.tight_layout()
            plt.savefig("uploads/emp_box_salary_dept.png")
            plt.close()
            charts.append("/uploads/emp_box_salary_dept.png")


        # =====================================================
# 🏋️ FITNESS DATASET (6 KPIs + 6 LABELED CHARTS)
# =====================================================
        elif {"bmi","calories_day","steps_day","sleep_hours","fitness_level"}.issubset(colset):

            dataset_type = "FITNESS"

    # --------- CLEAN DATA ----------
            df["fitness_level"] = df["fitness_level"].astype(str).str.strip().str.lower()

    # --------- KPI DATA (6) ----------
            kpi_data = {
                "avg_bmi": round(df["bmi"].mean(), 2),
                "avg_steps": int(df["steps_day"].mean()),
                "avg_calories": int(df["calories_day"].mean()),
                "avg_sleep_hours": round(df["sleep_hours"].mean(), 2),
                "fit_percentage_%": round((df["fitness_level"] == "fit").mean() * 100, 2),
                "total_users": len(df)
            }

    # --------- DETAILED SUMMARY ----------
            summary_parts.append(
                f"This fitness dataset contains activity and health records for {kpi_data['total_users']} users. "
                f"The average Body Mass Index (BMI) across users is {kpi_data['avg_bmi']}, "
                f"which provides insight into overall physical health trends. "
                f"On average, users walk {kpi_data['avg_steps']} steps per day and burn "
                f"{kpi_data['avg_calories']} calories daily. "
                f"Sleep duration averages {kpi_data['avg_sleep_hours']} hours per night, "
                f"highlighting general rest patterns. "
                f"Approximately {kpi_data['fit_percentage_%']}% of users are classified as physically fit, "
                f"helping identify overall wellness distribution."
            )

    # =====================================================
    # 📊 1. Histogram – BMI Distribution
    # =====================================================
            plt.figure(figsize=(6,4))
            plt.hist(df["bmi"], bins=15)
            plt.title("BMI Distribution")
            plt.xlabel("BMI")
            plt.ylabel("Number of Users")
            plt.tight_layout()
            plt.savefig("uploads/fit_hist_bmi.png")
            plt.close()
            charts.append("/uploads/fit_hist_bmi.png")

    # =====================================================
    # 📊 2. Histogram – Daily Steps
    # =====================================================
            plt.figure(figsize=(6,4))
            plt.hist(df["steps_day"], bins=15)
            plt.title("Daily Steps Distribution")
            plt.xlabel("Steps per Day")
            plt.ylabel("Number of Users")
            plt.tight_layout()
            plt.savefig("uploads/fit_hist_steps.png")
            plt.close()
            charts.append("/uploads/fit_hist_steps.png")

    # =====================================================
    # 📊 3. Pie Chart – Fitness Level
    # =====================================================
            plt.figure(figsize=(5,5))
            df["fitness_level"].value_counts().plot(
                kind="pie",
                autopct="%1.1f%%",
                startangle=90
            )
            plt.title("Fitness Level Distribution")
            plt.ylabel("")
            plt.tight_layout()
            plt.savefig("uploads/fit_pie_level.png")
            plt.close()
            charts.append("/uploads/fit_pie_level.png")

    # =====================================================
    # 📊 4. Scatter – Sleep Hours vs BMI
    # =====================================================
            plt.figure(figsize=(6,4))
            plt.scatter(df["sleep_hours"], df["bmi"])
            plt.title("Sleep Duration vs BMI")
            plt.xlabel("Sleep Hours per Night")
            plt.ylabel("BMI")
            plt.tight_layout()
            plt.savefig("uploads/fit_scatter_sleep_bmi.png")
            plt.close()
            charts.append("/uploads/fit_scatter_sleep_bmi.png")

    # =====================================================
    # 📊 5. Scatter – Steps vs Calories Burned
    # =====================================================
            plt.figure(figsize=(6,4))
            plt.scatter(df["steps_day"], df["calories_day"])
            plt.title("Steps vs Calories Burned")
            plt.xlabel("Steps per Day")
            plt.ylabel("Calories Burned")
            plt.tight_layout()
            plt.savefig("uploads/fit_scatter_steps_calories.png")
            plt.close()
            charts.append("/uploads/fit_scatter_steps_calories.png")

    # =====================================================
    # 📊 6. Boxplot – Calories by Fitness Level
    # =====================================================
            plt.figure(figsize=(6,4))
            df.boxplot(column="calories_day", by="fitness_level")
            plt.title("Calories Burned by Fitness Level")
            plt.suptitle("")
            plt.xlabel("Fitness Level")
            plt.ylabel("Calories Burned")
            plt.tight_layout()
            plt.savefig("uploads/fit_box_calories.png")
            plt.close()
            charts.append("/uploads/fit_box_calories.png")


        # =====================================================
        # 🌐 WEB TRAFFIC DATASET
        # =====================================================
        elif {"session_duration_sec","pages_visited","bounce","device_type","visit_date"}.issubset(colset):

            dataset_type = "WEB_TRAFFIC"

    # ---------- CLEAN / NORMALIZE ----------
            df["bounce"] = df["bounce"].astype(str).str.lower()

    # ---------- KPI DATA (6 KPIs) ----------
            kpi_data = {
                "avg_session_sec": round(df["session_duration_sec"].mean(), 2),
                "max_session_sec": int(df["session_duration_sec"].max()),
                "avg_pages_visited": round(df["pages_visited"].mean(), 2),
                "bounce_rate_%": round((df["bounce"].isin(["yes","true","1"])).mean() * 100, 2),
                "top_device": df["device_type"].value_counts().idxmax(),
                "total_sessions": len(df)
            }

    # ---------- DETAILED SUMMARY ----------
            summary_parts.append(
                f"This web traffic dataset contains {len(df)} user sessions collected over time. "
                f"Users spend an average of {kpi_data['avg_session_sec']} seconds per session, "
                f"with the longest session lasting {kpi_data['max_session_sec']} seconds. "
                f"On average, visitors browse {kpi_data['avg_pages_visited']} pages per session. "
                f"The bounce rate is {kpi_data['bounce_rate_%']}%, indicating early exits. "
                f"The most commonly used device type is {kpi_data['top_device']}, "
                f"which provides insight into user access patterns and optimization opportunities."
            )       

    # =====================================================
    # 📊 1. Histogram – Session Duration
    # =====================================================
            plt.figure(figsize=(6,4))
            plt.hist(df["session_duration_sec"], bins=20)
            plt.title("Session Duration Distribution")
            plt.xlabel("Session Duration (seconds)")
            plt.ylabel("Number of Sessions")
            plt.tight_layout()
            plt.savefig("uploads/web_hist_session.png")
            plt.close()
            charts.append("/uploads/web_hist_session.png")

    # =====================================================
    # 📊 2. Bar Chart – Device Type Usage
    # =====================================================
            plt.figure(figsize=(6,4))
            df["device_type"].value_counts().plot(kind="bar")
            plt.title("Sessions by Device Type")
            plt.xlabel("Device Type")
            plt.ylabel("Number of Sessions")
            plt.tight_layout()
            plt.savefig("uploads/web_bar_device.png")
            plt.close()
            charts.append("/uploads/web_bar_device.png")

    # =====================================================
    # 📊 3. Pie Chart – Bounce vs Non-Bounce
    # =====================================================
            plt.figure(figsize=(5,5))
            df["bounce"].value_counts().plot(
                kind="pie",
                autopct="%1.1f%%",
                startangle=90
            )
            plt.title("Bounce Rate Distribution")
            plt.ylabel("")
            plt.tight_layout()
            plt.savefig("uploads/web_pie_bounce.png")
            plt.close()
            charts.append("/uploads/web_pie_bounce.png")

    # =====================================================
    # 📊 4. Scatter – Pages Visited vs Session Duration
    # =====================================================
            plt.figure(figsize=(6,4))
            plt.scatter(df["pages_visited"], df["session_duration_sec"])
            plt.title("Pages Visited vs Session Duration")
            plt.xlabel("Pages Visited")
            plt.ylabel("Session Duration (seconds)")
            plt.tight_layout()
            plt.savefig("uploads/web_scatter_pages_duration.png")
            plt.close()
            charts.append("/uploads/web_scatter_pages_duration.png")    
    # =====================================================
    # 📊 5. Boxplot – Pages Visited Distribution
    # =====================================================
            plt.figure(figsize=(6,4))
            df["pages_visited"].plot(kind="box")
            plt.title("Pages Visited Distribution")
            plt.ylabel("Pages Visited")
            plt.tight_layout()
            plt.savefig("uploads/web_box_pages.png")
            plt.close()
            charts.append("/uploads/web_box_pages.png")
    # =====================================================
    # 📊 6. Heatmap – Engagement Correlation
    # =====================================================
            plt.figure(figsize=(5,4))
            sns.heatmap(
                df[["pages_visited","session_duration_sec"]].corr(),
                annot=True,
                cmap="Blues"
            )
            plt.title("User Engagement Correlation")
            plt.tight_layout()
            plt.savefig("uploads/web_heatmap_engagement.png")
            plt.close()
            charts.append("/uploads/web_heatmap_engagement.png")

        else:
            return jsonify({"error": "Dataset structure not recognized"}), 400

        return jsonify({
            "status": "success",
            "dataset_type": dataset_type,
            "summary": {
                "rows": len(df),
                "cols": len(cols),
                "columns": cols
            },
            "ai_summary": " ".join(summary_parts),
            "kpi_data": kpi_data,
            "graphs": charts
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ✅ Serve Uploads to Frontend
@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename), mimetype="image/png")


# ✅ Download Report (optional placeholder)
@app.route("/download_report")
def download_report():
    return send_file(os.path.join("data_viz", "AI_Report.pdf"), as_attachment=True)


@app.route("/static/audio/<path:filename>")
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)


from meme_phi3_api import register_meme_routes
register_meme_routes(app)

if __name__ == "__main__":
    app.run(debug=True)

