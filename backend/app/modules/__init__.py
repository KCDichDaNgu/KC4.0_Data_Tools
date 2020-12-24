# encoding: utf-8
"""
Modules
=======

Modules enable logical resource separation.

You may control enabled modules by modifying ``ENABLED_MODULES`` config
variable.
"""

enabled_modules = ['domain']


def init_app(app, **kwargs):
    from importlib import import_module

    for module_name in enabled_modules:
        import_module('.%s' % module_name, package=__name__).init_app(app, **kwargs)
