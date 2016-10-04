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

    # Gremiensitzung
    workflow_0 = Workflow(name='Gremiensitzung')
    workflow_0.save(skip_autoupdate=True)
    state_0_1 = State(name='Entwurf',
                        workflow=workflow_0,
                        restriction=[
                            "is_submitter",
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        css_class='yellow',
                        merge_amendment_into_final=-1)
    state_0_1.save(skip_autoupdate=True)
    state_0_2 = State(name='eingereicht',
                        workflow=workflow_0,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_0_2.save(skip_autoupdate=True)
    state_0_3 = State(name='geprüft & zugeordnet',
                        workflow=workflow_0,
                        allow_create_poll=True,
                        allow_support=True,
                        merge_amendment_into_final=-1)
    state_0_3.save(skip_autoupdate=True)
    state_0_5 = State(name='angenommen',
                        workflow=workflow_0,
                        css_class='green',
                        merge_amendment_into_final=1)
    state_0_5.save(skip_autoupdate=True)
    state_0_6 = State(name='abgelehnt',
                        workflow=workflow_0,
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_0_6.save(skip_autoupdate=True)
    state_0_7 = State(name='zurückgezogen',
                        workflow=workflow_0,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_0_7.save(skip_autoupdate=True)
    state_0_8 = State(name='Sonstiges',
                        workflow=workflow_0,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_0_8.save(skip_autoupdate=True)
    state_0_1.next_states.add(state_0_2, state_0_7)
    state_0_2.next_states.add(state_0_3, state_0_7)
    state_0_3.next_states.add(state_0_5, state_0_6, state_0_7, state_0_8)
    workflow_0.first_state = state_0_1
    workflow_0.save(skip_autoupdate=True)


    # DGB workflow
    workflow_1 = Workflow(name='DGB')
    workflow_1.save(skip_autoupdate=True)
    state_1_1 = State(name='eingereicht',
                                     workflow=workflow_1,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     restriction=[
                                        "is_submitter",
                                        "motions.can_manage"
                                     ],
                                     dont_set_identifier=True,
                                     merge_amendment_into_final=-1)
    state_1_1.save(skip_autoupdate=True)
    state_1_2 = State(name='geprüft',
                                     workflow=workflow_1,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     restriction=[
                                        "is_submitter",
                                        "motions.can_manage"
                                     ],
                                     dont_set_identifier=True,
                                     merge_amendment_into_final=-1)
    state_1_2.save(skip_autoupdate=True)
    state_1_3 = State(name='zugeordnet',
                                     workflow=workflow_1,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     dont_set_identifier=False,
                                     merge_amendment_into_final=-1)
    state_1_3.save(skip_autoupdate=True)
    state_1_4 = State(name='Empfehlung der ABK liegt vor',
                                     workflow=workflow_1,
                                     allow_submitter_edit=False,
                                     allow_support=True,
                                     allow_create_poll=True,
                                     dont_set_identifier=False,
                                     merge_amendment_into_final=-1)
    state_1_4.save(skip_autoupdate=True)
    state_1_10 = State(name='angenommen',
                                     workflow=workflow_1,
                                     recommendation_label='Annahme',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='green',
                                     merge_amendment_into_final=1)
    state_1_10.save(skip_autoupdate=True)
    state_1_11 = State(name='angenommen in geänderter Fassung',
                                     workflow=workflow_1,
                                     recommendation_label='Annahme in geänderter Fassung',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='green',
                                     merge_amendment_into_final=1)
    state_1_11.save(skip_autoupdate=True)
    state_1_12 = State(name='angenommen als Material zu Antrag',
                                     workflow=workflow_1,
                                     recommendation_label='Annahme als Material zu Antrag',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='green',
                                     merge_amendment_into_final=1)
    state_1_12.save(skip_autoupdate=True)
    state_1_13 = State(name='angenommen als Material an',
                                     workflow=workflow_1,
                                     recommendation_label='Annahme als Material an',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='green',
                                     merge_amendment_into_final=1)
    state_1_13.save(skip_autoupdate=True)
    state_1_14 = State(name='angenommen in geänderter Fassung als Material',
                                     workflow=workflow_1,
                                     recommendation_label='Annahme in geänderter Fassung als Material',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='green',
                                     merge_amendment_into_final=1)
    state_1_14.save(skip_autoupdate=True)
    state_1_15 = State(name='erledigt bei Annahme von Antrag',
                                     workflow=workflow_1,
                                     recommendation_label='Erledigt bei Annahme von Antrag',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='grey',
                                     merge_amendment_into_final=-1)
    state_1_15.save(skip_autoupdate=True)
    state_1_16 = State(name='abgelehnt',
                                     workflow=workflow_1,
                                     recommendation_label='Ablehnung',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='red',
                                     merge_amendment_into_final=-1)
    state_1_16.save(skip_autoupdate=True)
    state_1_17 = State(name='nicht befasst',
                                     workflow=workflow_1,
                                     recommendation_label='Nichtbefassung',
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='grey',
                                     merge_amendment_into_final=-1)
    state_1_17.save(skip_autoupdate=True)
    state_1_20 = State(name='zurückgezogen',
                                     workflow=workflow_1,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     dont_set_identifier=True,
                                     css_class='grey',
                                     merge_amendment_into_final=-1)
    state_1_20.save(skip_autoupdate=True)
    state_1_21 = State(name='Sonstiges',
                                     workflow=workflow_1,
                                     recommendation_label='Sonstiges',
                                     show_recommendation_extension_field=True,
                                     show_state_extension_field=True,
                                     allow_submitter_edit=False,
                                     allow_support=False,
                                     allow_create_poll=False,
                                     css_class='grey',
                                     merge_amendment_into_final=-1)
    state_1_21.save(skip_autoupdate=True)
    state_1_1.next_states.add(state_1_2, state_1_20)
    state_1_2.next_states.add(state_1_3, state_1_20)
    state_1_3.next_states.add(state_1_4, state_1_20)
    state_1_4.next_states.add(state_1_10, state_1_11, state_1_12, state_1_13, state_1_14, state_1_15, state_1_16, state_1_17, state_1_20, state_1_21)
    workflow_1.first_state = state_1_1
    workflow_1.save(skip_autoupdate=True)


    # IG Metall workflow (ABK)
    workflow_2 = Workflow(name='IG Metall (ABK)')
    workflow_2.save(skip_autoupdate=True)
    state_2_1 = State(name='in Bearbeitung',
                        workflow=workflow_2,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_2_1.save(skip_autoupdate=True)
    state_2_2 = State(name='gestellt',
                        workflow=workflow_2,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_2_2.save(skip_autoupdate=True)
    state_2_3 = State(name='verworfen',
                        workflow=workflow_2,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_2_3.save(skip_autoupdate=True)
    state_2_4 = State(name='geprüft',
                        workflow=workflow_2,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_2_4.save(skip_autoupdate=True)
    state_2_5 = State(name='an Federführenden zugeteilt',
                        workflow=workflow_2,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_2_5.save(skip_autoupdate=True)
    state_2_6 = State(name='empfohlen durch Federführenden',
                        workflow=workflow_2,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_2_6.save(skip_autoupdate=True)
    state_2_7 = State(name='beraten durch gfVm',
                        workflow=workflow_2,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_2_7.save(skip_autoupdate=True)
    state_2_8 = State(name='beraten durch Vorstand',
                        workflow=workflow_2,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_2_8.save(skip_autoupdate=True)
    state_2_9 = State(name='beraten durch ABK',
                        workflow=workflow_2,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_2_9.save(skip_autoupdate=True)
    state_2_10 = State(name='Freigabe',
                        workflow=workflow_2,
                        allow_create_poll=True,
                        merge_amendment_into_final=-1)
    state_2_10.save(skip_autoupdate=True)
    state_2_20 = State(name='angenommen',
                        workflow=workflow_2,
                        recommendation_label='Annahme',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_2_20.save(skip_autoupdate=True)
    state_2_21 = State(name='angenommen in geänderter Fassung',
                        workflow=workflow_2,
                        recommendation_label='Annahme in geänderter Fassung',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_2_21.save(skip_autoupdate=True)
    state_2_22 = State(name='angenommen als Material zu',
                        workflow=workflow_2,
                        recommendation_label='Annahme als Material zu',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='green',
                        merge_amendment_into_final=1)
    state_2_22.save(skip_autoupdate=True)
    state_2_23 = State(name='angenommen als Material an Vorstand',
                        workflow=workflow_2,
                        recommendation_label='Annahme als Material an den Vorstand',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_2_23.save(skip_autoupdate=True)
    state_2_24 = State(name='erledigt durch',
                        workflow=workflow_2,
                        recommendation_label='Erledigt durch',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_2_24.save(skip_autoupdate=True)
    state_2_25 = State(name='erledigt durch Praxis',
                        workflow=workflow_2,
                        recommendation_label='Erledigt durch Praxis',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_2_25.save(skip_autoupdate=True)
    state_2_26 = State(name='abgelehnt',
                        workflow=workflow_2,
                        recommendation_label='Ablehnung',
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_2_26.save(skip_autoupdate=True)
    state_2_27 = State(name='nicht befasst',
                        workflow=workflow_2,
                        recommendation_label='Nichtbefassung',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_2_27.save(skip_autoupdate=True)
    state_2_28 = State(name='zurückgezogen',
                        workflow=workflow_2,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_2_28.save(skip_autoupdate=True)
    state_2_29 = State(name='Sonstiges',
                        workflow=workflow_2,
                        recommendation_label='Sonstiges',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_2_29.save(skip_autoupdate=True)
    state_2_1.next_states.add(state_2_2, state_2_3)
    state_2_2.next_states.add(state_2_4, state_2_28)
    state_2_4.next_states.add(state_2_5, state_2_28)
    state_2_5.next_states.add(state_2_6, state_2_28)
    state_2_6.next_states.add(state_2_7, state_2_28)
    state_2_7.next_states.add(state_2_8, state_2_28)
    state_2_8.next_states.add(state_2_9, state_2_28)
    state_2_9.next_states.add(state_2_10, state_2_28)
    state_2_10.next_states.add(state_2_20, state_2_21, state_2_22, state_2_23, state_2_24, state_2_25, state_2_26,state_2_27, state_2_28, state_2_29)
    workflow_2.first_state = state_2_1
    workflow_2.save(skip_autoupdate=True)

    # IG Metall workflow (SBK)
    workflow_3 = Workflow(name='IG Metall (SBK)')
    workflow_3.save(skip_autoupdate=True)
    state_3_1 = State(name='in Bearbeitung',
                        workflow=workflow_3,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_3_1.save(skip_autoupdate=True)
    state_3_2 = State(name='gestellt',
                        workflow=workflow_3,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_3_2.save(skip_autoupdate=True)
    state_3_3 = State(name='verworfen',
                      workflow=workflow_3,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_3_3.save(skip_autoupdate=True)
    state_3_4 = State(name='geprüft',
                        workflow=workflow_3,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_3_4.save(skip_autoupdate=True)
    state_3_5 = State(name='an Federführenden zugeteilt',
                        workflow=workflow_3,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_3_5.save(skip_autoupdate=True)
    state_3_6 = State(name='empfohlen durch Federführenden',
                        workflow=workflow_3,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_3_6.save(skip_autoupdate=True)
    state_3_7 = State(name='beraten durch gfVm',
                        workflow=workflow_3,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_3_7.save(skip_autoupdate=True)
    state_3_8 = State(name='beraten durch Vorstand',
                        workflow=workflow_3,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_3_8.save(skip_autoupdate=True)
    state_3_9 = State(name='beraten durch SBK',
                        workflow=workflow_3,
                        restriction=[
                            "motions.can_see_internal",
                            "motions.can_manage_metadata",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_3_9.save(skip_autoupdate=True)
    state_3_10 = State(name='Freigabe',
                        workflow=workflow_3,
                        allow_create_poll=True,
                        merge_amendment_into_final=-1)
    state_3_10.save(skip_autoupdate=True)
    state_3_20 = State(name='angenommen',
                        workflow=workflow_3,
                        recommendation_label='Annahme',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_3_20.save(skip_autoupdate=True)
    state_3_21 = State(name='abgelehnt',
                        workflow=workflow_3,
                        recommendation_label='Ablehnung',
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_3_21.save(skip_autoupdate=True)
    state_3_22 = State(name='nicht befasst',
                        workflow=workflow_3,
                        recommendation_label='Nichtbefassung',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_3_22.save(skip_autoupdate=True)
    state_3_23 = State(name='zurückgezogen',
                        workflow=workflow_3,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_3_23.save(skip_autoupdate=True)
    state_3_1.next_states.add(state_3_2, state_3_3)
    state_3_2.next_states.add(state_3_4, state_3_23)
    state_3_4.next_states.add(state_3_5, state_3_23)
    state_3_5.next_states.add(state_3_6, state_3_23)
    state_3_6.next_states.add(state_3_7, state_3_23)
    state_3_7.next_states.add(state_3_8, state_3_23)
    state_3_8.next_states.add(state_3_9, state_3_23)
    state_3_9.next_states.add(state_3_10, state_3_23)
    state_3_10.next_states.add(state_3_20, state_3_21, state_3_22, state_3_23)
    workflow_3.first_state = state_3_1
    workflow_3.save(skip_autoupdate=True)


    # verdi workflow
    workflow_4 = Workflow(name='ver.di')
    workflow_4.save(skip_autoupdate=True)
    state_4_1 = State(name='in Bearbeitung',
                        workflow=workflow_4,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_4_1.save(skip_autoupdate=True)
    state_4_2 = State(name='gestellt',
                        workflow=workflow_4,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_4_2.save(skip_autoupdate=True)
    state_4_3 = State(name='verworfen',
                        workflow=workflow_4,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_4_3.save(skip_autoupdate=True)
    state_4_4 = State(name='geprüft',
                        workflow=workflow_4,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_4_4.save(skip_autoupdate=True)
    state_4_5 = State(name='zugeordnet',
                        workflow=workflow_4,
                        merge_amendment_into_final=-1)
    state_4_5.save(skip_autoupdate=True)
    state_4_6 = State(name='Empfehlung der ABK liegt vor',
                        workflow=workflow_4,
                        allow_create_poll=True,
                        merge_amendment_into_final=-1)
    state_4_6.save(skip_autoupdate=True)
    state_4_10 = State(name='angenommen',
                        workflow=workflow_4,
                        recommendation_label='Annahme',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_4_10.save(skip_autoupdate=True)
    state_4_11 = State(name='angenommen und weitergeleitet an',
                        workflow=workflow_4,
                        recommendation_label='Annahme und Weiterleitung an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='green',
                        merge_amendment_into_final=1)
    state_4_11.save(skip_autoupdate=True)
    state_4_12 = State(name='angenommen in geänderter Fassung',
                        workflow=workflow_4,
                        recommendation_label='Annahme in geänderter Fassung',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_4_12.save(skip_autoupdate=True)
    state_4_13 = State(name='angenommen in geänderter Fassung und weitergeleitet an',
                        workflow=workflow_4,
                        recommendation_label='Annahme in geänderter Fassung und Weiterleitung an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='green',
                        merge_amendment_into_final=1)
    state_4_13.save(skip_autoupdate=True)
    state_4_14 = State(name='angenommen als Arbeitsmaterial zu Antrag',
                        workflow=workflow_4,
                        recommendation_label='Annahme als Arbeitsmaterial zu Antrag',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='green',
                        merge_amendment_into_final=1)
    state_4_14.save(skip_autoupdate=True)
    state_4_15 = State(name='angenommen als Arbeitsmaterial zur Weiterleitung an',
                        workflow=workflow_4,
                        recommendation_label='Annahme als Arbeitsmaterial zur Weiterleitung an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='green',
                        merge_amendment_into_final=1)
    state_4_15.save(skip_autoupdate=True)
    state_4_16 = State(name='angenommen in geänderter Fassung durch Änderungsantrag',
                        workflow=workflow_4,
                        recommendation_label='Annahme in geänderter Fassung durch Änderungsantrag',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='green',
                        merge_amendment_into_final=1)
    state_4_16.save(skip_autoupdate=True)
    state_4_17 = State(name='angenommen in geänderter Fassung als Material',
                        workflow=workflow_4,
                        recommendation_label='Annahme in geänderter Fassung als Material',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='green',
                        merge_amendment_into_final=1)
    state_4_17.save(skip_autoupdate=True)
    state_4_18 = State(name='erledigt durch',
                        workflow=workflow_4,
                        recommendation_label='Erledigt durch',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_4_18.save(skip_autoupdate=True)
    state_4_19 = State(name='abgelehnt',
                        workflow=workflow_4,
                        recommendation_label='Ablehnung',
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_4_19.save(skip_autoupdate=True)
    state_4_20 = State(name='nicht befasst',
                        workflow=workflow_4,
                        recommendation_label='Nichtbefassung',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_4_20.save(skip_autoupdate=True)
    state_4_21 = State(name='zurückgezogen',
                        workflow=workflow_4,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_4_21.save(skip_autoupdate=True)
    state_4_22 = State(name='Sonstiges',
                        workflow=workflow_4,
                        recommendation_label='Sonstiges',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_4_22.save(skip_autoupdate=True)
    state_4_1.next_states.add(state_4_2, state_4_3)
    state_4_2.next_states.add(state_4_4, state_4_21)
    state_4_4.next_states.add(state_4_5, state_4_21)
    state_4_5.next_states.add(state_4_6, state_4_21)
    state_4_6.next_states.add(state_4_10, state_4_11, state_4_12, state_4_13, state_4_14, state_4_15, state_4_16, state_4_17, state_4_18, state_4_19, state_4_20, state_4_21, state_4_22)
    workflow_4.first_state = state_4_1
    workflow_4.save(skip_autoupdate=True)


    # GEW workflow
    workflow_5 = Workflow(name='GEW')
    workflow_5.save(skip_autoupdate=True)
    state_5_1 = State(name='in Bearbeitung',
                        workflow=workflow_5,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_5_1.save(skip_autoupdate=True)
    state_5_2 = State(name='gestellt',
                        workflow=workflow_5,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_5_2.save(skip_autoupdate=True)
    state_5_3 = State(name='verworfen',
                        workflow=workflow_5,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_5_3.save(skip_autoupdate=True)
    state_5_4 = State(name='geprüft',
                        workflow=workflow_5,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_5_4.save(skip_autoupdate=True)
    state_5_5 = State(name='zugeordnet',
                        workflow=workflow_5,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_5_5.save(skip_autoupdate=True)
    state_5_6 = State(name='Empfehlung der ABK liegt vor',
                        workflow=workflow_5,
                        allow_create_poll=True,
                        merge_amendment_into_final=-1)
    state_5_6.save(skip_autoupdate=True)
    state_5_10 = State(name='angenommen',
                        workflow=workflow_5,
                        recommendation_label='Annahme',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_5_10.save(skip_autoupdate=True)
    state_5_11 = State(name='angenommen mit Änderungen',
                        workflow=workflow_5,
                        recommendation_label='Annahme mit Änderungen',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_5_11.save(skip_autoupdate=True)
    state_5_12 = State(name='angenommen als Material zu',
                        workflow=workflow_5,
                        recommendation_label='Annahme als Material zu',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=1)
    state_5_12.save(skip_autoupdate=True)
    state_5_13 = State(name='abgelehnt',
                        workflow=workflow_5,
                        recommendation_label='Ablehnung',
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_5_13.save(skip_autoupdate=True)
    state_5_14 = State(name='Erledigt',
                        workflow=workflow_5,
                        recommendation_label='Erledigt',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_5_14.save(skip_autoupdate=True)
    state_5_15 = State(name='überwiesen an',
                        workflow=workflow_5,
                        recommendation_label='Überweisung an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_5_15.save(skip_autoupdate=True)
    state_5_16 = State(name='überwiesen als Material an',
                        workflow=workflow_5,
                        recommendation_label='Überweisung als Material an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_5_16.save(skip_autoupdate=True)
    state_5_20 = State(name='nicht befasst',
                        workflow=workflow_5,
                        recommendation_label='Nichtbefassung',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_5_20.save(skip_autoupdate=True)
    state_5_21 = State(name='zurückgezogen',
                        workflow=workflow_5,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_5_21.save(skip_autoupdate=True)
    state_5_22 = State(name='Sonstiges',
                        workflow=workflow_5,
                        recommendation_label='Sonstiges',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_5_22.save(skip_autoupdate=True)
    state_5_1.next_states.add(state_5_2, state_5_3)
    state_5_2.next_states.add(state_5_4, state_5_21)
    state_5_4.next_states.add(state_5_5, state_5_21)
    state_5_5.next_states.add(state_5_6, state_5_21)
    state_5_6.next_states.add(state_5_10, state_5_11, state_5_12, state_5_13, state_5_14, state_5_15, state_5_16, state_5_20, state_5_21, state_5_22)
    workflow_5.first_state = state_5_1
    workflow_5.save(skip_autoupdate=True)


    # IG BAU workflow
    workflow_6 = Workflow(name='IG BAU')
    workflow_6.save(skip_autoupdate=True)
    state_6_1 = State(name='in Bearbeitung',
                        workflow=workflow_6,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_6_1.save(skip_autoupdate=True)
    state_6_2 = State(name='gestellt',
                        workflow=workflow_6,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_6_2.save(skip_autoupdate=True)
    state_6_3 = State(name='verworfen',
                        workflow=workflow_6,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_6_3.save(skip_autoupdate=True)
    state_6_4 = State(name='geprüft',
                        workflow=workflow_6,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_6_4.save(skip_autoupdate=True)
    state_6_5 = State(name='zugeordnet',
                        workflow=workflow_6,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_6_5.save(skip_autoupdate=True)
    state_6_6 = State(name='Empfehlung der SABK liegt vor',
                        workflow=workflow_6,
                        allow_create_poll=True,
                        merge_amendment_into_final=-1)
    state_6_6.save(skip_autoupdate=True)
    state_6_10 = State(name='angenommen',
                        workflow=workflow_6,
                        recommendation_label='Annahme',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_6_10.save(skip_autoupdate=True)
    state_6_11 = State(name='angenommen mit Änderungen',
                        workflow=workflow_6,
                        recommendation_label='Annahme mit Änderungen',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_6_11.save(skip_autoupdate=True)
    state_6_12 = State(name='angenommen als Material an',
                        workflow=workflow_6,
                        recommendation_label='Annahme als Material an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_6_12.save(skip_autoupdate=True)
    state_6_12a = State(name='angenommen mit Änderungen als Material an',
                        workflow=workflow_6,
                        recommendation_label='Annahme mit Änderungen als Material an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=1)
    state_6_12a.save(skip_autoupdate=True)
    state_6_13 = State(name='abgelehnt',
                        workflow=workflow_6,
                        recommendation_label='Ablehnung',
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_6_13.save(skip_autoupdate=True)
    state_6_14 = State(name='erledigt durch Annahme von',
                        workflow=workflow_6,
                        recommendation_label='Erledigt durch Annahme von',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_6_14.save(skip_autoupdate=True)
    state_6_15 = State(name='erledigt durch Paxis, Beschluss- oder Satzungslage',
                        workflow=workflow_6,
                        recommendation_label='Erledigt durch Paxis, Beschluss- oder Satzungslage',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_6_15.save(skip_autoupdate=True)
    state_6_20 = State(name='nicht befasst aus formalen Gründen',
                        workflow=workflow_6,
                        recommendation_label='Nichtbefassung aus formalen Gründen',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_6_20.save(skip_autoupdate=True)
    state_6_21 = State(name='zurückgezogen',
                        workflow=workflow_6,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_6_21.save(skip_autoupdate=True)
    state_6_22 = State(name='Sonstiges',
                        workflow=workflow_6,
                        recommendation_label='Sonstiges',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_6_22.save(skip_autoupdate=True)
    state_6_1.next_states.add(state_6_2, state_6_3)
    state_6_2.next_states.add(state_6_4, state_6_21)
    state_6_4.next_states.add(state_6_5, state_6_21)
    state_6_5.next_states.add(state_6_6, state_6_21)
    state_6_6.next_states.add(state_6_10, state_6_11, state_6_12, state_6_12a, state_6_13, state_6_14, state_6_15, state_6_20, state_6_21, state_6_22)
    workflow_6.first_state = state_6_1
    workflow_6.save(skip_autoupdate=True)


    # IG BCE workflow
    workflow_7 = Workflow(name='IG BCE')
    workflow_7.save(skip_autoupdate=True)
    state_7_1 = State(name='in Bearbeitung',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_7_1.save(skip_autoupdate=True)
    state_7_2 = State(name='gestellt',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_7_2.save(skip_autoupdate=True)
    state_7_3 = State(name='geprüft',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_7_3.save(skip_autoupdate=True)
    state_7_4 = State(name='zugeordnet zu Sachgebieten',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_7_4.save(skip_autoupdate=True)
    state_7_5a = State(name='zugeordnet zu VB 1',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_7_5a.save(skip_autoupdate=True)
    state_7_5b = State(name='zugeordnet zu VB 2',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_7_5b.save(skip_autoupdate=True)
    state_7_5c = State(name='zugeordnet zu VB 3',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_7_5c.save(skip_autoupdate=True)
    state_7_5d = State(name='zugeordnet zu VB 4',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_7_5d.save(skip_autoupdate=True)
    state_7_5e = State(name='zugeordnet zu VB 5',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_7_5e.save(skip_autoupdate=True)
    state_7_6 = State(name='zugewiesen an Antragskommission',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_7_6.save(skip_autoupdate=True)
    state_7_7 = State(name='Empfehlung liegt vor',
                        workflow=workflow_7,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_7_7.save(skip_autoupdate=True)
    state_7_8 = State(name='Freigabe',
                    workflow=workflow_7,
                    allow_create_poll=True,
                    merge_amendment_into_final=-1)
    state_7_8.save(skip_autoupdate=True)
    state_7_10 = State(name='angenommen',
                        workflow=workflow_7,
                        recommendation_label='Annahme',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_7_10.save(skip_autoupdate=True)
    state_7_11 = State(name='angenommen mit Änderungen',
                        workflow=workflow_7,
                        recommendation_label='Annahme mit Änderungen',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_7_11.save(skip_autoupdate=True)
    state_7_12 = State(name='angenommen als Material zu',
                        workflow=workflow_7,
                        recommendation_label='Annahme als Material zu',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_7_12.save(skip_autoupdate=True)
    state_7_13 = State(name='abgelehnt',
                        workflow=workflow_7,
                        recommendation_label='Ablehnung',
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_7_13.save(skip_autoupdate=True)
    state_7_14 = State(name='erledigt durch',
                        workflow=workflow_7,
                        recommendation_label='Erledigt durch',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_7_14.save(skip_autoupdate=True)
    state_7_15 = State(name='weitergeleitet an',
                        workflow=workflow_7,
                        recommendation_label='Weiterleitung an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_7_15.save(skip_autoupdate=True)
    state_7_16 = State(name='nicht befasst',
                        workflow=workflow_7,
                        recommendation_label='Nichtbefassung',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_7_16.save(skip_autoupdate=True)
    state_7_21 = State(name='zurückgezogen',
                        workflow=workflow_7,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_7_21.save(skip_autoupdate=True)
    state_7_22 = State(name='Sonstiges',
                        workflow=workflow_7,
                        recommendation_label='Sonstiges',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_7_22.save(skip_autoupdate=True)
    state_7_1.next_states.add(state_7_2)
    state_7_2.next_states.add(state_7_3, state_7_21)
    state_7_3.next_states.add(state_7_4, state_7_21)
    state_7_4.next_states.add(state_7_5a, state_7_5b, state_7_5c, state_7_5d, state_7_5e, state_7_21)
    state_7_5a.next_states.add(state_7_6, state_7_21)
    state_7_5b.next_states.add(state_7_6, state_7_21)
    state_7_5c.next_states.add(state_7_6, state_7_21)
    state_7_5d.next_states.add(state_7_6, state_7_21)
    state_7_5e.next_states.add(state_7_6, state_7_21)
    state_7_6.next_states.add(state_7_7, state_7_21)
    state_7_7.next_states.add(state_7_8, state_7_21)
    state_7_8.next_states.add(state_7_10, state_7_11, state_7_12, state_7_13, state_7_14, state_7_15, state_7_16, state_7_21, state_7_22)
    workflow_7.first_state = state_7_1
    workflow_7.save(skip_autoupdate=True)

    # IG BCE workflow #2
    workflow_8 = Workflow(name='IG BCE BEZ/LBZ')
    workflow_8.save(skip_autoupdate=True)
    state_8_1 = State(name='in Bearbeitung',
                        workflow=workflow_8,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_8_1.save(skip_autoupdate=True)
    state_8_2 = State(name='gestellt',
                        workflow=workflow_8,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_8_2.save(skip_autoupdate=True)
    state_8_3 = State(name='geprüft',
                        workflow=workflow_8,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_8_3.save(skip_autoupdate=True)
    state_8_4 = State(name='zugeordnet zu Sachgebiet',
                        workflow=workflow_8,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_8_4.save(skip_autoupdate=True)
    state_8_5 = State(name='Freigabe',
                    workflow=workflow_8,
                    allow_create_poll=True,
                    merge_amendment_into_final=-1)
    state_8_5.save(skip_autoupdate=True)
    state_8_10 = State(name='angenommen',
                        workflow=workflow_8,
                        recommendation_label='Annahme',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_8_10.save(skip_autoupdate=True)
    state_8_11 = State(name='angenommen mit Änderungen',
                        workflow=workflow_8,
                        recommendation_label='Annahme mit Änderungen',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_8_11.save(skip_autoupdate=True)
    state_8_12 = State(name='angenommen als Material zu',
                        workflow=workflow_8,
                        recommendation_label='Annahme als Material zu',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_8_12.save(skip_autoupdate=True)
    state_8_13 = State(name='abgelehnt',
                        workflow=workflow_8,
                        recommendation_label='Ablehnung',
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_8_13.save(skip_autoupdate=True)
    state_8_14 = State(name='erledigt durch',
                        workflow=workflow_8,
                        recommendation_label='Erledigt durch',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_8_14.save(skip_autoupdate=True)
    state_8_15 = State(name='weitergeleitet an',
                        workflow=workflow_8,
                        recommendation_label='Weiterleitung an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_8_15.save(skip_autoupdate=True)
    state_8_16 = State(name='nicht befasst',
                        workflow=workflow_8,
                        recommendation_label='Nichtbefassung',
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_8_16.save(skip_autoupdate=True)
    state_8_21 = State(name='zurückgezogen',
                        workflow=workflow_8,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_8_21.save(skip_autoupdate=True)
    state_8_22 = State(name='Sonstiges',
                        workflow=workflow_8,
                        recommendation_label='Sonstiges',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_8_22.save(skip_autoupdate=True)
    state_8_1.next_states.add(state_8_2)
    state_8_2.next_states.add(state_8_3, state_8_21)
    state_8_3.next_states.add(state_8_4, state_8_21)
    state_8_4.next_states.add(state_8_5, state_8_21)
    state_8_5.next_states.add(state_8_10, state_8_11, state_8_12, state_8_13, state_8_14, state_8_15, state_8_16, state_8_21, state_8_22)
    workflow_8.first_state = state_8_1
    workflow_8.save(skip_autoupdate=True)


    # EVG workflow
    workflow_9 = Workflow(name='EVG')
    workflow_9.save(skip_autoupdate=True)
    state_9_1 = State(name='in Bearbeitung',
                        workflow=workflow_9,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_submitter_edit=True,
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_9_1.save(skip_autoupdate=True)
    state_9_2 = State(name='gestellt',
                        workflow=workflow_9,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_9_2.save(skip_autoupdate=True)
    state_9_3 = State(name='geprüft',
                        workflow=workflow_9,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        dont_set_identifier=True,
                        merge_amendment_into_final=-1)
    state_9_3.save(skip_autoupdate=True)
    state_9_4 = State(name='zugeordnet zu Sachgebiet',
                        workflow=workflow_9,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_9_4.save(skip_autoupdate=True)
    state_9_5 = State(name='zugewiesen an AK',
                        workflow=workflow_9,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        merge_amendment_into_final=-1)
    state_9_5.save(skip_autoupdate=True)
    state_9_6 = State(name='Empfehlung der AK liegt vor',
                        workflow=workflow_9,
                        restriction=[
                            "is_submitter",
                            "motions.can_manage"
                        ],
                        allow_create_poll=True,
                        merge_amendment_into_final=-1)
    state_9_6.save(skip_autoupdate=True)
    state_9_10 = State(name='angenommen',
                        workflow=workflow_9,
                        recommendation_label='Annahme',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_9_10.save(skip_autoupdate=True)
    state_9_11 = State(name='angenommen mit Änderungen',
                        workflow=workflow_9,
                        recommendation_label='Annahme mit Änderungen',
                        css_class='green',
                        merge_amendment_into_final=1)
    state_9_11.save(skip_autoupdate=True)
    state_9_12 = State(name='verwiesen an',
                        workflow=workflow_9,
                        recommendation_label='Verweisung an',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_9_12.save(skip_autoupdate=True)
    state_9_13 = State(name='abgelehnt',
                        workflow=workflow_9,
                        recommendation_label='Ablehnung',
                        css_class='red',
                        merge_amendment_into_final=-1)
    state_9_13.save(skip_autoupdate=True)
    state_9_14 = State(name='erledigt',
                        workflow=workflow_9,
                        recommendation_label='Erledigt',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_9_14.save(skip_autoupdate=True)
    state_9_21 = State(name='zurückgewiesen',
                        workflow=workflow_9,
                        dont_set_identifier=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_9_21.save(skip_autoupdate=True)
    state_9_22 = State(name='Sonstiges',
                        workflow=workflow_9,
                        recommendation_label='Sonstiges',
                        show_recommendation_extension_field=True,
                        show_state_extension_field=True,
                        css_class='grey',
                        merge_amendment_into_final=-1)
    state_9_22.save(skip_autoupdate=True)
    state_9_1.next_states.add(state_9_2)
    state_9_2.next_states.add(state_9_3, state_9_21)
    state_9_3.next_states.add(state_9_4)
    state_9_4.next_states.add(state_9_5)
    state_9_5.next_states.add(state_9_6)
    state_9_6.next_states.add(state_9_10, state_9_11, state_9_12, state_9_13, state_9_14, state_9_22)
    workflow_9.first_state = state_9_1
    workflow_9.save(skip_autoupdate=True)


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
