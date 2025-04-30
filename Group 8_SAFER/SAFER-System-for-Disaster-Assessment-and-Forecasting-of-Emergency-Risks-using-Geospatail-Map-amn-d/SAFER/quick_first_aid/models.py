from django.db import models

# Create your models here.
class Symptom(models.Model):
    name = models.CharField(max_length=100)

class QuickFirstAid(models.Model):
    disease = models.CharField(max_length=200)
    symptoms = models.ManyToManyField(Symptom)
    description = models.TextField(default="No description available.")
    web_links = models.URLField(max_length=300, blank=True, null=True)

    def __str__(self):
        return self.disease