from __future__ import annotations

import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "cloudflare-release"
ALT_CONFIG = ROOT / "cloudflare" / "site.config.cloudflare.js"
VIDEOS = ROOT / "assets" / "videos"
FUNCTIONS = ROOT / "functions"


ROOT_FILES = [
    "index.html",
    "404.html",
    "styles.css",
    "script.js",
    "shader-background.js",
    "section-effects.js",
    "data.js",
    "site.config.js",
    "_headers",
    "robots.txt",
    "favicon.svg",
]

ASSET_FOLDERS = [
    "documents",
    "graphics",
    "images",
    "posters",
    "vendor",
]

MAX_PAGES_VIDEO_BYTES = 25 * 1024 * 1024


def copy_file(name: str) -> None:
    source = ROOT / name
    if source.exists():
        target = DIST / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


def copy_tree(name: str) -> None:
    source = ROOT / "assets" / name
    if source.exists():
        target = DIST / "assets" / name
        shutil.copytree(source, target, dirs_exist_ok=True)


def copy_small_videos() -> tuple[list[str], list[str]]:
    copied: list[str] = []
    skipped: list[str] = []

    if not VIDEOS.exists():
        return copied, skipped

    target_root = DIST / "assets" / "videos"
    target_root.mkdir(parents=True, exist_ok=True)

    for source in sorted(VIDEOS.iterdir()):
        if not source.is_file():
            continue

        if source.stat().st_size < MAX_PAGES_VIDEO_BYTES:
            target_file = target_root / source.name
            try:
                shutil.copy2(source, target_file)
            except PermissionError:
                if not target_file.exists():
                    raise
            copied.append(source.name)
        else:
            skipped.append(source.name)

    return copied, skipped


def main() -> None:
    DIST.mkdir(parents=True, exist_ok=True)

    for file_name in ROOT_FILES:
        copy_file(file_name)

    for folder_name in ASSET_FOLDERS:
        copy_tree(folder_name)

    copied_videos, skipped_videos = copy_small_videos()

    if FUNCTIONS.exists():
        shutil.copytree(FUNCTIONS, DIST / "functions", dirs_exist_ok=True)

    if ALT_CONFIG.exists():
        shutil.copy2(ALT_CONFIG, DIST / "site.config.js")

    print(f"Cloudflare dist prepared at: {DIST}")
    if copied_videos:
        print(f"Copied videos to Pages: {', '.join(copied_videos)}")
    if skipped_videos:
        print(f"Skipped oversized videos: {', '.join(skipped_videos)}")


if __name__ == "__main__":
    main()
