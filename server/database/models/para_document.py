from datetime import datetime

from database.db import db
from database.models import User

class ParaDocumentText(db.EmbeddedDocument):

    content = db.StringFiled(required=True)
    lang = db.StringField(required=True)
    url = db.StringField(required=True)

class ParaDocument(db.Document):

    text1 = db.EmbeddedDocumentField(ParaDocumentText)
    text2 = db.EmbeddedDocumentField(ParaDocumentText)
    
    score = db.DictField()
    creator_id = db.ReferenceField(User)

    rating = db.StringField(
        choices=RATING_TYPES.keys(),
        default=RATING_TYPES['unRated']
    )
    
    created_at = db.DateTimeField(default=datetime.now, required=True)
    updated_at = db.DateTimeField(default=datetime.now, required=True)

    meta = {'collection': 'para_document'}
