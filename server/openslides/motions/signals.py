from django.apps import apps

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

    # Workflow Grüne
    workflow_1 = Workflow(name='Grüne')
    workflow_1.save(skip_autoupdate=True)
    state_1_0 = State(name='in Bearbeitung',
        workflow=workflow_1,
        restriction=[
            "is_submitter",
            "motions.can_manage"
        ],
        dont_set_identifier=True,
        allow_submitter_edit=True
    )
    state_1_0.save(skip_autoupdate=True)
    state_1_1 = State(name='eingereicht',
        workflow=workflow_1,
        restriction=[
            "is_submitter",
            "motions.can_manage"
        ],
        dont_set_identifier=True,
    )
    state_1_1.save(skip_autoupdate=True)
    state_1_2 = State(name='veröffentlicht',
         workflow=workflow_1,
         allow_support=True,
         dont_set_identifier=True,
    )
    state_1_2.save(skip_autoupdate=True)
    state_1_3 = State(name='zugelassen',
         workflow=workflow_1,
         allow_support=True,
         allow_create_poll=True,
    )
    state_1_3.save(skip_autoupdate=True)

    # Empfehlungen der Antragskommission, inkl. passenden Status
    state_1_10 = State(name='accepted',
          workflow=workflow_1,
          recommendation_label='Übernahme',
          css_class='green',
          merge_amendment_into_final=1,
    )
    state_1_10.save(skip_autoupdate=True)
    state_1_11 = State(name='angenommen nach Modifizierung',
          workflow=workflow_1,
          recommendation_label='modifizierte Übernahme',
          show_recommendation_extension_field=True,
          show_state_extension_field=True,
          css_class='green',
          merge_amendment_into_final=1,
    )
    state_1_11.save(skip_autoupdate=True)
    state_1_12 = State(name='zurückgezogen wegen modifizierte Übernahme',
          workflow=workflow_1,
          recommendation_label='zurückgezogen wegen modifizierte Übernahme',
          show_recommendation_extension_field=True,
          show_state_extension_field=True,
          css_class='grey',
          merge_amendment_into_final=-1,
    )
    state_1_12.save(skip_autoupdate=True)

    # Empfehlungen ohne passenden Status
    state_1_a = State(name='strittig',
         workflow=workflow_1,
         recommendation_label='strittig',
         css_class='yellow',
         merge_amendment_into_final=-1,
    )
    state_1_a.save(skip_autoupdate=True)
    state_1_b = State(name='Abstimmung',
         workflow=workflow_1,
         recommendation_label='Abstimmung',
         css_class='yellow',
         merge_amendment_into_final=-1,
    )
    state_1_b.save(skip_autoupdate=True)

    # Beschlüsse
    state_1_13 = State(name='erledigt',
          workflow=workflow_1,
          recommendation_label='erledigt',
          show_recommendation_extension_field=True,
          show_state_extension_field=True,
          css_class='grey',
          merge_amendment_into_final=-1,
    )
    state_1_13.save(skip_autoupdate=True)
    state_1_14 = State(name='zurückgezogen',
          workflow=workflow_1,
          recommendation_label='zurückgezogen',
          css_class='grey',
          merge_amendment_into_final=-1,
    )
    state_1_14.save(skip_autoupdate=True)
    state_1_15 = State(name='Überweisung in Ausschuss',
          workflow=workflow_1,
          css_class='grey',
          merge_amendment_into_final=-1,
    )
    state_1_15.save(skip_autoupdate=True)
    state_1_16 = State(name='nicht befasst',
          workflow=workflow_1,
          css_class='grey',
          merge_amendment_into_final=-1,
    )
    state_1_16.save(skip_autoupdate=True)
    state_1_17 = State(name='abgelehnt',
          workflow=workflow_1,
          recommendation_label='Ablehnung nach Abstimmung der Versammlung',
          css_class='red',
          merge_amendment_into_final=-1,
    )
    state_1_17.save(skip_autoupdate=True)
    state_1_18 = State(name='Sonstiges',
          workflow=workflow_1,
          recommendation_label='Sonstiges',
          show_recommendation_extension_field=True,
          show_state_extension_field=True,
          css_class='grey',
          merge_amendment_into_final=-1,
    )
    state_1_18.save(skip_autoupdate=True)

    state_1_0.next_states.add(state_1_1)
    state_1_1.next_states.add(state_1_2)
    state_1_2.next_states.add(state_1_3)
    state_1_3.next_states.add(state_1_10, state_1_11, state_1_12, state_1_13, state_1_14, state_1_15, state_1_16, state_1_17, state_1_18)
    workflow_1.first_state = state_1_0
    workflow_1.save(skip_autoupdate=True)


def get_permission_change_data(sender, permissions, **kwargs):
    """
    Yields all necessary collections if 'motions.can_see' permission changes.
    """
    motions_app = apps.get_app_config(app_label="motions")
    for permission in permissions:
        # There could be only one 'motions.can_see' and then we want to return data.
        if (
            permission.content_type.app_label == motions_app.label
            and permission.codename == "can_see"
        ):
            yield from motions_app.get_startup_elements()
