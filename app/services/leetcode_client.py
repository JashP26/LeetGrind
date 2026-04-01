import json
import os
from typing import Any

import requests

DEFAULT_BASE_URL = "https://alfa-leetcode-api.onrender.com"


class LeetCodeClient:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or os.getenv("LEETCODE_API_BASE_URL", DEFAULT_BASE_URL)).rstrip("/")

    def _request_json(self, path: str) -> dict[str, Any] | None:
        url = f"{self.base_url}/{path.lstrip('/')}"
        try:
            response = requests.get(url, timeout=12)
        except requests.RequestException:
            return None

        if response.status_code != 200:
            return None

        try:
            data = response.json()
        except ValueError:
            return None

        if isinstance(data, dict):
            return data
        return None

    @staticmethod
    def _extract_int(payload: dict[str, Any], candidate_keys: list[str]) -> int:
        for key in candidate_keys:
            if key in payload and isinstance(payload[key], (int, float)):
                return int(payload[key])
        return 0

    def fetch_snapshot(self, username: str) -> dict[str, Any]:
        payloads = [
            self._request_json(f"{username}"),
            self._request_json(f"userProfile/{username}"),
            self._request_json(f"solved/{username}"),
        ]
        merged: dict[str, Any] = {}
        for payload in payloads:
            if payload:
                merged.update(payload)

        if not merged:
            raise ValueError("Could not fetch data from LeetCode API")

        easy_solved = self._extract_int(merged, ["easySolved", "easy", "easy_solved"])
        medium_solved = self._extract_int(merged, ["mediumSolved", "medium", "medium_solved"])
        hard_solved = self._extract_int(merged, ["hardSolved", "hard", "hard_solved"])
        total_solved = self._extract_int(merged, ["totalSolved", "solvedProblem", "total", "total_solved"])

        if total_solved == 0:
            total_solved = easy_solved + medium_solved + hard_solved

        return {
            "total_solved": total_solved,
            "easy_solved": easy_solved,
            "medium_solved": medium_solved,
            "hard_solved": hard_solved,
            "raw_payload": json.dumps(merged),
        }
