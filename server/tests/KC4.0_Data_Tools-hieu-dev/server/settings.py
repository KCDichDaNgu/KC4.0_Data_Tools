import pkg_resources

from kombu import Exchange, Queue
from tlds import tld_set


HOUR = 60 * 60


class Defaults(object):
    DEBUG = False
    TESTING = False
    SEND_MAIL = True
    LANGUAGES = {
        'en': 'English',
        'fr': 'Français',
        'es': 'Español',
        'pt': 'Português',
        'sr': 'Српски',
    }
    DEFAULT_LANGUAGE = 'en'
    SECRET_KEY = 'Default uData secret key'
    CONTACT_EMAIL = 'contact@example.org'
    TERRITORIES_EMAIL = 'territories@example.org'

    MONGODB_HOST = 'mongodb://localhost:27017/data-tool'
    MONGODB_CONNECT = False  # Lazy connexion for Fork-safe usage

    MONGODB_DB = 'data-tool'
    MONGODB_PORT = 27017

    # Elasticsearch configuration
    ELASTICSEARCH_URL = 'localhost:9200'
    ELASTICSEARCH_INDEX_BASENAME = 'data-tool'
    ELASTICSEARCH_REFRESH_INTERVAL = '1s'
    # ES Query/default timeout.
    ELASTICSEARCH_TIMEOUT = 10  # Same default as elasticsearch library
    # ES index timeout (should be longer)
    ELASTICSEARCH_INDEX_TIMEOUT = 20

    # BROKER_TRANSPORT = 'redis'
    CELERY_BROKER_URL = 'redis://localhost:6379'
    CELERY_BROKER_TRANSPORT_OPTIONS = {
        'fanout_prefix': True,
        'fanout_patterns': True,
    }
    CELERY_RESULT_BACKEND = 'redis://localhost:6379'
    CELERY_RESULT_EXPIRES = 6 * HOUR  # Results are kept 6 hours
    CELERY_TASK_IGNORE_RESULT = True
    CELERY_TASK_SERIALIZER = 'pickle'
    CELERY_RESULT_SERIALIZER = 'pickle'
    CELERY_ACCEPT_CONTENT = ['pickle', 'json']
    CELERY_WORKER_HIJACK_ROOT_LOGGER = False
    CELERY_BEAT_SCHEDULER = 'udata.tasks.Scheduler'
    CELERY_MONGODB_SCHEDULER_COLLECTION = "schedules"
    CELERY_MONGODB_SCHEDULER_CONNECTION_ALIAS = "udata_scheduler"

    # Default celery routing
    CELERY_TASK_DEFAULT_QUEUE = 'default'
    CELERY_TASK_QUEUES = (
        # Default queue (on default exchange)
        Queue('default', routing_key='task.#'),
        # High priority for urgent tasks
        Queue('high', Exchange('high', type='topic'), routing_key='high.#'),
        # Low priority for slow tasks
        Queue('low', Exchange('low', type='topic'), routing_key='low.#'),
    )
    CELERY_TASK_DEFAULT_EXCHANGE = 'default'
    CELERY_TASK_DEFAULT_EXCHANGE_TYPE = 'topic'
    CELERY_TASK_DEFAULT_ROUTING_KEY = 'task.default'
    CELERY_TASK_ROUTES = 'udata.tasks.router'

    CACHE_KEY_PREFIX = 'udata-cache'
    CACHE_TYPE = 'redis'

    PLUGINS = []

    # Flask mail settings

    MAIL_DEFAULT_SENDER = 'webmaster@udata'

    # Flask security settings

    SECURITY_TRACKABLE = True
    SECURITY_REGISTERABLE = True
    SECURITY_CONFIRMABLE = True
    SECURITY_RECOVERABLE = True
    SECURITY_CHANGEABLE = True

    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_LENGTH_MIN = 8
    SECURITY_PASSWORD_REQUIREMENTS_LOWERCASE = True
    SECURITY_PASSWORD_REQUIREMENTS_DIGITS = True
    SECURITY_PASSWORD_REQUIREMENTS_UPPERCASE = True
    SECURITY_PASSWORD_REQUIREMENTS_SYMBOLS = False

    SECURITY_PASSWORD_SALT = 'Default uData secret password salt'
    SECURITY_CONFIRM_SALT = 'Default uData secret confirm salt'
    SECURITY_RESET_SALT = 'Default uData secret reset salt'
    SECURITY_REMEMBER_SALT = 'Default uData remember salt'

    # Flask WTF settings
    CSRF_SESSION_KEY = 'Default uData csrf key'

    # Flask-Sitemap settings
    # TODO: chose between explicit or automagic for params-less endpoints
    # SITEMAP_INCLUDE_RULES_WITHOUT_PARAMS = False
    SITEMAP_BLUEPRINT_URL_PREFIX = None

    AUTO_INDEX = True

    STATIC_DIRS = []

    # OAuth 2 settings
    OAUTH2_PROVIDER_ERROR_ENDPOINT = 'oauth.oauth_error'
    OAUTH2_REFRESH_TOKEN_GENERATOR = True
    OAUTH2_TOKEN_EXPIRES_IN = {
        'authorization_code': 30 * 24 * HOUR,
        'implicit': 10 * 24 * HOUR,
        'password': 30 * 24 * HOUR,
        'client_credentials': 30 * 24 * HOUR
    }

    HARVEST_PREVIEW_MAX_ITEMS = 20
    # Harvesters are scheduled at midnight by default
    HARVEST_DEFAULT_SCHEDULE = '0 0 * * *'

    # The number of days of harvest jobs to keep (ie. number of days of history kept)
    HARVEST_JOBS_RETENTION_DAYS = 365

    # The number of days since last harvesting date when a missing dataset is archived
    HARVEST_AUTOARCHIVE_GRACE_DAYS = 7

    # Lists levels that shouldn't be indexed
    SPATIAL_SEARCH_EXCLUDE_LEVELS = tuple()

    ACTIVATE_TERRITORIES = False
    # The order is important to compute parents/children, smaller first.
    HANDLED_LEVELS = tuple()

    LINKCHECKING_ENABLED = True
    # Resource types ignored by linkchecker
    LINKCHECKING_UNCHECKED_TYPES = ('api', )
    LINKCHECKING_IGNORE_DOMAINS = []
    LINKCHECKING_IGNORE_PATTERNS = ['format=shp']
    LINKCHECKING_MIN_CACHE_DURATION = 60  # in minutes
    LINKCHECKING_MAX_CACHE_DURATION = 1080  # in minutes (1 week)
    LINKCHECKING_UNAVAILABLE_THRESHOLD = 100
    LINKCHECKING_DEFAULT_LINKCHECKER = 'no_check'

    # Ignore some endpoint from API tracking
    # By default ignore the 3 most called APIs
    TRACKING_BLACKLIST = [
        'api.notifications',
        'api.check_dataset_resource',
        'api.avatar',
    ]

    # Optimize uploaded images
    FS_IMAGES_OPTIMIZE = True

    # Default resources extensions whitelist
    ALLOWED_RESOURCES_EXTENSIONS = [
        # Base
        'csv', 'txt', 'json', 'pdf', 'xml', 'rtf', 'xsd',
        # OpenOffice
        'ods', 'odt', 'odp', 'odg',
        # Microsoft Office
        'xls', 'xlsx', 'doc', 'docx', 'pps', 'ppt',
        # Archives
        'tar', 'gz', 'tgz', 'rar', 'zip', '7z', 'xz', 'bz2',
        # Images
        'jpeg', 'jpg', 'jpe', 'gif', 'png', 'dwg', 'svg', 'tiff', 'ecw', 'svgz', 'jp2',
        # Geo
        'shp', 'kml', 'kmz', 'gpx', 'shx', 'ovr', 'geojson', 'gpkg',
        # Meteorology
        'grib2',
        # Misc
        'dbf', 'prj', 'sql', 'epub', 'sbn', 'sbx', 'cpg', 'lyr', 'owl', 'dxf',
        # RDF
        'rdf', 'ttl', 'n3',
    ]

    # How much time upload chunks are kept before cleanup
    UPLOAD_MAX_RETENTION = 24 * HOUR

    # Avatar providers parameters
    # Overrides themes and default parameters
    # if set to anything else than `None`
    ###########################################################################
    # avatar provider used to render user avatars
    AVATAR_PROVIDER = None
    # Number of blocks used by the internal provider
    AVATAR_INTERNAL_SIZE = None
    # List of foreground colors used by the internal provider
    AVATAR_INTERNAL_FOREGROUND = None
    # Background color used by the internal provider
    AVATAR_INTERNAL_BACKGROUND = None
    # Padding (in percent) used by the internal provider
    AVATAR_INTERNAL_PADDING = None
    # Skin (set) used by the robohash provider
    AVATAR_ROBOHASH_SKIN = None
    # The background used by the robohash provider.
    AVATAR_ROBOHASH_BACKGROUND = None

    # Post settings
    ###########################################################################
    # Discussions on posts are disabled by default
    POST_DISCUSSIONS_ENABLED = False
    # Default pagination size on listing
    POST_DEFAULT_PAGINATION = 20

    # Dataset settings
    ###########################################################################
    # Max number of resources to display uncollapsed in dataset view
    DATASET_MAX_RESOURCES_UNCOLLAPSED = 6

    # Preview settings
    ###########################################################################
    # Preview mode can be either `iframe` or `page` or `None`
    PREVIEW_MODE = 'iframe'

    # URLs validation settings
    ###########################################################################
    # Whether or not to allow private URLs (private IPs...) submission
    URLS_ALLOW_PRIVATE = False
    # Whether or not to allow local URLs (localhost...) submission.
    URLS_ALLOW_LOCAL = False
    # Whether or not to allow credentials in URLs submission.
    URLS_ALLOW_CREDENTIALS = True
    # List of allowed URL schemes.
    URLS_ALLOWED_SCHEMES = ('http', 'https', 'ftp', 'ftps')
    # List of allowed TLDs.
    URLS_ALLOWED_TLDS = tld_set

    # Map/Tiles configuration
    ###########################################################################
    # Tiles URL for SD displays
    MAP_TILES_URL = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
    # Tiles URL for HD/HiDPI displays
    MAP_TILES_URL_HIDPI = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png'
    # Leaflet tiles config, see https://leafletjs.com/reference-0.7.7.html#tilelayer
    MAP_TILES_CONFIG = {
        'subdomains': 'abcd',
        'attribution': (
            '&copy;'
            '<a href="http://openstreetmap.org/copyright">OpenStreetMap</a>'
            '/'
            '<a href="https://cartodb.com/attributions">CartoDB</a>'
        )
    }
    # Initial map center position
    MAP_INITIAL_CENTER = [42, 2.4]
    # Initial map zoom level
    MAP_INITIAL_ZOOM = 4
    # Initial map territory level
    MAP_INITIAL_LEVEL = 0
    # Flask-CDN options
    # See: https://github.com/libwilliam/flask-cdn#flask-cdn-options
    # If this value is defined, toggle static assets on external domain
    CDN_DOMAIN = None
    # Don't check timestamp on assets (and avoid error on missing assets)
    CDN_TIMESTAMP = False

    # Export CSVs of model objects as resources of a dataset
    ########################################################
    EXPORT_CSV_MODELS = ('dataset', 'resource', 'discussion', 'organization',
                         'reuse', 'tag')
    EXPORT_CSV_DATASET_ID = None


class Testing(object):
    '''Sane values for testing. Should be applied as override'''
    TESTING = True
    # related to https://github.com/noirbizarre/flask-restplus/commit/93e412789f1ef8d1d2eab837f15535cf79bd144d#diff-68876137696247abc8c123622c73a11f  # noqa
    # this keeps our legacy tests from failing, we should probably fix the tests instead someday
    PROPAGATE_EXCEPTIONS = False
    SEND_MAIL = False
    WTF_CSRF_ENABLED = False
    AUTO_INDEX = False
    CACHE_TYPE = 'null'
    CACHE_NO_NULL_WARNING = True
    DEBUG_TOOLBAR = False
    SERVER_NAME = 'local.test'
    DEFAULT_LANGUAGE = 'en'
    ACTIVATE_TERRITORIES = False
    LOGGER_HANDLER_POLICY = 'never'
    CELERYD_HIJACK_ROOT_LOGGER = False
    URLS_ALLOW_LOCAL = True  # Test server URL is local.test
    URLS_ALLOWED_TLDS = tld_set | set(['test'])
    URLS_ALLOW_PRIVATE = False


class Debug(Defaults):
    DEBUG = True
    SEND_MAIL = False
    CACHE_TYPE = 'null'
    CACHE_NO_NULL_WARNING = True
