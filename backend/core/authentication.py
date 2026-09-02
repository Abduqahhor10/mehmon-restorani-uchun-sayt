from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication without enforcing CSRF checks.
    This allows decoupled SPAs (React Admin / Client) to interact with
    REST API endpoints safely without CSRF cookie mismatches.
    """
    def enforce_csrf(self, request):
        return  # Do not enforce CSRF on REST API requests
