from django.utils.translation import ugettext_noop

from .models import State, Workflow


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
