STATUS_CODES = {
    'success': 1,
    'failure': 0
}

IMPORT_FROM_FILE_DIR = "data/import_from_file/"
IMPORT_SINGLE_LANGUAGE_DATA_DIR = "data/import_single_language_data"

BACKUP_SERVER_DIR = "public/backups/by_server/"
BACKUP_USER_DIR = "public/backups/by_user/"
RESTORE_DIR = "public/restore/"
BACKUP_SCHEDULE_HOURS = 8
ADD_LOCAL_DATA_SCHEDULE_MINUTES = 5

EXPORT_FILE_DIR = "data/export_file/"

DOC_ALIGNMENT_FILE_DIR = "data/doc-alignment"

LANGS = [
    {
        'notation': 'vi'
    },
    {
        'notation': 'km'
    },
    {
        'notation': 'zh'
    },
    {
        'notation': 'lo'
    },
]

API_ALIGN_DOCUMENT = {
    'vi-lo': 'http://103.124.92.104:9988/scores/sentences'
}

API_SCORE_DOCUMENT = {
    'vi-lo': 'http://103.124.92.104:9988/scores/document',
    'vi-km': 'http://0.0.0.0:9111/doc_align',
    'km-vi': 'http://0.0.0.0:9111/doc_align',
    'vi-zh': 'http://0.0.0.0:9977/doc_align',
    'zh-vi': 'http://0.0.0.0:9977/doc_align' # change 0.0.0.0 to nmtuet.ddns.net in local pc
}

API_CRAWL = 'http://0.0.0.0:3010'

VERSION_COUNT_FILE_PATH='api/admin/backup/version_count'
CURRENT_VERSION_FILE_PATH='api/admin/backup/current_version'