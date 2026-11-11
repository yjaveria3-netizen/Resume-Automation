from cryptography.fernet import Fernet
from app.core.config import settings


def _get_fernet() -> Fernet:
    """Get Fernet instance using settings.ENCRYPTION_KEY."""
    raw_key = (settings.ENCRYPTION_KEY or "").strip()
    if not raw_key:
        raise ValueError("ENCRYPTION_KEY is not configured")
    try:
        return Fernet(raw_key.encode("utf-8"))
    except Exception as e:
        raise ValueError(f"ENCRYPTION_KEY must be a valid 32-byte url-safe base64 Fernet key: {e}") from e


def encrypt_token(plain_token: str) -> str:
    """Encrypt plain token string and return base64-encoded cipher text."""
    if not plain_token:
        return ""
    fernet = _get_fernet()
    encrypted_bytes = fernet.encrypt(plain_token.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")


def decrypt_token(cipher_token: str) -> str:
    """Decrypt base64-encoded cipher text and return original plain token string."""
    if not cipher_token:
        return ""
    fernet = _get_fernet()
    try:
        decrypted_bytes = fernet.decrypt(cipher_token.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Failed to decrypt token: {str(e)}") from e
