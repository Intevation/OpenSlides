from typing import Set  # noqa

from django.apps import apps
from django.utils.translation import ugettext_noop

from ..utils.auth import has_perm
from ..utils.collection import Collection
from .models import Motion, State, Workflow


def create_builtin_workflows(sender, **kwargs):
    """
    Receiver function to create a simple and a complex workflow. It is
    connected to the signal django.db.models.signals.post_migrate during
    app loading.
    """
    if Workflow.objects.exists():
        # If there is at least one workflow, then do nothing.
        return

    # DGB workflow
    workflow_3 = Workflow.objects.create(name='DGB')
    state_3_1 = State.objects.create(name='eingereicht',
                                     workflow=workflow_3,
                                     allow_submitter_edit=True,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     required_permission_to_see='motions.can_manage',
                                     dont_set_identifier=True,
                                     versioning=False)
    state_3_2 = State.objects.create(name='geprüft',
                                     workflow=workflow_3,
                                     action_word='Geprüft',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     required_permission_to_see='motions.can_manage',
                                     dont_set_identifier=True,
                                     versioning=False)
    state_3_3 = State.objects.create(name='zugeordnet',
                                     workflow=workflow_3,
                                     action_word='Zugeordnet',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     dont_set_identifier=False,
                                     versioning=False)
    state_3_4 = State.objects.create(name='Empfehlung der ABK liegt vor',
                                     workflow=workflow_3,
                                     action_word='Empfehlung der ABK liegt vor',
                                     allow_submitter_edit=False,
                                     allow_support=True,
                                     allow_create_poll=True,
                                     dont_set_identifier=False,
                                     versioning=False)
    state_3_10 = State.objects.create(name='angenommen',
                                     workflow=workflow_3,
                                     action_word='Annehmen',
                                     recommendation_label='Annahme',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='success')
    state_3_11 = State.objects.create(name='angenommen in geänderter Fassung',
                                     workflow=workflow_3,
                                     action_word='Annehmen in geänderter Fassung',
                                     recommendation_label='Annahme in geänderter Fassung',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='success')
    state_3_12 = State.objects.create(name='angenommen als Material zu Antrag',
                                     workflow=workflow_3,
                                     action_word='Annehmen als Material zu Antrag',
                                     recommendation_label='Annahme als Material zu Antrag',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='success')
    state_3_13 = State.objects.create(name='angenommen als Material an',
                                     workflow=workflow_3,
                                     action_word='Annehmen als Material an',
                                     recommendation_label='Annahme als Material an',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='success')
    state_3_14 = State.objects.create(name='angenommen in geänderter Fassung als Material',
                                     workflow=workflow_3,
                                     action_word='Annehmen in geänderter Fassung als Material',
                                     recommendation_label='Annahme in geänderter Fassung als Material',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='success')
    state_3_15 = State.objects.create(name='erledigt bei Annahme von Antrag',
                                     workflow=workflow_3,
                                     action_word='Erledigt durch Annahme von Antrag',
                                     recommendation_label='Erledigt bei Annahme von Antrag',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='default')
    state_3_16 = State.objects.create(name='abgelehnt',
                                     workflow=workflow_3,
                                     action_word='Ablehnen',
                                     recommendation_label='Ablehnung',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='danger')
    state_3_17 = State.objects.create(name='nicht befasst',
                                     workflow=workflow_3,
                                     action_word='Nicht befassen',
                                     recommendation_label='Nichtbefassung',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='default')
    state_3_20 = State.objects.create(name='zurückgezogen',
                                     workflow=workflow_3,
                                     action_word='Zurückziehen',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     dont_set_identifier=True,
                                     versioning=False,
                                     css_class='default')
    state_3_21 = State.objects.create(name='Sonstiges',
                                     workflow=workflow_3,
                                     action_word='Sonstiges',
                                     recommendation_label='Sonstiges',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     versioning=False,
                                     css_class='default')
    state_3_1.next_states.add(state_3_2, state_3_20)
    state_3_2.next_states.add(state_3_3, state_3_20)
    state_3_3.next_states.add(state_3_4, state_3_20)
    state_3_4.next_states.add(state_3_10, state_3_11, state_3_12, state_3_13, state_3_14, state_3_15, state_3_16,
            state_3_17, state_3_20, state_3_21)
    workflow_3.first_state = state_3_1
    workflow_3.save()


def get_permission_change_data(sender, permissions, **kwargs):
    """
    Yields all necessary collections if 'motions.can_see' permission changes.
    """
    motions_app = apps.get_app_config(app_label='motions')
    for permission in permissions:
        # There could be only one 'motions.can_see' and then we want to return data.
        if permission.content_type.app_label == motions_app.label and permission.codename == 'can_see':
            yield from motions_app.get_startup_elements()


def required_users(sender, request_user, **kwargs):
    """
    Returns all user ids that are displayed as as submitter or supporter in
    any motion if request_user can see motions. This function may return an
    empty set.
    """
    submitters_supporters = set()  # type: Set[int]
    if has_perm(request_user, 'motions.can_see'):
        for motion_collection_element in Collection(Motion.get_collection_string()).element_generator():
            full_data = motion_collection_element.get_full_data()
            submitters_supporters.update(
                [submitter['user_id'] for submitter in full_data['submitters']])
            submitters_supporters.update(full_data['supporters_id'])
    return submitters_supporters
