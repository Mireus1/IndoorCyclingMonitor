import re
from typing import Dict, List, Optional


class Step:
    def __init__(
        self,
        ftp_percent: Optional[int],
        duration_sec: int,
        rpm: Optional[int] = None,
        progressive_range: Optional[Dict[str, int]] = None
    ):
        self.ftp_percent = ftp_percent
        self.duration = duration_sec
        self.rpm = rpm
        self.progressive_range = progressive_range

    def to_dict(self):
        return {
            "ftp_percent": self.ftp_percent,
            "duration": self.duration,
            "rpm": self.rpm,
            "progressive_range": self.progressive_range
        }

class Workout:
    def __init__(self, raw_text: str):
        self.raw_text = raw_text
        self.steps: List[Step] = []
        self._parse()

    def _parse_duration(self, duration_str: str) -> int:
        match = re.match(r'(\d+)(min|sec)', duration_str)
        if match:
            value, unit = match.groups()
            return int(value) * 60 if unit == 'min' else int(value)
        return 0

    def _parse(self):
        progressive_pattern = re.compile(
            r'(?P<duration>\d+(?:min|sec))\s+from\s+'
            r'(?P<from_ftp>\d+)\s*to\s*(?P<to_ftp>\d+)\s*%\s*FTP',
            re.IGNORECASE
        )

        step_pattern = re.compile(
            r'(?P<duration>\d+(?:min|sec))\s*'
            r'(?:@\s*(?P<rpm>\d+)\s*rpm)?\s*,?\s*'
            r'(?P<ftp>\d+)\s*%\s*FTP',
            re.IGNORECASE
        )

        all_matches = []

        # Capture progressive steps with their position
        for match in progressive_pattern.finditer(self.raw_text):
            duration = self._parse_duration(match.group("duration"))
            step = Step(
                ftp_percent=None,
                duration_sec=duration,
                rpm=None,
                progressive_range={
                    "from": int(match.group("from_ftp")),
                    "to": int(match.group("to_ftp")),
                },
            )
            all_matches.append((match.start(), step))

        # Capture regular steps with position
        for match in step_pattern.finditer(self.raw_text):
            # Skip if it overlaps with a progressive pattern
            if progressive_pattern.match(self.raw_text[match.start():match.end()]):
                continue

            ftp = int(match.group("ftp"))
            duration = self._parse_duration(match.group("duration"))
            rpm = int(match.group("rpm")) if match.group("rpm") else None
            step = Step(
                ftp_percent=ftp,
                duration_sec=duration,
                rpm=rpm,
            )
            all_matches.append((match.start(), step))

        # Sort all steps by original text position
        all_matches.sort(key=lambda x: x[0])
        self.steps = [step for _, step in all_matches]

    def to_list(self):
        return [step.to_dict() for step in self.steps]

    def get_workout_steps(self):
        return [step.to_dict() for step in self.steps]
