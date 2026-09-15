"""
Builds the lights-mockup sprites in public/christmas-mockup/ from the source
art in src/components/admin/drawing-assets/.

Every bulb color is recolored from the blue C9 (the only source bulb with a
clean transparent background): pixels in the blue glass/glow hue range get
the target hue and saturation, keeping their brightness and alpha, so the
green socket and the glass shading stay intact.

Run: python3 scripts/prepare-mockup-assets.py   (needs Pillow)
"""

import colorsys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'src/components/admin/drawing-assets'
OUT = ROOT / 'public/christmas-mockup'
BULB_HEIGHT = 256
GARLAND_WIDTH = 2000

# name: (hue 0-1, saturation scale, brightness lift)
BULB_COLORS = {
    'warm-white': (0.11, 0.42, 0.28),
    'bright-white': (0.58, 0.08, 0.32),
    'red': (0.995, 1.0, 0.0),
    'green': (0.36, 1.0, 0.05),
    'blue': (None, 1.0, 0.0),
    'amber': (0.1, 1.0, 0.12),
    'purple': (0.8, 0.9, 0.05),
}


def is_glass(h, s):
    return 0.52 <= h <= 0.8 and s > 0.12


def recolor(source, hue, sat_scale, lift):
    out = source.copy()
    pixels = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = pixels[x, y]
            if not a:
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if not is_glass(h, s):
                continue
            new_h = h if hue is None else hue
            new_s = min(1.0, s * sat_scale)
            new_v = min(1.0, v + (1 - v) * lift)
            nr, ng, nb = colorsys.hsv_to_rgb(new_h, new_s, new_v)
            pixels[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255), a)
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blue = Image.open(SOURCE / 'light-bulbArtboard-2.png').convert('RGBA')
    blue = blue.crop(blue.split()[3].getbbox())
    blue = blue.resize((round(blue.width * BULB_HEIGHT / blue.height), BULB_HEIGHT), Image.LANCZOS)
    for name, (hue, sat_scale, lift) in BULB_COLORS.items():
        recolor(blue, hue, sat_scale, lift).save(OUT / f'c9-{name}.png', optimize=True)

    garland = Image.open(SOURCE / 'garland.png').convert('RGBA')
    garland = garland.crop(garland.split()[3].getbbox())
    garland = garland.resize((GARLAND_WIDTH, round(garland.height * GARLAND_WIDTH / garland.width)), Image.LANCZOS)
    garland.save(OUT / 'garland.webp', quality=82, method=6)


if __name__ == '__main__':
    main()
