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

    # FDP (Anträge)
    workflow_3 = Workflow(name="FDP (Anträge)")
    workflow_3.save(skip_autoupdate=True)
    state_3_0 = State(
        name="in Bearbeitung",
        workflow=workflow_3,
        restriction=[
            "is_submitter",
            "motions.can_manage"
        ],
        allow_submitter_edit=True,
        dont_set_identifier=True,
        css_class='yellow',
        merge_amendment_into_final=-1,
    )
    state_3_0.save(skip_autoupdate=True)
    state_3_1 = State(
        name="eingereicht",
        workflow=workflow_3,
        restriction=[
            "is_submitter",
            "motions.can_manage"
        ],
        dont_set_identifier=True,
        merge_amendment_into_final=-1,
    )
    state_3_1.save(skip_autoupdate=True)
    state_3_2 = State(
        name="vorbehaltlich zugelassen",
        workflow=workflow_3,
        allow_support=True,
        dont_set_identifier=True,
        merge_amendment_into_final=-1,
    )
    state_3_2.save(skip_autoupdate=True)
    state_3_3 = State(
        name="zugelassen",
        workflow=workflow_3,
        allow_create_poll=True,
        merge_amendment_into_final=-1,
    )
    state_3_3.save(skip_autoupdate=True)
    state_3_4 = State(
        name="nicht zugelassen",
        workflow=workflow_3,
        dont_set_identifier=True,
        show_state_extension_field=True,
        merge_amendment_into_final=-1,
    )
    state_3_4.save(skip_autoupdate=True)

    state_3_5 = State(
        name="angenommen",
        workflow=workflow_3,
        css_class="green",
        merge_amendment_into_final=1,
    )
    state_3_5.save(skip_autoupdate=True)
    state_3_6 = State(
        name="angenommen in geänderter Fassung",
        workflow=workflow_3,
        css_class="green",
        merge_amendment_into_final=1,
    )
    state_3_5.save(skip_autoupdate=True)
    state_3_6 = State(
        name="abgelehnt",
        workflow=workflow_3,
        css_class="red",
        merge_amendment_into_final=-1,
    )
    state_3_6.save(skip_autoupdate=True)
    state_3_7 = State(
        name="erledigt",
        workflow=workflow_3,
        show_state_extension_field=True,
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_3_7.save(skip_autoupdate=True)
    state_3_8 = State(
        name="verwiesen",
        workflow=workflow_3,
        recommendation_label="Verweisung",
        show_state_extension_field=True,
        show_recommendation_extension_field=True,
        merge_amendment_into_final=-1,
    )
    state_3_8.save(skip_autoupdate=True)
    state_3_9 = State(
        name="zurückgezogen",
        workflow=workflow_3,
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_3_9.save(skip_autoupdate=True)
    state_3_0.next_states.add(state_3_1, state_3_9)
    state_3_1.next_states.add(state_3_2, state_3_3, state_3_4, state_3_9)
    state_3_2.next_states.add(state_3_3, state_3_4, state_3_9)
    state_3_3.next_states.add(
        state_3_5, state_3_6, state_3_7, state_3_8, state_3_9
    )
    workflow_3.first_state = state_3_0
    workflow_3.save(skip_autoupdate=True)


    # FDP (Änderungsanträge)
    workflow_4 = Workflow(name="FDP (Änderungsanträge)")
    workflow_4.save(skip_autoupdate=True)
    state_4_1 = State(
        name="eingereicht",
        workflow=workflow_4,
        restriction=[
            "is_submitter",
            "motions.can_manage"
        ],
        dont_set_identifier=True,
        merge_amendment_into_final=-1,
    )
    state_4_1.save(skip_autoupdate=True)
    state_4_2 = State(
        name="zugelassen",
        workflow=workflow_4,
        allow_create_poll=True,
        merge_amendment_into_final=0,
    )
    state_4_2.save(skip_autoupdate=True)
    state_4_3 = State(
        name="übernommen",
        recommendation_label="Übernahme",
        workflow=workflow_4,
        css_class='green',
        merge_amendment_into_final=1,
    )
    state_4_3.save(skip_autoupdate=True)
    state_4_4 = State(
        name="übernommen in geänderter Form",
        recommendation_label="Übernahme in geänderter Form",
        workflow=workflow_4,
        show_state_extension_field=True,
        show_recommendation_extension_field=True,
        css_class='green',
        merge_amendment_into_final=1,
    )
    state_4_4.save(skip_autoupdate=True)
    state_4_5 = State(
        name="übernommen in Zeile",
        recommendation_label="Übernahme in Zeile",
        workflow=workflow_4,
        show_state_extension_field=True,
        show_recommendation_extension_field=True,
        css_class='green',
        merge_amendment_into_final=-1,
    )
    state_4_5.save(skip_autoupdate=True)
    state_4_6 = State(
        name="abzustimmen mit Beratung",
        recommendation_label="Abstimmung mit Beratung",
        workflow=workflow_4,
        allow_create_poll=True,
        show_state_extension_field=True,
        show_recommendation_extension_field=True,
        merge_amendment_into_final=-1,
    )
    state_4_6.save(skip_autoupdate=True)
    state_4_7 = State(
        name="abzustimmen ohne Beratung",
        recommendation_label="Abstimmung ohne Beratung",
        workflow=workflow_4,
        allow_create_poll=True,
        merge_amendment_into_final=-1,
    )
    state_4_7.save(skip_autoupdate=True)

    state_4_10 = State(
        name="angenommen",
        workflow=workflow_4,
        css_class="green",
        merge_amendment_into_final=1,
    )
    state_4_10.save(skip_autoupdate=True)
    state_4_11 = State(
        name="abgelehnt",
        workflow=workflow_4,
        css_class="red",
        merge_amendment_into_final=-1,
    )
    state_4_11.save(skip_autoupdate=True)
    state_4_12 = State(
        name="erledigt",
        workflow=workflow_4,
        show_state_extension_field=True,
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_4_12.save(skip_autoupdate=True)
    state_4_13 = State(
        name="zurückgezogen",
        workflow=workflow_4,
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_4_13.save(skip_autoupdate=True)

    state_4_1.next_states.add(state_4_2, state_4_13)
    state_4_2.next_states.add(state_4_3, state_4_4, state_4_5, state_4_6, state_4_7, state_4_10, state_4_11, state_4_12, state_4_13)
    state_4_6.next_states.add(state_4_10, state_4_11, state_4_12, state_4_13)
    state_4_7.next_states.add(state_4_6, state_4_10, state_4_11, state_4_12, state_4_13)
    workflow_4.first_state = state_4_1
    workflow_4.save(skip_autoupdate=True)



    workflow_1 = Workflow(name="Simple Workflow")
    workflow_1.save(skip_autoupdate=True)
    state_1_1 = State(
        name="submitted",
        workflow=workflow_1,
        allow_create_poll=True,
        allow_support=True,
    )
    state_1_1.save(skip_autoupdate=True)
    state_1_2 = State(
        name="accepted",
        workflow=workflow_1,
        recommendation_label="Acceptance",
        css_class="green",
        merge_amendment_into_final=1,
    )
    state_1_2.save(skip_autoupdate=True)
    state_1_3 = State(
        name="rejected",
        workflow=workflow_1,
        recommendation_label="Rejection",
        css_class="red",
        merge_amendment_into_final=-1,
    )
    state_1_3.save(skip_autoupdate=True)
    state_1_4 = State(
        name="not decided",
        workflow=workflow_1,
        recommendation_label="No decision",
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_1_4.save(skip_autoupdate=True)
    state_1_1.next_states.add(state_1_2, state_1_3, state_1_4)
    workflow_1.first_state = state_1_1
    workflow_1.save(skip_autoupdate=True)

    workflow_2 = Workflow(name="Complex Workflow")
    workflow_2.save(skip_autoupdate=True)
    state_2_0 = State(
        name="in progress",
        workflow=workflow_2,
        allow_submitter_edit=True,
        dont_set_identifier=True,
    )
    state_2_0.save(skip_autoupdate=True)
    state_2_1 = State(
        name="submitted",
        workflow=workflow_2,
        allow_support=True,
        dont_set_identifier=True,
    )
    state_2_1.save(skip_autoupdate=True)
    state_2_2 = State(
        name="permitted",
        workflow=workflow_2,
        recommendation_label="Permission",
        allow_create_poll=True,
    )
    state_2_2.save(skip_autoupdate=True)
    state_2_3 = State(
        name="accepted",
        workflow=workflow_2,
        recommendation_label="Acceptance",
        css_class="green",
        merge_amendment_into_final=1,
    )
    state_2_3.save(skip_autoupdate=True)
    state_2_4 = State(
        name="rejected",
        workflow=workflow_2,
        recommendation_label="Rejection",
        css_class="red",
        merge_amendment_into_final=-1,
    )
    state_2_4.save(skip_autoupdate=True)
    state_2_5 = State(
        name="withdrawed",
        workflow=workflow_2,
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_2_5.save(skip_autoupdate=True)
    state_2_6 = State(
        name="adjourned",
        workflow=workflow_2,
        recommendation_label="Adjournment",
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_2_6.save(skip_autoupdate=True)
    state_2_7 = State(
        name="not concerned",
        workflow=workflow_2,
        recommendation_label="No concernment",
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_2_7.save(skip_autoupdate=True)
    state_2_8 = State(
        name="refered to committee",
        workflow=workflow_2,
        recommendation_label="Referral to committee",
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_2_8.save(skip_autoupdate=True)
    state_2_9 = State(
        name="needs review",
        workflow=workflow_2,
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_2_9.save(skip_autoupdate=True)
    state_2_10 = State(
        name="rejected (not authorized)",
        workflow=workflow_2,
        recommendation_label="Rejection (not authorized)",
        css_class="grey",
        merge_amendment_into_final=-1,
    )
    state_2_10.save(skip_autoupdate=True)
    state_2_0.next_states.add(state_2_1, state_2_5)
    state_2_1.next_states.add(state_2_2, state_2_5, state_2_10)
    state_2_2.next_states.add(
        state_2_3, state_2_4, state_2_5, state_2_6, state_2_7, state_2_8, state_2_9
    )
    workflow_2.first_state = state_2_0
    workflow_2.save(skip_autoupdate=True)


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
