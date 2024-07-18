-- 000003_insert_muscle_groups_and_equipment.down.sql

DELETE FROM equipment WHERE id IN (
    'equipment_olympic_barbell', 'equipment_ez_curl_bar', 'equipment_bench', 'equipment_cable_machine',
    'equipment_pull_up_bar', 'equipment_dumbbells', 'equipment_pec_deck_machine', 'equipment_lat_pulldown_machine',
    'equipment_bench_press_station', 'equipment_power_rack', 'equipment_seated_row_machine', 'equipment_leg_press_machine',
    'equipment_leg_extension_machine', 'equipment_leg_curl_machine', 'equipment_calf_raise_machine', 'equipment_preacher_curl_bench',
    'equipment_dip_station', 'equipment_kettlebells', 'equipment_tricep_pushdown_rope', 'equipment_back_extension_bench',
    'equipment_ab_bench', 'equipment_trap_bar', 'equipment_safety_squat_bar', 'equipment_weight_plates'
);

DELETE FROM muscle_groups WHERE id IN (
    'muscle_group_chest', 'muscle_group_lats', 'muscle_group_traps', 'muscle_group_front_delts',
    'muscle_group_side_delts', 'muscle_group_rear_delts', 'muscle_group_biceps', 'muscle_group_triceps',
    'muscle_group_forearms', 'muscle_group_abs', 'muscle_group_obliques', 'muscle_group_lower_back',
    'muscle_group_glutes', 'muscle_group_quads', 'muscle_group_hamstrings', 'muscle_group_calves',
    'muscle_group_hip_flexors', 'muscle_group_adductors', 'muscle_group_rhomboids', 'muscle_group_rotator_cuff',
    'muscle_group_spinal_erectors', 'muscle_group_neck'
);