"""
Utility functions for image processing.
"""
def read_image(file_path: str) -> bytes:
    """
    Read an image file as bytes.
    """
    with open(file_path, "rb") as f:
        return f.read()

def save_image(image_bytes: bytes, file_path: str):
    """
    Save bytes as an image file.
    """
    with open(file_path, "wb") as f:
        f.write(image_bytes)
