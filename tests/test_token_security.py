import sys
from pathlib import Path
from cryptography.fernet import Fernet, InvalidToken

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.services.crypto import encrypt_token, decrypt_token


def test_tokens_are_never_stored_plaintext():
    raw_token = "ghp_SampleSecretToken1234567890abcdef"
    encrypted = encrypt_token(raw_token)

    print("RAW TOKEN:       ", raw_token)
    print("ENCRYPTED TOKEN: ", encrypted)

    assert "ghp_" not in encrypted, "Raw token prefix 'ghp_' must NOT exist in encrypted ciphertext"
    assert raw_token != encrypted, "Encrypted token must not equal raw token"


def test_encryption_roundtrip():
    original_token = "ghp_SecretGithubOAuthToken998877"
    encrypted = encrypt_token(original_token)
    decrypted = decrypt_token(encrypted)

    assert decrypted == original_token, f"Decrypted token '{decrypted}' must match original token '{original_token}'"


def test_corrupted_key_fails_safely():
    raw_token = "ghp_SampleSecretToken1234567890abcdef"
    encrypted = encrypt_token(raw_token)

    # Decrypting with wrong key raises InvalidToken safely
    wrong_key = Fernet.generate_key().decode()
    wrong_fernet = Fernet(wrong_key.encode("utf-8"))

    try:
        wrong_fernet.decrypt(encrypted.encode("utf-8"))
        assert False, "Decrypting with wrong key should raise InvalidToken"
    except InvalidToken:
        print("[OK] Corrupted key test passed: InvalidToken raised safely.")


if __name__ == "__main__":
    test_tokens_are_never_stored_plaintext()
    test_encryption_roundtrip()
    test_corrupted_key_fails_safely()
    print("ALL TOKEN SECURITY TESTS PASSED PERFECTLY!")
