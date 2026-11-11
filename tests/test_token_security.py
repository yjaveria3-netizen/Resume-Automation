import pytest
from sqlalchemy import text
from app.services.crypto import encrypt_token, decrypt_token
from app.models.github_account import GitHubAccount
from app.core.config import settings
from cryptography.fernet import Fernet


def test_token_encryption_and_decryption_roundtrip():
    """Validates that plaintext tokens are encrypted and can be decrypted accurately."""
    raw_token = "ghp_SampleSecretToken1234567890abcdef"
    encrypted = encrypt_token(raw_token)

    assert "ghp_" not in encrypted, "Raw token prefix 'ghp_' must NOT exist in encrypted ciphertext"
    assert raw_token != encrypted, "Encrypted token must not equal raw token"

    decrypted = decrypt_token(encrypted)
    assert decrypted == raw_token, "Decrypted token must exactly match the original raw token"


def test_github_account_storage_raw_column_not_plaintext(temp_db_session):
    """Stores token in GitHubAccount and asserts raw DB column is encrypted and never plaintext."""
    raw_token = "ghp_PersonalAccessTokenABC123XYZ999"
    encrypted = encrypt_token(raw_token)

    account = GitHubAccount(
        github_username="octocat_secure",
        github_user_id="1234567",
        encrypted_access_token=encrypted
    )
    temp_db_session.add(account)
    temp_db_session.commit()

    # Query raw database column directly using raw SQL
    result = temp_db_session.execute(
        text("SELECT encrypted_access_token FROM github_accounts WHERE github_username = :uname"),
        {"uname": "octocat_secure"}
    ).scalar_one()

    assert result != raw_token, "Database column must NOT store plaintext token"
    assert "ghp_" not in result, "Database column must NOT contain the sensitive token prefix"
    assert result == encrypted, "Database column must match the ciphertext"

    # Verify decryption from retrieved ORM model
    db_account = temp_db_session.query(GitHubAccount).filter_by(github_username="octocat_secure").first()
    assert decrypt_token(db_account.encrypted_access_token) == raw_token


def test_decryption_failure_with_mismatched_key(monkeypatch):
    """Mismatched encryption key must raise ValueError when decrypting."""
    raw_token = "ghp_CriticalSecretOAuthToken123"
    encrypted = encrypt_token(raw_token)

    # Change the encryption key to an unrelated Fernet key
    new_unrelated_key = Fernet.generate_key().decode("utf-8")
    monkeypatch.setattr(settings, "ENCRYPTION_KEY", new_unrelated_key)

    with pytest.raises(ValueError, match="Failed to decrypt token"):
        decrypt_token(encrypted)
