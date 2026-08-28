from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "models" / "tshirts"
OUTPUT_DIR = SOURCE_DIR / "colors"

SOURCES = (
    "loose-fit-front.png",
    "loose-fit-back.png",
    "boxy-fit-front.png",
    "boxy-fit-back.png",
)

COLORS = {
    "white": {"fa": "سفید", "hex": "#FFFFFF"},
    "black": {"fa": "مشکی", "hex": "#151515"},
    "off-white": {"fa": "سفید استخوانی", "hex": "#F1EBDD"},
    "zara-green": {"fa": "سبز زارا", "hex": "#4B6B4F"},
    "teal-green": {"fa": "سبز کله‌غازی", "hex": "#006A66"},
    "sky-blue": {"fa": "آبی آسمانی", "hex": "#86C9E8"},
    "light-gray": {"fa": "طوسی روشن", "hex": "#C8C9CB"},
    "olive-green": {"fa": "سبز زیتونی", "hex": "#6D7345"},
    "navy": {"fa": "سورمه‌ای", "hex": "#17233F"},
    "cream": {"fa": "کرم", "hex": "#DCC8A2"},
}


def hex_rgb(value: str) -> np.ndarray:
    value = value.removeprefix("#")
    return np.array([int(value[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def recolor(image: Image.Image, target_hex: str) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8)
    rgb = rgba[..., :3].astype(np.float32)
    alpha = rgba[..., 3:4]

    # The masters are neutral white shirts. Their luminance therefore acts as a
    # reliable lighting map while the target RGB supplies the fabric colour.
    luminance = (
        rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722
    )
    base_luminance = 238.0
    target = hex_rgb(target_hex)

    shadows = np.minimum(luminance / base_luminance, 1.0)[..., None]
    coloured = target * shadows

    # Preserve specular highlights and fine white-thread detail by blending
    # values brighter than the base fabric colour gently towards white.
    highlight = np.clip((luminance - base_luminance) / (255.0 - base_luminance), 0, 1)[..., None]
    coloured = coloured * (1.0 - highlight) + 255.0 * highlight

    output = np.concatenate((np.clip(coloured, 0, 255).astype(np.uint8), alpha), axis=2)
    output[alpha[..., 0] == 0, :3] = 0
    return Image.fromarray(output, mode="RGBA")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, dict[str, object]] = {}

    for slug, colour in COLORS.items():
        files: list[str] = []

        for source_name in SOURCES:
            source_path = SOURCE_DIR / source_name
            stem = Path(source_name).stem
            fit, side = stem.rsplit("-", 1)
            output_path = OUTPUT_DIR / f"{fit}-{slug}-{side}.png"
            with Image.open(source_path) as source:
                recolor(source, str(colour["hex"])).save(output_path, "PNG", compress_level=6)
            files.append(output_path.relative_to(ROOT / "public").as_posix())

        manifest[slug] = {**colour, "files": files}

    (OUTPUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
