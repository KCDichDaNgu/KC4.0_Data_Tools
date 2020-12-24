from flask_marshmallow import base_fields, Schema
from flask_restplus_patched import PostFormParameters, PatchJSONParameters


class AddParaSentenceParameters(PostFormParameters):
    """
    New user creation (sign up) parameters.
    """

    text1 = base_fields.String(default='', required=True)
    text2 = base_fields.String(default='', required=True)
    score = base_fields.String(default='', required=False)
    editor_id = base_fields.Integer(
        description="Example: 1", required=True)
    para_document_id = base_fields.Integer(
        description="Example: 1", required=False)
    origin_para_document_id = base_fields.Integer(
        description="Example: 1", required=False)
    status = base_fields.Integer(
        description="Example: 1", required=False)
    created_time = base_fields.Integer(default=1608743995, required=True)
    updated_time = base_fields.Integer(default=1608743995, required=False)

    class Meta(Schema.Meta):
        fields = (
            'text1',
            'text2',
            'score',
            'editor_id',
            'para_document_id',
            'origin_para_document_id',
            'status',
            'created_time',
            'updated_time',
        )