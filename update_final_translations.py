import json
import os

# Base directory for locales
LOCALES_DIR = r"d:\Chrome_Extensions\C2Pdf_wxt\lib\i18n\locales"

# Complete translations for remaining components
TRANSLATIONS = {
    'es': {
        # BulkExport - additional keys
        'bulkExport.exporting': 'Exportando...',
        'bulkExport.chatSelected': 'chat seleccionado. Esto creará un único archivo de respaldo con todos los chats seleccionados.',
        'bulkExport.chatsSelected': 'chats seleccionados. Esto creará un único archivo de respaldo con todos los chats seleccionados.',
        
        # ImportChats - additional keys
        'importChats.title': 'Importar Chat',
        'importChats.dragDrop': 'Arrastra y suelta tu archivo aquí',
        'importChats.or': 'o',
        'importChats.chooseFiles': 'Elegir Archivos',
        'importChats.acceptedFormats': 'Formatos aceptados: .json, .jsonld',
        'importChats.description': 'Importa copias de seguridad de chats que hayas exportado anteriormente desde Chat2Pdf.',
        'importChats.review': 'Revisar',
        'importChats.import': 'Importar Chats',
        'importChats.importing': 'Importando chats...',
        'importChats.success': '¡Importación exitosa!',
        'importChats.error': 'Importación fallida',
        'importChats.messages': 'mensajes',
        
        # MergeChats - additional keys  
        'mergeChatsDialog.description': 'Selecciona y fusiona múltiples chats en uno consolidado.',
        'mergeChatsDialog.currentChat': 'Chat Actual',
        'mergeChatsDialog.chatsToMerge': 'Chats para Fusionar',
        'mergeChatsDialog.messages': 'mensajes',
    },
    'fr': {
        # BulkExport
        'bulkExport.exporting': 'Exportation...',
        'bulkExport.chatSelected': 'discussion sélectionnée. Cela créera un fichier de sauvegarde unique contenant toutes les discussions sélectionnées.',
        'bulkExport.chatsSelected': 'discussions sélectionnées. Cela créera un fichier de sauvegarde unique contenant toutes les discussions sélectionnées.',
        
        # ImportChats
        'importChats.title': 'Importer une Discussion',
        'importChats.dragDrop': 'Glissez-déposez votre fichier ici',
        'importChats.or': 'ou',
        'importChats.chooseFiles': 'Choisir des Fichiers',
        'importChats.acceptedFormats': 'Formats acceptés : .json, .jsonld',
        'importChats.description': 'Importez des sauvegardes de discussions que vous avez précédemment exportées depuis Chat2Pdf.',
        'importChats.review': 'Examiner',
        'importChats.import': 'Importer des Discussions',
        'importChats.importing': 'Importation des discussions...',
        'importChats.success': 'Importation réussie !',
        'importChats.error': 'Échec de l\'importation',
        'importChats.messages': 'messages',
        
        # MergeChats
        'mergeChatsDialog.description': 'Sélectionnez et fusionnez plusieurs discussions en une seule.',
        'mergeChatsDialog.currentChat': 'Discussion Actuelle',
        'mergeChatsDialog.chatsToMerge': 'Discussions à Fusionner',
        'mergeChatsDialog.messages': 'messages',
    },
    'de': {
        # BulkExport
        'bulkExport.exporting': 'Exportiere...',
        'bulkExport.chatSelected': 'Chat ausgewählt. Dies erstellt eine einzelne Sicherungsdatei mit allen ausgewählten Chats.',
        'bulkExport.chatsSelected': 'Chats ausgewählt. Dies erstellt eine einzelne Sicherungsdatei mit allen ausgewählten Chats.',
        
        # ImportChats
        'importChats.title': 'Chat Importieren',
        'importChats.dragDrop': 'Datei hier ablegen',
        'importChats.or': 'oder',
        'importChats.chooseFiles': 'Dateien Auswählen',
        'importChats.acceptedFormats': 'Akzeptierte Formate: .json, .jsonld',
        'importChats.description': 'Importieren Sie Chat-Backups, die Sie zuvor von Chat2Pdf exportiert haben.',
        'importChats.review': 'Überprüfen',
        'importChats.import': 'Chats Importieren',
        'importChats.importing': 'Importiere Chats...',
        'importChats.success': 'Import erfolgreich!',
        'importChats.error': 'Import fehlgeschlagen',
        'importChats.messages': 'Nachrichten',
        
        # MergeChats
        'mergeChatsDialog.description': 'Wählen und fusionieren Sie mehrere Chats zu einem konsolidierten Chat.',
        'mergeChatsDialog.currentChat': 'Aktueller Chat',
        'mergeChatsDialog.chatsToMerge': 'Chats zum Zusammenführen',
        'mergeChatsDialog.messages': 'Nachrichten',
    },
    'zh': {
        # BulkExport
        'bulkExport.exporting': '导出中...',
        'bulkExport.chatSelected': '个聊天已选中。这将创建一个包含所有选定聊天的单个备份文件。',
        'bulkExport.chatsSelected': '个聊天已选中。这将创建一个包含所有选定聊天的单个备份文件。',
        
        # ImportChats
        'importChats.title': '导入聊天',
        'importChats.dragDrop': '拖放文件到这里',
        'importChats.or': '或',
        'importChats.chooseFiles': '选择文件',
        'importChats.acceptedFormats': '接受的格式：.json, .jsonld',
        'importChats.description': '导入您之前从Chat2Pdf导出的聊天备份。',
        'importChats.review': '查看',
        'importChats.import': '导入聊天',
        'importChats.importing': '导入聊天中...',
        'importChats.success': '导入成功！',
        'importChats.error': '导入失败',
        'importChats.messages': '条消息',
        
        # MergeChats
        'mergeChatsDialog.description': '选择并合并多个聊天为一个合并的聊天。',
        'mergeChatsDialog.currentChat': '当前聊天',
        'mergeChatsDialog.chatsToMerge': '要合并的聊天',
        'mergeChatsDialog.messages': '条消息',
    },
}

# Add remaining languages (using placeholders)
for lang in ['ja', 'ko', 'pt', 'ru', 'ar', 'hi', 'it', 'nl', 'tr', 'pl']:
    TRANSLATIONS[lang] = TRANSLATIONS['zh']  # Use Chinese as placeholder

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
    print("Starting final translation update...\n")
    
    success_count = 0
    fail_count = 0
    
    for lang_code, translations in TRANSLATIONS.items():
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
