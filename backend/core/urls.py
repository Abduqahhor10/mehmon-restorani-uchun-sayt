from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('menu.urls')),
]

# Uploaded food images are served by Django in every environment. Django's static()
# helper is a no-op when DEBUG=False, so production uses an explicit re-serve view.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    from django.views.static import serve

    urlpatterns += [
        path(
            'media/<path:path>',
            serve,
            {'document_root': settings.MEDIA_ROOT},
            name='media',
        ),
    ]
