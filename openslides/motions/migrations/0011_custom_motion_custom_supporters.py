# -*- coding: utf-8 -*-
# Generated by Django 1.10.8 on 2018-04-27 09:32
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('motions', '0010_auto_20180822_1042'),
    ]

    operations = [
        migrations.AddField(
            model_name='motion',
            name='custom_supporters',
            field=models.TextField(blank=True, null=True),
        ),
    ]
