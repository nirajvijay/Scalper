from django.db import models


class AccessToken(models.Model):
    token = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.created_at
