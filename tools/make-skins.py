#!/usr/bin/env python3
"""Generate Dylan outfit skins from the original sprites.

Recolors the blue outfit (shirt + pants) and leaves hair, skin and beard alone.
Output mirrors resources/images/characters/dylan/ under
resources/images/characters/skins/<skin-id>/, downscaled to 192px-wide-equivalent
(Dylan renders at 32px on a 3x map, so that's crisp on 2x screens).

Usage:  python3 tools/make-skins.py            # all skins
        python3 tools/make-skins.py crimson    # just one
Keep the ids in sync with SKINS in resources/js/skins.js.
"""
import colorsys
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "resources/images/characters/dylan"
OUT = ROOT / "resources/images/characters/skins"
# Every frame is scaled by the same factor so relative sizes stay identical.
SCALE = 192 / 713

# hue: target hue (0-1). sat/val: multipliers applied to the original blues.
SKINS = {
    "crimson": {"hue": 0.99, "sat": 1.0, "val": 1.15},
    "forest": {"hue": 0.38, "sat": 0.9, "val": 1.05},
    "royal": {"hue": 0.77, "sat": 0.9, "val": 1.2},
    "sunset": {"hue": 0.07, "sat": 1.0, "val": 1.35},
    "midnight": {"hue": 0.62, "sat": 0.12, "val": 0.75},
    "gold": {"hue": 0.12, "sat": 0.95, "val": 1.75},
}


def is_outfit_blue(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    # v > 0.12 leaves the near-black navy of the eyes and outlines alone.
    return 0.52 < h < 0.68 and s > 0.35 and v > 0.12, (h, s, v)


def recolor(img, spec):
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    cache = {}
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            key = (r, g, b)
            if key not in cache:
                blue, (hh, s, v) = is_outfit_blue(r, g, b)
                if blue:
                    nr, ng, nb = colorsys.hsv_to_rgb(
                        spec["hue"], min(1, s * spec["sat"]), min(1, v * spec["val"])
                    )
                    cache[key] = (round(nr * 255), round(ng * 255), round(nb * 255))
                else:
                    cache[key] = key
            nr, ng, nb = cache[key]
            px[x, y] = (nr, ng, nb, a)
    return img


def main(selected):
    frames = sorted(p for p in SRC.rglob("*.png"))
    for skin_id in selected:
        spec = SKINS[skin_id]
        for frame in frames:
            rel = frame.relative_to(SRC)
            img = Image.open(frame)
            small = img.resize(
                (max(1, round(img.width * SCALE)), max(1, round(img.height * SCALE))),
                Image.LANCZOS,
            )
            out = OUT / skin_id / rel
            out.parent.mkdir(parents=True, exist_ok=True)
            # A 128-color palette keeps each frame a few KB with no visible change.
            recolor(small, spec).quantize(128, method=Image.Quantize.FASTOCTREE).save(out, optimize=True)
        print(f"{skin_id}: {len(frames)} frames")


if __name__ == "__main__":
    main(sys.argv[1:] or list(SKINS))
