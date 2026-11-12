import{C as s,o as i,c as o,a2 as l,E as r,k as n}from"./chunks/framework.BUrnCmah.js";const d=`alias: 📣 Custom voice announcement
description: >-
  Manages connection, volume, and playback of a custom voice announcement on a
  speaker, with dynamic presence-based routing (excluding TVs).
icon: m3o:nest-audio
fields:
  speaker:
    name: 📢 Default Speaker
    description: >-
      Select the default speaker (used as fallback or when dynamic routing is
      disabled)
    required: true
    selector:
      entity:
        filter:
          domain: media_player
  text:
    name: 📃 Message text
    description: Text to play on the speaker
    required: true
    selector:
      text: {}
  speaker_dinamico:
    name: 🧠 Dynamic Speaker Routing
    description: >-
      When enabled, plays the announcement in the room where presence is
      detected
    default: false
    selector:
      boolean: {}
  modalita_dinamica:
    name: 🔄 Multiple Presence Mode
    description: >-
      Choose what happens when people are detected in multiple rooms at the same
      time
    default: prima_stanza
    selector:
      select:
        mode: dropdown
        options:
          - label: Play only in the first detected room
            value: prima_stanza
          - label: Play in all occupied rooms
            value: tutte_le_stanze
          - label: Use the default speaker
            value: solo_default
sequence:
  - variables:
      speakers_list: |
        {% if speaker_dinamico %}
          {% set device_classes = ['motion', 'presence', 'occupancy'] %}
          
          {# Find all currently active presence sensors #}
          {% set active_sensors = states.binary_sensor 
            | selectattr('state', 'eq', 'on') 
            | selectattr('attributes.device_class', 'defined')
            | selectattr('attributes.device_class', 'in', device_classes)
            | map(attribute='entity_id') | list %}
          
          {# Extract areas linked to these sensors #}
          {% set ns_area = namespace(areas=[]) %}
          {% for s in active_sensors %}
            {% set a = area_id(s) %}
            {% if a and a not in ns_area.areas %}
              {% set ns_area.areas = ns_area.areas + [a] %}
            {% endif %}
          {% endfor %}
          
          {# Scan areas to find valid speakers #}
          {% set ns_speakers = namespace(found=[]) %}
          {% for area in ns_area.areas %}
            {% set current_players = namespace(entities=[]) %}
            
            {% for p in area_entities(area) if p.startswith('media_player.') %}
              {% set s = states[p] %}
              {% if s is not none %}
                {% set fn = s.attributes.friendly_name | default('') | lower %}
                {% set dc = s.attributes.device_class | default('') %}
                
                {# Anti-TV filters #}
                {% if 'tv' not in fn 
                    and dc not in ['tv', 'receiver'] 
                    and 'source_list' not in s.attributes 
                    and 'activity_list' not in s.attributes 
                    and 'current_activity' not in s.attributes %}
                  {% set current_players.entities = current_players.entities + [p] %}
                {% endif %}
              {% endif %}
            {% endfor %}
            
            {# If a valid speaker is found in this area, add it to the list #}
            {% if current_players.entities | length > 0 %}
              {% set ns_speakers.found = ns_speakers.found + [current_players.entities | first] %}
            {% endif %}
          {% endfor %}
          
          {# Output handling #}
          {% if ns_speakers.found | length > 0 %}
            {% if ns_speakers.found | length > 1 and modalita_dinamica == 'solo_default' %}
              {{ [speaker] }}
            {% elif modalita_dinamica == 'tutte_le_stanze' %}
              {{ ns_speakers.found }}
            {% else %}
              {{ [ns_speakers.found | first] }}
            {% endif %}
          {% else %}
            {{ [speaker] }}
          {% endif %}
        {% else %}
          {{ [speaker] }}
        {% endif %}
      volume_notifica: |
        {% if now().hour < 22 %}
          0.6
        {% else %}
          0.3
        {% endif %}
      volume_ripristino: |
        {% if now().hour >= 22 or now().hour < 9 %}
          0.1
        {% else %}
          0.5
        {% endif %}
    alias: 🧩 Compute target speakers and volumes
  - alias: 🔉 Set connection volume (mute initial chime)
    target:
      entity_id: '{{ speakers_list }}'
    data:
      volume_level: 0
    action: media_player.volume_set
  - delay:
      seconds: 1
  - action: media_player.turn_on
    target:
      entity_id: '{{ speakers_list }}'
    alias: 🔛 Connect to speaker
    data: {}
  - delay:
      seconds: 1
  - alias: 🔉 Set announcement volume
    target:
      entity_id: '{{ speakers_list }}'
    data:
      volume_level: '{{ volume_notifica }}'
    action: media_player.volume_set
  - alias: 🗣️ Play voice announcement via TTS
    target:
      device_id: 285d5f99189ca15b66cf4a976e13783c
    data:
      cache: true
      message: '{{ text }}'
      media_player_entity_id: '{{ speakers_list }}'
    action: tts.speak
  - delay:
      seconds: 15
  - alias: 🔄 Restore initial volume
    target:
      entity_id: '{{ speakers_list }}'
    data:
      volume_level: '{{ volume_ripristino }}'
    action: media_player.volume_set
  - action: media_player.turn_off
    target:
      entity_id: '{{ speakers_list }}'
    alias: 📴 Disconnect from speaker
    data: {}
`,c=`alias: 📣 Annuncio vocale personalizzato
description: >-
  Gestisce la connessione, il volume e la riproduzione di un annuncio vocale
  personalizzato su uno speaker, con gestione dinamica basata sulla presenza
  (esclude le TV).
icon: m3o:nest-audio
fields:
  speaker:
    name: 📢 Speaker di Default
    description: >-
      Seleziona lo speaker predefinito (usato come fallback o se la gestione
      dinamica è disattivata)
    required: true
    selector:
      entity:
        filter:
          domain: media_player
  text:
    name: 📃 Testo da riprodurre
    description: Testo da riprodurre sullo speaker
    required: true
    selector:
      text: {}
  speaker_dinamico:
    name: 🧠 Gestione Dinamica dello Speaker
    description: >-
      Se attivo, riproduce l'annuncio nella stanza in cui viene rilevata
      presenza
    default: false
    selector:
      boolean: {}
  modalita_dinamica:
    name: 🔄 Modalità Presenza Multipla
    description: >-
      Scegli il comportamento se ci sono persone in più stanze
      contemporaneamente
    default: prima_stanza
    selector:
      select:
        mode: dropdown
        options:
          - label: Riproduci solo nella prima stanza rilevata
            value: prima_stanza
          - label: Riproduci in tutte le stanze occupate
            value: tutte_le_stanze
          - label: Usa lo speaker di default
            value: solo_default
sequence:
  - variables:
      speakers_list: |
        {% if speaker_dinamico %}
          {% set device_classes = ['motion', 'presence', 'occupancy'] %}
          
          {# Troviamo tutti i sensori di presenza attualmente attivi #}
          {% set active_sensors = states.binary_sensor 
            | selectattr('state', 'eq', 'on') 
            | selectattr('attributes.device_class', 'defined')
            | selectattr('attributes.device_class', 'in', device_classes)
            | map(attribute='entity_id') | list %}
          
          {# Estraiamo le aree associate a questi sensori #}
          {% set ns_area = namespace(areas=[]) %}
          {% for s in active_sensors %}
            {% set a = area_id(s) %}
            {% if a and a not in ns_area.areas %}
              {% set ns_area.areas = ns_area.areas + [a] %}
            {% endif %}
          {% endfor %}
          
          {# Scansione delle aree per trovare gli speaker validi #}
          {% set ns_speakers = namespace(found=[]) %}
          {% for area in ns_area.areas %}
            {% set current_players = namespace(entities=[]) %}
            
            {% for p in area_entities(area) if p.startswith('media_player.') %}
              {% set s = states[p] %}
              {% if s is not none %}
                {% set fn = s.attributes.friendly_name | default('') | lower %}
                {% set dc = s.attributes.device_class | default('') %}
                
                {# Filtri anti-TV #}
                {% if 'tv' not in fn 
                    and dc not in ['tv', 'receiver'] 
                    and 'source_list' not in s.attributes 
                    and 'activity_list' not in s.attributes 
                    and 'current_activity' not in s.attributes %}
                  {% set current_players.entities = current_players.entities + [p] %}
                {% endif %}
              {% endif %}
            {% endfor %}
            
            {# Se troviamo uno speaker valido in questa area, lo aggiungiamo alla lista globale #}
            {% if current_players.entities | length > 0 %}
              {% set ns_speakers.found = ns_speakers.found + [current_players.entities | first] %}
            {% endif %}
          {% endfor %}
          
          {# Gestione dell'output #}
          {% if ns_speakers.found | length > 0 %}
            {% if ns_speakers.found | length > 1 and modalita_dinamica == 'solo_default' %}
              {{ [speaker] }}
            {% elif modalita_dinamica == 'tutte_le_stanze' %}
              {{ ns_speakers.found }}
            {% else %}
              {{ [ns_speakers.found | first] }}
            {% endif %}
          {% else %}
            {{ [speaker] }}
          {% endif %}
        {% else %}
          {{ [speaker] }}
        {% endif %}
      volume_notifica: |
        {% if now().hour < 22 %}
          0.6
        {% else %}
          0.3
        {% endif %}
      volume_ripristino: |
        {% if now().hour >= 22 or now().hour < 9 %}
          0.1
        {% else %}
          0.5
        {% endif %}
    alias: 🧩 Calcolo dello Speaker Effettivo e dei Volumi
  - alias: 🔉 Imposta volume connessione (Azzera suono iniziale)
    target:
      entity_id: '{{ speakers_list }}'
    data:
      volume_level: 0
    action: media_player.volume_set
  - delay:
      seconds: 1
  - action: media_player.turn_on
    target:
      entity_id: '{{ speakers_list }}'
    alias: 🔛 Connessione allo Speaker
    data: {}
  - delay:
      seconds: 1
  - alias: 🔉 Imposta volume notifica
    target:
      entity_id: '{{ speakers_list }}'
    data:
      volume_level: '{{ volume_notifica }}'
    action: media_player.volume_set
  - alias: 🗣️ Annuncio vocale via TTS
    target:
      device_id: 285d5f99189ca15b66cf4a976e13783c
    data:
      cache: true
      message: '{{ text }}'
      media_player_entity_id: '{{ speakers_list }}'
    action: tts.speak
  - delay:
      seconds: 15
  - alias: 🔄 Ripristina volume iniziale
    target:
      entity_id: '{{ speakers_list }}'
    data:
      volume_level: '{{ volume_ripristino }}'
    action: media_player.volume_set
  - action: media_player.turn_off
    target:
      entity_id: '{{ speakers_list }}'
    alias: 📴 Disconnessione dallo Speaker
    data: {}
`,t={en:d,it:c},f=JSON.parse('{"title":"Custom Voice Announcement","description":"Home Assistant script for TTS voice announcements with silent speaker wake-up, time-based volume levels, and optional presence routing.","frontmatter":{"title":"Custom Voice Announcement","description":"Home Assistant script for TTS voice announcements with silent speaker wake-up, time-based volume levels, and optional presence routing."},"headers":[],"relativePath":"showcase/scripts/custom-voice-announcement.md","filePath":"showcase/scripts/custom-voice-announcement.md"}'),p={name:"showcase/scripts/custom-voice-announcement.md"},h=Object.assign(p,{setup(u){return(m,e)=>{const a=s("MultiLangYaml");return i(),o("div",null,[e[0]||(e[0]=l("",11)),r(a,{title:"Custom Voice Announcement",en:n(t).en,it:n(t).it,"default-lang":"en"},null,8,["en","it"])])}}});export{f as __pageData,h as default};
