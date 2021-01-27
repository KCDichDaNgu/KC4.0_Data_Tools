import time

from database.db import db
from database.models import User

RATING_TYPES = {
    'good': 'good',
    'bad': 'bad',
    'unRated': 'unRated'
}

ALIGNMENT_STATUSES = {
    'aligned': 'aligned',
    'not_aligned_yet': 'not_aligned_yet'
}

class ParaDocumentText(db.EmbeddedDocument):

    content = db.StringField(required=True)
    lang = db.StringField(required=True)

class NewestParaDocument(db.EmbeddedDocument):

    text1 = db.EmbeddedDocumentField(ParaDocumentText)
    text2 = db.EmbeddedDocumentField(ParaDocumentText)

    hash_content = db.StringField(required=True)

    rating = db.StringField(
        choices=RATING_TYPES.keys(),
        default=RATING_TYPES['unRated']
    )

class OriginalParaDocument(db.EmbeddedDocument):

    text1 = db.EmbeddedDocumentField(ParaDocumentText)
    text2 = db.EmbeddedDocumentField(ParaDocumentText)

    hash_content = db.StringField(required=True)

    rating = db.StringField(
        choices=RATING_TYPES.keys(),
        default=RATING_TYPES['unRated']
    )

class Editor(db.EmbeddedDocument):

    user_id = db.ReferenceField(User, default=None)
    roles = db.ListField(choices=User.USER_ROLES.keys(), default=[])

class Score(db.EmbeddedDocument):

    docAlign = db.FloatField(default=0)

class ParaDocument(db.Document):

    RATING_TYPES = RATING_TYPES
    ALIGNMENT_STATUSES = ALIGNMENT_STATUSES

    newest_para_sentence = db.EmbeddedDocumentField(ParaDocumentText, required=True)
    original_para_sentence = db.EmbeddedDocumentField(OriginalParaDocument)
    
    score = db.EmbeddedDocumentField(Score)
    creator_id = db.ReferenceField(User)

    creator_id = db.ReferenceField(User)
    editor = db.EmbeddedDocumentField(Editor)

    data_field_id = db.ReferenceField(DataField)
    
    created_at = db.IntField(default=int(time.time()), required=True)
    updated_at = db.IntField(default=int(time.time()), required=True)

    viewer_id = db.ObjectIdField()
    view_due_date = db.FloatField()

    alignment_status = db.StringField(
        choices=ALIGNMENT_STATUSES.keys(), 
        default=ALIGNMENT_STATUSES['not_aligned_yet']
    )

    meta = {'collection': 'para_document'}
