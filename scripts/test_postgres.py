"""Run opt-in backend checks using only the dedicated test URL from local configuration."""

import os
import subprocess
import sys
from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url

backend = Path(__file__).resolve().parents[1] / "backend"


class TestConfiguration(BaseSettings):
    model_config = SettingsConfigDict(env_file=backend / ".env", extra="ignore")
    test_database_url: SecretStr | None = None


configured = TestConfiguration().test_database_url
url = configured.get_secret_value() if configured else None
if not url or make_url(url).database != "equora_test":
    raise SystemExit("Configure TEST_DATABASE_URL for the dedicated equora_test database")
environment = os.environ.copy()
environment["TEST_DATABASE_URL"] = url
raise SystemExit(
    subprocess.call([sys.executable, "-m", "pytest", *sys.argv[1:]], cwd=backend, env=environment)
)
