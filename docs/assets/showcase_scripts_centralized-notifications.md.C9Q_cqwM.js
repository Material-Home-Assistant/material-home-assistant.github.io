import{C as a,o as s,c as o,a2 as l,E as c,k as i}from"./chunks/framework.BUrnCmah.js";const r=`alias: 📲 Centralized Notifications Manager
description: >-
  ### 📲 Unified Notifications Script

  Centralized script for sending notifications.

  Handles global broadcasts or targeted delivery to dynamically filtered
  devices, stripping Markdown formatting for mobile push notifications.
mode: parallel
fields:
  canali_notifica:
    name: 🔌 Notification Channels
    description: >-
      🔌 Select the channels to send the notification through (multiple
      allowed).
    required: true
    default:
      - push
      - home_assistant
    selector:
      select:
        multiple: true
        options:
          - label: 📱 Push Notification (Mobile App)
            value: push
          - label: 🖥️ Persistent Notification (HA UI)
            value: home_assistant
          - label: ✈️ Telegram
            value: telegram
  tutti_i_dispositivi:
    name: 👥 Send to All Devices
    description: >-
      👥 When enabled, push notifications are sent to all registered devices.
      When disabled, uses the list below.
    required: false
    default: true
    selector:
      boolean: {}
  destinatari_specifici:
    name: 🎯 Specific Devices
    description: >-
      📱 Select one or more smartphones/services to notify (only applies when
      'Send to All Devices' is disabled).
    required: false
    selector:
      entity:
        domain: notify
        multiple: true
  title:
    name: ✨ Notification Title
    description: ✨ Main title shown at the top of the notification.
    example: ⚠️ Dishwasher Alert
    required: true
    selector:
      text: {}
  message:
    name: 📝 Notification Message
    description: ✨ Body text of the notification (may include Markdown).
    example: The **salt** is empty!
    required: true
    selector:
      text: {}
  notification_id:
    name: 🆔 Persistent Notification ID
    description: >-
      🆔 Unique ID for the persistent notification (optional). Useful for
      overwriting previous notifications of the same type.
    example: dishwasher_status
    required: false
    selector:
      text: {}
sequence:
  - alias: 📱 Check and Send Push Notification
    note: >-
      Checks whether the 'push' channel is enabled before resolving delivery
      targets.
    if:
      - condition: template
        value_template: '{{ ''push'' in canali_notifica }}'
        alias: '🔍 Check channel: Push'
        note: Checks the channels array for the 'push' value.
    then:
      - alias: 🔀 Select Push Target
        note: >-
          Sends to all devices or iterates over the specified targets.
        choose:
          - alias: '👥 Case 1: Global Broadcast'
            note: >-
              Sends a broadcast via notify.notify when the boolean is set to
              true.
            conditions:
              - condition: template
                value_template: '{{ tutti_i_dispositivi }}'
                alias: 'Check: Send to all devices = True'
            sequence:
              - action: notify.notify
                data:
                  title: >-
                    {{ title | regex_replace(find='\\*\\*|\\*|_|###\\s|##\\s|#\\s',
                    replace='', ignorecase=True) }}
                  message: >-
                    {{ message | regex_replace(find='\\*\\*|\\*|_|###\\s|##\\s|#\\s',
                    replace='', ignorecase=True) }}
                alias: 🚀 Send Group Push
                note: >-
                  Immediately notifies all devices connected to the Home
                  Assistant hub.
          - alias: '🎯 Case 2: Targeted Delivery'
            note: >-
              Loops through the specific notify services selected in the array.
            conditions:
              - condition: template
                value_template: >-
                  {{ not tutti_i_dispositivi and destinatari_specifici is
                  defined and destinatari_specifici | length > 0 }}
                alias: 'Check: Specific devices selected'
            sequence:
              - repeat:
                  for_each: '{{ destinatari_specifici }}'
                  sequence:
                    - action: notify.mobile_app_{{ repeat.item.split('.')[1] }}
                      data:
                        title: >-
                          {{ title |
                          regex_replace(find='\\*\\*|\\*|_|###\\s|##\\s|#\\s',
                          replace='', ignorecase=True) }}
                        message: >-
                          {{ message |
                          regex_replace(find='\\*\\*|\\*|_|###\\s|##\\s|#\\s',
                          replace='', ignorecase=True) }}
                      alias: 🚀 Send Push to Single Target
                      note: >-
                        Dynamically builds the service name by prepending
                        mobile_app_ as required by the official Home Assistant
                        mobile app integration.
  - alias: 🖥️ Check and Create Persistent Notification
    note: >-
      Checks whether the 'home_assistant' channel is enabled. The Home Assistant
      UI supports Markdown natively.
    if:
      - condition: template
        value_template: '{{ ''home_assistant'' in canali_notifica }}'
        alias: '🔍 Check channel: Home Assistant'
        note: Checks the channels array for the 'home_assistant' value.
    then:
      - alias: 🔀 Select Persistent Notification Payload
        note: >-
          Handles the presence or absence of the optional notification_id to
          avoid dictionary key errors.
        choose:
          - alias: '🆔 Case A: With Specified ID'
            note: Runs when a notification ID has been provided.
            conditions:
              - condition: template
                value_template: >-
                  {{ notification_id is defined and notification_id != '' and
                  notification_id != none }}
            sequence:
              - action: persistent_notification.create
                data:
                  title: '{{ title }}'
                  message: '{{ message }}'
                  notification_id: '{{ notification_id }}'
                alias: 🚀 Create Notification with Static ID
          - alias: '🎲 Case B: Without Specified ID'
            note: >-
              Runs when the ID field is empty, omitting the key from the data
              payload.
            conditions:
              - condition: template
                value_template: >-
                  {{ notification_id is not defined or notification_id == '' or
                  notification_id == none }}
            sequence:
              - action: persistent_notification.create
                data:
                  title: '{{ title }}'
                  message: '{{ message }}'
                alias: 🚀 Create Notification with Random ID
  - alias: ✈️ Check and Send Telegram Message
    note: >-
      Checks whether the 'telegram' channel is enabled and applies Telegram
      MarkdownV2 escaping.
    if:
      - condition: template
        value_template: '{{ ''telegram'' in canali_notifica }}'
        alias: '🔍 Check channel: Telegram'
        note: Checks the channels array for the 'telegram' value.
    then:
      - alias: 🚀 Send Telegram with Parser
        note: >-
          Sends the message to Telegram after escaping special characters for
          MarkdownV2.
        action: telegram_bot.send_message
        data:
          title: >-
            {{ title |
            regex_replace(find='([_\\\\*\\\\\`\\\\[\\\\]\\\\(\\\\)\\\\~\\\\>\\\\#\\\\+\\\\-\\\\=\\\\|\\\\{\\\\}\\\\.\\\\!])',
            replace='\\\\\\\\\\\\1', ignorecase=True) }}
          message: >-
            {{ message |
            regex_replace(find='([_\\\\*\\\\\`\\\\[\\\\]\\\\(\\\\)\\\\~\\\\>\\\\#\\\\+\\\\-\\\\=\\\\|\\\\{\\\\}\\\\.\\\\!])',
            replace='\\\\\\\\\\\\1', ignorecase=True) }}
          parse_mode: markdownv2
`,d=`alias: 📲 Gestione Notifiche Centralizzata
description: >-
  ### 📲 Script Gestione Notifiche Unificato

  Script centralizzato per l'invio delle notifiche.

  Gestisce l'invio globale o mirato a dispositivi specifici filtrati
  dinamicamente, pulendo il testo dal Markdown per i cellulari.
mode: parallel
fields:
  canali_notifica:
    name: 🔌 Canali di Notifica
    description: >-
      🔌 Seleziona i canali attraverso cui inviare la notifica (puoi sceglierne
      multipli).
    required: true
    default:
      - push
      - home_assistant
    selector:
      select:
        multiple: true
        options:
          - label: 📱 Notifica Push (App Smartphone)
            value: push
          - label: 🖥️ Notifica Persistente (Interfaccia HA)
            value: home_assistant
          - label: ✈️ Telegram
            value: telegram
  tutti_i_dispositivi:
    name: 👥 Invia a Tutti i Dispositivi
    description: >-
      👥 Se attivo, la notifica push verrà inviata a tutti i dispositivi
      registrati. Se disattivato, usa la lista sottostante.
    required: false
    default: true
    selector:
      boolean: {}
  destinatari_specifici:
    name: 🎯 Dispositivi Specifici
    description: >-
      📱 Seleziona uno o più smartphone/servizi a cui inviare la notifica
      (valido solo se 'Invia a Tutti' è disattivato).
    required: false
    selector:
      entity:
        domain: notify
        multiple: true
  title:
    name: ✨ Titolo Notifica
    description: ✨ Il titolo principale che apparirà in cima alla notifica.
    example: ⚠️ Problema Lavastoviglie
    required: true
    selector:
      text: {}
  message:
    name: 📝 Messaggio Notifica
    description: ✨ Contenuto testuale della notifica (Può contenere Markdown).
    example: Il **sale** è terminato!
    required: true
    selector:
      text: {}
  notification_id:
    name: 🆔 ID Notifica Persistente
    description: >-
      🆔 ID univoco per la notifica persistente (opzionale). Utile per
      sovrascrivere notifiche precedenti dello stesso tipo.
    example: lavastoviglie_status
    required: false
    selector:
      text: {}
sequence:
  - alias: 📱 Controllo e Invio Notifica Push
    note: >-
      Verifica se il canale 'push' è attivo prima di determinare i target di
      invio.
    if:
      - condition: template
        value_template: '{{ ''push'' in canali_notifica }}'
        alias: '🔍 Verifica canale: Push'
        note: Analizza l'array dei canali alla ricerca del valore 'push'.
    then:
      - alias: 🔀 Scelta Target Push
        note: >-
          Invia a tutti i dispositivi o mappa la chiamata sui target
          specificati.
        choose:
          - alias: '👥 Caso 1: Invio Globale'
            note: >-
              Esegue l'invio massivo tramite notify.notify se il boolean è
              impostato su true.
            conditions:
              - condition: template
                value_template: '{{ tutti_i_dispositivi }}'
                alias: 'Verifica: Tutti i dispositivi = True'
            sequence:
              - action: notify.notify
                data:
                  title: >-
                    {{ title | regex_replace(find='\\*\\*|\\*|_|###\\s|##\\s|#\\s',
                    replace='', ignorecase=True) }}
                  message: >-
                    {{ message | regex_replace(find='\\*\\*|\\*|_|###\\s|##\\s|#\\s',
                    replace='', ignorecase=True) }}
                alias: 🚀 Invia Push di Gruppo
                note: >-
                  Notifica istantaneamente tutti i device associati all'hub di
                  Home Assistant.
          - alias: '🎯 Caso 2: Invio Mirato'
            note: >-
              Invia erogando la notifica ciclicamente sui servizi specifici
              selezionati dall'array.
            conditions:
              - condition: template
                value_template: >-
                  {{ not tutti_i_dispositivi and destinatari_specifici is
                  defined and destinatari_specifici | length > 0 }}
                alias: 'Verifica: Dispositivi specifici selezionati'
            sequence:
              - repeat:
                  for_each: '{{ destinatari_specifici }}'
                  sequence:
                    - action: notify.mobile_app_{{ repeat.item.split('.')[1] }}
                      data:
                        title: >-
                          {{ title |
                          regex_replace(find='\\*\\*|\\*|_|###\\s|##\\s|#\\s',
                          replace='', ignorecase=True) }}
                        message: >-
                          {{ message |
                          regex_replace(find='\\*\\*|\\*|_|###\\s|##\\s|#\\s',
                          replace='', ignorecase=True) }}
                      alias: 🚀 Invia Push a Singolo Target
                      note: >-
                        Ricostruisce dinamicamente il nome del servizio
                        aggiungendo il prefisso mobile_app_ richiesto
                        dall'integrazione smartphone ufficiale di Home
                        Assistant.
  - alias: 🖥️ Controllo e Creazione Notifica Persistente
    note: >-
      Verifica se il canale 'home_assistant' è attivo. La UI di Home Assistant
      supporta il Markdown nativamente.
    if:
      - condition: template
        value_template: '{{ ''home_assistant'' in canali_notifica }}'
        alias: '🔍 Verifica canale: Home Assistant'
        note: Analizza l'array dei canali alla ricerca del valore 'home_assistant'.
    then:
      - alias: 🔀 Scelta Struttura Notifica Persistente
        note: >-
          Gestisce la presenza o l'assenza del notification_id opzionale per
          evitare errori di dizionario.
        choose:
          - alias: '🆔 Caso A: Con ID Specificato'
            note: Viene eseguito se l'ID è stato digitato nel campo.
            conditions:
              - condition: template
                value_template: >-
                  {{ notification_id is defined and notification_id != '' and
                  notification_id != none }}
            sequence:
              - action: persistent_notification.create
                data:
                  title: '{{ title }}'
                  message: '{{ message }}'
                  notification_id: '{{ notification_id }}'
                alias: 🚀 Crea Notifica con ID statico
          - alias: '🎲 Caso B: Senza ID Specificato'
            note: >-
              Viene eseguito se il campo ID è vuoto, evitando l'inserimento
              della chiave nel dizionario dei dati.
            conditions:
              - condition: template
                value_template: >-
                  {{ notification_id is not defined or notification_id == '' or
                  notification_id == none }}
            sequence:
              - action: persistent_notification.create
                data:
                  title: '{{ title }}'
                  message: '{{ message }}'
                alias: 🚀 Crea Notifica con ID randomico
  - alias: ✈️ Controllo e Invio Messaggio Telegram
    note: >-
      Verifica se il canale 'telegram' è attivo ed abilita il parsing Markdown
      specifico di Telegram.
    if:
      - condition: template
        value_template: '{{ ''telegram'' in canali_notifica }}'
        alias: '🔍 Verifica canale: Telegram'
        note: Analizza l'array dei canali alla ricerca del valore 'telegram'.
    then:
      - alias: 🚀 Invia Telegram con Parser
        note: >-
          Invia il messaggio a Telegram applicando il corretto escaping dei
          caratteri speciali per MarkdownV2.
        action: telegram_bot.send_message
        data:
          title: >-
            {{ title |
            regex_replace(find='([_\\\\*\\\\\`\\\\[\\\\]\\\\(\\\\)\\\\~\\\\>\\\\#\\\\+\\\\-\\\\=\\\\|\\\\{\\\\}\\\\.\\\\!])',
            replace='\\\\\\\\\\\\1', ignorecase=True) }}
          message: >-
            {{ message |
            regex_replace(find='([_\\\\*\\\\\`\\\\[\\\\]\\\\(\\\\)\\\\~\\\\>\\\\#\\\\+\\\\-\\\\=\\\\|\\\\{\\\\}\\\\.\\\\!])',
            replace='\\\\\\\\\\\\1', ignorecase=True) }}
          parse_mode: markdownv2
`,t={en:r,it:d},g=JSON.parse('{"title":"Centralized Notifications","description":"Unified Home Assistant script for sending push, persistent UI, and Telegram notifications with channel routing and Markdown handling.","frontmatter":{"title":"Centralized Notifications","description":"Unified Home Assistant script for sending push, persistent UI, and Telegram notifications with channel routing and Markdown handling."},"headers":[],"relativePath":"showcase/scripts/centralized-notifications.md","filePath":"showcase/scripts/centralized-notifications.md"}'),p={name:"showcase/scripts/centralized-notifications.md"},u=Object.assign(p,{setup(h){return(f,e)=>{const n=a("MultiLangYaml");return s(),o("div",null,[e[0]||(e[0]=l(`<h1 id="📲-centralized-notifications" tabindex="-1">📲 Centralized Notifications <a class="header-anchor" href="#📲-centralized-notifications" aria-label="Permalink to &quot;📲 Centralized Notifications&quot;">​</a></h1><p>A unified notification script for Home Assistant (<code>mode: parallel</code>) that routes messages to mobile push, persistent UI notifications, and Telegram, adapting Markdown formatting per channel.</p><h2 id="⚙️-parameters" tabindex="-1">⚙️ Parameters <a class="header-anchor" href="#⚙️-parameters" aria-label="Permalink to &quot;⚙️ Parameters&quot;">​</a></h2><table tabindex="0"><thead><tr><th style="text-align:left;">Field</th><th style="text-align:left;">Selector</th><th style="text-align:left;">Required</th><th style="text-align:left;">Default</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>canali_notifica</code></td><td style="text-align:left;"><code>select</code></td><td style="text-align:left;">Yes</td><td style="text-align:left;"><code>push</code>, <code>home_assistant</code></td><td style="text-align:left;">Delivery channels (<code>push</code>, <code>home_assistant</code>, <code>telegram</code>).</td></tr><tr><td style="text-align:left;"><code>tutti_i_dispositivi</code></td><td style="text-align:left;"><code>boolean</code></td><td style="text-align:left;">No</td><td style="text-align:left;"><code>true</code></td><td style="text-align:left;">When <code>true</code>, sends push via <code>notify.notify</code>; when <code>false</code>, uses selected devices.</td></tr><tr><td style="text-align:left;"><code>destinatari_specifici</code></td><td style="text-align:left;"><code>entity</code></td><td style="text-align:left;">No</td><td style="text-align:left;"></td><td style="text-align:left;">One or more <code>notify</code> entities to target when <code>tutti_i_dispositivi</code> is <code>false</code>.</td></tr><tr><td style="text-align:left;"><code>title</code></td><td style="text-align:left;"><code>text</code></td><td style="text-align:left;">Yes</td><td style="text-align:left;"></td><td style="text-align:left;">Main title shown at the top of the notification.</td></tr><tr><td style="text-align:left;"><code>message</code></td><td style="text-align:left;"><code>text</code></td><td style="text-align:left;">Yes</td><td style="text-align:left;"></td><td style="text-align:left;">Notification body text (supports Markdown).</td></tr><tr><td style="text-align:left;"><code>notification_id</code></td><td style="text-align:left;"><code>text</code></td><td style="text-align:left;">No</td><td style="text-align:left;"></td><td style="text-align:left;">Optional persistent notification ID to overwrite earlier alerts of the same type.</td></tr></tbody></table><h2 id="🔍-how-it-works" tabindex="-1">🔍 How It Works <a class="header-anchor" href="#🔍-how-it-works" aria-label="Permalink to &quot;🔍 How It Works&quot;">​</a></h2><ol><li><strong>Mobile Push (<code>push</code>)</strong>: strips Markdown syntax (<code>**</code>, <code>*</code>, <code>_</code>, <code>#</code>) before sending either globally via <code>notify.notify</code> or per device via <code>notify.mobile_app_&lt;device&gt;</code>.</li><li><strong>Home Assistant UI (<code>home_assistant</code>)</strong>: creates a <code>persistent_notification</code> keeping native Markdown intact, using <code>notification_id</code> only when provided.</li><li><strong>Telegram (<code>telegram</code>)</strong>: sends via <code>telegram_bot.send_message</code> with <code>parse_mode: markdownv2</code> and automatic regex escaping of special characters.</li></ol><h2 id="🧪-example-call" tabindex="-1">🧪 Example Call <a class="header-anchor" href="#🧪-example-call" aria-label="Permalink to &quot;🧪 Example Call&quot;">​</a></h2><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">script.gestione_notifiche_centralizzata</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  canali_notifica</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">push</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">home_assistant</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  tutti_i_dispositivi</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  title</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;⚠️ Dishwasher Alert&quot;</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;The **salt** is empty!&quot;</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  notification_id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">dishwasher_status</span></span></code></pre></div><h2 id="📜-full-script-yaml" tabindex="-1">📜 Full Script YAML <a class="header-anchor" href="#📜-full-script-yaml" aria-label="Permalink to &quot;📜 Full Script YAML&quot;">​</a></h2><div class="info custom-block"><p class="custom-block-title">Import in Home Assistant</p><p>Go to <strong>Settings -&gt; Automations &amp; Scenes -&gt; Scripts -&gt; Add Script -&gt; Edit in YAML</strong> and paste the configuration below. Use the language selector to switch between English and Italian.</p></div>`,10)),c(n,{title:"Centralized Notifications",en:i(t).en,it:i(t).it,"default-lang":"en"},null,8,["en","it"])])}}});export{g as __pageData,u as default};
