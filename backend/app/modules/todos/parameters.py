from flask_marshmallow import base_fields,Schema
from flask_restplus_patched import PostFormParameters, PatchJSONParameters

class AddTodoParameters(PostFormParameters):
    """
    New user creation (sign up) parameters.
    """

    complete = base_fields.Boolean(default=True, required=True)
    text = base_fields.String(description="Example: root@gmail.com", required=True)

    class Meta(Schema.Meta):
        fields = (
            'complete',
            'text'
        )
