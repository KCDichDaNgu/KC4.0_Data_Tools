from flask_marshmallow import base_fields, Schema
from flask_restplus_patched import PostFormParameters, PatchJSONParameters


class AddParaDocumentParameters(PostFormParameters):
    """
    New user creation (sign up) parameters.
    """

    text1 = base_fields.String(default='', required=True)
    text2 = base_fields.String(default='', required=True)
    url1 = base_fields.String(default='', required=True)
    url2 = base_fields.String(default='', required=True)
    lang1 = base_fields.String(default='', required=True)
    lang2 = base_fields.String(default='', required=True)
    score = base_fields.String(default='', required=False)
    creator_id = base_fields.Integer(
        description="Example: 1", required=True)
    status = base_fields.Integer(
        description="Example: 1", required=False)
    created_time = base_fields.Integer(default=1608743995, required=True)
    updated_time = base_fields.Integer(default=1608743995, required=False)

    class Meta(Schema.Meta):
        fields = (
            'url1',
            'url2',
            'text1',
            'text2',
            'score',
            'creator_id',
            'status',
            'created_time',
            'updated_time',
        )
