from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase

from .views import _validate_upload_file


class UploadValidationTests(SimpleTestCase):
    def test_rejects_html_uploads(self):
        upload = SimpleUploadedFile(
            "payload.html",
            b"<script>alert(document.domain)</script>",
            content_type="text/html",
        )

        self.assertEqual(_validate_upload_file(upload), "Unsupported file type.")

    def test_rejects_svg_uploads(self):
        upload = SimpleUploadedFile(
            "payload.svg",
            b"<svg><script>alert(document.domain)</script></svg>",
            content_type="image/svg+xml",
        )

        self.assertEqual(_validate_upload_file(upload), "Unsupported file type.")

    def test_accepts_glb_uploads(self):
        upload = SimpleUploadedFile(
            "model.glb",
            b"glTF",
            content_type="model/gltf-binary",
        )

        self.assertIsNone(_validate_upload_file(upload))
