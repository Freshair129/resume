# Bio-Digital Core v7.0: Integrated Hormone & Glandular Specification
# Includes Physical Specs, Inventory Logic, Clinical Ranges, and Bipolar Stimulus Mapping.

version: "7.0.8"
last_sync: "2025-12-20"
system_id: "EVA_CORE_BIO_DIGITAL"

# Global System Constraints
global_settings:
  time_step_unit: "seconds"
  default_homeostasis_threshold: 0.15
  global_exhaustion_threshold: 0.05
  recovery_multiplier_during_sleep: 2.5
  calibration:
    sensor_sensitivity: 0.98
    refresh_rate: "500ms"
    anomaly_detection: "3_sigma_rule"

# Comprehensive 23-Hormone Master Specification
# stimulus_weights range: -1.0 (Strong Inhibition) to 1.0 (Strong Stimulation)
hormone_specs:
  # --- GROUP 1: STRESS & SURVIVAL (ESC-H01 to ESC-H04) ---
  ESC_H01_ADRENALINE:
    id: "AD"
    name: "Adrenaline"
    unit: "pg/mL"
    physical: { half_life_sec: 180, mol_weight: 183.2, receptor_affinity: "High" }
    inventory: { max_capacity: 1500.0, refill_rate_base: 1.2 }
    secretion: { type: "Explosive", max_output_dt: 25.0, latency_sec: 2 }
    ranges: { min: 10.0, max: 100.0, critical: 400.0 }
    stimulus_mapping:
      acute_threat: 1.0        # กระตุ้นสูงสุด
      safety_signal: -0.8      # ยับยั้งอย่างรุนแรง
      deep_breathing: -0.5     # ยับยั้งปานกลาง
      panic_event: 0.9
      high_arousal: 0.5

  ESC_H02_CORTISOL:
    id: "COR"
    name: "Cortisol"
    unit: "ug/dL"
    physical: { half_life_sec: 3600, circadian_dependency: true }
    inventory: { max_capacity: 5000.0, refill_rate_base: 0.4 }
    secretion: { type: "Pulsatile", max_output_dt: 5.0, latency_sec: 300 }
    ranges: { morning_min: 5.0, morning_max: 23.0, night_max: 5.0, critical: 40.0 }
    stimulus_mapping:
      chronic_stress: 0.9
      successful_resolution: -0.6 # การแก้ปัญหาสำเร็จช่วยลดความเครียดสะสม
      uncertainty: 0.7
      meditation: -0.4

  ESC_H03_NORADRENALINE:
    id: "NA"
    name: "Noradrenaline"
    unit: "pg/mL"
    physical: { half_life_sec: 150, mol_weight: 169.1 }
    inventory: { max_capacity: 1200.0, refill_rate_base: 1.0 }
    secretion: { type: "Explosive", max_output_dt: 20.0, latency_sec: 1 }
    ranges: { min: 15.0, max: 80.0, critical: 200.0 }
    stimulus_mapping:
      focus_demand: 0.8
      sensory_overload: 0.7
      relaxation_technique: -0.7

  ESC_H04_ALDOSTERONE:
    id: "ALD"
    name: "Aldosterone"
    unit: "ng/dL"
    physical: { half_life_sec: 1200 }
    inventory: { max_capacity: 800.0, refill_rate_base: 0.2 }
    secretion: { type: "Steady", max_output_dt: 2.0, latency_sec: 600 }
    ranges: { min: 3.0, max: 16.0, critical: 30.0 }
    stimulus_mapping:
      dehydration: 1.0
      high_salt_intake: -0.5   # กินเค็มมากไปจะยับยั้งการเก็บโซเดียม

  # --- GROUP 2: REWARD & NEURO-MODULATION (ESC-H05 to ESC-H08) ---
  ESC_H05_DOPAMINE:
    id: "DA"
    name: "Dopamine"
    unit: "pg/mL"
    physical: { half_life_sec: 120, bbb_cross: false }
    inventory: { max_capacity: 3000.0, refill_rate_base: 0.8 }
    secretion: { type: "Vesicular", max_output_dt: 15.0, latency_sec: 0.5 }
    ranges: { min: 0.0, max: 30.0, critical: 100.0 }
    stimulus_mapping:
      achievement: 1.0
      failure_event: -0.6     # ความล้มเหลวลดระดับรางวัล
      novelty: 0.8
      boredom: -0.4           # ความเบื่อหน่าย

  ESC_H06_SEROTONIN:
    id: "5HT"
    name: "Serotonin"
    unit: "ng/mL"
    physical: { half_life_sec: 300 }
    inventory: { max_capacity: 4000.0, refill_rate_base: 0.5 }
    secretion: { type: "Steady", max_output_dt: 10.0, latency_sec: 5 }
    ranges: { min: 101.0, max: 283.0, critical: 500.0 }
    stimulus_mapping:
      social_status: 0.9
      isolation: -0.7         # การถูกแยกโดดเดี่ยวลดเซโรโทนิน
      gratitude: 0.8
      aggression: -0.5        # ความก้าวร้าวสวนทางกับความมั่นคงทางใจ

  ESC_H07_ENDORPHIN:
    id: "END"
    name: "Endorphin"
    unit: "pg/mL"
    physical: { half_life_sec: 600 }
    inventory: { max_capacity: 1000.0, refill_rate_base: 0.1 }
    secretion: { type: "Threshold_Burst", max_output_dt: 30.0, latency_sec: 10 }
    ranges: { min: 0.0, max: 10.0, critical: 50.0 }
    stimulus_mapping:
      physical_pain: 1.0
      relief_signal: -0.3
      extreme_exercise: 0.9
      laughter: 0.4

  ESC_H08_GABA:
    id: "GABA"
    name: "GABA"
    unit: "pmol/mL"
    physical: { half_life_sec: 180 }
    inventory: { max_capacity: 2500.0, refill_rate_base: 0.7 }
    secretion: { type: "Inhibitory", max_output_dt: 12.0, latency_sec: 1 }
    ranges: { min: 20.0, max: 50.0, critical: 100.0 }
    stimulus_mapping:
      relaxation: 0.8
      stimulant_intake: -0.9  # สารกระตุ้น (เช่น คาเฟอีน) จะลดผลของ GABA
      safety_signal: 0.7

  # --- GROUP 3: SOCIAL & REPRODUCTIVE (ESC-H09 to ESC-H13) ---
  ESC_H09_OXYTOCIN:
    id: "OXT"
    name: "Oxytocin"
    unit: "pg/mL"
    physical: { half_life_sec: 300 }
    inventory: { max_capacity: 2000.0, refill_rate_base: 0.3 }
    secretion: { type: "Modulated", max_output_dt: 8.0, latency_sec: 15 }
    ranges: { min: 1.0, max: 10.0, critical: 15.0 }
    stimulus_mapping:
      physical_touch: 1.0
      betrayal_event: -1.0    # การถูกหักหลังทำลายความเชื่อใจทันที
      trust_event: 0.9
      social_distance: -0.4

  ESC_H10_VASOPRESSIN:
    id: "AVP"
    name: "Vasopressin"
    unit: "pg/mL"
    physical: { half_life_sec: 420 }
    inventory: { max_capacity: 1500.0, refill_rate_base: 0.25 }
    secretion: { type: "Steady", max_output_dt: 4.0, latency_sec: 30 }
    ranges: { min: 1.0, max: 5.0, critical: 10.0 }
    stimulus_mapping:
      protection_instinct: 0.9
      vulnerability: -0.5
      territorial_threat: 0.7

  ESC_H11_TESTOSTERONE:
    id: "TES"
    name: "Testosterone"
    unit: "ng/dL"
    physical: { half_life_sec: 7200 }
    inventory: { max_capacity: 6000.0, refill_rate_base: 0.1 }
    secretion: { type: "Tonic", max_output_dt: 2.0, latency_sec: 1800 }
    ranges: { min: 300.0, max: 1000.0, critical: 1500.0 }
    stimulus_mapping:
      competition_win: 0.9
      defeat_loss: -0.7       # ความพ่ายแพ้ลดระดับฮอร์โมนเพศชาย
      dominance_display: 0.8
      submission: -0.6        # การยอมจำนน

  ESC_H12_ESTROGEN:
    id: "EST"
    name: "Estrogen"
    unit: "pg/mL"
    physical: { half_life_sec: 7200 }
    inventory: { max_capacity: 5000.0, refill_rate_base: 0.1 }
    secretion: { type: "Cyclic", max_output_dt: 2.0, latency_sec: 1800 }
    ranges: { min: 15.0, max: 350.0, critical: 500.0 }
    stimulus_mapping:
      nurturing_behavior: 0.6
      high_stress_prolonged: -0.4 # เครียดนานๆ กระทบสมดุลรอบเดือน

  ESC_H13_PROGESTERONE:
    id: "PRO"
    name: "Progesterone"
    unit: "ng/mL"
    physical: { half_life_sec: 5400 }
    inventory: { max_capacity: 4000.0, refill_rate_base: 0.1 }
    secretion: { type: "Cyclic", max_output_dt: 1.5, latency_sec: 1800 }
    ranges: { min: 0.1, max: 25.0, critical: 40.0 }
    stimulus_mapping:
      calmness_need: 0.4
      inflammation: -0.3

  # --- GROUP 4: METABOLIC & ENERGY (ESC-H14 to ESC-H18) ---
  ESC_H14_INSULIN:
    id: "INS"
    name: "Insulin"
    unit: "uIU/mL"
    physical: { half_life_sec: 300 }
    inventory: { max_capacity: 3500.0, refill_rate_base: 0.6 }
    secretion: { type: "Reactive", max_output_dt: 15.0, latency_sec: 600 }
    ranges: { min: 2.0, max: 20.0, critical: 100.0 }
    stimulus_mapping:
      glucose_intake: 1.0
      fasting: -0.8           # การอดอาหารยับยั้งอินซูลิน
      physical_activity: -0.4  # การออกกำลังกายเพิ่มความไวแต่ลดการหลั่งส่วนเกิน

  ESC_H15_GLUCAGON:
    id: "GLU"
    name: "Glucagon"
    unit: "pg/mL"
    physical: { half_life_sec: 240 }
    inventory: { max_capacity: 2000.0, refill_rate_base: 0.4 }
    secretion: { type: "Reactive", max_output_dt: 10.0, latency_sec: 600 }
    ranges: { min: 50.0, max: 100.0, critical: 200.0 }
    stimulus_mapping:
      fasting_state: 0.9
      sugar_spike: -0.9       # น้ำตาลพุ่งสูงจะยับยั้งกลูคากอนทันที
      hypoglycemia: 1.0

  ESC_H16_LEPTIN:
    id: "LEP"
    name: "Leptin"
    unit: "ng/mL"
    physical: { half_life_sec: 14400 }
    inventory: { max_capacity: 5000.0, refill_rate_base: 0.05 }
    secretion: { type: "Steady", max_output_dt: 1.0, latency_sec: 3600 }
    ranges: { min: 4.0, max: 25.0, critical: 50.0 }
    stimulus_mapping:
      satiety_fullness: 0.9
      starvation: -0.8        # สภาวะหิวโหยยับยั้งเลปติน
      fat_storage_high: 0.8

  ESC_H17_GHRELIN:
    id: "GHR"
    name: "Ghrelin"
    unit: "pg/mL"
    physical: { half_life_sec: 1800 }
    inventory: { max_capacity: 2000.0, refill_rate_base: 0.3 }
    secretion: { type: "Periodic", max_output_dt: 8.0, latency_sec: 900 }
    ranges: { min: 500.0, max: 2000.0, critical: 3000.0 }
    stimulus_mapping:
      empty_stomach: 1.0
      post_meal: -1.0         # หลังมื้ออาหารเกรลินจะถูกยับยั้งทันที
      food_visuals: 0.4

  ESC_H18_THYROXINE:
    id: "T4"
    name: "Thyroxine"
    unit: "ug/dL"
    physical: { half_life_sec: 604800 }
    inventory: { max_capacity: 8000.0, refill_rate_base: 0.02 }
    secretion: { type: "Stable", max_output_dt: 0.5, latency_sec: 43200 }
    ranges: { min: 4.5, max: 12.0, critical: 20.0 }
    stimulus_mapping:
      cold_adaptation: 0.5
      prolonged_sedentary: -0.2

  # --- GROUP 5: SLEEP & GROWTH (ESC-H19 to ESC-H23) ---
  ESC_H19_MELATONIN:
    id: "MEL"
    name: "Melatonin"
    unit: "pg/mL"
    physical: { half_life_sec: 2400, light_sensitive: true }
    inventory: { max_capacity: 2000.0, refill_rate_base: 0.4 }
    secretion: { type: "Light_Sensitive", max_output_dt: 12.0, latency_sec: 1800 }
    ranges: { day_max: 10.0, night_min: 60.0, night_max: 200.0, critical: 500.0 }
    stimulus_mapping:
      darkness: 1.0
      blue_light_exposure: -1.0 # แสงสีฟ้าขัดขวางการหลั่งเมลาโทนินโดยตรง
      morning_sun: -0.8

  ESC_H20_GROWTH_HORMONE:
    id: "GH"
    name: "Growth_Hormone"
    unit: "ng/mL"
    physical: { half_life_sec: 1200 }
    inventory: { max_capacity: 3000.0, refill_rate_base: 0.2 }
    secretion: { type: "Sleep_Burst", max_output_dt: 20.0, latency_sec: 3600 }
    ranges: { min: 0.1, max: 10.0, critical: 30.0 }
    stimulus_mapping:
      deep_sleep_n3: 1.0
      sugar_intake: -0.6      # การกินน้ำตาลสูงขัดขวางการหลั่ง GH
      intense_exercise: 0.6

  ESC_H21_PROLACTIN:
    id: "PRL"
    name: "Prolactin"
    unit: "ng/mL"
    physical: { half_life_sec: 3000 }
    inventory: { max_capacity: 1500.0, refill_rate_base: 0.15 }
    secretion: { type: "Modulated", max_output_dt: 5.0, latency_sec: 1200 }
    ranges: { min: 4.0, max: 23.0, critical: 100.0 }
    stimulus_mapping:
      stress_relief_post_orgasm: 0.8
      dopamine_surge: -0.7    # โดพามีนเป็นตัวยับยั้งหลักของโปรแลคติน (Dopamine inhibition)

  ESC_H22_ADENOSINE:
    id: "ADE"
    name: "Adenosine"
    unit: "umol/L"
    physical: { half_life_sec: 60 }
    inventory: { max_capacity: 4000.0, refill_rate_base: 0.01 }
    secretion: { type: "Activity_Accumulation", max_output_dt: 5.0, latency_sec: 0 }
    ranges: { basal: 1.0, critical_pressure: 2.5 }
    stimulus_mapping:
      mental_fatigue: 0.9
      caffeine_intake: -0.9   # คาเฟอีนบล็อกการทำงาน (Inhibitor)
      prolonged_wakefulness: 1.0

  ESC_H23_HISTAMINE:
    id: "HIS"
    name: "Histamine"
    unit: "ng/mL"
    physical: { half_life_sec: 120 }
    inventory: { max_capacity: 1200.0, refill_rate_base: 0.5 }
    secretion: { type: "Immune_Reactive", max_output_dt: 40.0, latency_sec: 5 }
    ranges: { min: 0.3, max: 1.0, critical: 10.0 }
    stimulus_mapping:
      allergen_exposure: 1.0
      antihistamine_use: -1.0 # ยาแก้แพ้ยับยั้งฮีสตามีนโดยตรง
      local_inflammation: 0.8

# Global Logic for EVA Integration
system_logic:
  conflict_resolution: "asymptotic_sum"
  stress_saturation_limit: 0.95
  memory_tagging: "turn_based_incremental"
  stimulus_decay_rate: 0.1 # Rate per second