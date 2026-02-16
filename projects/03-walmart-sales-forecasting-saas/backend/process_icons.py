from PIL import Image
import os

ARTIFACT_PATH = "/home/ibadat/.gemini/antigravity/brain/0009e509-4f20-4387-9612-40d048d8cdf1/app_icon_512_1771262582044.png"
OUTPUT_DIR = "/media/ibadat/NewVolume/DATA SCIENCE/ML/DATASCIENCE PROJECTS/Demand Sales Walmart Forecasting/ml-forecast-saas/frontend/public"

def process_icons():
    if not os.path.exists(ARTIFACT_PATH):
        print(f"Artifact not found: {ARTIFACT_PATH}")
        return

    img = Image.open(ARTIFACT_PATH)
    
    # Ensure RGBA
    img = img.convert("RGBA")
    
    # 512x512
    icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(os.path.join(OUTPUT_DIR, "pwa-512x512.png"))
    print("Saved pwa-512x512.png")
    
    # 192x192
    icon_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(OUTPUT_DIR, "pwa-192x192.png"))
    print("Saved pwa-192x192.png")
    
    # Apple Touch Icon (180x180)
    icon_apple = img.resize((180, 180), Image.Resampling.LANCZOS)
    icon_apple.save(os.path.join(OUTPUT_DIR, "apple-touch-icon.png"))
    print("Saved apple-touch-icon.png")

    # Favicon (64x64 -> .ico)
    icon_fav = img.resize((64, 64), Image.Resampling.LANCZOS)
    icon_fav.save(os.path.join(OUTPUT_DIR, "favicon.ico"), format='ICO')
    print("Saved favicon.ico")

if __name__ == "__main__":
    process_icons()
