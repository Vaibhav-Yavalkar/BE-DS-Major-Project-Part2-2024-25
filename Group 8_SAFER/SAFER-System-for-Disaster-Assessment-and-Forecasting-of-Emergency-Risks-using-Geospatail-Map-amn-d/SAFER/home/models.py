from django.db import models

class LandslidePrediction(models.Model):
    datetime = models.DateTimeField()
    probability = models.FloatField()
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"{self.datetime} - Probability: {self.probability}"