"""
Image enhancement logic using CLAHE (Contrast Limited Adaptive Histogram Equalization) for robust local enhancement.
Future: automated lighting, sharpness, color enhancement, watermarking, etc.
"""
from io import BytesIO
from PIL import Image
import numpy as np
import cv2
from typing import Optional, List, Dict
import requests
import base64
import replicate
import os
from dotenv import load_dotenv

# --- Load .env file and API keys from environment variables ---
load_dotenv()
IMGBB_API_KEY = os.environ.get("IMGBB_API_KEY", "")
REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN", "")

def polygon_to_mask(points: List[Dict[str, float]], shape):
    mask = np.zeros(shape[:2], dtype=np.uint8)
    if points and len(points) > 2:
        pts = np.array([[int(p['x']), int(p['y'])] for p in points], np.int32)
        pts = pts.reshape((-1, 1, 2))
        cv2.fillPoly(mask, [pts], 1)
    return mask


def upload_to_imgbb(image_bytes: bytes, imgbb_api_key: str) -> str:
    url = "https://api.imgbb.com/1/upload"
    payload = {
        "key": imgbb_api_key,
        "image": base64.b64encode(image_bytes).decode('utf-8')
    }
    response = requests.post(url, data=payload)
    response.raise_for_status()
    image_url = response.json()['data']['url']
    return image_url


def enhance_image(
    image_bytes: bytes,
    strength: float = 1.0,
    vignette_strength: float = 0.5,  # 0 (none) to 1 (max)
    warmth: float = 1.02,           # 1.0 = neutral, >1 = warmer
    saturation: float = 1.10,        # 1.0 = neutral, >1 = more vibrant
    sharpness: float = 1.0,
    floor_sharpness: float = 0,
    remove_glare: bool = False,
    floor_mask: list = None,
    premium: bool = False
) -> bytes:
    """
    Enhance the input image using user-adjustable parameters for strength, vignette, warmth, saturation, and sharpness.
    If premium=True, use Replicate's magic-image-refiner for advanced AI enhancement.
    """
    if premium:
        # --- Use Replicate's magic-image-refiner for premium enhancement ---
        image_url = upload_to_imgbb(image_bytes, IMGBB_API_KEY)
        client = replicate.Client(api_token=REPLICATE_API_TOKEN)
        output = client.run(
            "batouresearch/magic-image-refiner",
            input={
                "image": image_url,
                "resemblance": 0.75,
                "creativity": 0.25
            }
        )
        enhanced_img_url = output  # output is a URL to the enhanced image
        enhanced_img_bytes = requests.get(enhanced_img_url).content
        return enhanced_img_bytes

    # --- Normal enhancement pipeline continues below ---
    with BytesIO(image_bytes) as input_buffer:
        pil_img = Image.open(input_buffer).convert('RGB')
        img = np.array(pil_img)

    result = img.astype(np.float32)

    # --- PREMIUM ENHANCEMENT LOGIC ---
    # Stronger denoising, more vibrant color, and extra sharpening for premium users
    # (Replace or extend this block with your best AI model in production)
    # Boost color
    result = np.clip(result * 1.03, 0, 255)  # Slightly more vibrant
    # Extra gamma correction
    gamma = 1.25 + 0.15 * (strength-1)
    invGamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(256)]).astype("uint8")
    result = cv2.LUT(result.astype(np.uint8), table)
    # Extra sharpening
    kernel_strength = 1.6 + (sharpness - 1.0) * 2
    kernel = np.array([[0, -1, 0],
                       [-1, 4 * kernel_strength + 1, -1],
                       [0, -1, 0]]) / (4 * kernel_strength + 1)
    result = cv2.filter2D(result, -1, kernel)
    # Stronger denoising
    result = cv2.fastNlMeansDenoisingColored(result.astype(np.uint8), None, 8, 8, 7, 21)
    # Continue with normal pipeline below, but on already enhanced image

    # --- Normal pipeline continues below ---
    # Auto White Balance (Gray World Assumption)
    avg_b = np.mean(result[:,:,0])
    avg_g = np.mean(result[:,:,1])
    avg_r = np.mean(result[:,:,2])
    avg = (avg_b + avg_g + avg_r) / 3
    result[:,:,0] = np.clip(result[:,:,0] * (avg / avg_b), 0, 255)
    result[:,:,1] = np.clip(result[:,:,1] * (avg / avg_g), 0, 255)
    result[:,:,2] = np.clip(result[:,:,2] * (avg / avg_r), 0, 255)

    # Gamma Correction (brighten/darken midtones)
    gamma = 1.10 + 0.10 * (strength-1)  # let strength affect gamma a bit
    invGamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(256)]).astype("uint8")
    result = cv2.LUT(result.astype(np.uint8), table)

    # Saturation Boost (user adjustable)
    hsv = cv2.cvtColor(result, cv2.COLOR_RGB2HSV)
    hsv[:,:,1] = np.clip(hsv[:,:,1] * saturation, 0, 255)
    result = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)

    # --- Improved Warmth (color temperature shift using LAB space) ---
    # Convert to LAB color space for perceptual adjustment
    lab = cv2.cvtColor(result.astype(np.uint8), cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    # Adjust 'b' channel for blue/yellow (warm/cool)
    # warmth=1.0: neutral, >1.0: warmer, <1.0: cooler
    b = np.clip(b * warmth, 0, 255).astype(np.uint8)
    lab = cv2.merge((l, a, b))
    result = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    result = np.clip(result, 0, 255)

    # Increased clarity (local contrast using CLAHE)
    lab = cv2.cvtColor(result.astype(np.uint8), cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=0.8 * strength, tileGridSize=(16,16))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

    # Gentle sharpening (now user-adjustable)
    kernel_strength = 1.0 + (sharpness - 1.0) * 2  # 1.0=gentle, 2.0=strong, 0.5=soften
    kernel = np.array([[0, -1, 0],
                       [-1, 4 * kernel_strength + 1, -1],
                       [0, -1, 0]]) / (4 * kernel_strength + 1)
    sharpened = cv2.filter2D(enhanced_img, -1, kernel)

    # Blend with previous stage for natural look
    blended = cv2.addWeighted(sharpened, 0.7, result.astype(np.uint8), 0.3, 0)

    # --- Improved Vignette (user adjustable) ---
    rows, cols = blended.shape[:2]
    # Larger sigma for gentler vignette, scale by vignette_strength
    sigma = max(rows, cols) * (0.7 + 1.0 * vignette_strength)
    X_resultant_kernel = cv2.getGaussianKernel(cols, sigma)
    Y_resultant_kernel = cv2.getGaussianKernel(rows, sigma)
    kernel = Y_resultant_kernel * X_resultant_kernel.T
    mask = (kernel / np.max(kernel)) * (1-vignette_strength*0.5) + vignette_strength*0.5  # Blend less strongly
    vignette = np.copy(blended)
    for i in range(3):
        vignette[:,:,i] = vignette[:,:,i] * mask
    vignette = np.clip(vignette, 0, 255)

    # --- Tune Contrast/Normalization ---
    # Use a wider stretch for more dramatic effect
    alpha = 0  # min value after stretch
    beta = 255  # max value after stretch
    vignette = cv2.normalize(vignette, None, alpha=alpha, beta=beta, norm_type=cv2.NORM_MINMAX)

    # Optional: Denoising (make less aggressive)
    final = cv2.fastNlMeansDenoisingColored(vignette.astype(np.uint8), None, 4, 4, 7, 21)

    # Improved Glare Removal: Detect and inpaint overexposed regions
    if remove_glare:
        # Convert to LAB and extract L channel
        lab = cv2.cvtColor(final.astype(np.uint8), cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        # Threshold to find very bright regions (glare)
        _, glare_mask = cv2.threshold(l, 240, 255, cv2.THRESH_BINARY)
        # Inpaint glare using surrounding pixels
        inpainted = cv2.inpaint(final.astype(np.uint8), glare_mask, 7, cv2.INPAINT_TELEA)
        # Optionally, enhance contrast a bit
        lab = cv2.cvtColor(inpainted, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        lab = cv2.merge((l, a, b))
        result = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        result = np.clip(result, 0, 255)
    else:
        result = final

    # Apply sharpening to floor region if mask is present
    if floor_sharpness > 0 and floor_mask and len(floor_mask) > 2:
        mask = polygon_to_mask(floor_mask, result)
        # Sharpening kernel strength based on floor_sharpness
        k = 1.0 + floor_sharpness * 3.0  # scale for strong effect
        kernel = np.array([[0, -1, 0],
                           [-1, 4 * k + 1, -1],
                           [0, -1, 0]]) / (4 * k + 1)
        floor_sharpened = cv2.filter2D(result, -1, kernel)
        result[mask == 1] = floor_sharpened[mask == 1]

    # Convert back to PIL and bytes
    result_pil = Image.fromarray(result.astype(np.uint8))
    with BytesIO() as output_buffer:
        result_pil.save(output_buffer, format='JPEG')
        return output_buffer.getvalue()
