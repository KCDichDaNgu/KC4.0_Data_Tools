from flask_marshmallow import base_fields,Schema
from flask_restplus_patched import PostFormParameters, PatchJSONParameters

class AddDomainParameters(PostFormParameters):
    """
    New user creation (sign up) parameters.
    """

    name = base_fields.String(required=True)
    user_id = base_fields.String(description="Example: root@gmail.com", required=True)
    created_time = base_fields.Integer(required=False)
    class Meta(Schema.Meta):
        fields = (
            'name',
            'user_id',
            'created_time'
        )
