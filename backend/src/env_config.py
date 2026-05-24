from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

DEFAULT_ALLOWED_ORIGINS: set[str] = {"http://localhost:5173"}


def get_env_value(env: Any, key: str, default: str | None = None) -> str | None:
    """Read a string value from the Cloudflare env object."""
    if isinstance(env, dict):
        value = env.get(key)
    else:
        value = getattr(env, key, None)

    if value is None:
        return default
    if isinstance(value, str):
        return value
    return str(value)


def get_allowed_origins(env: Any) -> set[str]:
    """Return the configured CORS allow-list."""
    raw_origins = get_env_value(
        env,
        "ALLOWED_ORIGINS",
        ",".join(sorted(DEFAULT_ALLOWED_ORIGINS)),
    )
    if not raw_origins:
        return set(DEFAULT_ALLOWED_ORIGINS)

    allowed_origins = {
        origin.strip()
        for origin in raw_origins.split(",")
        if origin.strip()
    }
    return allowed_origins or set(DEFAULT_ALLOWED_ORIGINS)


def is_origin_allowed(origin: str | None, allowed_origins: set[str]) -> bool:
    """Check whether a request origin is allowed to call the API."""
    if not origin:
        return False

    normalized_origin = origin.rstrip('/')
    if '*' in allowed_origins or normalized_origin in allowed_origins:
        return True

    parsed_origin = urlparse(normalized_origin)
    origin_scheme = parsed_origin.scheme
    origin_hostname = parsed_origin.hostname or ''
    origin_port = parsed_origin.port

    for allowed_origin in allowed_origins:
        normalized_allowed_origin = allowed_origin.rstrip('/')
        parsed_allowed_origin = urlparse(normalized_allowed_origin)
        allowed_scheme = parsed_allowed_origin.scheme
        allowed_hostname = parsed_allowed_origin.hostname or ''
        allowed_port = parsed_allowed_origin.port

        if not allowed_hostname.startswith('*.'):
            continue
        if allowed_scheme and allowed_scheme != origin_scheme:
            continue
        if allowed_port is not None and allowed_port != origin_port:
            continue

        required_suffix = allowed_hostname[1:]
        if origin_hostname.endswith(required_suffix) and origin_hostname != allowed_hostname[2:]:
            return True

    return False
