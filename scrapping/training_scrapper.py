import argparse
import json
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

from workout import Workout


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip().lower())
    return cleaned.strip("_") or "workout"

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape workout steps from a What's On Zwift page."
    )
    parser.add_argument("url", help="Workout URL to scrape")
    parser.add_argument(
        "--out-dir",
        default=str(Path(__file__).resolve().parent / "workouts"),
        help="Directory to write workout JSON files",
    )
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    response = requests.get(args.url, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    created = 0
    for article in soup.select("article[id]"):
        article_id = article["id"].strip()

        textbars = article.select("div.textbar")
        if not textbars:
            continue

        steps = [tb.get_text(" ", strip=True) for tb in textbars]
        workout = Workout("\n".join(steps))

        output_path = out_dir / f"{slugify(article_id)}.json"
        with output_path.open("w", encoding="utf-8") as handle:
            json.dump(workout.to_list(), handle, indent=2, ensure_ascii=True)
            handle.write("\n")
        created += 1
        print(f"Wrote {output_path}")

    print(f"Done. Wrote {created} workouts to {out_dir}")


if __name__ == "__main__":
    main()
