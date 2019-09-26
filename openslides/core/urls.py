from django.conf.urls import url

from . import views


urlpatterns = [
    url(r"^servertime/$", views.ServerTime.as_view(), name="core_servertime"),
    url(r"^version/$", views.VersionView.as_view(), name="core_version"),
    url(r"^history/", views.ROErrorView.as_view(), name="RO_error_view"),
]
