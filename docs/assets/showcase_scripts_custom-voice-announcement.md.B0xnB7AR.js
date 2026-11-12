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
`,t={en:d,it:c},f=JSON.parse('{"title":"Custom Voice Announcement","description":"Home Assistant script for TTS voice announcements with silent speaker wake-up, time-based volume levels, and optional presence routing.","frontmatter":{"title":"Custom Voice Announcement","description":"Home Assistant script for TTS voice announcements with silent speaker wake-up, time-based volume levels, and optional presence routing."},"headers":[],"relativePath":"showcase/scripts/custom-voice-announcement.md","filePath":"showcase/scripts/custom-voice-announcement.md"}'),p={name:"showcase/scripts/custom-voice-announcement.md"},h=Object.assign(p,{setup(u){return(m,e)=>{const a=s("MultiLangYaml");return i(),o("div",null,[e[0]||(e[0]=l(`<h1 id="📣-custom-voice-announcement" tabindex="-1">📣 Custom Voice Announcement <a class="header-anchor" href="#📣-custom-voice-announcement" aria-label="Permalink to &quot;📣 Custom Voice Announcement&quot;">​</a></h1><p>Plays a custom Text-to-Speech (TTS) announcement while managing silent speaker connection, day/night volume adjustments, and optional dynamic room routing based on live presence sensors (automatically skipping TVs and AV receivers).</p><h2 id="⚙️-parameters" tabindex="-1">⚙️ Parameters <a class="header-anchor" href="#⚙️-parameters" aria-label="Permalink to &quot;⚙️ Parameters&quot;">​</a></h2><table tabindex="0"><thead><tr><th style="text-align:left;">Field</th><th style="text-align:left;">Selector</th><th style="text-align:left;">Required</th><th style="text-align:left;">Default</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>speaker</code></td><td style="text-align:left;"><code>entity</code></td><td style="text-align:left;">Yes</td><td style="text-align:left;"></td><td style="text-align:left;">Fallback <code>media_player</code> used when dynamic routing is disabled or no room matches.</td></tr><tr><td style="text-align:left;"><code>text</code></td><td style="text-align:left;"><code>text</code></td><td style="text-align:left;">Yes</td><td style="text-align:left;"></td><td style="text-align:left;">Message text to speak via TTS.</td></tr><tr><td style="text-align:left;"><code>speaker_dinamico</code></td><td style="text-align:left;"><code>boolean</code></td><td style="text-align:left;">No</td><td style="text-align:left;"><code>false</code></td><td style="text-align:left;">Routes playback to areas with active <code>motion</code>, <code>presence</code>, or <code>occupancy</code> sensors.</td></tr><tr><td style="text-align:left;"><code>modalita_dinamica</code></td><td style="text-align:left;"><code>select</code></td><td style="text-align:left;">No</td><td style="text-align:left;"><code>prima_stanza</code></td><td style="text-align:left;">Multi-room behavior: <code>prima_stanza</code>, <code>tutte_le_stanze</code>, or <code>solo_default</code>.</td></tr></tbody></table><h2 id="🔍-how-it-works" tabindex="-1">🔍 How It Works <a class="header-anchor" href="#🔍-how-it-works" aria-label="Permalink to &quot;🔍 How It Works&quot;">​</a></h2><ol><li><strong>Dynamic Speaker Discovery</strong>: when <code>speaker_dinamico</code> is enabled, finds all active <code>binary_sensor</code> entities with <code>motion</code>, <code>presence</code>, or <code>occupancy</code> device classes, maps them to their areas, and selects one <code>media_player</code> per room while filtering out TVs and receivers.</li><li><strong>Time-Based Volumes</strong>: sets announcement volume to <code>0.6</code> before <code>22:00</code> or <code>0.3</code> at night, and restores volume afterward to <code>0.1</code> between <code>22:00</code> and <code>09:00</code> or <code>0.5</code> during the day.</li><li><strong>Silent Wake-Up &amp; Cleanup</strong>: mutes the speaker (<code>0</code>) before calling <code>media_player.turn_on</code> to avoid the cast connection chime, speaks the message with <code>tts.speak</code>, waits 15 seconds, restores the volume, and turns the speaker off.</li></ol><div class="warning custom-block"><p class="custom-block-title">TTS Target</p><p>Before saving this script in your Home Assistant instance, update the <code>target.device_id</code> inside the <code>tts.speak</code> action to match your own TTS engine entity or device.</p></div><h2 id="🧪-example-call" tabindex="-1">🧪 Example Call <a class="header-anchor" href="#🧪-example-call" aria-label="Permalink to &quot;🧪 Example Call&quot;">​</a></h2><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">script.annuncio_vocale_personalizzato</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  speaker</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">media_player.kitchen_speaker</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;The washing machine cycle is complete.&quot;</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  speaker_dinamico</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  modalita_dinamica</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prima_stanza</span></span></code></pre></div><h2 id="📜-full-script-yaml" tabindex="-1">📜 Full Script YAML <a class="header-anchor" href="#📜-full-script-yaml" aria-label="Permalink to &quot;📜 Full Script YAML&quot;">​</a></h2><div class="info custom-block"><p class="custom-block-title">Import in Home Assistant</p><p>Go to <strong>Settings -&gt; Automations &amp; Scenes -&gt; Scripts -&gt; Add Script -&gt; Edit in YAML</strong> and paste the configuration below. Use the language selector to switch between English and Italian.</p></div>`,11)),r(a,{title:"Custom Voice Announcement",en:n(t).en,it:n(t).it,"default-lang":"en"},null,8,["en","it"])])}}});export{f as __pageData,h as default};
