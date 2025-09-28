#!/usr/bin/env python3
"""
Publish a local album folder to Cloudflare R2 and update the site manifests.

What this script does:
1) Upload all images from a local folder to R2 under images/travel/<slug>/
2) Generate or update _data/albums/<slug>.yml with entries (path + alt)
3) Create _albums/<slug>.md if missing, wired to data_key + teaser

Environment variables (required):
  R2_ACCOUNT_ID          e.g. abcdef1234567890
  R2_ACCESS_KEY_ID       S3 access key for R2
  R2_SECRET_ACCESS_KEY   S3 secret for R2
  R2_BUCKET              R2 bucket name (public read enabled)

Optional:
  CDN_BASE               e.g. https://img.utokyobwchen.men

Usage example:
  python scripts/publish_album.py \
    --album-dir ./_local_albums/tgs2025 \
    --slug tgs2025 \
    --title "Tokyo Game Show 2025" \
    --date 2025-09-27

This is a local helper. Commit and push after running.
"""

from __future__ import annotations

import argparse
import datetime as dt
import mimetypes
import os
import sys
from pathlib import Path
from typing import List, Dict

import boto3
import yaml


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".JPG", ".JPEG", ".PNG", ".GIF", ".WEBP", ".AVIF"}


def find_images(root: Path) -> List[Path]:
    files = []
    for p in sorted(root.rglob("*")):
        if p.is_file() and p.suffix in IMAGE_EXTS:
            files.append(p)
    return files


def guess_content_type(path: Path) -> str:
    typ, _ = mimetypes.guess_type(str(path))
    return typ or "application/octet-stream"


def ensure_parent(file_path: Path) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)


def write_yaml_list(file_path: Path, entries: List[Dict]) -> None:
    ensure_parent(file_path)
    with file_path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(entries, f, sort_keys=False, allow_unicode=True)


def render_album_md(slug: str, title: str, date_str: str, teaser_url: str) -> str:
    front_matter = {
        "title": title,
        "date": date_str,
        "header": {"teaser": teaser_url},
        "dir": "",
        "data_key": f"albums.{slug}",
        "author_profile": False,
    }
    # Minimal front matter writer
    lines = ["---"]
    for k, v in front_matter.items():
        if isinstance(v, dict):
            lines.append(f"{k}:")
            for kk, vv in v.items():
                lines.append(f"  {kk}: {vv}")
        else:
            lines.append(f"{k}: {v}")
    lines.append("---")
    lines.append("")
    lines.append("{% include auto_gallery.html data_key=page.data_key caption=page.title layout=\"masonry\" %}")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser(description="Publish album to R2 and update manifests")
    ap.add_argument("--album-dir", required=True, help="Local folder containing the album images")
    ap.add_argument("--slug", required=True, help="Album slug, e.g. tgs2025")
    ap.add_argument("--title", required=True, help="Album title")
    ap.add_argument("--date", default=str(dt.date.today()), help="Album date (YYYY-MM-DD), default today")
    ap.add_argument("--dest-prefix", default="images/travel", help="Destination prefix in bucket")
    ap.add_argument("--teaser", default="", help="Teaser filename within the album-dir (optional)")
    ap.add_argument("--dry-run", action="store_true", help="Do not upload or write files")

    args = ap.parse_args()

    album_dir = Path(args.album_dir).expanduser().resolve()
    if not album_dir.exists() or not album_dir.is_dir():
        print(f"[ERROR] Album dir not found: {album_dir}", file=sys.stderr)
        sys.exit(1)

    images = find_images(album_dir)
    if not images:
        print(f"[ERROR] No images found in: {album_dir}", file=sys.stderr)
        sys.exit(1)

    # R2 env
    account_id = os.environ.get("R2_ACCOUNT_ID", "").strip()
    access_key = os.environ.get("R2_ACCESS_KEY_ID", "").strip()
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY", "").strip()
    bucket = os.environ.get("R2_BUCKET", "").strip()
    cdn_base = os.environ.get("CDN_BASE", "").strip()

    if not (account_id and access_key and secret_key and bucket):
        print("[ERROR] Missing R2 env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET", file=sys.stderr)
        sys.exit(1)

    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

    # Upload
    uploaded_keys: List[str] = []
    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )

    dest_base = f"{args.dest_prefix.rstrip('/')}/{args.slug}"
    print(f"[INFO] Uploading {len(images)} images to r2://{bucket}/{dest_base}/")

    for img in images:
        rel = img.name  # flat into album folder; if need, can keep subdirs via img.relative_to(album_dir)
        key = f"{dest_base}/{rel}"
        ctype = guess_content_type(img)
        if args.dry_run:
            print(f"[DRY] put_object {key} ({ctype})")
        else:
            with img.open("rb") as fh:
                s3.put_object(Bucket=bucket, Key=key, Body=fh, ContentType=ctype)
        uploaded_keys.append(key)

    uploaded_keys.sort()

    # Build manifest entries (prefer path for cdn_base substitution)
    entries: List[Dict] = []
    for key in uploaded_keys:
        alt = Path(key).name.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").strip()
        entries.append({"path": key, "alt": alt})

    # Write _data/albums/<slug>.yml
    data_file = Path("_data/albums") / f"{args.slug}.yml"
    if args.dry_run:
        print(f"[DRY] write manifest: {data_file} with {len(entries)} items")
    else:
        write_yaml_list(data_file, entries)
        print(f"[OK] Wrote manifest: {data_file}")

    # Create album page if missing
    album_md = Path("_albums") / f"{args.slug}.md"
    if not album_md.exists():
        # Pick teaser
        teaser_key = ""
        if args.teaser:
            candidate = Path(args.teaser).name
            for key in uploaded_keys:
                if key.endswith("/" + candidate):
                    teaser_key = key
                    break
        if not teaser_key and uploaded_keys:
            teaser_key = uploaded_keys[0]

        if cdn_base and teaser_key:
            teaser_url = f"{cdn_base.rstrip('/')}/{teaser_key}"
        else:
            # Fallback to key only if cdn_base missing; site will attempt to prefix later
            teaser_url = teaser_key

        content = render_album_md(
            slug=args.slug,
            title=args.title,
            date_str=args.date,
            teaser_url=teaser_url,
        )
        if args.dry_run:
            print(f"[DRY] create album page: {album_md}")
        else:
            ensure_parent(album_md)
            album_md.write_text(content, encoding="utf-8")
            print(f"[OK] Created album page: {album_md}")
    else:
        print(f"[SKIP] Album page exists: {album_md}")

    print(
        "\nDone. Next steps:\n"
        "  - git add _data/albums/*.yml _albums/*.md\n"
        f"  - git commit -m 'feat(albums): publish {args.slug}'\n"
        "  - git push\n"
    )


if __name__ == "__main__":
    main()


