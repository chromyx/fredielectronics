"""Turn backup/data/projects.json into a clean projects.js for the design preview."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "backup" / "data" / "projects.json"
OUT = ROOT / "design-preview" / "projects.js"

# slug fragment -> (title sq, title en, category)
NAMES = [
    ("bashkiamat", "Ekran LED, Bashkia Mat", "LED display, Municipality of Mat", "led"),
    ("restaurimi-total-i-kqz", "Restaurimi total i KQZ", "Full refit of the Central Election Commission", "av"),
    ("video-wall-tek-akep", "Video wall, AKEP", "Video wall, AKEP", "led"),
    ("keshilli-bashkiak-durres", "Këshilli Bashkiak, Durrës", "Municipal Council, Durrës", "av"),
    ("led-wall-sarande", "LED wall për supermarket, Sarandë", "Supermarket LED wall, Sarandë", "led"),
    ("led-wall-world-vision", "LED wall, World Vision", "LED wall, World Vision", "led"),
    ("kamerave-termike", "Kamera termike, Forcat Detare", "Thermal cameras, Albanian Navy", "sec"),
    ("bashkise-tirane", "Salla e Këshillit Bashkiak, Tiranë", "City Council chamber, Tirana", "av"),
    ("prokuroria-elbasan", "Prokuroria Elbasan", "Elbasan Prosecution Office", "av"),
    ("sistem-konference", "Sistem konference", "Conference system", "av"),
    ("instalim-ups-20kva", "UPS 20 kVA", "20 kVA UPS installation", "power"),
    ("fondi-i-zhvillimit-korce", "Fondi Shqiptar i Zhvillimit, Korçë", "Albanian Development Fund, Korçë", "av"),
    ("universiteti-politeknik", "Universiteti Politeknik, audio-vizuale", "Polytechnic University, audio-visual", "av"),
    ("ledwall-p2-5", "LED wall P2.5", "P2.5 LED wall", "led"),
    ("led-wall-durres", "LED wall, Durrës", "LED wall, Durrës", "led"),
    ("ish-sigurimit", "Autoriteti i Dosjeve", "Authority on Former State Security Files", "av"),
    ("universiteti-bujqesor", "Universiteti Bujqësor i Tiranës", "Agricultural University of Tirana", "av"),
    ("bashkia-cerrik", "Bashkia Cërrik", "Municipality of Cërrik", "av"),
    ("ministria-e-arsimit", "Ministria e Arsimit", "Ministry of Education", "av"),
    ("universiteti-i-vlores", "Universiteti i Vlorës", "University of Vlora", "av"),
    ("fondi-zhvillimit-tirane", "Fondi Shqiptar i Zhvillimit, Tiranë", "Albanian Development Fund, Tirana", "av"),
    ("ama-video-wall", "Video wall, AMA", "Video wall, Audiovisual Media Authority", "led"),
    ("dress-code", "Dress Code, Astir", "Dress Code store, Astir", "led"),
    ("arrsh", "ARRSH", "Albanian Road Authority", "led"),
    ("politekniku-realizuar", "Politekniku", "Polytechnic University", "av"),
    ("bashkiadurres", "Bashkia Durrës", "Municipality of Durrës", "led"),
    ("galeria-e-arteve", "Galeria e Arteve, Tiranë", "National Gallery of Arts, Tirana", "av"),
    ("kryqeve-elektronike", "Kryqe LED, Rejsi Pharma", "LED pharmacy crosses, Rejsi Pharma", "led"),
    ("tripod-kalimi", "Kontroll aksesi, fabrikë në Korçë", "Access control, factory in Korçë", "sec"),
    ("ups-60kva", "UPS 60 & 80 kVA, Gjykata e Rrethit Tiranë", "60 & 80 kVA UPS, Tirana District Court", "power"),
    ("agjensi-marketingu", "Agjenci marketingu, Tiranë", "Marketing agency, Tirana", "led"),
    ("gjykates-se-apelit", "Kontroll aksesi, Gjykata e Apelit", "Access control, Court of Appeal", "sec"),
    ("hidrovoret", "Kamera sigurie, Hidrovoret e Lezhës", "CCTV, Lezhë pumping stations", "sec"),
]


def clean_images(images):
    seen, out = set(), []
    for img in images:
        key = re.sub(r"-scaled(\.\w+)$", r"\1", img)
        # Prefer the non-"-scaled" file; skip duplicates of the same photo.
        if "-scaled" in img or key in seen:
            continue
        if not (ROOT / "backup" / img).exists():
            continue
        seen.add(key)
        out.append("../backup/" + img)
    return out


def clean_text(text):
    text = re.sub(r"\s+", " ", text).strip()
    # drop leftovers from embedded video players on the old site
    text = re.sub(r"\s*Playlist \d+ Videos.*$", "", text)
    return text[:700].rsplit(" ", 1)[0] + "…" if len(text) > 700 else text


def main():
    raw = json.loads(SRC.read_text("utf-8"))
    by_slug = {p["slug"]: p for p in raw}
    out = []
    for frag, sq, en, cat in NAMES:
        match = next((p for s, p in by_slug.items() if frag in s), None)
        if not match:
            print("missing", frag)
            continue
        imgs = clean_images(match["images"])
        out.append({"slug": match["slug"], "sq": sq, "en": en, "cat": cat,
                    "text": clean_text(match["text"]), "images": imgs})
    OUT.write_text("window.PROJECTS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n", "utf-8")
    print(len(out), "projects;", sum(len(p["images"]) for p in out), "images")
    for p in out:
        print(len(p["images"]), p["sq"])


main()
