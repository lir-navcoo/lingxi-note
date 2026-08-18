#!/bin/sh
set -eu

ENV_FILE="${1:-.env.docker}"

if [ -f "$ENV_FILE" ]; then
  echo "$ENV_FILE 已存在，未覆盖。"
  exit 0
fi

python3 - "$ENV_FILE" <<'PY'
import base64
import hashlib
import hmac
import json
import secrets
import sys
import time

path = sys.argv[1]
secret = secrets.token_urlsafe(48)
now = int(time.time())


def encode(value):
    raw = json.dumps(value, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def token(role):
    header = encode({"alg": "HS256", "typ": "JWT"})
    payload = encode({"role": role, "iss": "supabase", "iat": now, "exp": now + 315360000})
    signature = base64.urlsafe_b64encode(
        hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    ).decode().rstrip("=")
    return f"{header}.{payload}.{signature}"

with open(path, "w", encoding="utf-8") as file:
    file.write(
        "APP_PORT=8081\n"
        "SUPABASE_PORT=8000\n"
        f"POSTGRES_PASSWORD={secrets.token_urlsafe(32)}\n"
        f"SUPABASE_JWT_SECRET={secret}\n"
        f"SUPABASE_ANON_KEY={token('anon')}\n"
        f"SUPABASE_SERVICE_ROLE_KEY={token('service_role')}\n"
        f"AUTH_JWT_SECRET={secrets.token_urlsafe(48)}\n"
        "SUPABASE_STORAGE_BUCKET=note-media\n"
        "AI_GATEWAY_API_KEY=\n"
    )
PY

chmod 600 "$ENV_FILE"
echo "已生成 $ENV_FILE。"
