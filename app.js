(() => {
  'use strict';

  const APP_VERSION = 'V11';
  let stableAppHeight = 0;
  let stableOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const els = {
    editor: $('#chartEditor'), projectName: $('#projectName'), projectSelect: $('#projectSelect'),
    textModeBtn: $('#textModeBtn'), chordModeBtn: $('#chordModeBtn'), modeLabel: $('#modeLabel'), modeHint: $('#modeHint'), editorModeBadge: $('#editorModeBadge'),
    chordPanel: $('#chordPanel'), chordPreview: $('#chordPreview'), qualityGrid: $('#qualityGrid'), rootGrid: $('#rootGrid'), mobileMinorBtn: $('#mobileMinorBtn'),
    extensionGrid: $('#extensionGrid'), alterationGrid: $('#alterationGrid'), utilitiesGrid: $('#utilitiesGrid'), slashBassGrid: $('#slashBassGrid'),
    keyGrid: $('#keyGrid'), keyScaleBtn: $('#keyScaleBtn'), keyScalePopover: $('#keyScalePopover'), scaleCloseBtn: $('#scaleCloseBtn'), diatonicGrid: $('#diatonicGrid'), scaleType: $('#scaleType'), seventhToggle: $('#seventhToggle'),
    symbolStyle: $('#symbolStyle'), superscriptToggle: $('#superscriptToggle'), spaceAfterChordToggle: $('#spaceAfterChordToggle'),
    customSuffix: $('#customSuffix'), customSuffixWrap: $('#customSuffixWrap'), slashBassBtn: $('#slashBassBtn'), customSuffixBtn: $('#customSuffixBtn'),
    insertChordBtn: $('#insertChordBtn'), clearChordBtn: $('#clearChordBtn'), saveTxtBtn: $('#saveTxtBtn'), downloadBackupBtn: $('#downloadBackupBtn'),
    backupFolderInput: $('#backupFolderInput'), chooseBackupFolderBtn: $('#chooseBackupFolderBtn'), clearBackupFolderBtn: $('#clearBackupFolderBtn'),
    backupFolderHelp: $('#backupFolderHelp'), newProjectBtn: $('#newProjectBtn'), importBtn: $('#importBtn'), importInput: $('#importInput'),
    saveStatus: $('#saveStatus'), backupStatus: $('#backupStatus'), charCount: $('#charCount'), shortcutsBtn: $('#shortcutsBtn'), shortcutsDialog: $('#shortcutsDialog'),
    mobileNewLineBtn: $('#mobileNewLineBtn'), mobileBarBtn: $('#mobileBarBtn'), mobileDoubleBtn: $('#mobileDoubleBtn'), mobileRepeatBtn: $('#mobileRepeatBtn'), mobileBeatBtn: $('#mobileBeatBtn'), mobileSyncBtn: $('#mobileSyncBtn'),
    forceGSharpMinorToggle: $('#forceGSharpMinorToggle'), lineTypeBtn: $('#lineTypeBtn'), viewModeBtn: $('#viewModeBtn'), viewModeDialog: $('#viewModeDialog'), closeViewModeBtn: $('#closeViewModeBtn'), viewSourceKey: $('#viewSourceKey'), viewTargetKey: $('#viewTargetKey'), viewModeStatus: $('#viewModeStatus'), viewChartContent: $('#viewChartContent'), chartSearchInput: $('#chartSearchInput'), chartSearchResults: $('#chartSearchResults'), chartSearchStatus: $('#chartSearchStatus'), connectChartsRootBtn: $('#connectChartsRootBtn'), toast: $('#toast')
  };

  const PROJECTS_KEY = 'chordChartFast.projects.v1';
  const CURRENT_KEY = 'chordChartFast.current.v1';
  const BACKUP_KEY = 'chordChartFast.backups.v1';
  const SETTINGS_KEY = 'chordChartFast.settings.v1';
  const ENHARMONIC_KEY = 'chordChartFast.enharmonicPreferences.v1';
  const ROOT_ENHARMONIC_KEY = 'chordChartFast.rootEnharmonicPreferences.v1';
  const FORCE_GSHARP_MINOR_KEY = 'chordChartFast.forceGSharpMinor.v1';
  const HANDLE_DB_NAME = 'chordChartFast.fileHandles.v1';
  const HANDLE_STORE_NAME = 'handles';
  const BACKUP_DIRECTORY_KEY = 'backupDirectory';
  const CHARTS_ROOT_DIRECTORY_KEY = 'chartsRootDirectory';
  const CHART_META_START = '[[CHORDCHART_META_V2]]';
  const CHART_META_END = '[[/CHORDCHART_META]]';
  const LINE_TYPE_TEXT = 'text';
  const LINE_TYPE_CHORD = 'chord';

  const chromaticSharp = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const chromaticFlat = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const keyPairs = [
    { major:'C', minor:'Am', prefer:'sharp' }, { major:'G', minor:'Em', prefer:'sharp' },
    { major:'D', minor:'Bm', prefer:'sharp' }, { major:'A', minor:'F#m', prefer:'sharp' },
    { major:'E', minor:'C#m', prefer:'sharp' }, { major:'B', minor:'G#m', prefer:'sharp' },
    { major:'F#', minor:'D#m', prefer:'sharp' }, { major:'Db', minor:'Bbm', prefer:'flat' },
    { major:'Ab', minor:'Fm', prefer:'flat' }, { major:'Eb', minor:'Cm', prefer:'flat' },
    { major:'Bb', minor:'Gm', prefer:'flat' }, { major:'F', minor:'Dm', prefer:'flat' }
  ];

  const scales = {
    major: {
      intervals:[0,2,4,5,7,9,11], roman:['I','ii','iii','IV','V','vi','vii°'],
      triads:['','m','m','','','m','dim'], sevenths:['maj7','m7','m7','maj7','7','m7','m7b5']
    },
    naturalMinor: {
      intervals:[0,2,3,5,7,8,10], roman:['i','ii°','III','iv','v','VI','VII'],
      triads:['m','dim','','m','m','',''], sevenths:['m7','m7b5','maj7','m7','m7','maj7','7']
    },
    harmonicMinor: {
      intervals:[0,2,3,5,7,8,11], roman:['i','ii°','III+','iv','V','VI','vii°'],
      triads:['m','dim','aug','m','','','dim'], sevenths:['mMaj7','m7b5','maj7#5','m7','7','maj7','dim7']
    },
    melodicMinor: {
      intervals:[0,2,3,5,7,9,11], roman:['i','ii','III+','IV','V','vi°','vii°'],
      triads:['m','m','aug','','','dim','dim'], sevenths:['mMaj7','m7','maj7#5','7','7','m7b5','m7b5']
    }
  };

  // Quality/Base intentionally contains only Major and Minor.
  const qualities = [
    { value:'', label:'Major' },
    { value:'m', label:'Minor' }
  ];

  // Ordered vertically in three-row columns for fast scanning.
  const extensionControls = [
    { kind:'triad', value:'', label:'Triad', shortcut:'T' },
    { kind:'suspension', value:'sus2', label:'sus2', shortcut:'2' },
    { kind:'suspension', value:'sus4', label:'sus4', shortcut:'4' },

    { kind:'extension', value:'7', label:'7', shortcut:'7' },
    { kind:'extension', value:'maj7', label:'maj7', shortcut:'J' },
    { kind:'type', value:'halfDim', label:'Half-dim', shortcut:'H' },

    { kind:'extension', value:'6', label:'6', shortcut:'6' },
    { kind:'extension', value:'add9', label:'add9' },
    { kind:'type', value:'5', label:'Power 5', shortcut:'5' },

    { kind:'type', value:'aug', label:'aug', shortcut:'+' },
    { kind:'type', value:'dim', label:'dim' },
    { kind:'extension', value:'9', label:'9', shortcut:'9' },

    { kind:'extension', value:'69', label:'6/9' },
    { kind:'extension', value:'11', label:'11' },
    { kind:'extension', value:'13', label:'13' },

    { kind:'extension', value:'add2', label:'add2' },
    { kind:'extension', value:'add4', label:'add4' },
    { kind:'extension', value:'add11', label:'add11' },

    { kind:'extension', value:'mMaj7', label:'m(maj7)' },
    { kind:'typeExtension', value:'dim7', label:'dim7' },
    { kind:'extension', value:'maj9', label:'maj9' },

    { kind:'extension', value:'maj11', label:'maj11' },
    { kind:'extension', value:'maj13', label:'maj13' },
    { kind:'extension', value:'add6', label:'add6' },

    { kind:'extension', value:'add13', label:'add13' },
    { kind:'extension', value:'alt', label:'alt' }
  ];

  const alterations = ['b5','#5','b9','#9','b11','#11','b13','#13'];
  const superscriptMap = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};

  let state = {
    mode:'text',
    currentProjectId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    selectedKey:0,
    root:'', quality:'', chordType:'', extension:'', suspension:'',
    alterations:[], omissions:[], slashBass:'', customSuffix:'',
    awaitingSlashBass:false, slashHeld:false, slashUsed:false,
    mHeld:false, mUsedAsModifier:false, pendingMinor:false,
    xHeld:false, xUsed:false,
    activeChord:null,
    directoryHandle:null, backupDirectoryHandle:null, defaultBackupDirectoryHandle:null, backupPermission:'none',
    history:[], historyIndex:0, dirty:false,
    lineTypes:[LINE_TYPE_TEXT], previousEditorValue:'', sourceKeyIndex:0, sourceScaleType:'major', chartsRootHandle:null, chartLibrary:[]
  };

  function safeJsonParse(value, fallback) { try { return JSON.parse(value) ?? fallback; } catch { return fallback; } }
  function getProjects() { return safeJsonParse(localStorage.getItem(PROJECTS_KEY), {}); }
  function setProjects(projects) { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); }
  function safeName(name, fallback='untitled') {
    return (name.trim() || fallback).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').slice(0, 100);
  }
  function currentName() { return els.projectName.value.trim() || 'untitled'; }
  function showToast(message, isError=false) {
    els.toast.textContent = message;
    els.toast.className = `toast show${isError ? ' error' : ''}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.className = 'toast', 2400);
  }
  function markSaved(label='Saved locally') {
    state.dirty = false;
    els.saveStatus.textContent = label;
    els.saveStatus.style.color = 'var(--good)';
  }
  function markDirty() {
    state.dirty = true;
    els.saveStatus.textContent = 'Unsaved change';
    els.saveStatus.style.color = 'var(--warn)';
  }


  function getLines(content=els.editor.value) { return String(content).split('\n'); }
  function normalizeLineTypes(content=els.editor.value, types=state.lineTypes) {
    const count = getLines(content).length;
    return Array.from({length:Math.max(1,count)}, (_,i) => types?.[i] === LINE_TYPE_CHORD ? LINE_TYPE_CHORD : LINE_TYPE_TEXT);
  }
  function lineIndexAtPosition(content, position) {
    const value=String(content); const safe=Math.max(0,Math.min(Number(position)||0,value.length));
    return value.slice(0,safe).split('\n').length-1;
  }
  function reconcileLineTypes(oldValue,newValue,oldTypes=state.lineTypes,defaultType=LINE_TYPE_TEXT) {
    const oldLines=getLines(oldValue), newLines=getLines(newValue), normalized=normalizeLineTypes(oldValue,oldTypes);
    let prefix=0; while(prefix<oldLines.length&&prefix<newLines.length&&oldLines[prefix]===newLines[prefix]) prefix++;
    let suffix=0; while(suffix<oldLines.length-prefix&&suffix<newLines.length-prefix&&oldLines[oldLines.length-1-suffix]===newLines[newLines.length-1-suffix]) suffix++;
    const oldMiddle=oldLines.length-prefix-suffix, newMiddle=newLines.length-prefix-suffix;
    const next=normalized.slice(0,prefix); const safeDefault=defaultType===LINE_TYPE_CHORD?LINE_TYPE_CHORD:LINE_TYPE_TEXT;
    for(let i=0;i<newMiddle;i++) next.push(oldMiddle===newMiddle&&normalized[prefix+i]?normalized[prefix+i]:(oldMiddle===1&&normalized[prefix]?normalized[prefix]:safeDefault));
    if(suffix) next.push(...normalized.slice(normalized.length-suffix));
    return normalizeLineTypes(newValue,next);
  }
  function selectedLineRange(){ const a=els.editor.selectionStart||0,b=els.editor.selectionEnd||a; return {first:lineIndexAtPosition(els.editor.value,a),last:lineIndexAtPosition(els.editor.value,b)}; }
  function updateLineTypeButton(){
    if(!els.lineTypeBtn)return; state.lineTypes=normalizeLineTypes(); const {first,last}=selectedLineRange(); const chosen=state.lineTypes.slice(first,last+1);
    const allChord=chosen.length&&chosen.every(x=>x===LINE_TYPE_CHORD), allText=chosen.length&&chosen.every(x=>x===LINE_TYPE_TEXT);
    els.lineTypeBtn.classList.toggle('chord',allChord); els.lineTypeBtn.classList.toggle('text',!allChord);
    els.lineTypeBtn.textContent=allChord?'Line: Chords':(allText?'Line: Text':'Lines: Mixed');
  }
  function markLineRange(type,start,end=start,content=els.editor.value){
    state.lineTypes=normalizeLineTypes(content,state.lineTypes); const first=lineIndexAtPosition(content,start),last=lineIndexAtPosition(content,Math.max(start,end));
    for(let i=first;i<=last;i++) state.lineTypes[i]=type===LINE_TYPE_CHORD?LINE_TYPE_CHORD:LINE_TYPE_TEXT; updateLineTypeButton();
  }
  function toggleSelectedLinesType(){ const {first,last}=selectedLineRange(); state.lineTypes=normalizeLineTypes(); const make=state.lineTypes.slice(first,last+1).every(x=>x===LINE_TYPE_CHORD)?LINE_TYPE_TEXT:LINE_TYPE_CHORD; for(let i=first;i<=last;i++)state.lineTypes[i]=make; pushHistory(); markDirty(); scheduleSave(); updateLineTypeButton(); showToast(make===LINE_TYPE_CHORD?'Marked as chord row':'Marked as text row'); }
  function parsePrefixedContent(content){ const visible=[],types=[]; getLines(content).forEach(line=>{ if(/^> ?/.test(line)){visible.push(line.replace(/^> ?/,''));types.push(LINE_TYPE_CHORD);}else{visible.push(line);types.push(LINE_TYPE_TEXT);} }); return {content:visible.join('\n'),lineTypes:types}; }
  function serializePrefixedContent(content=els.editor.value,types=state.lineTypes){ const lines=getLines(content),t=normalizeLineTypes(content,types); return lines.map((line,i)=>t[i]===LINE_TYPE_CHORD&&line.length?`> ${line}`:line).join('\n'); }
  function parseChartDocument(rawText){
    const raw=String(rawText||'').replace(/^\uFEFF/,''); const a=raw.lastIndexOf(CHART_META_START),b=raw.lastIndexOf(CHART_META_END); const body=a>=0&&b>a?raw.slice(0,a):raw;
    const metaText=a>=0&&b>a?raw.slice(a+CHART_META_START.length,b).trim():''; const parsed=parsePrefixedContent(body.replace(/\s+$/,'')); return {...parsed,meta:metaText?safeJsonParse(metaText,null):null};
  }
  function applyChartMetadata(meta){ state.sourceKeyIndex=Number.isInteger(meta?.sourceKeyIndex)&&keyPairs[meta.sourceKeyIndex]?meta.sourceKeyIndex:state.selectedKey; state.sourceScaleType=meta?.sourceScaleType&&scales[meta.sourceScaleType]?meta.sourceScaleType:els.scaleType.value; }
  function getChartMetadataSnapshot(){ return {version:2,sourceKeyIndex:state.sourceKeyIndex,sourceMajor:keyPairs[state.sourceKeyIndex].major,sourceMinor:keyPairs[state.sourceKeyIndex].minor,sourceScaleType:state.sourceScaleType,format:'prefixed-chord-lines'}; }
  function buildExportText(){ const body=serializePrefixedContent().replace(/\s+$/,''); return `${body}\n\n${CHART_META_START}\n${JSON.stringify(getChartMetadataSnapshot())}\n${CHART_META_END}\n`; }

  function normalizeChordText(value){ const sup={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'}; return String(value).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,c=>sup[c]||c).replaceAll('♯','#').replaceAll('♭','b').replace(/[Δ△]/g,'maj'); }
  function isValidChordSuffix(suffix){ let n=normalizeChordText(suffix||''); const atoms=/^(?:mMaj7|maj13|maj11|maj9|maj7#5|maj7|m7b5|m7|M7|M|dim7|dim|aug|sus11|sus9|sus4|sus2|sus|add13|add11|add9|add6|add4|add2|alt|ø7|ø|°7|°|\+5|\+|13|11|9|7|6\/9|69|6|5|b13|#13|b11|#11|b9|#9|b5|#5|no7|no5|no3|m)*$/; const groups=[...n.matchAll(/\(([^()]*)\)/g)]; for(const g of groups){const parts=g[1].split(',').filter(Boolean);if(!parts.length||parts.some(x=>!atoms.test(x)))return false;} n=n.replace(/\([^()]*\)/g,''); return atoms.test(n); }
  function parseChordToken(token){ if(!token)return null; let core=String(token).trim(); const tm=core.match(/((?:['’′`*]+|\.{2,}|…+)+)$/),timing=tm?tm[1]:''; if(tm)core=core.slice(0,-timing.length); const bm=core.match(/\/([A-G](?:[#b♯♭])?)$/),bass=bm?bm[1]:''; if(bm)core=core.slice(0,-bm[0].length); const rm=core.match(/^([A-G](?:[#b♯♭])?)(.*)$/); if(!rm||!isValidChordSuffix(rm[2]))return null; return {root:rm[1],suffix:rm[2],bass,timing}; }
  function stripNotationEdges(token){ const leading=token.match(/^[|:]+/)?.[0]||'',rest=token.slice(leading.length),trailing=rest.match(/[|:]+$/)?.[0]||''; return {leading,core:rest.slice(0,trailing?rest.length-trailing.length:rest.length),trailing}; }
  function transposeChordToken(token,semitones,targetKeyIndex){ const c=parseChordToken(token); if(!c)return token; const r=noteForPitch((noteIndex(c.root)+semitones+120)%12,targetKeyIndex); let out=formatAccidentals(r)+c.suffix; if(c.bass)out+=`/${formatAccidentals(noteForPitch((noteIndex(c.bass)+semitones+120)%12,targetKeyIndex))}`; return out+(c.timing||''); }
  function transposeChordLine(line,semitones,targetKeyIndex){ return String(line).replace(/\S+/g,t=>{const e=stripNotationEdges(t);return parseChordToken(e.core)?e.leading+transposeChordToken(e.core,semitones,targetKeyIndex)+e.trailing:t;}); }
  function transposeChart(content,source,target,types=state.lineTypes){ if(source===target)return content; const sem=(noteIndex(keyPairs[target].major)-noteIndex(keyPairs[source].major)+12)%12,t=normalizeLineTypes(content,types); return getLines(content).map((line,i)=>t[i]===LINE_TYPE_CHORD?transposeChordLine(line,sem,target):line).join('\n'); }
  function populateViewScaleMenus(){ const opts=keyPairs.map((p,i)=>`<option value="${i}">${p.major} / ${p.minor}</option>`).join(''); els.viewSourceKey.innerHTML=opts; els.viewTargetKey.innerHTML=`<option value="original">Original</option>${opts}`; }
  function renderViewMode(){ const source=Number(els.viewSourceKey.value),target=els.viewTargetKey.value==='original'?source:Number(els.viewTargetKey.value); els.viewChartContent.textContent=transposeChart(els.editor.value,source,target); const a=`${keyPairs[source].major} / ${keyPairs[source].minor}`,b=`${keyPairs[target].major} / ${keyPairs[target].minor}`; els.viewModeStatus.textContent=source===target?`Read-only · original ${a}`:`Read-only · ${a} → ${b}`; }
  function openViewMode(){ populateViewScaleMenus(); els.viewSourceKey.value=String(state.sourceKeyIndex); els.viewTargetKey.value='original'; renderViewMode(); els.viewModeDialog.showModal(); }
  function closeViewMode(){ if(els.viewModeDialog?.open)els.viewModeDialog.close(); }

  function saveCurrentProject({backup=false}={}) {
    const project = {
      id: state.currentProjectId,
      name: currentName(),
      content: els.editor.value,
      updatedAt: new Date().toISOString(),
      settings: getSettingsSnapshot(),
      lineTypes: normalizeLineTypes(), sourceKeyIndex: state.sourceKeyIndex, sourceScaleType: state.sourceScaleType
    };
    const projects = getProjects();
    projects[project.id] = project;
    setProjects(projects);
    localStorage.setItem(CURRENT_KEY, project.id);
    if (backup) {
      const backups = safeJsonParse(localStorage.getItem(BACKUP_KEY), {});
      backups[`${safeName(project.name)}_backup`] = {...project, backedUpAt:new Date().toISOString()};
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
    }
    refreshProjectSelect();
    markSaved(backup ? 'Backup saved locally' : 'Saved locally');
    return project;
  }

  function loadProject(id) {
    const project = getProjects()[id];
    if (!project) return;
    saveCurrentProject();
    unlinkActiveChord();
    state.currentProjectId = project.id;
    els.projectName.value = project.name === 'untitled' ? '' : project.name;
    els.editor.value = project.content || '';
    state.lineTypes = normalizeLineTypes(els.editor.value, project.lineTypes || []);
    state.sourceKeyIndex = Number.isInteger(project.sourceKeyIndex) ? project.sourceKeyIndex : state.selectedKey;
    state.sourceScaleType = project.sourceScaleType || els.scaleType.value;
    state.previousEditorValue = els.editor.value;
    applySettings(project.settings || {});
    resetHistory(els.editor.value);
    updateCounts();
    localStorage.setItem(CURRENT_KEY, id);
    refreshProjectSelect();
    updateBackupFolderUI();
    markSaved('Project opened');
    els.editor.focus();
  }

  function refreshProjectSelect() {
    const projects = Object.values(getProjects()).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    els.projectSelect.innerHTML = '<option value="">Open saved song…</option>' + projects.map(p =>
      `<option value="${escapeHtml(p.id)}" ${p.id === state.currentProjectId ? 'selected' : ''}>${escapeHtml(p.name || 'untitled')}</option>`
    ).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function newProject() {
    if (state.dirty && els.editor.value.trim() && !confirm('Start a new song? Your current song is saved locally first.')) return;
    saveCurrentProject();
    state.currentProjectId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    els.projectName.value = '';
    els.editor.value = '';
    state.lineTypes = [LINE_TYPE_TEXT]; state.previousEditorValue=''; state.sourceKeyIndex=state.selectedKey; state.sourceScaleType=els.scaleType.value;
    clearChord();
    resetHistory('');
    updateCounts();
    saveCurrentProject();
    refreshProjectSelect();
    updateBackupFolderUI();
    els.editor.focus();
    showToast('New song created');
  }

  function downloadText(content, filename) {
    const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function saveTxt() {
    saveCurrentProject();
    downloadText(buildExportText(), `${safeName(currentName())}.txt`);
    showToast('TXT saved');
  }
  function downloadBackup() {
    saveCurrentProject({backup:true});
    downloadText(buildExportText(), `${safeName(currentName())}_backup.txt`);
    showToast('Backup TXT downloaded');
  }

  function supportsFolderPicker() {
    return 'showDirectoryPicker' in window && 'indexedDB' in window;
  }

  function supportsPrivateBackups() {
    return Boolean(navigator.storage && typeof navigator.storage.getDirectory === 'function');
  }

  function openHandleDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(HANDLE_DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(HANDLE_STORE_NAME)) {
          request.result.createObjectStore(HANDLE_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function storeDirectoryHandle(handle) {
    const db = await openHandleDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(HANDLE_STORE_NAME, 'readwrite');
      transaction.objectStore(HANDLE_STORE_NAME).put(handle, BACKUP_DIRECTORY_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  }

  async function readStoredDirectoryHandle() {
    const db = await openHandleDatabase();
    const handle = await new Promise((resolve, reject) => {
      const request = db.transaction(HANDLE_STORE_NAME, 'readonly').objectStore(HANDLE_STORE_NAME).get(BACKUP_DIRECTORY_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return handle;
  }

  async function removeStoredDirectoryHandle() {
    if (!('indexedDB' in window)) return;
    const db = await openHandleDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(HANDLE_STORE_NAME, 'readwrite');
      transaction.objectStore(HANDLE_STORE_NAME).delete(BACKUP_DIRECTORY_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  }

  async function getDirectoryPermission(handle, requestAccess=false) {
    if (!handle) return 'none';
    const options = {mode:'readwrite'};
    if (typeof handle.queryPermission !== 'function') return 'prompt';
    let permission = await handle.queryPermission(options);
    if (permission === 'prompt' && requestAccess && typeof handle.requestPermission === 'function') {
      permission = await handle.requestPermission(options);
    }
    return permission;
  }

  async function ensureDefaultBackupFolder() {
    if (state.defaultBackupDirectoryHandle || !supportsPrivateBackups()) return state.defaultBackupDirectoryHandle;
    try {
      const root = await navigator.storage.getDirectory();
      state.defaultBackupDirectoryHandle = await root.getDirectoryHandle('backups', {create:true});
    } catch (error) {
      console.warn('Private backup folder unavailable:', error);
      state.defaultBackupDirectoryHandle = null;
    }
    return state.defaultBackupDirectoryHandle;
  }

  async function ensureExternalBackupFolder(requestAccess=false) {
    if (!state.directoryHandle) return null;
    state.backupPermission = await getDirectoryPermission(state.directoryHandle, requestAccess);
    if (state.backupPermission !== 'granted') {
      state.backupDirectoryHandle = null;
      return null;
    }
    state.backupDirectoryHandle = await state.directoryHandle.getDirectoryHandle('backups', {create:true});
    return state.backupDirectoryHandle;
  }

  function updateBackupFolderUI() {
    const handle = state.directoryHandle;
    const permission = state.backupPermission;
    els.clearBackupFolderBtn.disabled = !handle;
    els.backupFolderHelp.classList.remove('good', 'warn');

    if (!handle) {
      els.backupFolderInput.value = supportsPrivateBackups()
        ? 'Browser storage /backups (default)'
        : 'Browser-local project backup (default)';
      els.chooseBackupFolderBtn.textContent = supportsFolderPicker() ? 'Choose Windows folder' : 'Folder picker unavailable';
      els.chooseBackupFolderBtn.disabled = !supportsFolderPicker();
      els.clearBackupFolderBtn.textContent = 'Use default';
      els.backupFolderHelp.textContent = supportsPrivateBackups()
        ? `Default: ${safeName(currentName())}_backup.txt is stored in the app's private /backups folder every minute.`
        : 'This browser cannot expose a writable folder. The minute backup still survives in browser storage.';
      if (!supportsPrivateBackups()) els.backupFolderHelp.classList.add('warn');
      return;
    }

    els.chooseBackupFolderBtn.disabled = false;
    els.backupFolderInput.value = `${handle.name}/backups`;
    els.clearBackupFolderBtn.textContent = 'Use default';
    if (permission === 'granted') {
      els.chooseBackupFolderBtn.textContent = 'Change folder';
      els.backupFolderHelp.textContent = `Active: ${safeName(currentName())}_backup.txt is updated in ${handle.name}/backups every minute.`;
      els.backupFolderHelp.classList.add('good');
    } else if (permission === 'prompt') {
      els.chooseBackupFolderBtn.textContent = 'Restore access';
      els.backupFolderHelp.textContent = 'Folder remembered. Click Restore access once so writing to its /backups subfolder can resume.';
      els.backupFolderHelp.classList.add('warn');
    } else {
      els.chooseBackupFolderBtn.textContent = 'Choose another folder';
      els.backupFolderHelp.textContent = 'Access was denied. The private /backups folder remains the active fallback.';
      els.backupFolderHelp.classList.add('warn');
    }
  }

  async function chooseBackupFolder() {
    if (!supportsFolderPicker()) {
      showToast('Windows folder selection requires a current Chrome or Edge browser.', true);
      return;
    }

    try {
      if (state.directoryHandle && state.backupPermission === 'prompt') {
        const restored = await ensureExternalBackupFolder(true);
        updateBackupFolderUI();
        if (restored) {
          await writeFileBackup();
          showToast(`Backup access restored: ${state.directoryHandle.name}/backups`);
          return;
        }
      }

      const options = {id:'chord-chart-fast-backups', mode:'readwrite'};
      if (state.directoryHandle && state.backupPermission !== 'denied') options.startIn = state.directoryHandle;
      else options.startIn = 'documents';

      const handle = await window.showDirectoryPicker(options);
      state.directoryHandle = handle;
      await storeDirectoryHandle(handle);
      await ensureExternalBackupFolder(true);
      updateBackupFolderUI();

      if (state.backupPermission === 'granted') {
        await writeFileBackup();
        showToast(`Backup folder set: ${handle.name}/backups`);
      } else {
        showToast('Folder remembered, but write permission was not granted.', true);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error(error);
        showToast('Could not set the backup folder.', true);
      }
    }
  }

  async function clearBackupFolder() {
    try {
      await removeStoredDirectoryHandle();
      state.directoryHandle = null;
      state.backupDirectoryHandle = null;
      state.backupPermission = 'none';
      updateBackupFolderUI();
      els.backupStatus.textContent = 'Using the default private /backups folder.';
      showToast('Using the default /backups folder');
    } catch (error) {
      console.error(error);
      showToast('Could not clear the remembered folder.', true);
    }
  }

  async function restoreBackupFolder() {
    await ensureDefaultBackupFolder();
    if (!supportsFolderPicker()) {
      updateBackupFolderUI();
      return;
    }
    try {
      state.directoryHandle = await readStoredDirectoryHandle();
      state.backupPermission = await getDirectoryPermission(state.directoryHandle, false);
      if (state.backupPermission === 'granted') await ensureExternalBackupFolder(false);
    } catch (error) {
      console.error(error);
      state.directoryHandle = null;
      state.backupDirectoryHandle = null;
      state.backupPermission = 'none';
    }
    updateBackupFolderUI();
  }

  async function writeTextToDirectory(directoryHandle, filename, content) {
    if (!directoryHandle) return false;
    const fileHandle = await directoryHandle.getFileHandle(filename, {create:true});
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  }

  async function writeFileBackup() {
    const filename = `${safeName(currentName())}_backup.txt`;
    const destinations = [];

    try {
      const defaultFolder = await ensureDefaultBackupFolder();
      if (await writeTextToDirectory(defaultFolder, filename, buildExportText())) destinations.push('private /backups');
    } catch (error) {
      console.warn('Default file backup failed:', error);
    }

    if (state.directoryHandle) {
      try {
        const externalFolder = await ensureExternalBackupFolder(false);
        if (await writeTextToDirectory(externalFolder, filename, buildExportText())) destinations.push(`${state.directoryHandle.name}/backups`);
      } catch (error) {
        console.warn('External file backup failed:', error);
        state.backupPermission = 'prompt';
        state.backupDirectoryHandle = null;
      }
    }

    updateBackupFolderUI();
    return destinations;
  }

  function getSettingsSnapshot() {
    return {
      selectedKey:state.selectedKey,
      scaleType:els.scaleType.value,
      seventh:els.seventhToggle.checked,
      symbolStyle:els.symbolStyle.value,
      superscript:els.superscriptToggle.checked,
      trailingSpace:els.spaceAfterChordToggle.checked
    };
  }

  function applySettings(s={}) {
    state.selectedKey = Number.isInteger(s.selectedKey) ? s.selectedKey : state.selectedKey;
    els.scaleType.value = s.scaleType || els.scaleType.value;
    els.seventhToggle.checked = Boolean(s.seventh);
    els.symbolStyle.value = s.symbolStyle || els.symbolStyle.value;
    els.superscriptToggle.checked = Boolean(s.superscript);
    els.spaceAfterChordToggle.checked = s.trailingSpace !== false;
    renderKeys();
    renderRoots();
    renderDiatonic();
    updateChordPreview();
  }

  function saveGlobalSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(getSettingsSnapshot()));
    markDirty();
    scheduleSave();
  }

  function setMode(mode) {
    state.mode = mode;
    const chord = mode === 'chord';
    if (!chord) {
      state.mHeld = false;
      state.slashHeld = false;
      state.awaitingSlashBass = false;
      state.xHeld = false;
      state.xUsed = false;
    }
    document.body.classList.toggle('mode-text', !chord);
    document.body.classList.toggle('mode-chord', chord);
    els.textModeBtn.classList.toggle('active', !chord);
    els.chordModeBtn.classList.toggle('active', chord);
    els.modeLabel.textContent = chord ? 'CHORD' : 'TEXT';
    els.editorModeBadge.textContent = chord ? 'CHORD MODE' : 'TEXT MODE';
    els.modeHint.textContent = chord
      ? 'Tap the editor to type · roots insert immediately.'
      : 'Tap the editor to type lyrics.';
    els.chordPanel.classList.toggle('disabled', !chord);
    if (!chord) closeKeyScalePopover();

    // Mobile behavior: suppress the phone keyboard in Chord mode while preserving
    // the textarea selection/caret as the insertion target.
    els.editor.readOnly = chord;
    els.editor.inputMode = chord ? 'none' : 'text';
    els.editor.setAttribute('aria-readonly', chord ? 'true' : 'false');
    if (chord) {
      els.editor.blur();
    } else {
      // On iPhone, changing from readOnly to editable and focusing in the same
      // button event is unreliable. Text mode arms the editor; one direct tap
      // on the editor then opens the phone keyboard consistently.
      els.editor.blur();
    }
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      syncVisibleViewport();
      setTimeout(syncVisibleViewport, 180);
      setTimeout(syncVisibleViewport, 420);
    });
  }

  function noteIndex(note) {
    const normalized = note.replace('♯','#').replace('♭','b');
    const idxSharp = chromaticSharp.indexOf(normalized);
    if (idxSharp >= 0) return idxSharp;
    const idxFlat = chromaticFlat.indexOf(normalized);
    if (idxFlat >= 0) return idxFlat;

    // Enharmonic fallback for uncommon spellings such as B#, Cb, E# and Fb.
    const letterOffsets = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    const letter = normalized[0];
    if (!(letter in letterOffsets)) return -1;
    let index = letterOffsets[letter];
    for (const accidental of normalized.slice(1)) {
      if (accidental === '#') index += 1;
      if (accidental === 'b') index -= 1;
    }
    return (index + 120) % 12;
  }

  function preferredChromatic() {
    return keyPairs[state.selectedKey].prefer === 'flat' ? chromaticFlat : chromaticSharp;
  }

  function getRootEnharmonicPreferences() {
    return safeJsonParse(localStorage.getItem(ROOT_ENHARMONIC_KEY), {});
  }

  function getRootNotes() {
    const baseNotes = preferredChromatic();
    const preferences = getRootEnharmonicPreferences();
    return baseNotes.map((baseNote, pitchIndex) => preferences[String(pitchIndex)] || baseNote);
  }

  function toggleRootSpelling(pitchIndex) {
    toggleGlobalPitchSpelling(pitchIndex, 'Root');
  }

  function getGlobalPitchNotes() {
    const baseNotes = preferredChromatic();
    const preferences = getRootEnharmonicPreferences();
    return baseNotes.map((baseNote, pitchIndex) => preferences[String(pitchIndex)] || baseNote);
  }

  function getGlobalPreferredNote(note) {
    const pitchIndex = noteIndex(note);
    if (pitchIndex < 0) return note;
    return getRootEnharmonicPreferences()[String(pitchIndex)] || note;
  }

  function noteForPitch(pitchIndex, keyIndex=state.selectedKey, fallbackPreference='') {
    const pitch=((pitchIndex%12)+12)%12;
    const stored=getRootEnharmonicPreferences()[String(pitch)];
    if(stored)return stored;
    const prefer=fallbackPreference||keyPairs[keyIndex]?.prefer||'sharp';
    return prefer==='flat'?chromaticFlat[pitch]:chromaticSharp[pitch];
  }

  function toggleGlobalPitchSpelling(pitchIndex, sourceLabel='Note') {
    const currentNote = getGlobalPitchNotes()[pitchIndex];
    const alternative = enharmonicAlternative(currentNote);
    if (!alternative) {
      showToast(`${currentNote} has no common sharp/flat alternative`, true);
      return;
    }
    const preferences = getRootEnharmonicPreferences();
    // Always store the chosen spelling explicitly so it stays identical in every key and scale.
    preferences[String(pitchIndex)] = alternative;
    localStorage.setItem(ROOT_ENHARMONIC_KEY, JSON.stringify(preferences));
    renderRoots();
    renderDiatonic();
    if (els.viewModeDialog?.open) renderViewMode();
    showToast(`${sourceLabel} spelling changed globally to ${alternative}`);
  }

  function forceGSharpMinorEnabled() {
    return localStorage.getItem(FORCE_GSHARP_MINOR_KEY) !== 'false';
  }

  function enharmonicAlternative(note) {
    const index = noteIndex(note);
    if (index < 0) return '';
    const sharp = chromaticSharp[index];
    const flat = chromaticFlat[index];
    if (sharp === flat) return '';
    return note.replace('♯','#').replace('♭','b').includes('b') ? sharp : flat;
  }

  function bindPrimaryAndLongPress(button, onPrimary, onLongPress) {
    let timer = null;
    let suppressClick = false;
    let suppressContextMenu = false;
    let startX = 0;
    let startY = 0;

    button.addEventListener('contextmenu', event => {
      event.preventDefault();
      if (suppressContextMenu) {
        suppressContextMenu = false;
        return;
      }
      onLongPress();
    });

    button.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') return;
      startX = event.clientX;
      startY = event.clientY;
      suppressClick = false;
      clearTimeout(timer);
      timer = setTimeout(() => {
        suppressClick = true;
        suppressContextMenu = true;
        onLongPress();
      }, 550);
    });

    const cancelLongPress = () => {
      clearTimeout(timer);
      timer = null;
    };

    button.addEventListener('pointermove', event => {
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) cancelLongPress();
    });
    button.addEventListener('pointerup', cancelLongPress);
    button.addEventListener('pointercancel', cancelLongPress);
    button.addEventListener('pointerleave', cancelLongPress);

    button.addEventListener('click', event => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
        return;
      }
      onPrimary();
    });
  }


  function bindPrimaryDoubleAndLongPress(button,onPrimary,onDouble,onLongPress){
    let tapTimer=null,lastTap=0,longTimer=null,longPressed=false,startX=0,startY=0;
    button.addEventListener('contextmenu',e=>{e.preventDefault();onLongPress?.();});
    button.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;startX=e.clientX;startY=e.clientY;longPressed=false;clearTimeout(longTimer);longTimer=setTimeout(()=>{longPressed=true;clearTimeout(tapTimer);lastTap=0;onLongPress?.();},600);});
    const cancel=()=>{clearTimeout(longTimer);longTimer=null;};
    button.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-startX,e.clientY-startY)>10)cancel();});
    button.addEventListener('pointerup',cancel);button.addEventListener('pointercancel',cancel);button.addEventListener('pointerleave',cancel);
    button.addEventListener('click',e=>{if(longPressed){e.preventDefault();longPressed=false;return;}if(!onDouble){onPrimary();return;}const now=Date.now();if(now-lastTap<310){clearTimeout(tapTimer);tapTimer=null;lastTap=0;onDouble();return;}lastTap=now;clearTimeout(tapTimer);tapTimer=setTimeout(()=>{onPrimary();tapTimer=null;},315);});
  }

  function formatAccidentals(text) {
    if (els.symbolStyle.value !== 'symbols') return text;
    return text.replaceAll('#','♯').replaceAll('b','♭');
  }

  function superscriptNumbers(text) {
    if (!els.superscriptToggle.checked) return text;
    return text.replace(/\d+/g, digits => [...digits].map(d => superscriptMap[d] || d).join(''));
  }

  function renderExtension(extension, style) {
    if (!extension) return '';
    if (extension === '69') return '6/9';
    if (extension === 'mMaj7') return '(maj7)';
    if (extension.startsWith('maj')) return style === 'symbols' ? `Δ${extension.slice(3)}` : extension;
    return extension;
  }

  function renderChord(customState=state) {
    if (!customState.root) return '';
    const style = els.symbolStyle.value;
    let body = '';

    if (customState.chordType === 'halfDim') {
      body = style === 'symbols' ? 'ø7' : 'm7b5';
      if (customState.extension && !['7',''].includes(customState.extension)) {
        body += renderExtension(customState.extension, style);
      }
    } else if (customState.chordType === 'dim') {
      const dimLabel = style === 'symbols' ? '°' : 'dim';
      if (customState.extension === 'dim7' || customState.extension === '7') {
        body = style === 'symbols' ? '°7' : 'dim7';
      } else {
        body = dimLabel + renderExtension(customState.extension, style);
      }
    } else if (customState.chordType === 'aug') {
      body = (style === 'symbols' ? '+' : 'aug') + renderExtension(customState.extension, style);
    } else if (customState.chordType === '5') {
      body = '5' + renderExtension(customState.extension, style);
    } else {
      body = customState.quality === 'm' ? 'm' : '';
      if (customState.extension === 'mMaj7') {
        if (customState.quality !== 'm') body += 'm';
        body += '(maj7)';
      } else {
        body += renderExtension(customState.extension, style);
      }
      body += customState.suspension || '';
    }

    const mods = [...customState.alterations, ...customState.omissions];
    if (mods.length) body += `(${mods.join(',')})`;
    body += customState.customSuffix || '';

    let symbol = customState.root + body + (customState.slashBass ? `/${customState.slashBass}` : '');
    symbol = formatAccidentals(symbol);
    symbol = superscriptNumbers(symbol);
    return symbol;
  }

  function updateChordPreview() {
    els.chordPreview.textContent = renderChord() || '—';
    updateActiveButtons();
  }

  function updateActiveButtons() {
    $$('.root-btn').forEach(button => button.classList.toggle('active', button.dataset.root === state.root));
    $$('[data-quality]').forEach(button => button.classList.toggle('active', button.dataset.quality === state.quality && !state.chordType));
    $$('[data-control-kind]').forEach(button => {
      const kind = button.dataset.controlKind;
      const value = button.dataset.controlValue;
      let active = false;
      if (kind === 'triad') active = !state.chordType && !state.extension && !state.suspension;
      if (kind === 'type') active = state.chordType === value;
      if (kind === 'typeExtension') active = state.chordType === 'dim' && state.extension === value;
      if (kind === 'extension') active = state.extension === value;
      if (kind === 'suspension') active = state.suspension === value;
      button.classList.toggle('active', active);
    });
    $$('[data-alteration]').forEach(button => button.classList.toggle('active', state.alterations.includes(button.dataset.alteration)));
    $$('[data-omit]').forEach(button => button.classList.toggle('active', state.omissions.includes(button.dataset.omit)));
    $$('#slashBassGrid .root-btn').forEach(button => button.classList.toggle('active', button.dataset.bass === state.slashBass));
  }

  function resetChordState() {
    Object.assign(state, {
      root:'', quality:'', chordType:'', extension:'', suspension:'',
      alterations:[], omissions:[], slashBass:'', customSuffix:'',
      awaitingSlashBass:false, slashHeld:false, slashUsed:false,
      pendingMinor:false
    });
    els.customSuffix.value = '';
    // Bass choices stay visible in the mobile touch layout.
    els.slashBassGrid.classList.remove('hidden');
    els.customSuffixWrap.classList.add('hidden');
  }

  function unlinkActiveChord() {
    state.activeChord = null;
  }

  function clearChord() {
    unlinkActiveChord();
    resetChordState();
    updateChordPreview();
  }

  function closeKeyScalePopover() {
    els.keyScalePopover.classList.add('hidden');
    els.keyScaleBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleKeyScalePopover() {
    const willOpen = els.keyScalePopover.classList.contains('hidden');
    els.keyScalePopover.classList.toggle('hidden', !willOpen);
    els.keyScaleBtn.setAttribute('aria-expanded', String(willOpen));
  }

  function renderKeys() {
    const selected = keyPairs[state.selectedKey];
    els.keyScaleBtn.textContent = `${selected.major} / ${selected.minor}`;
    els.keyGrid.innerHTML = keyPairs.map((key,index) =>
      `<button class="key-btn ${index===state.selectedKey?'active':''}" data-key-index="${index}">${key.major} / ${key.minor}</button>`
    ).join('');
    $$('[data-key-index]').forEach(button => button.addEventListener('click', () => {
      state.selectedKey = Number(button.dataset.keyIndex); state.sourceKeyIndex = state.selectedKey; state.sourceScaleType = els.scaleType.value;
      renderKeys();
      renderRoots();
      renderDiatonic();
      closeKeyScalePopover();
      saveGlobalSettings();
    }));
  }

  function getSlashBassNotes() {
    return getGlobalPitchNotes();
  }

  function toggleSlashBassSpelling(pitchIndex) {
    toggleGlobalPitchSpelling(pitchIndex, 'Bass');
  }

  function renderRoots() {
    const rootNotes = getRootNotes();
    const bassNotes = getSlashBassNotes();

    if (els.rootGrid) {
      els.rootGrid.innerHTML = rootNotes.map((note, pitchIndex) =>
        `<button class="root-btn mobile-root-btn enharmonic-toggle" data-mobile-root="${note}" data-root-pitch="${pitchIndex}" title="Double tap for minor; hold to switch sharp / flat spelling">${formatAccidentals(note)}</button>`
      ).join('');
      $$('[data-root-pitch]').forEach(button => {
        const pitchIndex = Number(button.dataset.rootPitch);
        let tapTimer = null;
        let lastTapAt = 0;
        let longTimer = null;
        let longPressed = false;
        let startX = 0;
        let startY = 0;

        button.addEventListener('contextmenu', event => {
          event.preventDefault();
          toggleRootSpelling(pitchIndex);
        });
        button.addEventListener('pointerdown', event => {
          if (event.pointerType === 'mouse') return;
          startX = event.clientX;
          startY = event.clientY;
          longPressed = false;
          clearTimeout(longTimer);
          longTimer = setTimeout(() => {
            longPressed = true;
            clearTimeout(tapTimer);
            lastTapAt = 0;
            toggleRootSpelling(pitchIndex);
          }, 600);
        });
        const cancelLong = () => { clearTimeout(longTimer); longTimer = null; };
        button.addEventListener('pointermove', event => {
          if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) cancelLong();
        });
        button.addEventListener('pointerup', cancelLong);
        button.addEventListener('pointercancel', cancelLong);
        button.addEventListener('pointerleave', cancelLong);
        button.addEventListener('click', event => {
          if (longPressed) {
            event.preventDefault();
            longPressed = false;
            return;
          }
          const now = Date.now();
          const isDoubleTap = now - lastTapAt < 310;
          lastTapAt = now;
          if (isDoubleTap) {
            clearTimeout(tapTimer);
            tapTimer = null;
            lastTapAt = 0;
            const minorRoot = forceGSharpMinorEnabled() && pitchIndex === 8 ? 'G#' : button.dataset.mobileRoot;
            startAndInsertChord(minorRoot, 'm');
            return;
          }
          clearTimeout(tapTimer);
          tapTimer = setTimeout(() => {
            startAndInsertChord(button.dataset.mobileRoot, '');
            tapTimer = null;
          }, 315);
        });
      });
    }

    els.slashBassGrid.innerHTML = bassNotes.map((note, pitchIndex) =>
      `<button class="root-btn enharmonic-toggle" data-bass="${note}" data-bass-pitch="${pitchIndex}" title="Hold to switch sharp / flat spelling">/${formatAccidentals(note)}</button>`
    ).join('');
    $$('[data-bass-pitch]').forEach(button => {
      const pitchIndex = Number(button.dataset.bassPitch);
      bindPrimaryAndLongPress(
        button,
        () => applySlashBass(button.dataset.bass),
        () => toggleSlashBassSpelling(pitchIndex)
      );
    });
  }

  function updateMobileMinorButton() {
    if (!els.mobileMinorBtn) return;
    els.mobileMinorBtn.classList.toggle('active', state.pendingMinor);
    els.mobileMinorBtn.textContent = state.pendingMinor ? 'Minor armed' : 'Minor next';
  }

  function renderQualityButtons() {
    els.qualityGrid.innerHTML = qualities.map(item =>
      `<button class="modifier-btn" data-quality="${item.value}"><span class="modifier-label">${item.label}</span></button>`
    ).join('');
    $$('[data-quality]').forEach(button => button.addEventListener('click', () => {
      setBaseQuality(button.dataset.quality);
    }));
  }

  function shortcutMarkup(item) {
    return '';
  }

  function renderExtensionButtons() {
    els.extensionGrid.innerHTML = extensionControls.map(item =>
      `<button class="modifier-btn modifier-content" data-control-kind="${item.kind}" data-control-value="${item.value}">` +
        `<span class="modifier-label">${item.label}</span>` +
      `</button>`
    ).join('');
    $$('[data-control-kind]').forEach(button => button.addEventListener('click', () => {
      applyExtensionControl(button.dataset.controlKind, button.dataset.controlValue);
    }));
  }

  function renderAlterationButtons() {
    els.alterationGrid.innerHTML = alterations.map(value =>
      `<button class="modifier-btn" data-alteration="${value}">(${formatAccidentals(value)})</button>`
    ).join('');
    $$('[data-alteration]').forEach(button => button.addEventListener('click', () => {
      toggleArrayValue(state.alterations, button.dataset.alteration);
    }));
  }

  function toggleArrayValue(array, value) {
    const index = array.indexOf(value);
    if (index >= 0) array.splice(index,1);
    else array.push(value);
    updateChordAndActiveText();
  }

  function getBaseDiatonicChord(index) {
    const pair=keyPairs[state.selectedKey],scale=scales[els.scaleType.value];
    const tonicName=els.scaleType.value==='major'?pair.major:pair.minor.replace(/m$/,'');
    const tonicIndex=noteIndex(tonicName),notes=preferredChromatic(),suffixes=[...scale.triads];
    if(suffixes[6]==='dim')suffixes[6]='m7b5';
    return {root:notes[(tonicIndex+scale.intervals[index])%12],suffix:suffixes[index],roman:scale.roman[index]};
  }
  function getDiatonicChord(index){const c=getBaseDiatonicChord(index);return {...c,root:getGlobalPreferredNote(c.root)};}
  function toggleDiatonicSpelling(index){toggleGlobalPitchSpelling(noteIndex(getBaseDiatonicChord(index).root),'Diatonic');}
  function getDiatonicDoubleVariant(index){
    if(els.scaleType.value!=='major')return null;
    const tonic=noteIndex(keyPairs[state.selectedKey].major),pitch=d=>(tonic+scales.major.intervals[d])%12;
    let root=-1,bass=-1,suffix='',fallback='';
    if(index===4){root=pitch(2);bass=pitch(4);suffix='m';}
    else if(index===0){root=pitch(5);bass=pitch(0);suffix='m';}
    else if(index===2){root=pitch(2);bass=(root+4)%12;fallback='flat';}
    else if(index===5){root=pitch(5);bass=(root+4)%12;fallback='sharp';}
    else return null;
    return {root:noteForPitch(root,state.selectedKey),suffix,bass:noteForPitch(bass,state.selectedKey,fallback)};
  }
  function insertDiatonicVariant(index){const v=getDiatonicDoubleVariant(index);if(!v)return insertDiatonicChord(index);applySuffixToState(v.root,v.suffix);state.slashBass=v.bass;insertNewActiveChord();}
  function renderDiatonic(){
    const scale=scales[els.scaleType.value];
    els.diatonicGrid.innerHTML=scale.intervals.map((_,index)=>{const c=getDiatonicChord(index),v=getDiatonicDoubleVariant(index);const title=v?`Tap ${c.root+c.suffix}; double tap ${v.root}${v.suffix}/${v.bass}; hold to change spelling`:'Hold to change spelling';return `<button class="diatonic-btn enharmonic-toggle" data-diatonic-index="${index}" title="${escapeHtml(title)}"><strong>${formatAccidentals(c.root+c.suffix)}</strong></button>`;}).join('');
    $$('[data-diatonic-index]').forEach(button=>{const index=Number(button.dataset.diatonicIndex);bindPrimaryDoubleAndLongPress(button,()=>insertDiatonicChord(index),getDiatonicDoubleVariant(index)?()=>insertDiatonicVariant(index):null,()=>toggleDiatonicSpelling(index));});
  }

  function applySuffixToState(root, suffix) {
    resetChordState();
    state.root = root;
    if (suffix === 'm') state.quality = 'm';
    else if (suffix === 'dim') state.chordType = 'dim';
    else if (suffix === 'aug') state.chordType = 'aug';
    else if (suffix === 'maj7') state.extension = 'maj7';
    else if (suffix === 'm7') { state.quality = 'm'; state.extension = '7'; }
    else if (suffix === '7') state.extension = '7';
    else if (suffix === 'm7b5') state.chordType = 'halfDim';
    else if (suffix === 'dim7') { state.chordType = 'dim'; state.extension = 'dim7'; }
    else if (suffix === 'mMaj7') { state.quality = 'm'; state.extension = 'mMaj7'; }
    else if (suffix === 'maj7#5') { state.extension = 'maj7'; state.alterations = ['#5']; }
  }

  function insertDiatonicChord(index) {
    const chord = getDiatonicChord(index);
    applySuffixToState(chord.root, chord.suffix);
    insertNewActiveChord();
  }

  function validActiveChord() {
    const active = state.activeChord;
    if (!active) return false;
    if (active.start < 0 || active.end < active.start || active.end > els.editor.value.length) {
      unlinkActiveChord();
      return false;
    }
    if (els.editor.value.slice(active.start, active.end) !== active.rendered) {
      unlinkActiveChord();
      return false;
    }
    return true;
  }

  function ensureEditorCaretVisible() {
    const cursor = els.editor.selectionStart ?? 0;
    const before = els.editor.value.slice(0, cursor);
    const lineIndex = before.split('\n').length - 1;
    const computed = getComputedStyle(els.editor);
    const lineHeight = parseFloat(computed.lineHeight) || 22;
    const paddingTop = parseFloat(computed.paddingTop) || 0;
    const caretTop = paddingTop + (lineIndex * lineHeight);
    const visibleTop = els.editor.scrollTop;
    const visibleBottom = visibleTop + els.editor.clientHeight;
    const margin = lineHeight * 1.5;
    if (caretTop + margin > visibleBottom) {
      els.editor.scrollTop = Math.max(0, caretTop - els.editor.clientHeight + (lineHeight * 2.2));
    } else if (caretTop < visibleTop) {
      els.editor.scrollTop = Math.max(0, caretTop - lineHeight);
    }
  }

  function commitEditorValue(value, cursorStart, cursorEnd=cursorStart) {
    const oldValue=els.editor.value;
    state.lineTypes=reconcileLineTypes(oldValue,value,state.lineTypes,state.mode==='chord'?LINE_TYPE_CHORD:LINE_TYPE_TEXT);
    els.editor.value=value;
    if(state.mode==='chord') markLineRange(LINE_TYPE_CHORD,cursorStart,cursorEnd,value);
    state.previousEditorValue=value;
    els.editor.setSelectionRange(cursorStart,cursorEnd);
    if(state.mode==='text')els.editor.focus({preventScroll:true});
    requestAnimationFrame(ensureEditorCaretVisible); pushHistory(); updateCounts(); markDirty(); scheduleSave(); updateLineTypeButton();
  }

  function insertAtCursor(text, {clearActive=true}={}) {
    const start = els.editor.selectionStart;
    const end = els.editor.selectionEnd;
    const before = els.editor.value.slice(0,start);
    const after = els.editor.value.slice(end);
    if (clearActive) unlinkActiveChord();
    commitEditorValue(before + text + after, start + text.length);
  }

  function insertNewActiveChord() {
    const chord = renderChord();
    if (!chord) {
      showToast('Choose a chord root first', true);
      return false;
    }
    const start = els.editor.selectionStart;
    const end = els.editor.selectionEnd;
    const trailing = els.spaceAfterChordToggle.checked ? ' ' : '';
    const before = els.editor.value.slice(0,start);
    const after = els.editor.value.slice(end);
    const value = before + chord + trailing + after;
    state.activeChord = {
      start,
      end:start + chord.length,
      suffixEnd:start + chord.length,
      trailingLength:trailing.length,
      rendered:chord
    };
    commitEditorValue(value, start + chord.length + trailing.length);
    updateChordPreview();
    return true;
  }

  function syncActiveChordText() {
    if (!validActiveChord()) return false;
    const active = state.activeChord;
    const newChord = renderChord();
    if (!newChord) return false;
    const oldEnd = active.end;
    const oldRendered = active.rendered;
    const delta = newChord.length - oldRendered.length;
    const before = els.editor.value.slice(0,active.start);
    const after = els.editor.value.slice(oldEnd);
    const oldSelectionStart = els.editor.selectionStart;
    const oldSelectionEnd = els.editor.selectionEnd;

    active.end += delta;
    active.suffixEnd += delta;
    active.rendered = newChord;

    const adjustPosition = (position) => {
      if (position <= active.start) return position;
      if (position < oldEnd) return active.end;
      return position + delta;
    };

    commitEditorValue(
      before + newChord + after,
      adjustPosition(oldSelectionStart),
      adjustPosition(oldSelectionEnd)
    );
    return true;
  }

  function updateChordAndActiveText() {
    updateChordPreview();
    syncActiveChordText();
  }

  function startAndInsertChord(root, quality='') {
    resetChordState();
    state.root = root;
    state.quality = quality;
    insertNewActiveChord();
  }

  function finishOrInsertChord() {
    if (validActiveChord()) {
      unlinkActiveChord();
      resetChordState();
      updateChordPreview();
      return;
    }
    insertNewActiveChord();
  }

  function setBaseQuality(quality) {
    state.quality = quality;
    // These types already define their own quality; selecting Major/Minor returns to a normal base.
    if (state.chordType) state.chordType = '';
    updateChordAndActiveText();
  }

  function toggleMinor() {
    if (!state.root && !validActiveChord()) {
      state.pendingMinor = !state.pendingMinor;
      state.quality = state.pendingMinor ? 'm' : '';
      updateChordPreview();
      return;
    }
    state.quality = state.quality === 'm' ? '' : 'm';
    state.pendingMinor = false;
    if (state.chordType) state.chordType = '';
    updateChordAndActiveText();
  }

  function applyExtensionControl(kind, value) {
    if (kind === 'triad') {
      state.chordType = '';
      state.extension = '';
      state.suspension = '';
      state.alterations = [];
    } else if (kind === 'type') {
      state.chordType = value;
      state.extension = '';
      state.suspension = '';
      if (['dim','halfDim','aug','5'].includes(value)) state.quality = '';
    } else if (kind === 'typeExtension') {
      state.chordType = 'dim';
      state.quality = '';
      state.extension = value;
      state.suspension = '';
    } else if (kind === 'suspension') {
      state.suspension = state.suspension === value ? '' : value;
      if (state.chordType) state.chordType = '';
    } else if (kind === 'extension') {
      state.extension = state.extension === value ? '' : value;
      if (value === 'mMaj7') state.quality = 'm';
    }
    updateChordAndActiveText();
  }

  function clearToTriad() {
    state.chordType = '';
    state.extension = '';
    state.suspension = '';
    state.alterations = [];
    updateChordAndActiveText();
  }

  function rootFromCode(code) {
    const match = /^Key([A-G])$/.exec(code || '');
    return match ? match[1] : '';
  }

  function alterSpelling(note, direction) {
    if (!note) return note;
    const normalized = note.replace('♯','#').replace('♭','b');
    const letter = normalized[0];
    const accidental = normalized.slice(1);
    if (direction === 'sharp') {
      if (accidental.includes('b')) return letter + accidental.replace(/b/, '');
      if (accidental.includes('#')) return normalized;
      return `${letter}#`;
    }
    if (accidental.includes('#')) return letter + accidental.replace(/#/, '');
    if (accidental.includes('b')) return normalized;
    return `${letter}b`;
  }

  function alterCurrentNote(direction) {
    const target = state.slashHeld && state.slashBass ? 'slashBass' : 'root';
    if (!state[target]) return;
    state[target] = alterSpelling(state[target], direction);
    updateChordAndActiveText();
  }

  function applySlashBass(root) {
    if (!state.root) {
      showToast('Insert a main chord before adding slash bass', true);
      return;
    }
    state.slashBass = root;
    state.awaitingSlashBass = false;
    state.slashUsed = true;
    els.slashBassGrid.classList.remove('hidden');
    updateChordAndActiveText();
  }

  function insertChordMarker(marker) {
    if (!validActiveChord()) {
      insertAtCursor(marker);
      return;
    }
    const active = state.activeChord;
    const position = active.suffixEnd;
    const before = els.editor.value.slice(0,position);
    const after = els.editor.value.slice(position);
    active.suffixEnd += marker.length;
    const cursor = active.suffixEnd + active.trailingLength;
    commitEditorValue(before + marker + after, cursor);
  }

  function insertSyncopation() {
    if (validActiveChord()) {
      insertChordMarker(' *');
      return;
    }
    const start = els.editor.selectionStart;
    const before = els.editor.value.slice(0,start);
    insertAtCursor(before.endsWith(' ') || before.endsWith('\n') || !before.length ? '*' : ' *');
  }

  function insertSpacedSymbol(symbol) {
    unlinkActiveChord();
    resetChordState();
    updateChordPreview();
    const start = els.editor.selectionStart;
    const end = els.editor.selectionEnd;
    let before = els.editor.value.slice(0,start);
    let after = els.editor.value.slice(end);
    const atLineStart = before.length === 0 || before.endsWith('\n');
    before = before.replace(/[ \t]+$/g, '');
    after = after.replace(/^[ \t]+/g, '');
    const leftSpace = atLineStart ? '' : ' ';
    const rightSpace = after.startsWith('\n') || after.length === 0 ? ' ' : ' ';
    const insertion = `${leftSpace}${symbol}${rightSpace}`;
    commitEditorValue(before + insertion + after, before.length + insertion.length);
  }

  function insertNewLine() {
    unlinkActiveChord();
    resetChordState();
    updateChordPreview();
    const start = els.editor.selectionStart;
    const end = els.editor.selectionEnd;
    const before = els.editor.value.slice(0,start).replace(/[ 	]+$/g, '');
    const after = els.editor.value.slice(end);
    commitEditorValue(before + '\n' + after, before.length + 1);
  }

  function insertRepeatCount(number) {
    unlinkActiveChord();
    resetChordState();
    updateChordPreview();
    const start = els.editor.selectionStart;
    const end = els.editor.selectionEnd;
    const before = els.editor.value.slice(0,start).replace(/[ \t]+$/g, '');
    const after = els.editor.value.slice(end).replace(/^[ \t]+/g, '');
    const insertion = `   X${number}`;
    commitEditorValue(before + insertion + after, before.length + insertion.length);
  }

  function insertTimeSignature(signature) {
    unlinkActiveChord();
    resetChordState();
    updateChordPreview();
    const start = els.editor.selectionStart;
    const end = els.editor.selectionEnd;
    let before = els.editor.value.slice(0,start);
    let after = els.editor.value.slice(end);
    const atLineStart = before.length === 0 || before.endsWith('\n');
    before = before.replace(/[ \t]+$/g, '');
    after = after.replace(/^[ \t]+/g, '');
    const insertion = `${atLineStart ? '' : ' '}${signature} `;
    commitEditorValue(before + insertion + after, before.length + insertion.length);
  }

  function runUtility(kind, value='') {
    if (kind === 'tripleQuote') insertChordMarker("'''");
    if (kind === 'repeat') insertRepeatCount(value);
    if (kind === 'time') insertTimeSignature(value);
  }

  function wrapCurrentLineAsRepeat() {
    unlinkActiveChord();
    resetChordState();
    updateChordPreview();

    const value = els.editor.value;
    const cursor = els.editor.selectionStart;
    const lineStart = value.lastIndexOf('\n', Math.max(0, cursor - 1)) + 1;
    const nextBreak = value.indexOf('\n', cursor);
    const lineEnd = nextBreak === -1 ? value.length : nextBreak;
    const line = value.slice(lineStart, lineEnd).trim();

    if (!line) {
      showToast('The current row is empty', true);
      return;
    }

    const wrapped = line.startsWith('||:') && line.endsWith(':||')
      ? line
      : `||: ${line} :||`;
    const nextValue = value.slice(0,lineStart) + wrapped + value.slice(lineEnd);
    commitEditorValue(nextValue, lineStart + wrapped.length);
  }

  function isChordShortcutContext() {
    const active = document.activeElement;
    if (!active) return true;
    if (active === els.editor) return true;
    return !['INPUT','SELECT','TEXTAREA'].includes(active.tagName);
  }

  function handleRootKey(event, root) {
    // Slash bass takes priority while / is held or after / was tapped.
    if (state.slashHeld || state.awaitingSlashBass) {
      event.preventDefault();
      state.slashUsed = true;
      applySlashBass(root);
      return true;
    }

    event.preventDefault();
    const minor = state.mHeld || state.pendingMinor;
    if (state.mHeld) state.mUsedAsModifier = true;
    startAndInsertChord(root, minor ? 'm' : '');
    state.pendingMinor = false;
    return true;
  }

  function handleChordKeyDown(event) {
    if (state.mode !== 'chord' || event.ctrlKey || event.metaKey || event.altKey || !isChordShortcutContext()) return false;

    const code = event.code;
    const key = event.key;

    if (code === 'KeyM') {
      event.preventDefault();
      if (!event.repeat) {
        state.mHeld = true;
        state.mUsedAsModifier = false;
      }
      return true;
    }

    if (code === 'KeyX') {
      event.preventDefault();
      if (!event.repeat) {
        state.xHeld = true;
        state.xUsed = false;
      }
      return true;
    }

    if (code === 'Slash') {
      event.preventDefault();
      if (!event.repeat) {
        state.slashHeld = true;
        state.slashUsed = false;
        state.awaitingSlashBass = true;
        els.slashBassGrid.classList.remove('hidden');
        updateChordPreview();
      }
      return true;
    }

    if (state.xHeld && !event.shiftKey) {
      const repeatMatch = /^Digit([0-9])$/.exec(code);
      if (repeatMatch) {
        event.preventDefault();
        state.xUsed = true;
        insertRepeatCount(repeatMatch[1]);
        return true;
      }
    }

    if (event.shiftKey) {
      const degreeMatch = /^Digit([1-7])$/.exec(code);
      if (degreeMatch) {
        event.preventDefault();
        insertDiatonicChord(Number(degreeMatch[1]) - 1);
        return true;
      }
      if (code === 'Enter') {
        event.preventDefault();
        finishOrInsertChord();
        return true;
      }
      if (code === 'Quote') {
        event.preventDefault();
        insertChordMarker("'''");
        return true;
      }
      if (code === 'Semicolon') {
        event.preventDefault();
        wrapCurrentLineAsRepeat();
        return true;
      }
    }

    const root = rootFromCode(code);
    if (root) return handleRootKey(event, root);

    const simpleActions = {
      Digit2:() => applyExtensionControl('suspension', 'sus2'),
      Digit4:() => applyExtensionControl('suspension', 'sus4'),
      Digit5:() => applyExtensionControl('type', '5'),
      Digit6:() => applyExtensionControl('extension', '6'),
      Digit7:() => applyExtensionControl('extension', '7'),
      Digit9:() => applyExtensionControl('extension', '9'),
      KeyJ:() => applyExtensionControl('extension', 'maj7'),
      KeyH:() => applyExtensionControl('type', 'halfDim'),
      KeyT:() => clearToTriad(),
      KeyQ:() => clearChord(),
      Comma:() => alterCurrentNote('flat'),
      Period:() => alterCurrentNote('sharp'),
      Equal:() => {
        if (key === '+') applyExtensionControl('type', 'aug');
      },
      Enter:() => insertNewLine(),
      Backslash:() => insertSpacedSymbol('|'),
      BracketLeft:() => { if (!event.shiftKey) insertSpacedSymbol('||'); },
      BracketRight:() => { if (!event.shiftKey) insertSpacedSymbol(':||'); },
      Quote:() => { if (!event.shiftKey) insertChordMarker("'"); },
      NumpadMultiply:() => insertSyncopation(),
      Escape:() => clearChord()
    };

    if (key === '*') {
      event.preventDefault();
      insertSyncopation();
      return true;
    }

    const action = simpleActions[code];
    if (action) {
      event.preventDefault();
      action();
      return true;
    }
    return false;
  }

  function handleChordKeyUp(event) {
    if (event.code === 'KeyM' && state.mHeld) {
      event.preventDefault();
      if (state.mode === 'chord' && !state.mUsedAsModifier) toggleMinor();
      state.mHeld = false;
      state.mUsedAsModifier = false;
      return true;
    }
    if (event.code === 'KeyX' && state.xHeld) {
      event.preventDefault();
      state.xHeld = false;
      state.xUsed = false;
      return true;
    }
    if (event.code === 'Slash' && state.slashHeld) {
      event.preventDefault();
      state.slashHeld = false;
      if (state.slashUsed) state.awaitingSlashBass = false;
      updateChordPreview();
      return true;
    }
    return false;
  }

  function historySnapshot(){return {value:els.editor.value,lineTypes:[...normalizeLineTypes()],sourceKeyIndex:state.sourceKeyIndex,sourceScaleType:state.sourceScaleType};}
  function resetHistory(value){state.history=[{value,lineTypes:[...normalizeLineTypes(value,state.lineTypes)],sourceKeyIndex:state.sourceKeyIndex,sourceScaleType:state.sourceScaleType}];state.historyIndex=0;}
  function pushHistory(){const snap=historySnapshot(),cur=state.history[state.historyIndex];if(cur&&cur.value===snap.value&&JSON.stringify(cur.lineTypes)===JSON.stringify(snap.lineTypes))return;state.history=state.history.slice(0,state.historyIndex+1);state.history.push(snap);if(state.history.length>120)state.history.shift();state.historyIndex=state.history.length-1;}
  function restoreHistory(snap){els.editor.value=snap.value;state.lineTypes=normalizeLineTypes(snap.value,snap.lineTypes);state.sourceKeyIndex=snap.sourceKeyIndex??state.sourceKeyIndex;state.sourceScaleType=snap.sourceScaleType||state.sourceScaleType;state.previousEditorValue=snap.value;unlinkActiveChord();updateCounts();updateLineTypeButton();requestAnimationFrame(ensureEditorCaretVisible);markDirty();}
  function undo(){if(state.historyIndex>0){state.historyIndex--;restoreHistory(state.history[state.historyIndex]);}}
  function redo(){if(state.historyIndex<state.history.length-1){state.historyIndex++;restoreHistory(state.history[state.historyIndex]);}}

  function updateCounts() {
    els.charCount.textContent = `${els.editor.value.length.toLocaleString()} characters`;
  }

  let saveTimer;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveCurrentProject(), 650);
  }

  function syncVisibleViewport({force=false}={}) {
    const viewport = window.visualViewport;
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    const keyboardVisible = state.mode === 'text' && document.activeElement === els.editor && viewport &&
      viewport.height < (stableAppHeight || window.innerHeight) - 120;

    const layoutCandidate = Math.max(
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
      viewport ? viewport.height + viewport.offsetTop : 0
    );

    // Capture the largest non-keyboard viewport and never let keyboard opening
    // reduce the app's coordinate system. Recalculate only on orientation change
    // or when a genuinely larger viewport becomes available.
    if (force || orientation !== stableOrientation || layoutCandidate > stableAppHeight + 40 || stableAppHeight < 300) {
      stableOrientation = orientation;
      stableAppHeight = layoutCandidate;
    }

    const textHeight = Math.round(stableAppHeight * (orientation === 'landscape' ? 0.56 : 0.50));
    document.documentElement.style.setProperty('--stable-app-height', `${stableAppHeight}px`);
    document.documentElement.style.setProperty('--text-editor-height', `${textHeight}px`);
    document.body.classList.toggle('keyboard-visible', Boolean(keyboardVisible));
    requestAnimationFrame(ensureEditorCaretVisible);
  }


  async function loadHostedChartIndex(){
    try{const response=await fetch('./charts/index.json',{cache:'no-store'});if(!response.ok)return false;const data=await response.json();state.chartLibrary=Array.isArray(data)?data:(data.charts||[]);els.chartSearchStatus.textContent=`${state.chartLibrary.length} hosted chart(s) available`;renderChartSearchResults();return true;}catch{return false;}
  }
  async function connectChartsRoot(){
    if(!window.showDirectoryPicker){els.chartSearchStatus.textContent='On iPhone, add charts/index.json to the hosted charts folder.';showToast('Folder browsing is unavailable in iPhone Safari',true);return;}
    try{state.chartsRootHandle=await window.showDirectoryPicker({mode:'read'});const charts=await state.chartsRootHandle.getDirectoryHandle('charts');state.chartLibrary=[];for await(const [name,handle] of charts.entries()){if(handle.kind==='file'&&/\.txt$/i.test(name))state.chartLibrary.push({name,handle});}els.chartSearchStatus.textContent=`${state.chartLibrary.length} chart(s) found`;renderChartSearchResults();}catch(e){if(e?.name!=='AbortError')showToast('Could not open charts folder',true);}
  }
  function renderChartSearchResults(){
    if(!els.chartSearchResults)return;const q=(els.chartSearchInput?.value||'').trim().toLowerCase();const list=state.chartLibrary.filter(item=>(item.name||item.title||item.path||'').toLowerCase().includes(q)).slice(0,40);els.chartSearchResults.innerHTML=list.map((item,i)=>`<button class="chart-search-result" data-chart-index="${i}"><span>${escapeHtml(item.title||item.name||item.path)}</span><small>Open</small></button>`).join('');els.chartSearchResults.classList.toggle('hidden',!q&&!list.length);$$('[data-chart-index]').forEach((button,i)=>button.addEventListener('click',()=>openChartLibraryItem(list[i])));
  }
  async function openChartLibraryItem(item){
    try{let text,name=item.title||item.name||item.path||'chart.txt';if(item.handle){text=await (await item.handle.getFile()).text();}else{const path=item.path||item.file||item.name;const response=await fetch(path.startsWith('charts/')?`./${path}`:`./charts/${path}`);if(!response.ok)throw new Error('Not found');text=await response.text();}const parsed=parseChartDocument(text);saveCurrentProject();state.currentProjectId=crypto.randomUUID?crypto.randomUUID():String(Date.now());els.projectName.value=name.replace(/\.txt$/i,'');els.editor.value=parsed.content;state.lineTypes=normalizeLineTypes(parsed.content,parsed.lineTypes);applyChartMetadata(parsed.meta);state.previousEditorValue=els.editor.value;clearChord();resetHistory(els.editor.value);updateCounts();updateLineTypeButton();saveCurrentProject();els.chartSearchResults.classList.add('hidden');document.getElementById('projectDrawer')?.classList.add('hidden');showToast('Chart opened');}catch(e){console.error(e);showToast('Could not open chart',true);}
  }

  function bindEvents() {
    els.textModeBtn.addEventListener('click', () => setMode('text'));
    els.chordModeBtn.addEventListener('click', () => setMode('chord'));
    if (els.mobileMinorBtn) els.mobileMinorBtn.addEventListener('click', () => {
      state.pendingMinor = !state.pendingMinor;
      updateMobileMinorButton();
      updateChordPreview();
    });
    if (els.mobileNewLineBtn) els.mobileNewLineBtn.addEventListener('click', insertNewLine);
    if (els.mobileBarBtn) els.mobileBarBtn.addEventListener('click', () => insertChordMarker(' | '));
    if (els.mobileDoubleBtn) els.mobileDoubleBtn.addEventListener('click', () => insertChordMarker(' || '));
    if (els.mobileRepeatBtn) els.mobileRepeatBtn.addEventListener('click', () => insertChordMarker(' :|| '));
    if (els.mobileBeatBtn) els.mobileBeatBtn.addEventListener('click', () => insertChordMarker("'"));
    if (els.mobileSyncBtn) els.mobileSyncBtn.addEventListener('click', () => insertChordMarker(' *'));
    els.insertChordBtn.addEventListener('click', finishOrInsertChord);
    els.clearChordBtn.addEventListener('click', clearChord);
    els.newProjectBtn.addEventListener('click', newProject);
    els.lineTypeBtn?.addEventListener('click', toggleSelectedLinesType);
    els.viewModeBtn?.addEventListener('click', openViewMode);
    els.closeViewModeBtn?.addEventListener('click', closeViewMode);
    els.viewSourceKey?.addEventListener('change', renderViewMode);
    els.viewTargetKey?.addEventListener('change', renderViewMode);
    els.connectChartsRootBtn?.addEventListener('click', connectChartsRoot);
    els.chartSearchInput?.addEventListener('input', renderChartSearchResults);
    els.saveTxtBtn.addEventListener('click', saveTxt);
    els.downloadBackupBtn.addEventListener('click', downloadBackup);
    els.chooseBackupFolderBtn.addEventListener('click', chooseBackupFolder);
    els.clearBackupFolderBtn.addEventListener('click', clearBackupFolder);
    els.keyScaleBtn.addEventListener('click', event => {
      event.stopPropagation();
      toggleKeyScalePopover();
    });
    if (els.scaleCloseBtn) els.scaleCloseBtn.addEventListener('click', closeKeyScalePopover);
    els.keyScalePopover.addEventListener('click', event => {
      if (event.target === els.keyScalePopover) closeKeyScalePopover();
    });
    els.projectSelect.addEventListener('change', event => event.target.value && loadProject(event.target.value));
    els.projectName.addEventListener('input', () => {
      markDirty();
      scheduleSave();
      updateBackupFolderUI();
    });
    els.editor.addEventListener('input', () => {
      state.lineTypes = reconcileLineTypes(state.previousEditorValue, els.editor.value, state.lineTypes, state.mode === 'chord' ? LINE_TYPE_CHORD : LINE_TYPE_TEXT);
      if (state.mode === 'chord') markLineRange(LINE_TYPE_CHORD, els.editor.selectionStart, els.editor.selectionEnd);
      state.previousEditorValue = els.editor.value;
      updateLineTypeButton();
      if (state.activeChord) {
        const active = state.activeChord;
        const chordStillMatches = active.start >= 0 && active.end <= els.editor.value.length &&
          els.editor.value.slice(active.start, active.end) === active.rendered;
        if (chordStillMatches) {
          if (active.suffixEnd < active.end || active.suffixEnd > els.editor.value.length) active.suffixEnd = active.end;
          const trailing = els.editor.value.slice(active.suffixEnd).match(/^[ \t]*/)?.[0] || '';
          active.trailingLength = trailing.length;
        } else {
          unlinkActiveChord();
        }
      }
      updateCounts();
      markDirty();
      scheduleSave();
      clearTimeout(pushHistory.timer);
      pushHistory.timer = setTimeout(pushHistory, 250);
    });
    els.editor.addEventListener('pointerdown', event => {
      if (state.mode === 'chord') {
        event.preventDefault();
        const range = document.caretRangeFromPoint?.(event.clientX, event.clientY);
        syncVisibleViewport({force:true});
    setMode('text');
        els.editor.readOnly = false;
        els.editor.inputMode = 'text';
        els.editor.setAttribute('aria-readonly', 'false');
        if (range && range.startContainer === els.editor.firstChild) {
          els.editor.setSelectionRange(range.startOffset, range.startOffset);
        }
        els.editor.focus({preventScroll:true});
        return;
      }
      els.editor.readOnly = false;
      els.editor.inputMode = 'text';
      els.editor.setAttribute('aria-readonly', 'false');
    });
    els.editor.addEventListener('keyup', updateLineTypeButton);
    els.editor.addEventListener('select', updateLineTypeButton);
    els.editor.addEventListener('click', () => {
      if (!validActiveChord()) unlinkActiveChord();
      if (state.mode === 'text') els.editor.focus({preventScroll:true});
    });
    els.editor.addEventListener('focus', () => {
      setTimeout(syncVisibleViewport, 80);
      setTimeout(syncVisibleViewport, 320);
    });
    els.editor.addEventListener('blur', () => {
      setTimeout(syncVisibleViewport, 80);
      setTimeout(syncVisibleViewport, 320);
    });
    if (els.forceGSharpMinorToggle) {
      els.forceGSharpMinorToggle.checked = forceGSharpMinorEnabled();
      els.forceGSharpMinorToggle.addEventListener('change', () => {
        localStorage.setItem(FORCE_GSHARP_MINOR_KEY, String(els.forceGSharpMinorToggle.checked));
        showToast(els.forceGSharpMinorToggle.checked ? 'G#m exception enabled' : 'G#m exception disabled');
      });
    }
    els.scaleType.addEventListener('change', () => {
      renderRoots();
      renderDiatonic();
      saveGlobalSettings();
    });
    if (els.seventhToggle) els.seventhToggle.addEventListener('change', () => {
      renderDiatonic();
      saveGlobalSettings();
    });
    [els.symbolStyle, els.superscriptToggle, els.spaceAfterChordToggle].forEach(element => element.addEventListener('change', () => {
      renderRoots();
      renderAlterationButtons();
      renderDiatonic();
      updateChordAndActiveText();
      saveGlobalSettings();
    }));
    $$('[data-omit]').forEach(button => button.addEventListener('click', () => toggleArrayValue(state.omissions, button.dataset.omit)));
    if (els.slashBassBtn) els.slashBassBtn.addEventListener('click', () => {
      state.slashBass = '';
      state.awaitingSlashBass = false;
      updateChordAndActiveText();
    });
    els.customSuffixBtn.addEventListener('click', () => {
      els.customSuffixWrap.classList.toggle('hidden');
      if (!els.customSuffixWrap.classList.contains('hidden')) els.customSuffix.focus();
    });
    els.customSuffix.addEventListener('input', () => {
      state.customSuffix = els.customSuffix.value;
      updateChordAndActiveText();
    });
    $$('.utility-btn').forEach(button => button.addEventListener('click', () => {
      runUtility(button.dataset.utility, button.dataset.value || '');
    }));
    $$('.insert-token').forEach(button => button.addEventListener('click', () => insertAtCursor(button.dataset.token.replace('\\n','\n'))));
    $$('[data-editor-action]').forEach(button => button.addEventListener('click', async () => {
      const action = button.dataset.editorAction;
      if (action === 'undo') undo();
      if (action === 'redo') redo();
      if (action === 'copy') {
        await navigator.clipboard.writeText(els.editor.value);
        showToast('Chart copied');
      }
    }));
    els.shortcutsBtn.addEventListener('click', () => els.shortcutsDialog.showModal());
    els.importBtn.addEventListener('click', () => els.importInput.click());
    els.importInput.addEventListener('change', async () => {
      const file = els.importInput.files[0];
      if (!file) return;
      saveCurrentProject();
      state.currentProjectId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      els.projectName.value = file.name.replace(/\.txt$/i,'');
      const parsed = parseChartDocument(await file.text());
      els.editor.value = parsed.content; state.lineTypes = normalizeLineTypes(parsed.content, parsed.lineTypes); applyChartMetadata(parsed.meta); state.previousEditorValue=els.editor.value;
      clearChord();
      resetHistory(els.editor.value);
      updateCounts();
      saveCurrentProject();
      showToast('TXT imported');
      els.importInput.value = '';
    });

    document.addEventListener('click', event => {
      if (!els.keyScalePopover.classList.contains('hidden') && !event.target.closest('.scale-modal-card') && event.target !== els.keyScaleBtn) closeKeyScalePopover();
    });

    document.addEventListener('keydown', event => {
      const mod = event.ctrlKey || event.metaKey;
      if (event.code === 'Escape' && !els.keyScalePopover.classList.contains('hidden')) {
        event.preventDefault();
        closeKeyScalePopover();
        return;
      }
      if (!mod && !event.altKey && (event.key === '`' || event.code === 'Backquote')) {
        event.preventDefault();
        setMode(state.mode === 'text' ? 'chord' : 'text');
        return;
      }
      if (mod && event.key.toLowerCase() === 's') {
        event.preventDefault();
        event.shiftKey ? downloadBackup() : saveTxt();
        return;
      }
      if (mod && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        newProject();
        return;
      }
      handleChordKeyDown(event);
    });

    document.addEventListener('keyup', handleChordKeyUp);
    window.addEventListener('blur', () => {
      state.mHeld = false;
      state.mUsedAsModifier = false;
      state.slashHeld = false;
      state.xHeld = false;
      state.xUsed = false;
    });
    window.addEventListener('beforeunload', () => saveCurrentProject());
    window.addEventListener('resize', syncVisibleViewport);
    window.addEventListener('orientationchange', () => setTimeout(syncVisibleViewport, 120));
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncVisibleViewport);
      window.visualViewport.addEventListener('scroll', syncVisibleViewport);
    }
  }

  async function initialize() {
    syncVisibleViewport();
    renderKeys();
    renderRoots();
    updateMobileMinorButton();
    renderQualityButtons();
    renderExtensionButtons();
    renderAlterationButtons();
    const globalSettings = safeJsonParse(localStorage.getItem(SETTINGS_KEY), {});
    applySettings(globalSettings);
    bindEvents();

    const projects = getProjects();
    const currentId = localStorage.getItem(CURRENT_KEY);
    if (currentId && projects[currentId]) {
      state.currentProjectId = currentId;
      const project = projects[currentId];
      els.projectName.value = project.name === 'untitled' ? '' : project.name;
      els.editor.value = project.content || ''; state.lineTypes=normalizeLineTypes(els.editor.value,project.lineTypes||[]); state.sourceKeyIndex=Number.isInteger(project.sourceKeyIndex)?project.sourceKeyIndex:state.selectedKey; state.sourceScaleType=project.sourceScaleType||els.scaleType.value; state.previousEditorValue=els.editor.value;
      applySettings(project.settings || globalSettings);
    }

    updateCounts();
    state.lineTypes=normalizeLineTypes(els.editor.value,state.lineTypes); state.previousEditorValue=els.editor.value; resetHistory(els.editor.value); updateLineTypeButton();
    refreshProjectSelect();
    setMode('text');
    saveCurrentProject();
    await ensureDefaultBackupFolder();
    state.directoryHandle = null;
    state.backupDirectoryHandle = null;
    state.backupPermission = 'none';
    updateBackupFolderUI();
    loadHostedChartIndex();

    setInterval(async () => {
      saveCurrentProject({backup:true});
      const destinations = await writeFileBackup();
      const stamp = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      els.backupStatus.textContent = destinations.length
        ? `Backed up at ${stamp}: ${destinations.join(' + ')}`
        : `Browser project backup saved at ${stamp}`;
    }, 60_000);
  }

  initialize().catch(error => {
    console.error(error);
    showToast('The app started, but one saved preference could not be restored.', true);
  });
})();
