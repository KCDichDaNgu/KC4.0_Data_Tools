import time

from database.db import db
from database.models import User
from database.models.data_field import DataField

RATING_TYPES = {
    'good': 'good',
    'bad': 'bad',
    'unRated': 'unRated'
}

ALIGNMENT_STATUSES = {
    'aligned': 'aligned',
    'not_aligned_yet': 'not_aligned_yet'
}

CREATED_BY = {
    "by_machine": "by_machine",
    "by_user": "by_user"
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
    CREATED_BY = CREATED_BY

    newest_para_document = db.EmbeddedDocumentField(NewestParaDocument, required=True)
    original_para_document = db.EmbeddedDocumentField(OriginalParaDocument)
    
    score = db.EmbeddedDocumentField(Score)

    creator_id = db.ReferenceField(User)
    editor = db.EmbeddedDocumentField(Editor)

    domain_id = db.ObjectIdField()
    data_field_id = db.ReferenceField(DataField)
    
    created_at = db.IntField(default=int(time.time()), required=True)
    updated_at = db.IntField(default=int(time.time()), required=True)

    created_by = db.StringField(
        choices=CREATED_BY.values(),
        default=CREATED_BY['by_machine']
    )

    viewer_id = db.ObjectIdField()
    view_due_date = db.FloatField()

    alignment_status = db.StringField(
        choices=ALIGNMENT_STATUSES.keys(), 
        default=ALIGNMENT_STATUSES['not_aligned_yet']
    )

    meta = {'collection': 'para_document'}

    def save(self, is_update=False):
        similar_paradocuments = ParaDocument.objects.filter(
            original_para_document__hash_content=self.original_para_document.hash_content
        )

        if len(similar_paradocuments) == 0:
            return super(ParaDocument, self).save()
        else:
            raise Exception('hashExists')

    @property
    def serialize(self):
        return {
            'id': str(self.id),
            'newest_para_document': self.newest_para_document,
            'original_para_document': self.original_para_document,
            'score': self.score,
            'creator': {
                'id': str(self.creator_id.id) if self.creator_id is not None else None,
                'username': self.creator_id.username if self.creator_id is not None else None
            },
            'created_by': self.created_by,
            'editor': {
                'id': str(self.editor.user_id.id) if self.editor is not None else None,
                'username': self.editor.user_id.username if self.editor is not None else None,
                'roles': self.editor.roles if self.editor is not None else None
            },
            'domain_id': str(self.domain_id),
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'viewer_id': str(self.viewer_id),
            'view_due_date': self.view_due_date,
            'alignment_status': self.alignment_status
        }
