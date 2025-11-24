# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_student_hobbies_student_theme'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='hobbies',
            field=models.TextField(blank=True, verbose_name='Loisirs'),
        ),
        migrations.AddField(
            model_name='student',
            name='theme',
            field=models.CharField(choices=[('light', 'Clair'), ('dark', 'Sombre')], default='dark', max_length=10, verbose_name='Thème'),
        ),
    ]
