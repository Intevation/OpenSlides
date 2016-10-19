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

    workflow_1 = Workflow.objects.create(name='Simple Workflow')
    state_1_1 = State.objects.create(name=ugettext_noop('submitted'),
                                     workflow=workflow_1,
                                     allow_create_poll=True,
                                     allow_support=True,
                                     allow_submitter_edit=True)
    state_1_2 = State.objects.create(name=ugettext_noop('accepted'),
                                     workflow=workflow_1,
                                     action_word='Accept',
                                     recommendation_label='Acceptance',
                                     css_class='success')
    state_1_3 = State.objects.create(name=ugettext_noop('rejected'),
                                     workflow=workflow_1,
                                     action_word='Reject',
                                     recommendation_label='Rejection',
                                     css_class='danger')
    state_1_4 = State.objects.create(name='Vorstandsüberweisung',
                                     workflow=workflow_1,
                                     action_word='Vorstandsüberweisung',
                                     recommendation_label='Überweisung an Vorstand',
                                     css_class='default')
    state_1_5 = State.objects.create(name='Ausschussüberweisung',
                                     workflow=workflow_1,
                                     action_word='Ausschussüberweisung',
                                     recommendation_label='Überweisung an Ausschuss',
                                     css_class='default')
    state_1_6 = State.objects.create(name=ugettext_noop('not decided'),
                                     workflow=workflow_1,
                                     action_word='Do not decide',
                                     recommendation_label='No decision',
                                     css_class='default')
    state_1_7 = State.objects.create(name='Entfallen',
                                     workflow=workflow_1,
                                     action_word='Entfallen',
                                     css_class='default')
    state_1_8 = State.objects.create(name='Zurückgezogen',
                                     workflow=workflow_1,
                                     action_word='Zurückziehen',
                                     css_class='default')

    state_1_1.next_states.add(state_1_2, state_1_3, state_1_4, state_1_5, state_1_6, state_1_7, state_1_8)
    workflow_1.first_state = state_1_1
    workflow_1.save()


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
