import os
import io
import uuid
import textwrap
from PIL import Image, ImageDraw, ImageFont
from flask import request, jsonify, send_file

# ============================
# FIXED MEME CAPTIONS
# ============================
MEME_CAPTIONS = {
    "MEME1": [
        "You can’t fail the exam if you don’t attend the exam.",
        "No attendance shortage if you never go to college."
    ],
    "MEME2": [
        "When you realize the syllabus is longer\nthan your future plans…",
        "When results are coming tomorrow and you remember everything except what you studied."
    ],
    "MEME3": [
    "Studying daily",
    "Studying one\nnight before exam"
  ],
    "MEME4": [
        "This wasn’t supposed to be my life.",
        "I trusted life. Life laughed."
    ],
    "MEME5": [
        "POV: You survived Monday.",
        "Me after solving one problem and ignoring the other 47."
    ]
}

# ============================
# ROUTES
# ============================
def register_meme_routes(app):

    @app.route("/generate_meme", methods=["POST"])
    def generate_meme():
        try:
            if "file" not in request.files:
                return jsonify({"error": "No image uploaded"}), 400

            file = request.files["file"]
            filename = file.filename.lower()

            # ----------------------------
            # DETECT MEME BY FILE NAME
            # ----------------------------
            if "meme1" in filename:
                meme_key = "MEME1"
            elif "meme2" in filename:
                meme_key = "MEME2"
            elif "meme3" in filename:
                meme_key = "MEME3"
            elif "meme4" in filename:
                meme_key = "MEME4"
            elif "meme5" in filename:
                meme_key = "MEME5"
            else:
                meme_key = "MEME1"  # safe fallback

            captions = MEME_CAPTIONS[meme_key]

            pil = Image.open(io.BytesIO(file.read())).convert("RGB")

            os.makedirs("generated_memes", exist_ok=True)
            previews = []
            job = uuid.uuid4().hex

            # ----------------------------
            # RENDER MEMES
            # ----------------------------
            for i, cap in enumerate(captions):

                img = pil.copy()
                draw = ImageDraw.Draw(img)

                try:
                    font = ImageFont.truetype("arial.ttf", int(img.height * 0.06))
                except:
                    font = ImageFont.load_default()

                w, h = img.size

                # =========================
                # ✅ MEME3 (DRAKE TEMPLATE)
                # =========================
                # =========================
# ✅ MEME3 (DRAKE VS TEMPLATE)
# =========================
                if meme_key == "MEME3":

                    img = pil.copy()
                    draw = ImageDraw.Draw(img)

                    try:
                        font = ImageFont.truetype("arial.ttf", int(img.height * 0.06))
                    except:
                        font = ImageFont.load_default()

                    w, h = img.size

                    LEFT_PADDING = int(w * 0.56)

                    # TOP RIGHT
                    draw.multiline_text(
                        (LEFT_PADDING, int(h * 0.25)),
                        captions[0],
                        font=font,
                        fill="black",
                        align="left"
                    )

                    # BOTTOM RIGHT
                    draw.multiline_text(
                        (LEFT_PADDING, int(h * 0.72)),
                        captions[1],
                        font=font,
                        fill="black",
                        align="left"
                    )

                    fname = f"meme_{uuid.uuid4().hex}.jpg"
                    path = os.path.join("generated_memes", fname)
                    img.save(path, quality=95)

                    return jsonify({
                        "status": "success",
                        "meme_type": "MEME3",
                        "results": [{
                            "caption": "VS meme",
                            "preview_url": f"/get_meme?file=generated_memes/{fname}"
                        }]
                    })


                # =========================
                # ✅ ALL OTHER MEMES (DEFAULT)
                # =========================
                else:
                    lines = textwrap.wrap(cap, width=30)
                    total_h = 0
                    sizes = []

                    for line in lines:
                        bbox = draw.textbbox((0, 0), line, font=font)
                        lw = bbox[2] - bbox[0]
                        lh = bbox[3] - bbox[1]
                        sizes.append((lw, lh))
                        total_h += lh + 8

                    y = h - total_h - 25

                    for idx, line in enumerate(lines):
                        lw, lh = sizes[idx]
                        x_center = (w - lw) / 2

                        draw.text(
                            (x_center, y),
                            line,
                            font=font,
                            fill="white",
                            stroke_width=3,
                            stroke_fill="black"
                        )
                        y += lh + 8


                fname = f"meme_{job}_{i}.jpg"
                path = os.path.join("generated_memes", fname)
                img.save(path, quality=90)

                previews.append({
                    "caption": cap,
                    "preview_url": f"/get_meme?file=generated_memes/{fname}"
                })

            return jsonify({
                "status": "success",
                "meme_type": meme_key,
                "results": previews
            })

        except Exception as e:
            print("MEME ERROR:", e)
            return jsonify({"error": str(e)}), 500

    @app.route("/get_meme", methods=["GET"])
    def get_meme():
        file = request.args.get("file", "")
        path = os.path.join(os.getcwd(), file)
        if not os.path.exists(path):
            return jsonify({"error": "file not found"}), 404
        return send_file(path, mimetype="image/jpeg")
