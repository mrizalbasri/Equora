from types import SimpleNamespace

import pytest

from app.etl import register_education


@pytest.mark.parametrize("database", ["tera", "postgres", "equora_test"])
def test_registry_cli_rejects_other_databases_without_disclosing_credentials(
    monkeypatch, capsys, database
):
    url = f"postgresql+psycopg://fixture:synthetic-password@localhost/{database}"
    monkeypatch.setattr(
        register_education, "get_settings", lambda: SimpleNamespace(database_url=url)
    )

    def unexpected_connection(*args):
        pytest.fail("Rejected targets must never create an engine")

    monkeypatch.setattr(register_education, "build_engine", unexpected_connection)
    with pytest.raises(SystemExit) as exc:
        register_education.main(
            ["--source-id", "fixture", "--file", "synthetic.xlsx", "--education-level", "SD"]
        )
    assert exc.value.code == 2
    error = capsys.readouterr().err
    assert "dedicated equora database" in error
    assert "synthetic-password" not in error


@pytest.mark.parametrize("url", [None, "invalid-url"])
def test_registry_cli_rejects_missing_or_malformed_configuration(monkeypatch, capsys, url):
    monkeypatch.setattr(
        register_education, "get_settings", lambda: SimpleNamespace(database_url=url)
    )
    with pytest.raises(SystemExit) as exc:
        register_education.main(
            ["--source-id", "fixture", "--file", "synthetic.xlsx", "--education-level", "SD"]
        )
    assert exc.value.code == 2
    assert "dedicated equora database" in capsys.readouterr().err
