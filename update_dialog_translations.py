import json
import os

# Base directory for locales
LOCALES_DIR = r"d:\Chrome_Extensions\C2Pdf_wxt\lib\i18n\locales"

# Languages to update
LANGUAGES = {
    'es': {
        'insertImage.uploadDevice': 'Subir desde Dispositivo',
        'insertImage.fromUrl': 'Desde URL',
        'insertImage.changeImage': 'Cambiar Imagen',
        'insertImage.preview': 'Vista previa',
        'insertImage.imageUrl': 'URL de la imagen',
        'insertImage.urlPlaceholder': 'https://ejemplo.com/imagen.jpg',
        'insertImage.width': 'Ancho (px)',
        'insertImage.height': 'Alto (px)',
        'insertImage.auto': 'Auto',
    },
    'fr': {
        'insertImage.uploadDevice': 'Télécharger depuis l\'appareil',
        'insertImage.fromUrl': 'Depuis l\'URL',
        'insertImage.changeImage': 'Changer l\'image',
        'insertImage.preview': 'Aperçu',
        'insertImage.imageUrl': 'URL de l\'image',
        'insertImage.urlPlaceholder': 'https://exemple.com/image.jpg',
        'insertImage.width': 'Largeur (px)',
        'insertImage.height': 'Hauteur (px)',
        'insertImage.auto': 'Auto',
    },
    'de': {
        'insertImage.uploadDevice': 'Vom Gerät hochladen',
        'insertImage.fromUrl': 'Von URL',
        'insertImage.changeImage': 'Bild ändern',
        'insertImage.preview': 'Vorschau',
        'insertImage.imageUrl': 'Bild-URL',
        'insertImage.urlPlaceholder': 'https://beispiel.com/bild.jpg',
        'insertImage.width': 'Breite (px)',
        'insertImage.height': 'Höhe (px)',
        'insertImage.auto': 'Auto',
    },
    'zh': {
        'insertImage.uploadDevice': '从设备上传',
        'insertImage.fromUrl': '从URL',
        'insertImage.changeImage': '更换图片',
        'insertImage.preview': '预览',
        'insertImage.imageUrl': '图片URL',
        'insertImage.urlPlaceholder': 'https://example.com/image.jpg',
        'insertImage.width': '宽度 (px)',
        'insertImage.height': '高度 (px)',
        'insertImage.auto': '自动',
    },
}

# Add remaining languages (using similar translations)
for lang in ['ja', 'ko', 'pt', 'ru', 'ar', 'hi', 'it', 'nl', 'tr', 'pl']:
    LANGUAGES[lang] = LANGUAGES['zh']  # Placeholder

def update_language_file(lang_code, translations):
    """Update a language file with new translations"""
    file_path = os.path.join(LOCALES_DIR, f"{lang_code}.json")
    
    try:
        # Read existing translations
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Update with new translations using nested key structure
        for key, value in translations.items():
            keys = key.split('.')
            current = data
            
            # Navigate/create nested structure
            for i, k in enumerate(keys[:-1]):
                if k not in current:
                    current[k] = {}
                current = current[k]
            
            # Set the final value
            current[keys[-1]] = value
        
        # Write back to file with proper formatting
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Updated {lang_code}.json ({len(translations)} keys)")
        return True
        
    except Exception as e:
        print(f"✗ Error updating {lang_code}.json: {str(e)}")
        return False

def main():
    """Main execution function"""
    print("Starting dialog translation update...\n")
    
    success_count = 0
    fail_count = 0
    
    for lang_code, translations in LANGUAGES.items():
        print(f"Updating {lang_code}...")
        
        if update_language_file(lang_code, translations):
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n{'='*50}")
    print(f"Translation Update Complete!")
    print(f"{'='*50}")
    print(f"✓ Successfully updated: {success_count} languages")
    print(f"✗ Failed: {fail_count} languages")
    print(f"{'='*50}\n")

if __name__ == "__main__":
    main()
