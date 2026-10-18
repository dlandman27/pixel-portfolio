#!/usr/bin/env python3
"""Draw Dylan's hats as tiny pixel-art PNGs (1 char = 1 sprite pixel).

Dylan renders 32px wide; hats are 20px wide and sit on his head via CSS
(see .dylan-hat in style.css). Run: python3 tools/make-hats.py
"""
import pathlib

from PIL import Image

OUT = pathlib.Path(__file__).resolve().parent.parent / "resources/images/characters/hats"

PALETTE = {
    ".": None,
    "k": (20, 20, 28),
    "w": (245, 245, 245),
    "r": (214, 58, 58),
    "R": (150, 30, 40),
    "y": (250, 204, 21),
    "Y": (196, 140, 10),
    "p": (124, 58, 237),
    "P": (76, 29, 149),
    "b": (59, 130, 246),
    "g": (34, 197, 94),
    "G": (21, 128, 61),
    "o": (249, 115, 22),
    "s": (120, 120, 130),
}

HATS = {
    "beanie": [
        "........ww..........",
        "......rrrrrr........",
        "....rrrrrrrrrr......",
        "...rrrrrrrrrrrr.....",
        "..rrrrrrrrrrrrrr....",
        "..RRRRRRRRRRRRRR....",
        "..wRwRwRwRwRwRwR....",
    ],
    "party": [
        ".........y..........",
        "........kyk.........",
        "........kbk.........",
        ".......kbbbk........",
        ".......kyyyk........",
        "......kbbbbbk.......",
        "......kgggggk.......",
        ".....kbbbbbbbk......",
        ".....kyyyyyyyk......",
    ],
    "tophat": [
        ".....kkkkkkkkk......",
        ".....kkkkkkkkk......",
        ".....kkkkkkkkk......",
        ".....kkkkkkkkk......",
        ".....kkkkkkkkk......",
        ".....rrrrrrrrr......",
        "..kkkkkkkkkkkkkkk...",
        "..kkkkkkkkkkkkkkk...",
    ],
    "wizard": [
        "..........pP........",
        ".........pppP.......",
        "........ppypP.......",
        ".......pppppPP......",
        "......pppppppP......",
        ".....ppypppppPP.....",
        "....ppppppyppppP....",
        "..PPPPPPPPPPPPPPPP..",
        "..PPPPPPPPPPPPPPPP..",
    ],
    "crown": [
        "...y....y....y......",
        "...yy..yYy..yy......",
        "...yyyyyyyyyyy......",
        "...yryyybyyyry......",
        "...YYYYYYYYYYY......",
    ],
    "cap": [
        "....gggggggg........",
        "...gggggggggg.......",
        "..ggggwwggggggg.....",
        "..GGGGGGGGGGGGGGGGG.",
    ],
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, rows in HATS.items():
        w, h = max(len(r) for r in rows), len(rows)
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                col = PALETTE.get(ch)
                if col:
                    img.putpixel((x, y), col + (255,))
        img = img.crop(img.getbbox())  # CSS centers the hat on Dylan's head
        img.save(OUT / f"{name}.png")
        print(name, img.size)


if __name__ == "__main__":
    main()
