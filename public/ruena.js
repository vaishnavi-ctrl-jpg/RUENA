const firebaseConfig = {
    apiKey: "AIzaSyAFPCOO73P8e8G-rlWCcPb23G7CGci1ScI",
    authDomain: "ruena-6c23f.firebaseapp.com",
    databaseURL: "https://ruena-6c23f-default-rtdb.firebaseio.com",
    projectId: "ruena-6c23f",
    storageBucket: "ruena-6c23f.firebasestorage.app",
    messagingSenderId: "689374241877",
    appId: "1:689374241877:web:ad9ca0beb6f9d56ddea0dc"
  };
// ROUTE PROTECTION — redirect if not logged in
if(!localStorage.getItem('ruena_user_id')){
  window.location.href = '/auth';
}

// Show username in sidebar
const _userName = localStorage.getItem('ruena_user_name') || 'Student';
const _userEmail = localStorage.getItem('ruena_user_id') || '';
const _userInitial = _userName[0].toUpperCase();
const _pname = document.getElementById('profile-name');
const _pemail = document.getElementById('profile-email');
const _pavatar = document.getElementById('profile-avatar');
if(_pname) _pname.textContent = _userName;
if(_pemail) _pemail.textContent = _userEmail;
if(_pavatar) _pavatar.textContent = _userInitial;
// Settings page profile
const _sname = document.getElementById('settings-name');
const _semail = document.getElementById('settings-email');
const _savatar = document.getElementById('settings-avatar');
if(_sname) _sname.textContent = _userName;
if(_semail) _semail.textContent = _userEmail;
if(_savatar) _savatar.textContent = _userInitial;

// ── Toast notification ──
function showToast(msg, type='info'){
  const colors = {
    info:   { bg:'#3b2a6e', color:'white' },
    error:  { bg:'#ffebee', color:'#c62828' },
    success:{ bg:'#e8f5e9', color:'#1b5e20' },
    warning:{ bg:'#fff8ee', color:'#a05000' }
  };
  const c = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
    background:${c.bg};color:${c.color};padding:13px 22px;border-radius:12px;
    font-size:13px;font-weight:700;font-family:var(--font);z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.12);animation:fadeUp .3s ease;
    max-width:320px;text-align:center;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Custom confirm modal ──
function showConfirm(msg, subMsg='', onConfirm){
  // Remove existing
  document.getElementById('custom-confirm')?.remove();
  const modal = document.createElement('div');
  modal.id = 'custom-confirm';
  modal.style.cssText = `position:fixed;inset:0;z-index:3000;display:flex;align-items:center;
    justify-content:center;background:rgba(0,0,0,.35);backdrop-filter:blur(4px)`;
  modal.innerHTML = `
    <div style="background:var(--card);border-radius:24px;padding:32px;max-width:360px;
      width:90%;text-align:center;box-shadow:0 8px 48px rgba(0,0,0,.15);animation:slideUp .3s ease;font-family:var(--font)">
      <div style="font-size:36px;margin-bottom:12px">⚠️</div>
      <div style="font-size:16px;font-weight:800;color:var(--active-text);margin-bottom:8px">${msg}</div>
      ${subMsg ? `<div style="font-size:13px;color:var(--muted);font-weight:500;line-height:1.6;margin-bottom:20px">${subMsg}</div>` : '<div style="margin-bottom:20px"></div>'}
      <div style="display:flex;gap:10px">
        <button onclick="document.getElementById('custom-confirm').remove()"
          style="flex:1;padding:12px;border-radius:10px;border:1.5px solid var(--border);
          background:white;font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer">
          Cancel
        </button>
        <button id="confirm-yes-btn"
          style="flex:1;padding:12px;border-radius:10px;border:none;background:#e53935;
          color:white;font-size:14px;font-weight:800;font-family:var(--font);cursor:pointer">
          Yes, Exit
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('confirm-yes-btn').onclick = () => {
    modal.remove();
    onConfirm();
  };
  // Close on backdrop click
  modal.addEventListener('click', e => { if(e.target === modal) modal.remove(); });
}


function openModal(id){
  const m = document.getElementById(id);
  if(m){ m.style.display='flex'; }
}
function closeModal(id){
  const m = document.getElementById(id);
  if(m){ m.style.display='none'; }
}
// Close modal on background click
document.addEventListener('click', e => {
  ['signout-modal','delete-modal'].forEach(id => {
    const m = document.getElementById(id);
    if(m && e.target === m) m.style.display='none';
  });
});

// Logout function
function doLogout(){ openModal('signout-modal'); }
function confirmSignOut(){
  localStorage.removeItem('ruena_user_id');
  localStorage.removeItem('ruena_user_name');
  localStorage.removeItem(STREAK_KEY);
  localStorage.removeItem(TODAY_KEY);
  window.location.href = '/auth';
}

// Delete account function
async function doDeleteAccount(){ openModal('delete-modal'); }
async function confirmDeleteAccount(){
  closeModal('delete-modal');
  try {
    await fetch('http://localhost:5000/api/delete-account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getUserId() })
    });
  } catch(e){ console.warn('Delete account error:', e.message); }
  localStorage.clear();
  window.location.href = '/auth';
}

// USER ID — from localStorage after login
function getUserId(){
  return localStorage.getItem('ruena_user_id') || 'guest';
}

// BACKEND API CALLS

// 1. Save notes to backend
async function saveNoteToBackend(content){
  try{
    await fetch('http://localhost:5000/api/notes', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId: getUserId(), content })
    });
  } catch(e){ console.warn('Could not save note:', e.message); }
}

// 2. Save quiz score to backend
async function saveQuizScoreToBackend(score, total){
  try{
    await fetch('http://localhost:5000/api/quiz-scores', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId: getUserId(), score, total })
    });
  } catch(e){ console.warn('Could not save score:', e.message); }
}

// 3. Load user stats from backend
async function loadStatsFromBackend(){
  try{
    const res = await fetch(`http://localhost:5000/api/stats/${getUserId()}`);
    const data = await res.json();
    return data;
  } catch(e){ console.warn('Could not load stats:', e.message); return null; }
}

// GROQ AI — calls backend proxy
async function groq(messages, temperature=0.7){
  const res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUserId(), message: messages[messages.length-1]?.content, messages, temperature })
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error || 'API error');
  return data.reply || data.response;
}

function setLoading(el, msg='Ruena is thinking...'){
  if(!el) return;
  el.innerHTML=`<div style="display:flex;align-items:center;gap:10px;color:var(--muted);font-style:italic;padding:10px 0">
    <div style="width:18px;height:18px;border:2px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0"></div>${msg}</div>`;
}

// NAVIGATION
function navigate(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const t=document.getElementById('page-'+page);
  if(t) t.classList.add('active');
  document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
  updateMobileNav(page);
  if(window.innerWidth<=768) window.scrollTo({top:0,behavior:'smooth'});
  // Auto-trigger Weekly Wrap AI on first open
  if(page==='weeklywrap'){
    const out=document.getElementById('weekly-wrap-output');
    if(out && !out.dataset.generated){ out.dataset.generated='1'; generateWeeklyWrap(); }
  }
}

function updateMobileNav(page){
  document.querySelectorAll('.mobile-nav-item').forEach(b=>{
    b.classList.toggle('active', b.dataset.page===page);
  });
}

document.querySelectorAll('[data-page]').forEach(el=>{
  el.addEventListener('click',e=>{ e.preventDefault(); navigate(el.dataset.page); });
});

function toggleSidebar(){
  const sidebar=document.querySelector('.sidebar');
  const toggle=document.getElementById('sidebar-toggle');
  sidebar.classList.toggle('collapsed');
  toggle.classList.toggle('collapsed');
}

// UPLOADED NOTES STORE

// UPLOAD NOTES
let uploadedNotes = {};  
let pastedNotes = '';

function getNotesContext(){
  const parts = [...Object.entries(uploadedNotes).map(([k,v])=>`[${k}]\n${v}`), pastedNotes].filter(Boolean);
  return parts.length ? parts.join('\n\n').substring(0,6000) : null;
}

async function readFileText(file){
  return new Promise(resolve => {
    if(file.type === 'text/plain'){
      const r = new FileReader();
      r.onload = e => resolve(e.target.result);
      r.readAsText(file);
    } else {
      resolve(`[File: ${file.name} — text content not extractable in browser. Treat as study material on this topic.]`);
    }
  });
}

async function addFiles(files){
  for(const f of files){
    // Skip duplicates
    if(uploadedNotes[f.name]) continue;
    // Show pill in drop zone
    const pill = document.createElement('div');
    pill.className = 'file-pill';
    pill.dataset.fname = f.name;
    pill.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>${f.name}
      <span class="remove" onclick="removeFile('${f.name}',this)">×</span>`;
    document.getElementById('file-list').appendChild(pill);
    // Read content
    const text = await readFileText(f);
    uploadedNotes[f.name] = text;
    refreshNotesList();
  }
  // Reset input so same file can be re-added
  document.getElementById('file-input').value = '';
}

function removeFile(fname, el){
  el.closest('.file-pill').remove();
  delete uploadedNotes[fname];
  refreshNotesList();
}

function savePastedNotes(){
  const area = document.getElementById('paste-notes-area');
  const text = area?.value?.trim();
  if(!text){ showToast('Please paste some notes first!','error'); return; }
  pastedNotes = text;
  // Save as virtual "Pasted Notes" entry
  uploadedNotes['Pasted Notes'] = text;
  saveNoteToBackend(text);
  refreshNotesList();
  const btn = document.getElementById('save-notes-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Saved!`;
  btn.style.background = '#4caf50';
  setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
}

function refreshNotesList(){
  const keys = Object.keys(uploadedNotes);
  //  Upload page: Recent Uploads
  const recentEl = document.getElementById('recent-uploads-list');
  if(recentEl){
    if(keys.length === 0){
      recentEl.innerHTML = `<div class="empty-state" style="padding:20px 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px;height:36px;color:#d4ccc0;display:block;margin:0 auto 8px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p style="font-size:13px">No files uploaded yet</p></div>`;
    } else {
      recentEl.innerHTML = keys.map(k => `
        <div class="recent-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--purple)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div><div class="recent-item-name">${k}</div><div class="recent-item-meta">${k==='Pasted Notes'?'Pasted text':'Uploaded'}</div></div>
          <span class="recent-item-badge" style="cursor:pointer" onclick="removeFile('${k}',this.closest('.recent-item'))">✕ Remove</span>
        </div>`).join('');
    }
  }
  //  Summary page: notes selector
  const summaryEl = document.getElementById('summary-notes-list');
  if(summaryEl){
    if(keys.length === 0){
      summaryEl.innerHTML = `<div class="empty-state" style="padding:16px 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:32px;height:32px;color:#d4ccc0;display:block;margin:0 auto 8px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p style="font-size:12px;color:var(--muted)">Upload notes to select them here</p></div>`;
      selectedNote = null;
    } else {
      summaryEl.innerHTML = keys.map((k,i) => `
        <div class="recent-item note-select-item" style="cursor:pointer;${i===0?'border:1.5px solid var(--purple);background:var(--purple-light)':''}" onclick="selectNote(this,'${k}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:var(--purple)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div><div class="recent-item-name">${k}</div><div class="recent-item-meta">${k==='Pasted Notes'?'Pasted text':'Uploaded'}</div></div>
          ${i===0?'<span class="recent-item-badge">Selected</span>':''}
        </div>`).join('');
      if(!selectedNote || !uploadedNotes[selectedNote]) selectedNote = keys[0];
    }
  }
}

let selectedNote = null;
function selectNote(el, fname){
  document.querySelectorAll('.note-select-item').forEach(i => {
    i.style.border = ''; i.style.background = '';
    i.querySelector('.recent-item-badge')?.remove();
  });
  el.style.border = '1.5px solid var(--purple)';
  el.style.background = 'var(--purple-light)';
  el.insertAdjacentHTML('beforeend','<span class="recent-item-badge">Selected</span>');
  selectedNote = fname;
}

// Wire drop zone
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
if(dropZone){
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); addFiles([...e.dataTransfer.files]); });
  fileInput.addEventListener('change', () => addFiles([...fileInput.files]));
}

// QUICK ASK
function quickAsk(){
  const val=document.getElementById('quick-ask-input')?.value?.trim();
  if(val) document.getElementById('chat-input').value=val;
  navigate('chat');
  if(val) setTimeout(sendChat,100);
}


// CHAT
const chatHistory=[
  {role:'system',content:`You are Ruena, a friendly and smart AI study companion for students. Keep responses concise, clear and student-friendly. Use simple language. Format with bullet points or short paragraphs. Add relevant emojis occasionally.`}
];

function appendMessage(text,isUser){
  const container=document.getElementById('chat-messages');
  const div=document.createElement('div');
  div.style.cssText=`display:flex;align-items:flex-start;gap:10px;${isUser?'flex-direction:row-reverse':''}`;
  const avatar=isUser
    ?`<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#c4a8f0,#a78de0);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:16px;height:16px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`
    :`<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#c4a8f0,#a78de0);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" style="width:17px;height:17px"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>`;
  const bubble=`<div style="background:${isUser?'var(--active-bg)':'var(--purple-light)'};border-radius:${isUser?'12px 0 12px 12px':'0 12px 12px 12px'};padding:12px 16px;max-width:75%">${!isUser?'<div style="font-size:12px;font-weight:700;color:var(--purple);margin-bottom:4px">Ruena</div>':''}<div style="font-size:14px;color:var(--text);line-height:1.6;white-space:pre-wrap">${text}</div></div>`;
  div.innerHTML=avatar+bubble;
  container.appendChild(div);
  container.scrollTop=container.scrollHeight;
  return div;
}

function appendTyping(){
  const container=document.getElementById('chat-messages');
  const div=document.createElement('div');
  div.id='typing-indicator';
  div.style.cssText='display:flex;align-items:flex-start;gap:10px';
  div.innerHTML=`<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#c4a8f0,#a78de0);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" style="width:17px;height:17px"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
  <div style="background:var(--purple-light);border-radius:0 12px 12px 12px;padding:12px 16px">
    <div style="font-size:12px;font-weight:700;color:var(--purple);margin-bottom:6px">Ruena</div>
    <div style="display:flex;gap:4px;align-items:center">
      <div style="width:7px;height:7px;border-radius:50%;background:var(--purple);animation:bounce .8s infinite"></div>
      <div style="width:7px;height:7px;border-radius:50%;background:var(--purple);animation:bounce .8s .15s infinite"></div>
      <div style="width:7px;height:7px;border-radius:50%;background:var(--purple);animation:bounce .8s .3s infinite"></div>
    </div>
  </div>`;
  container.appendChild(div);
  container.scrollTop=container.scrollHeight;
}

async function sendChat(){
  const input=document.getElementById('chat-input');
  const text=input.value.trim();
  if(!text) return;
  input.value='';
  appendMessage(text,true);
  chatHistory.push({role:'user',content:text});
  appendTyping();
  try{
    const reply=await groq(chatHistory);
    document.getElementById('typing-indicator')?.remove();
    appendMessage(reply,false);
    chatHistory.push({role:'assistant',content:reply});
    trackActivity();
  }catch(e){
    document.getElementById('typing-indicator')?.remove();
    appendMessage('Sorry, I had trouble responding. Please try again!',false);
  }
}

function sendQuickMsg(text){
  document.getElementById('chat-input').value=text;
  sendChat();
}

document.getElementById('chat-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}});


// EXPLAIN TOPIC
let explainLevel='Simple';
function setLevel(btn){
  document.querySelectorAll('.level-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  explainLevel=btn.textContent;
}
function setTopic(t){ document.getElementById('explain-input').value=t; showExplain(); }

async function showExplain(){
  const t=document.getElementById('explain-input').value.trim();
  if(!t){ showToast('Please enter a topic first!','error'); return; }
  const out=document.getElementById('explain-output');
  out.classList.remove('empty');
  setLoading(out,`Explaining "${t}"...`);
  try{
    const reply=await groq([
      {role:'system',content:`You are Ruena, a student-friendly AI tutor. Explain topics clearly at a ${explainLevel} level. Use examples, analogies, bullet points or numbered steps. Keep it concise but thorough. Use HTML tags like <h3>, <p>, <ul>, <li>, <strong> for formatting.`},
      {role:'user',content:`Explain this topic: ${t}`}
    ]);
    out.innerHTML=`<div class="output-title">${t} <span style="font-size:12px;font-weight:600;color:var(--muted);margin-left:8px">${explainLevel} level</span></div>${reply}`;
    trackTopic(t); trackActivity();
  }catch(e){
    out.innerHTML=`<div style="color:#e05050">Error: ${e.message}</div>`;
  }
}

function copyExplain(){
  navigator.clipboard.writeText(document.getElementById('explain-output').innerText).then(()=>{
    const b=document.getElementById('copy-btn');
    const orig=b.innerHTML;
    b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Copied!`;
    setTimeout(()=>b.innerHTML=orig,2000);
  });
}

// SUMMARY
async function generateSummary(){
  const topicInput=document.getElementById('summary-topic-input')?.value?.trim();
  const notesCtx=getNotesContext();
  const out=document.getElementById('summary-output');
  const topic=topicInput||(selectedNote?selectedNote:null);

  if(!notesCtx && !topic){
    out.innerHTML=`<div style="color:#a05000;background:#fff8ee;border:1.5px solid #fcd9a0;border-radius:10px;padding:14px">
      📌 Type a topic in the box below, or upload your notes first!</div>`;
    return;
  }

  setLoading(out,`Summarizing ${topic||'your notes'}...`);
  const userMsg=notesCtx
    ?`Summarize these study notes${topic?` focusing on "${topic}"`:''}:\n\n${notesCtx}`
    :`Generate a comprehensive study summary for: "${topic}". Include overview, key concepts, definitions, examples, and a quick revision checklist.`;
  try{
    const reply=await groq([
      {role:'system',content:'You are Ruena. Generate well-structured summaries using HTML: <h3>, <p>, <ul>, <li>, <strong>. Be clear, thorough and student-friendly.'},
      {role:'user',content:userMsg}
    ]);
    out.innerHTML=reply;
    trackTopic(topic||'Summary'); trackActivity();
  }catch(e){ out.innerHTML=`<div style="color:#e05050">Error: ${e.message}</div>`; }
}

function copySummary(){
  navigator.clipboard.writeText(document.getElementById('summary-output').innerText)
    .then(()=>{ const b=document.querySelector('#page-summary .summary-tool-btn'); const o=b.innerHTML; b.textContent='✓ Copied!'; setTimeout(()=>b.innerHTML=o,2000); });
}

async function summaryToFlashcards(){
  const content=document.getElementById('summary-output')?.innerText?.trim();
  if(!content||content.length<20){ showToast('Generate a summary first!','error'); return; }
  navigate('flashcards');
  document.getElementById('fc-topic').value='From Summary';
  try{
    const reply=await groq([
      {role:'system',content:'Generate flashcards from the given content. Return ONLY a JSON array. No markdown, no extra text.'},
      {role:'user',content:`Create 8 flashcards from:\n${content.substring(0,3000)}\nReturn ONLY: [{"q":"...","a":"..."}]`}
    ],0.5);
    cards=JSON.parse(reply.replace(/\`\`\`json|\`\`\`/g,'').trim());
    fcIdx=0; updateCard();
  }catch(e){ showToast('Could not generate flashcards from summary.','error'); }
}

// QUIZ

let currentQuiz=[];
let userAns={};

async function generateQuiz(){
  const topic=document.getElementById('quiz-topic')?.value?.trim();
  const numQ=parseInt(document.getElementById('quiz-num')?.value||10);
  const qtype=document.getElementById('quiz-type')?.value||'mcq';
  const notesCtx=getNotesContext();
  const area=document.getElementById('quiz-area');
  userAns={};
  document.getElementById('quiz-score-label').textContent='';
  if(!topic&&!notesCtx){ showToast('Enter a topic or upload notes first!','error'); return; }

  const typeLabel={'mcq':'Multiple Choice','tf':'True/False','short':'Short Answer','mixed':'Mixed'}[qtype];
  setLoading(area,`Generating ${numQ} ${typeLabel} questions${topic?` on "${topic}"`:''}...`);

  const src = notesCtx
    ? `from these notes${topic?` focusing on "${topic}"`:''}:\n\n${notesCtx}`
    : `about "${topic}"`;

  let systemPrompt, userPrompt;

  if(qtype==='mcq'){
    systemPrompt='You are a quiz generator. Return ONLY valid JSON. No markdown, no extra text.';
    userPrompt=`Generate ${numQ} multiple choice questions ${src}.\nReturn ONLY JSON: [{"type":"mcq","q":"Question?","opts":["A","B","C","D"],"ans":0}] where ans is 0-based index of correct answer.`;
  } else if(qtype==='tf'){
    systemPrompt='You are a quiz generator. Return ONLY valid JSON. No markdown, no extra text.';
    userPrompt=`Generate ${numQ} True/False questions ${src}.\nReturn ONLY JSON: [{"type":"tf","q":"Statement to judge as true or false.","opts":["True","False"],"ans":0}] where ans is 0 for True, 1 for False.`;
  } else if(qtype==='short'){
    systemPrompt='You are a quiz generator. Return ONLY valid JSON. No markdown, no extra text.';
    userPrompt=`Generate ${numQ} short answer questions ${src}.\nReturn ONLY JSON: [{"type":"short","q":"Question?","ans":"Expected answer in 1-2 sentences."}]`;
  } else {
    // mixed: roughly equal split
    systemPrompt='You are a quiz generator. Return ONLY valid JSON. No markdown, no extra text.';
    userPrompt=`Generate ${numQ} mixed questions ${src}. Include a mix of MCQ, True/False, and Short Answer.\nReturn ONLY JSON array where each item has a "type" field:\n- MCQ: {"type":"mcq","q":"?","opts":["A","B","C","D"],"ans":0}\n- True/False: {"type":"tf","q":"Statement.","opts":["True","False"],"ans":0}\n- Short Answer: {"type":"short","q":"?","ans":"Expected answer."}`;
  }

  try{
    const reply=await groq([
      {role:'system',content:systemPrompt},
      {role:'user',content:userPrompt}
    ],0.4);
    currentQuiz=JSON.parse(reply.replace(/```json|```/g,'').trim());
    renderQuiz(currentQuiz);
  }catch(e){
    area.innerHTML=`<div style="color:#e05050;padding:20px">Failed to generate quiz. Try again! (${e.message})</div>`;
  }
}

function renderQuiz(quiz){
  const area=document.getElementById('quiz-area');
  area.innerHTML=quiz.map((q,i)=>{
    const type=q.type||'mcq';

    if(type==='short'){
      // Short answer — text input
      return `<div class="quiz-q" id="qq-${i}">
        <div class="quiz-q-num">Question ${i+1} · Short Answer</div>
        <div class="quiz-q-text">${q.q}</div>
        <textarea id="qo-short-${i}" class="paste-area" style="min-height:70px;margin-top:8px" placeholder="Type your answer here..."></textarea>
        <div id="short-ans-reveal-${i}" style="display:none;margin-top:10px;background:#e8f5e9;border:1.5px solid #4caf50;border-radius:8px;padding:10px;font-size:13px;font-weight:600;color:#1b5e20">
          <strong>Model Answer:</strong> ${q.ans}
        </div>
      </div>`;
    }

    // MCQ or T/F — same option layout
    const opts=q.opts||['True','False'];
    return `<div class="quiz-q" id="qq-${i}">
      <div class="quiz-q-num">Question ${i+1}${type==='tf'?' · True / False':''}</div>
      <div class="quiz-q-text">${q.q}</div>
      <div class="quiz-options">
        ${opts.map((o,j)=>`
          <div class="quiz-option" id="qo-${i}-${j}" onclick="pickOpt(${i},${j})">
            <span style="width:26px;height:26px;border-radius:50%;background:#f0ece3;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;color:var(--muted)">${type==='tf'?(j===0?'T':'F'):String.fromCharCode(65+j)}</span>
            ${o}
          </div>`).join('')}
      </div>
    </div>`;
  }).join('')+
  `<button class="btn-primary" onclick="submitQuiz()" style="margin-top:18px;width:100%;justify-content:center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Submit Quiz
  </button>`;
}

function pickOpt(qi,oi){
  // Clear all options for this question up to 4
  for(let j=0;j<4;j++){
    document.getElementById(`qo-${qi}-${j}`)?.classList.remove('selected');
  }
  document.getElementById(`qo-${qi}-${oi}`)?.classList.add('selected');
  userAns[qi]=oi;
}

function submitQuiz(){
  let score=0; let scorable=0;
  currentQuiz.forEach((q,i)=>{
    const type=q.type||'mcq';
    if(type==='short'){
      document.getElementById(`qo-short-${i}`)?.setAttribute('disabled','true');
      document.getElementById(`short-ans-reveal-${i}`).style.display='block';
      return;
    }
    scorable++;
    const chosen=userAns[i];                 
    const correct=parseInt(q.ans);           
    const opts=q.opts||['True','False'];
    for(let j=0;j<opts.length;j++){
      const b=document.getElementById(`qo-${i}-${j}`);
      if(!b) continue;
      b.style.pointerEvents='none';
      b.classList.remove('selected');
      if(j===correct) b.classList.add('correct');
      else if(j===chosen && chosen!==correct) b.classList.add('wrong');
    }
    if(chosen===correct) score++;
  });
  const label=document.getElementById('quiz-score-label');
  if(scorable>0){
    const pct=Math.round(score/scorable*100);
    const color=pct>=80?'#2e7d32':pct>=60?'#e07000':'#c62828';
    label.innerHTML=`Score: <strong style="color:${color}">${score}/${scorable} (${pct}%)</strong>${currentQuiz.length>scorable?' · Short answers revealed below':''}`;
    trackQuiz(document.getElementById('quiz-topic')?.value?.trim()||'Quiz', score, scorable);
  } else {
    label.innerHTML=`<span style="color:var(--purple);font-weight:700">Short answers revealed! Review the model answers below.</span>`;
  }
  document.querySelector('#quiz-area .btn-primary')?.remove();
}


// FLASHCARDS
let cards=[
  {q:'What is recursion?',a:'A function that calls itself with a smaller version of the same problem until a base case is reached.'},
  {q:'What is database normalization?',a:'Process of organizing database tables to reduce redundancy and improve data integrity.'},
  {q:'What is a primary key?',a:'A column that uniquely identifies each row in a table. Must be unique and NOT NULL.'},
  {q:'What does ACID stand for?',a:'Atomicity, Consistency, Isolation, Durability — properties ensuring reliable database transactions.'},
  {q:'What is a Binary Search Tree?',a:'A tree where left child < parent < right child, enabling O(log n) search operations.'},
];
let fcIdx=0;

async function generateFlashcards(){
  const topic=document.getElementById('fc-topic')?.value?.trim();
  const notesCtx=getNotesContext();
  const btn=document.getElementById('fc-gen-btn');
  if(!topic&&!notesCtx){ showToast('Enter a topic or upload notes first!','error'); return; }
  if(btn){ btn.disabled=true; btn.textContent='Generating...'; }
  const prompt=notesCtx
    ?`Generate 8 flashcards from these notes${topic?` focusing on "${topic}"`:''}:\n\n${notesCtx}`
    :`Generate 8 flashcards for: "${topic}"`;
  try{
    const reply=await groq([
      {role:'system',content:'You are a flashcard generator. Return ONLY a valid JSON array. No markdown, no explanation, no extra text.'},
      {role:'user',content:`${prompt}\n\nReturn ONLY JSON: [{"q":"Question?","a":"Answer."}]`}
    ],0.5);
    cards=JSON.parse(reply.replace(/\`\`\`json|\`\`\`/g,'').trim());
    fcIdx=0; updateCard();
    trackFlashcards(cards.length); trackTopic(topic||'Flashcards');
  }catch(e){
    if(btn){ btn.disabled=false; btn.textContent='Generate'; }
    showToast('Failed to generate flashcards. Please try again!','error');
  }
}

function initCards(){ updateCard(); }
function updateCard(){
  document.getElementById('main-fc')?.classList.remove('flipped');
  document.getElementById('fc-q').textContent=cards[fcIdx].q;
  document.getElementById('fc-a').textContent=cards[fcIdx].a;
  document.getElementById('fc-counter').textContent=`${fcIdx+1} / ${cards.length}`;
  document.getElementById('fc-prog').style.width=`${((fcIdx+1)/cards.length)*100}%`;
}
function flipCard(){ document.getElementById('main-fc').classList.toggle('flipped'); }
function nextCard(){ fcIdx=(fcIdx+1)%cards.length; updateCard(); }
function prevCard(){ fcIdx=(fcIdx-1+cards.length)%cards.length; updateCard(); }
function setFcView(v,btn){
  document.querySelectorAll('.fc-view-btn').forEach(b=>b.classList.toggle('active',b===btn));
  document.getElementById('fc-study-view').style.display=v==='study'?'flex':'none';
  document.getElementById('fc-grid-view').style.display=v==='grid'?'block':'none';
  if(v==='grid'){
    document.getElementById('fc-grid').innerHTML=cards.map(c=>`<div class="fc-mini"><div class="fc-mini-q">${c.q}</div><div class="fc-mini-a">${c.a.substring(0,80)}…</div></div>`).join('');
  }
}


// PYQ TRAINER
let pyqText='';

function setupPYQUpload(){
  const zone=document.getElementById('pyq-drop-zone');
  if(!zone) return;
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='.pdf,.txt'; inp.style='display:none';
  document.body.appendChild(inp);
  zone.onclick=()=>inp.click();
  inp.onchange=async()=>{
    if(!inp.files[0]) return;
    const f=inp.files[0];
    zone.innerHTML=`<div style="display:flex;align-items:center;gap:10px;color:var(--muted)"><div style="width:18px;height:18px;border:2px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>Reading ${f.name}...</div>`;
    pyqText=await readFileText(f);
    zone.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:36px;height:36px;color:var(--purple)"><polyline points="20 6 9 17 4 12"/></svg><span style="font-weight:700;color:var(--active-text)">${f.name} uploaded!</span><span style="font-size:12px;color:var(--muted)">Analyzing exam patterns...</span>`;
    analyzePYQ();
    inp.value='';
  };
}

async function analyzePYQ(){
  const topicContainer=document.getElementById('pyq-topic-bars');
  if(!pyqText) return;
  if(topicContainer) topicContainer.innerHTML=`<div style="display:flex;align-items:center;gap:8px;color:var(--muted);font-style:italic;font-size:13px"><div style="width:14px;height:14px;border:2px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>Analyzing paper...</div>`;
  try{
    const reply=await groq([
      {role:'system',content:'You are an exam paper analyzer. Return ONLY valid JSON, no markdown, no explanation.'},
      {role:'user',content:`Analyze this exam paper and return JSON:\n\n${pyqText.substring(0,4000)}\n\nReturn exactly: {"topics":[{"name":"Topic Name","count":5}],"totalQ":30,"keyTopics":8,"difficulty":"Medium"}`}
    ],0.3);
    const data=JSON.parse(reply.replace(/```json|```/g,'').trim());
    if(topicContainer&&data.topics){
      const max=Math.max(...data.topics.map(t=>t.count),1);
      topicContainer.innerHTML=data.topics.slice(0,6).map(t=>{
        const pct=Math.round(t.count/max*100);
        return `<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:13px;font-weight:700;color:var(--text)">${t.name}</span>
            <span style="font-size:12px;font-weight:700;color:var(--purple)">${t.count} Qs · ${pct}%</span>
          </div>
          <div style="background:#ede8f5;border-radius:20px;height:10px;width:100%">
            <div style="background:linear-gradient(90deg,var(--purple),#a87de8);height:10px;border-radius:20px;width:${pct}%;transition:width .6s ease"></div>
          </div>
        </div>`;
      }).join('');
    }
    document.getElementById('pyq-papers').textContent='1';
    document.getElementById('pyq-total-q').textContent=data.totalQ||'—';
    document.getElementById('pyq-key-topics').textContent=data.keyTopics||'—';
    document.getElementById('pyq-difficulty').textContent=(data.difficulty||'—').substring(0,3);
  }catch(e){
    console.warn('PYQ analyze error:',e);
    if(topicContainer) topicContainer.innerHTML='<div style="color:#e05050;font-size:13px;padding:8px 0">Could not analyze — try a plain text (.txt) file.</div>';
  }
}

async function generatePYQPractice(){
  if(!pyqText){ showToast('Please upload a PYQ paper first!','error'); return; }
  navigate('quiz');
  document.getElementById('quiz-topic').value='Previous Year Questions';
  document.getElementById('quiz-num').value='10';
  document.getElementById('quiz-type').value='mcq';
  const tempKey='__pyq__';
  uploadedNotes[tempKey]=pyqText;
  await generateQuiz();
  delete uploadedNotes[tempKey];
}

async function startPYQMockTest(){
  if(!pyqText){ showToast('Please upload a PYQ paper first!','error'); return; }

  const section = document.getElementById('pyq-mock-section');
  const cardsEl = document.getElementById('pyq-mock-cards');
  section.style.display = 'block';
  section.scrollIntoView({behavior:'smooth', block:'start'});

  cardsEl.innerHTML = `<div style="grid-column:1/-1;display:flex;align-items:center;gap:10px;color:var(--muted);font-size:13px;padding:20px 0">
    <div style="width:16px;height:16px;border:2px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0"></div>
    Analyzing your PYQ paper and creating mock tests...
  </div>`;

  try{
    const reply = await groq([
      {role:'system', content:'You are an exam analyst. Return ONLY valid JSON, no markdown, no extra text.'},
      {role:'user', content:`Analyze this exam paper and create 3 mock test cards at different difficulty levels:\n\n${pyqText.substring(0,4000)}\n\nReturn ONLY JSON array with exactly 3 items:\n[{"title":"Short topic title (max 4 words)","level":"Easy","questions":10,"minutes":15,"topic":"Full topic description for quiz generation"},{"title":"...","level":"Medium","questions":20,"minutes":30,"topic":"..."},{"title":"...","level":"Hard","questions":25,"minutes":40,"topic":"..."}]`}
    ], 0.3);

    const cards = JSON.parse(reply.replace(/```json|```/g,'').trim());
    const levelClass = {'Easy':'easy','Medium':'medium','Hard':'hard'};

    cardsEl.innerHTML = cards.map(c => `
      <div class="mock-card">
        <span class="mock-card-tag ${levelClass[c.level]||'medium'}">${c.level}</span>
        <div class="mock-card-title">${c.title}</div>
        <div class="mock-card-meta"><span>${c.questions} Questions</span><span>${c.minutes} Minutes</span></div>
        <div class="mock-card-footer">
          <span class="score-badge">PYQ Based</span>
          <button class="start-btn" onclick="startMockTestFromPYQ('${c.topic.replace(/'/g,"\\'")}', ${c.questions})">Start Test</button>
        </div>
      </div>`).join('');

  } catch(e){
    cardsEl.innerHTML = `<div style="grid-column:1/-1;color:#e05050;font-size:13px;padding:12px 0">Could not generate mock tests. Try again!</div>`;
  }
}

// EXAM SIMULATION 
let examQuestions = [];
let examAnswers = {};  
let examTimer = null;
let examSecondsLeft = 0;
let examTitle = '';

async function startMockTestFromPYQ(topic, numQ){
  if(!pyqText){ showToast('Upload a PYQ paper first!','error'); return; }

  // Show overlay with loading state
  document.getElementById('exam-overlay').classList.add('active');
  document.getElementById('exam-title').textContent = topic;
  document.getElementById('exam-meta').textContent = `${numQ} Questions · Generating...`;
  document.getElementById('exam-questions').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:14px;color:var(--muted)">
      <div style="width:36px;height:36px;border:3px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>
      <div style="font-size:14px;font-weight:700">Generating your exam from the PYQ paper...</div>
    </div>`;
  document.getElementById('q-grid').innerHTML = '';
  document.getElementById('exam-answered-count').textContent = `0 / ${numQ} answered`;

  // Generate questions from PYQ
  const tempKey = '__pyq__';
  uploadedNotes[tempKey] = pyqText;
  try{
    const reply = await groq([
      {role:'system', content:'You are an exam generator. Return ONLY valid JSON. No markdown, no extra text.'},
      {role:'user', content:`Generate ${numQ} exam questions about "${topic}" from this paper:\n\n${pyqText.substring(0,4000)}\n\nMix of MCQ, True/False and Short Answer. Return ONLY JSON:\n[{"type":"mcq","q":"Question?","opts":["A","B","C","D"],"ans":0},{"type":"tf","q":"Statement.","opts":["True","False"],"ans":0},{"type":"short","q":"Question?","ans":"Model answer."}]`}
    ], 0.4);
    examQuestions = JSON.parse(reply.replace(/```json|```/g,'').trim());
  } catch(e){
    document.getElementById('exam-questions').innerHTML = `<div style="color:#e05050;padding:40px;text-align:center">Failed to generate exam. Please try again.</div>`;
    delete uploadedNotes[tempKey];
    return;
  }
  delete uploadedNotes[tempKey];

  examAnswers = {};
  examTitle = topic;

  // Set timer based on numQ roughly 1.5 min per question
  examSecondsLeft = numQ * 90;
  startExamTimer();

  // Render questions
  renderExamQuestions();
  renderQGrid();

  document.getElementById('exam-title').textContent = topic;
  document.getElementById('exam-meta').textContent = `${examQuestions.length} Questions`;
}

function renderExamQuestions(){
  const container = document.getElementById('exam-questions');
  container.innerHTML = examQuestions.map((q, i) => {
    const type = q.type || 'mcq';
    const opts = q.opts || ['True','False'];
    const optsHTML = type === 'short'
      ? `<textarea class="paste-area" id="exam-short-${i}" style="min-height:70px" placeholder="Type your answer..." oninput="examShortAnswer(${i},this.value)"></textarea>`
      : `<div class="exam-opts">${opts.map((o,j) => `
          <div class="exam-opt" id="eqo-${i}-${j}" onclick="examPickOpt(${i},${j})">
            <span class="exam-opt-letter">${type==='tf'?(j===0?'T':'F'):String.fromCharCode(65+j)}</span>${o}
          </div>`).join('')}</div>`;

    const typeTag = type==='tf' ? '· True/False' : type==='short' ? '· Short Answer' : '';
    return `<div class="exam-q-card" id="eq-${i}">
      <div class="exam-q-num-label">Q${i+1} ${typeTag}</div>
      <div class="exam-q-text">${q.q}</div>
      ${optsHTML}
    </div>`;
  }).join('');
}

function examPickOpt(qi, oi){
  const q = examQuestions[qi];
  const opts = q.opts || ['True','False'];
  // Clear selection
  for(let j=0; j<opts.length; j++){
    document.getElementById(`eqo-${qi}-${j}`)?.classList.remove('selected');
  }
  document.getElementById(`eqo-${qi}-${oi}`)?.classList.add('selected');
  examAnswers[qi] = oi;
  document.getElementById(`eq-${qi}`)?.classList.add('answered');
  updateQGrid();
  updateExamProgress();
}

function examShortAnswer(qi, val){
  if(val.trim()){
    examAnswers[qi] = val;
    document.getElementById(`eq-${qi}`)?.classList.add('answered-short');
  } else {
    delete examAnswers[qi];
    document.getElementById(`eq-${qi}`)?.classList.remove('answered-short');
  }
  updateQGrid();
  updateExamProgress();
}

function renderQGrid(){
  const grid = document.getElementById('q-grid');
  grid.innerHTML = examQuestions.map((_,i) => `
    <div class="q-dot" id="qdot-${i}" onclick="scrollToQ(${i})">${i+1}</div>`).join('');
}

function updateQGrid(){
  examQuestions.forEach((_,i) => {
    const dot = document.getElementById(`qdot-${i}`);
    if(!dot) return;
    dot.className = 'q-dot';
    if(examAnswers[i] !== undefined){
      const type = examQuestions[i].type||'mcq';
      dot.classList.add(type==='short' ? 'answered-short' : 'answered');
    }
  });
  const answered = Object.keys(examAnswers).length;
  document.getElementById('exam-answered-count').textContent = `${answered} / ${examQuestions.length} answered`;
}

function updateExamProgress(){
  const pct = Math.round(Object.keys(examAnswers).length / examQuestions.length * 100);
  document.getElementById('exam-prog').style.width = pct + '%';
}

function scrollToQ(i){
  document.getElementById(`eq-${i}`)?.scrollIntoView({behavior:'smooth', block:'center'});
}

function startExamTimer(){
  clearInterval(examTimer);
  updateTimerDisplay();
  examTimer = setInterval(()=>{
    examSecondsLeft--;
    updateTimerDisplay();
    if(examSecondsLeft <= 0){
      clearInterval(examTimer);
      showToast('⏰ Time is up! Auto-submitting your exam.','warning');
      submitExam();
    }
  }, 1000);
}

function updateTimerDisplay(){
  const m = Math.floor(examSecondsLeft / 60).toString().padStart(2,'0');
  const s = (examSecondsLeft % 60).toString().padStart(2,'0');
  const el = document.getElementById('exam-timer');
  el.textContent = `${m}:${s}`;
  el.className = 'exam-timer';
  if(examSecondsLeft <= 60) el.classList.add('danger');
  else if(examSecondsLeft <= 300) el.classList.add('warning');
}

function confirmExitExam(){
  showConfirm('Exit exam?', 'Your progress will be lost and the exam will end.', exitExam);
}

function exitExam(){
  clearInterval(examTimer);
  document.getElementById('exam-overlay').classList.remove('active');
  examQuestions = []; examAnswers = {};
}

function submitExam(){
  clearInterval(examTimer);
  document.getElementById('exam-overlay').classList.remove('active');

  // Score
  let score = 0; let scorable = 0;
  examQuestions.forEach((q,i) => {
    if((q.type||'mcq') === 'short') return;
    scorable++;
    if(examAnswers[i] === parseInt(q.ans)) score++;
  });

  const pct = scorable > 0 ? Math.round(score/scorable*100) : 0;
  const color = pct>=80?'#2e7d32':pct>=60?'#e07000':'#c62828';
  const emoji = pct>=80?'🏆':pct>=60?'👍':'💪';

  // Track in session stats
  trackQuiz(examTitle, score, scorable||1);

  // Results screen
  const ring = document.getElementById('results-ring');
  ring.style.borderColor = color;
  document.getElementById('results-pct').textContent = pct + '%';
  document.getElementById('results-pct').style.color = color;
  document.getElementById('results-title').textContent = `${emoji} Exam Complete!`;
  document.getElementById('results-subtitle').textContent = `${examTitle} · ${score}/${scorable} correct`;

  // Stats row
  const timeTaken = examTitle ? formatTimeTaken() : '—';
  document.getElementById('results-stats').innerHTML = [
    {label:'Score', val:`${score}/${scorable}`, color},
    {label:'Percentage', val:`${pct}%`, color},
    {label:'Short Answers', val:`${examQuestions.filter(q=>(q.type||'mcq')==='short').length}`},
    {label:'Time Left', val:formatTimeTaken()},
  ].map(s=>`<div style="background:var(--purple-light);border-radius:12px;padding:12px 18px;text-align:center">
    <div style="font-size:20px;font-weight:800;color:${s.color||'var(--active-text)'}"> ${s.val}</div>
    <div style="font-size:11px;font-weight:700;color:var(--muted)">${s.label}</div>
  </div>`).join('');

  // Answer review
  document.getElementById('results-review').innerHTML = examQuestions.map((q,i)=>{
    const type = q.type||'mcq';
    const isShort = type==='short';
    const correct = parseInt(q.ans);
    const chosen = examAnswers[i];
    const isCorrect = !isShort && chosen === correct;
    const cardClass = isShort ? 'short-card' : isCorrect ? 'correct-card' : 'wrong-card';
    const badge = isShort
      ? `<span style="background:#ede8f8;color:var(--active-text);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">Short Answer</span>`
      : isCorrect
        ? `<span style="background:#e8f5e9;color:#1b5e20;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">✓ Correct</span>`
        : `<span style="background:#ffebee;color:#b71c1c;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">✗ Wrong</span>`;

    let answerHTML = '';
    if(isShort){
      answerHTML = `<div style="margin-top:10px;font-size:13px">
        <div style="font-weight:700;color:var(--muted);margin-bottom:4px">Your answer:</div>
        <div style="background:#f4f1f9;border-radius:8px;padding:8px 12px;font-weight:600">${chosen||'<em style="color:var(--muted)">Not answered</em>'}</div>
        <div style="font-weight:700;color:#1b5e20;margin:8px 0 4px">Model answer:</div>
        <div style="background:#e8f5e9;border-radius:8px;padding:8px 12px;font-weight:600;color:#1b5e20">${q.ans}</div>
      </div>`;
    } else {
      const opts = q.opts||['True','False'];
      answerHTML = `<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
        ${opts.map((o,j)=>{
          let bg='#f4f1f9'; let col='var(--text)';
          if(j===correct){bg='#e8f5e9';col='#1b5e20';}
          else if(j===chosen && chosen!==correct){bg='#ffebee';col='#b71c1c';}
          return `<div style="background:${bg};border-radius:8px;padding:8px 12px;font-size:13px;font-weight:600;color:${col}">
            ${String.fromCharCode(65+j)}. ${o} ${j===correct?'✓':''}${j===chosen&&chosen!==correct?'✗':''}
          </div>`;
        }).join('')}
      </div>`;
    }

    return `<div class="review-card ${cardClass}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;font-weight:800;color:var(--purple)">Q${i+1}</span>${badge}
      </div>
      <div style="font-size:14px;font-weight:700;color:var(--text);line-height:1.5">${q.q}</div>
      ${answerHTML}
    </div>`;
  }).join('');

  document.getElementById('exam-results').classList.add('active');
}

function formatTimeTaken(){
  const m = Math.floor(examSecondsLeft/60);
  const s = examSecondsLeft%60;
  return `${m}m ${s}s left`;
}

function closeResults(){
  document.getElementById('exam-results').classList.remove('active');
  navigate('pyq');
}

// CUSTOM DROPDOWN
function toggleDropdown(ddId){
  const dd = document.getElementById(ddId);
  const trigger = dd.previousElementSibling;
  const isOpen = dd.classList.contains('open');
  // Close all dropdowns first
  document.querySelectorAll('.custom-select-dropdown.open').forEach(d => {
    d.classList.remove('open');
    d.previousElementSibling.classList.remove('open');
  });
  if(!isOpen){ dd.classList.add('open'); trigger.classList.add('open'); }
}
function selectOption(inputId, value, labelId, labelText, ddId){
  document.getElementById(inputId).value = value;
  document.getElementById(labelId).textContent = labelText;
  // Mark active
  document.querySelectorAll(`#${ddId} .custom-select-option`).forEach(o => o.classList.remove('active'));
  event.target.classList.add('active');
  // Close
  const dd = document.getElementById(ddId);
  dd.classList.remove('open');
  dd.previousElementSibling.classList.remove('open');
}
// Close dropdown on outside click
document.addEventListener('click', e => {
  if(!e.target.closest('.custom-select')){
    document.querySelectorAll('.custom-select-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.previousElementSibling.classList.remove('open');
    });
  }
});

// REDIRECT TO PYQ WITH TOAST
function redirectToPYQ(){
  // Show toast
  const toast = document.createElement('div');
  toast.textContent = '📄 Upload a PYQ paper to unlock this!';
  toast.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
    background:#3b2a6e;color:white;padding:12px 22px;border-radius:12px;
    font-size:13px;font-weight:700;font-family:var(--font);z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.15);animation:fadeUp .3s ease`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
  // Redirect to PYQ page
  setTimeout(() => navigate('pyq'), 400);
}

// MOCK TESTS
async function startMockTest(topic, numQ){
  navigate('quiz');
  document.getElementById('quiz-topic').value=topic;
  document.getElementById('quiz-num').value=numQ;
  await generateQuiz();
}

// WEEKLY WRAP
async function generateWeeklyWrap(){
  const out=document.getElementById('weekly-wrap-output');
  if(!out) return;
  setLoading(out,'Generating your weekly AI summary...');
  const topicList = [...stats.topicsAsked].join(', ') || 'None yet';
  const scoreList = stats.quizScores.map(q=>`${q.topic}: ${Math.round(q.score/q.total*100)}%`).join(', ') || 'No quizzes taken yet';
  const studyTime = getStudyTime();
  try{
    const reply=await groq([
      {role:'system',content:'You are Ruena, a warm and motivating AI study companion. Write encouraging study session summaries using HTML: <h3>, <p>, <ul>, <li>, <strong>. Be specific, actionable and upbeat. If activity is low, encourage gently.'},
      {role:'user',content:`Generate a study session summary for a student with this actual activity:
- Topics studied: ${topicList}
- Quiz scores: ${scoreList}
- Time spent in app: ${studyTime}
- Streak actions: ${stats.streak}
- Flashcards reviewed: ${stats.flashcardsViewed}

${stats.topicsAsked.size===0 && stats.quizzesTaken===0
  ? 'The student just opened the app and has not studied yet. Warmly welcome them and encourage them to get started!'
  : 'Summarize what they did, highlight strengths, note what to improve, and suggest next steps.'}`}
    ]);
    out.innerHTML=reply;
  }catch(e){
    out.innerHTML=`<div style="color:#e05050">Error: ${e.message}</div>`;
  }
}

// SESSION STATS TRACKER
const stats = {
  startTime: Date.now(),
  topicsAsked: new Set(),
  quizzesTaken: 0,
  quizScores: [],        
  flashcardsViewed: 0,
  streak: 0,             
};

// STREAK SYSTEM — Duolingo style, localStorage persisted
const STREAK_KEY = 'ruena_streak';
const TODAY_KEY  = 'ruena_today';

function getStreakData(){
  try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || {days:0, best:0, activeDays:[]}; }
  catch{ return {days:0, best:0, activeDays:[]}; }
}
function saveStreakData(d){ localStorage.setItem(STREAK_KEY, JSON.stringify(d)); }

function getTodayData(){
  const today = new Date().toDateString();
  try {
    const d = JSON.parse(localStorage.getItem(TODAY_KEY));
    if(d && d.date === today) return d;
  } catch{}
  return { date: new Date().toDateString(), activities: 0, streakCounted: false };
}
function saveTodayData(d){ localStorage.setItem(TODAY_KEY, JSON.stringify(d)); }

function trackActivity(){
  const today = getTodayData();
  today.activities = (today.activities || 0) + 1;

  // Count streak once per day when 5 activities hit
  if(today.activities >= 15 && !today.streakCounted){
    today.streakCounted = true;
    const sd = getStreakData();
    sd.days = (sd.days || 0) + 1;
    sd.best = Math.max(sd.best || 0, sd.days);
    // Mark today's weekday
    const dayIdx = (new Date().getDay() + 6) % 7; // Mon=0
    if(!sd.activeDays.includes(dayIdx)) sd.activeDays.push(dayIdx);
    saveStreakData(sd);
    // Fire animation!
    showStreakCelebration(sd.days);
  }
  saveTodayData(today);
  updateStreakCard();
  stats.streak = getStreakData().days;
}

function showStreakCelebration(days){
  // Bounce streak number
  const sc = document.getElementById('streak-count');
  if(sc){ sc.style.transform='scale(1.4)'; setTimeout(()=>sc.style.transform='scale(1)',400); }

  // Random message
  const messages = [
    'Another W 👑',
    "Ruena's proud of you 💜",
    "Ruena sees you winning ✨"
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  // Inject keyframes if not already there
  if(!document.getElementById('streak-styles')){
    const style = document.createElement('style');
    style.id = 'streak-styles';
    style.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(-20px) rotate(0deg) scale(1);   opacity:1; }
        100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity:0; }
      }
      @keyframes popIn {
        0%   { opacity:0; transform:translate(-50%,-50%) scale(.7); }
        60%  { transform:translate(-50%,-50%) scale(1.08); }
        100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
      }
      @keyframes popOut {
        0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
        100% { opacity:0; transform:translate(-50%,-50%) scale(.8); }
      }
    `;
    document.head.appendChild(style);
  }

  // Overlay (dim background slightly)
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;z-index:9998;pointer-events:none;overflow:hidden`;
  document.body.appendChild(overlay);

  // Confetti particles — purple + gold, uneven sizes, from top
  const colors = ['#a78de0','#c4a8f0','#fcd9a0','#f59500','#ede8f5','#e07000','#7a4db5','#fceec7'];
  const shapes = ['●','★','✦','▲','◆','✶'];
  for(let i = 0; i < 60; i++){
    const p = document.createElement('div');
    const size = Math.random() * 18 + 6; // 6–24px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 1.2;
    const duration = Math.random() * 1.5 + 1.5;
    p.textContent = shape;
    p.style.cssText = `
      position:absolute;
      top:-30px;
      left:${left}%;
      font-size:${size}px;
      color:${color};
      animation:confettiFall ${duration}s ease-in ${delay}s forwards;
      pointer-events:none;
      opacity:1;
    `;
    overlay.appendChild(p);
  }

  // Frosted glass popup card
  const card = document.createElement('div');
  card.style.cssText = `
    position:fixed;top:50%;left:50%;
    transform:translate(-50%,-50%) scale(.7);
    z-index:9999;
    background:rgba(255,255,255,0.18);
    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);
    border:1.5px solid rgba(255,255,255,0.4);
    border-radius:28px;
    padding:40px 48px;
    text-align:center;
    box-shadow:0 8px 48px rgba(100,80,160,.25), 0 2px 12px rgba(0,0,0,.08);
    animation:popIn .45s cubic-bezier(.34,1.56,.64,1) forwards;
    min-width:280px;
    font-family:var(--font);
    pointer-events:none;
  `;
  card.innerHTML = `
    <div style="font-size:52px;font-weight:800;color:#e07000;line-height:1;margin-bottom:6px">${days}</div>
    <div style="font-size:18px;font-weight:800;color:#3b2a6e;margin-bottom:10px">Day Streak 🔥</div>
    <div style="font-size:15px;font-weight:700;color:#5a3fa0;opacity:.9">${msg}</div>
  `;
  document.body.appendChild(card);

  // Auto dismiss after 2.8s
  setTimeout(() => {
    card.style.animation = 'popOut .35s ease forwards';
    setTimeout(() => { card.remove(); overlay.remove(); }, 350);
  }, 6000);
}


function updateStreakCard(){
  const sd = getStreakData();
  const td = getTodayData();
  const el = id => document.getElementById(id);
  const n = sd.days || 0;
  const best = sd.best || 0;
  const acts = td.activities || 0;

  if(el('streak-count')) el('streak-count').textContent = n;
  if(el('best-streak-val')) el('best-streak-val').textContent = `${best} Day${best!==1?'s':''} 🏆`;

  // Day dots — only light up days that were actually active this week
  const todayIdx = (new Date().getDay() + 6) % 7;
  for(let i=0;i<7;i++){
    const dot = el(`sd-${i}`);
    if(!dot) continue;
    if(sd.activeDays && sd.activeDays.includes(i)){
      dot.classList.add('done'); dot.textContent = '✓';
    } else if(i === todayIdx && acts > 0){
      dot.classList.add('done'); dot.textContent = '✓';
    } else {
      dot.classList.remove('done'); dot.textContent = '·';
    }
  }

  // Today's activity progress (out of 5)
  const pct = Math.min(Math.round((acts/15)*100), 100);
  if(el('today-bar')) el('today-bar').style.width = pct+'%';
  if(el('today-pct')) el('today-pct').textContent = pct+'%';
  if(el('today-msg')){
    if(acts >= 15) el('today-msg').textContent = `Streak secured today! Amazing work 🔥`;
    else el('today-msg').textContent = `Do ${15-acts} more activit${(15-acts)===1?'y':'ies'} to build your streak!`;
  }
}

// Hook trackActivity into existing trackers
function trackQuiz(topic, score, total){
  stats.quizzesTaken++;
  stats.quizScores.push({topic: topic||'Quiz', score, total});
  saveQuizScoreToBackend(score, total);
  trackActivity();
  updateWrapStats();
}

function trackFlashcards(count){
  stats.flashcardsViewed += count||8;
  trackActivity();
  updateWrapStats();
}

function trackTopic(topic){
  if(topic) stats.topicsAsked.add(topic);
  trackActivity();
  updateWrapStats();
}

function getStudyTime(){
  const mins = Math.floor((Date.now() - stats.startTime) / 60000);
  return mins >= 60 ? `${(mins/60).toFixed(1)}h` : `${mins}m`;
}

function updateWrapStats(){
  const el = id => document.getElementById(id);
  if(el('wrap-study-time')) el('wrap-study-time').textContent = getStudyTime();
  if(el('wrap-topics')) el('wrap-topics').textContent = stats.topicsAsked.size;
  if(el('wrap-quizzes')) el('wrap-quizzes').textContent = stats.quizzesTaken;
  if(el('wrap-flashcards')) el('wrap-flashcards').textContent = stats.flashcardsViewed;
  if(el('wrap-streak-badge')) el('wrap-streak-badge').textContent = `${stats.streak} 🔥`;
  if(el('wrap-avg-score')){
    if(stats.quizScores.length > 0){
      const avg = Math.round(stats.quizScores.reduce((a,q)=>a+(q.score/q.total*100),0)/stats.quizScores.length);
      el('wrap-avg-score').textContent = `Avg score ${avg}%`;
    }
  }
  // Date range
  if(el('wrap-date-range')){
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - ((day+6)%7));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = d => d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    el('wrap-date-range').textContent = `${fmt(mon)} – ${fmt(sun)} · ${stats.streak} Day Streak 🔥`;
  }
  // Quiz scores list
  const scoresEl = document.getElementById('wrap-quiz-scores');
  if(scoresEl && stats.quizScores.length > 0){
    scoresEl.innerHTML = stats.quizScores.slice(-5).reverse().map(q => {
      const pct = Math.round(q.score/q.total*100);
      const bg = pct>=80?'var(--green-card)':pct>=60?'var(--yellow-card)':'#ffebee';
      const col = pct>=80?'#2a6e40':pct>=60?'#6b4f00':'#b71c1c';
      return `<div style="background:#f4f1f9;border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:13px;font-weight:700">${q.topic}</span>
        <span style="background:${bg};color:${col};border-radius:20px;padding:3px 10px;font-size:12px;font-weight:700">${pct}%</span>
      </div>`;
    }).join('');
  }
  // Topic bars
  const topicsEl = document.getElementById('wrap-topic-bars');
  if(topicsEl && stats.topicsAsked.size > 0){
    const topics = [...stats.topicsAsked].slice(-5);
    topicsEl.innerHTML = topics.map((t,i) => `
      <div class="topic-bar"><span class="topic-bar-name">${t}</span>
      <div class="topic-bar-track"><div class="topic-bar-fill" style="width:${100 - i*15}%"></div></div>
      <span class="topic-bar-count">studied</span></div>`).join('');
  }
}

// Init stats display on load
updateCard();
setupPYQUpload();
updateWrapStats();
updateStreakCard();
loadStatsFromBackend().then(data => {
  if(!data) return;
  const el = id => document.getElementById(id);
  if(el('wrap-quizzes')) el('wrap-quizzes').textContent = data.totalQuizzes || 0;
  if(el('wrap-avg-score') && data.avgScore) el('wrap-avg-score').textContent = `Avg score ${data.avgScore}%`;
  // Never override streak from backend — use localStorage
});

// ROUTE PROTECTION — redirect if not logged in
if(!localStorage.getItem('ruena_user_id')){
  window.location.href = '/auth';
}

// Show username in sidebar
const _userName = localStorage.getItem('ruena_user_name') || 'Student';
const _userEmail = localStorage.getItem('ruena_user_id') || '';
const _userInitial = _userName[0].toUpperCase();
const _pname = document.getElementById('profile-name');
const _pemail = document.getElementById('profile-email');
const _pavatar = document.getElementById('profile-avatar');
if(_pname) _pname.textContent = _userName;
if(_pemail) _pemail.textContent = _userEmail;
if(_pavatar) _pavatar.textContent = _userInitial;
// Settings page profile
const _sname = document.getElementById('settings-name');
const _semail = document.getElementById('settings-email');
const _savatar = document.getElementById('settings-avatar');
if(_sname) _sname.textContent = _userName;
if(_semail) _semail.textContent = _userEmail;
if(_savatar) _savatar.textContent = _userInitial;

// ── Toast notification ──
function showToast(msg, type='info'){
  const colors = {
    info:   { bg:'#3b2a6e', color:'white' },
    error:  { bg:'#ffebee', color:'#c62828' },
    success:{ bg:'#e8f5e9', color:'#1b5e20' },
    warning:{ bg:'#fff8ee', color:'#a05000' }
  };
  const c = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
    background:${c.bg};color:${c.color};padding:13px 22px;border-radius:12px;
    font-size:13px;font-weight:700;font-family:var(--font);z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.12);animation:fadeUp .3s ease;
    max-width:320px;text-align:center;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Custom confirm modal ──
function showConfirm(msg, subMsg='', onConfirm){
  // Remove existing
  document.getElementById('custom-confirm')?.remove();
  const modal = document.createElement('div');
  modal.id = 'custom-confirm';
  modal.style.cssText = `position:fixed;inset:0;z-index:3000;display:flex;align-items:center;
    justify-content:center;background:rgba(0,0,0,.35);backdrop-filter:blur(4px)`;
  modal.innerHTML = `
    <div style="background:var(--card);border-radius:24px;padding:32px;max-width:360px;
      width:90%;text-align:center;box-shadow:0 8px 48px rgba(0,0,0,.15);animation:slideUp .3s ease;font-family:var(--font)">
      <div style="font-size:36px;margin-bottom:12px">⚠️</div>
      <div style="font-size:16px;font-weight:800;color:var(--active-text);margin-bottom:8px">${msg}</div>
      ${subMsg ? `<div style="font-size:13px;color:var(--muted);font-weight:500;line-height:1.6;margin-bottom:20px">${subMsg}</div>` : '<div style="margin-bottom:20px"></div>'}
      <div style="display:flex;gap:10px">
        <button onclick="document.getElementById('custom-confirm').remove()"
          style="flex:1;padding:12px;border-radius:10px;border:1.5px solid var(--border);
          background:white;font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer">
          Cancel
        </button>
        <button id="confirm-yes-btn"
          style="flex:1;padding:12px;border-radius:10px;border:none;background:#e53935;
          color:white;font-size:14px;font-weight:800;font-family:var(--font);cursor:pointer">
          Yes, Exit
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('confirm-yes-btn').onclick = () => {
    modal.remove();
    onConfirm();
  };
  // Close on backdrop click
  modal.addEventListener('click', e => { if(e.target === modal) modal.remove(); });
}


function openModal(id){
  const m = document.getElementById(id);
  if(m){ m.style.display='flex'; }
}
function closeModal(id){
  const m = document.getElementById(id);
  if(m){ m.style.display='none'; }
}
// Close modal on background click
document.addEventListener('click', e => {
  ['signout-modal','delete-modal'].forEach(id => {
    const m = document.getElementById(id);
    if(m && e.target === m) m.style.display='none';
  });
});

// Logout function
function doLogout(){ openModal('signout-modal'); }
function confirmSignOut(){
  localStorage.removeItem('ruena_user_id');
  localStorage.removeItem('ruena_user_name');
  localStorage.removeItem(STREAK_KEY);
  localStorage.removeItem(TODAY_KEY);
  window.location.href = '/auth';
}

// Delete account function
async function doDeleteAccount(){ openModal('delete-modal'); }
async function confirmDeleteAccount(){
  closeModal('delete-modal');
  try {
    await fetch('http://localhost:5000/api/delete-account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getUserId() })
    });
  } catch(e){ console.warn('Delete account error:', e.message); }
  localStorage.clear();
  window.location.href = '/auth';
}

// USER ID — from localStorage after login
function getUserId(){
  return localStorage.getItem('ruena_user_id') || 'guest';
}

// BACKEND API CALLS

// 1. Save notes to backend
async function saveNoteToBackend(content){
  try{
    await fetch('http://localhost:5000/api/notes', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId: getUserId(), content })
    });
  } catch(e){ console.warn('Could not save note:', e.message); }
}

// 2. Save quiz score to backend
async function saveQuizScoreToBackend(score, total){
  try{
    await fetch('http://localhost:5000/api/quiz-scores', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId: getUserId(), score, total })
    });
  } catch(e){ console.warn('Could not save score:', e.message); }
}

// 3. Load user stats from backend
async function loadStatsFromBackend(){
  try{
    const res = await fetch(`http://localhost:5000/api/stats/${getUserId()}`);
    const data = await res.json();
    return data;
  } catch(e){ console.warn('Could not load stats:', e.message); return null; }
}

// GROQ AI — calls backend proxy
async function groq(messages, temperature=0.7){
  const res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUserId(), message: messages[messages.length-1]?.content, messages, temperature })
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error || 'API error');
  return data.reply || data.response;
}

function setLoading(el, msg='Ruena is thinking...'){
  if(!el) return;
  el.innerHTML=`<div style="display:flex;align-items:center;gap:10px;color:var(--muted);font-style:italic;padding:10px 0">
    <div style="width:18px;height:18px;border:2px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0"></div>${msg}</div>`;
}

// NAVIGATION
function navigate(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const t=document.getElementById('page-'+page);
  if(t) t.classList.add('active');
  document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
  updateMobileNav(page);
  if(window.innerWidth<=768) window.scrollTo({top:0,behavior:'smooth'});
  // Auto-trigger Weekly Wrap AI on first open
  if(page==='weeklywrap'){
    const out=document.getElementById('weekly-wrap-output');
    if(out && !out.dataset.generated){ out.dataset.generated='1'; generateWeeklyWrap(); }
  }
}

function updateMobileNav(page){
  document.querySelectorAll('.mobile-nav-item').forEach(b=>{
    b.classList.toggle('active', b.dataset.page===page);
  });
}

document.querySelectorAll('[data-page]').forEach(el=>{
  el.addEventListener('click',e=>{ e.preventDefault(); navigate(el.dataset.page); });
});

function toggleSidebar(){
  const sidebar=document.querySelector('.sidebar');
  const toggle=document.getElementById('sidebar-toggle');
  sidebar.classList.toggle('collapsed');
  toggle.classList.toggle('collapsed');
}

// UPLOADED NOTES STORE

// UPLOAD NOTES
let uploadedNotes = {};  
let pastedNotes = '';

function getNotesContext(){
  const parts = [...Object.entries(uploadedNotes).map(([k,v])=>`[${k}]\n${v}`), pastedNotes].filter(Boolean);
  return parts.length ? parts.join('\n\n').substring(0,6000) : null;
}

async function readFileText(file){
  return new Promise(resolve => {
    if(file.type === 'text/plain'){
      const r = new FileReader();
      r.onload = e => resolve(e.target.result);
      r.readAsText(file);
    } else {
      resolve(`[File: ${file.name} — text content not extractable in browser. Treat as study material on this topic.]`);
    }
  });
}

async function addFiles(files){
  for(const f of files){
    // Skip duplicates
    if(uploadedNotes[f.name]) continue;
    // Show pill in drop zone
    const pill = document.createElement('div');
    pill.className = 'file-pill';
    pill.dataset.fname = f.name;
    pill.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>${f.name}
      <span class="remove" onclick="removeFile('${f.name}',this)">×</span>`;
    document.getElementById('file-list').appendChild(pill);
    // Read content
    const text = await readFileText(f);
    uploadedNotes[f.name] = text;
    refreshNotesList();
  }
  // Reset input so same file can be re-added
  document.getElementById('file-input').value = '';
}

function removeFile(fname, el){
  el.closest('.file-pill').remove();
  delete uploadedNotes[fname];
  refreshNotesList();
}

function savePastedNotes(){
  const area = document.getElementById('paste-notes-area');
  const text = area?.value?.trim();
  if(!text){ showToast('Please paste some notes first!','error'); return; }
  pastedNotes = text;
  // Save as virtual "Pasted Notes" entry
  uploadedNotes['Pasted Notes'] = text;
  saveNoteToBackend(text);
  refreshNotesList();
  const btn = document.getElementById('save-notes-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Saved!`;
  btn.style.background = '#4caf50';
  setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
}

function refreshNotesList(){
  const keys = Object.keys(uploadedNotes);
  //  Upload page: Recent Uploads
  const recentEl = document.getElementById('recent-uploads-list');
  if(recentEl){
    if(keys.length === 0){
      recentEl.innerHTML = `<div class="empty-state" style="padding:20px 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px;height:36px;color:#d4ccc0;display:block;margin:0 auto 8px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p style="font-size:13px">No files uploaded yet</p></div>`;
    } else {
      recentEl.innerHTML = keys.map(k => `
        <div class="recent-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--purple)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div><div class="recent-item-name">${k}</div><div class="recent-item-meta">${k==='Pasted Notes'?'Pasted text':'Uploaded'}</div></div>
          <span class="recent-item-badge" style="cursor:pointer" onclick="removeFile('${k}',this.closest('.recent-item'))">✕ Remove</span>
        </div>`).join('');
    }
  }
  //  Summary page: notes selector
  const summaryEl = document.getElementById('summary-notes-list');
  if(summaryEl){
    if(keys.length === 0){
      summaryEl.innerHTML = `<div class="empty-state" style="padding:16px 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:32px;height:32px;color:#d4ccc0;display:block;margin:0 auto 8px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p style="font-size:12px;color:var(--muted)">Upload notes to select them here</p></div>`;
      selectedNote = null;
    } else {
      summaryEl.innerHTML = keys.map((k,i) => `
        <div class="recent-item note-select-item" style="cursor:pointer;${i===0?'border:1.5px solid var(--purple);background:var(--purple-light)':''}" onclick="selectNote(this,'${k}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:var(--purple)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div><div class="recent-item-name">${k}</div><div class="recent-item-meta">${k==='Pasted Notes'?'Pasted text':'Uploaded'}</div></div>
          ${i===0?'<span class="recent-item-badge">Selected</span>':''}
        </div>`).join('');
      if(!selectedNote || !uploadedNotes[selectedNote]) selectedNote = keys[0];
    }
  }
}

let selectedNote = null;
function selectNote(el, fname){
  document.querySelectorAll('.note-select-item').forEach(i => {
    i.style.border = ''; i.style.background = '';
    i.querySelector('.recent-item-badge')?.remove();
  });
  el.style.border = '1.5px solid var(--purple)';
  el.style.background = 'var(--purple-light)';
  el.insertAdjacentHTML('beforeend','<span class="recent-item-badge">Selected</span>');
  selectedNote = fname;
}

// Wire drop zone
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
if(dropZone){
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); addFiles([...e.dataTransfer.files]); });
  fileInput.addEventListener('change', () => addFiles([...fileInput.files]));
}

// QUICK ASK
function quickAsk(){
  const val=document.getElementById('quick-ask-input')?.value?.trim();
  if(val) document.getElementById('chat-input').value=val;
  navigate('chat');
  if(val) setTimeout(sendChat,100);
}


// CHAT
const chatHistory=[
  {role:'system',content:`You are Ruena, a friendly and smart AI study companion for students. Keep responses concise, clear and student-friendly. Use simple language. Format with bullet points or short paragraphs. Add relevant emojis occasionally.`}
];

function appendMessage(text,isUser){
  const container=document.getElementById('chat-messages');
  const div=document.createElement('div');
  div.style.cssText=`display:flex;align-items:flex-start;gap:10px;${isUser?'flex-direction:row-reverse':''}`;
  const avatar=isUser
    ?`<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#c4a8f0,#a78de0);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:16px;height:16px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`
    :`<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#c4a8f0,#a78de0);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" style="width:17px;height:17px"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>`;
  const bubble=`<div style="background:${isUser?'var(--active-bg)':'var(--purple-light)'};border-radius:${isUser?'12px 0 12px 12px':'0 12px 12px 12px'};padding:12px 16px;max-width:75%">${!isUser?'<div style="font-size:12px;font-weight:700;color:var(--purple);margin-bottom:4px">Ruena</div>':''}<div style="font-size:14px;color:var(--text);line-height:1.6;white-space:pre-wrap">${text}</div></div>`;
  div.innerHTML=avatar+bubble;
  container.appendChild(div);
  container.scrollTop=container.scrollHeight;
  return div;
}

function appendTyping(){
  const container=document.getElementById('chat-messages');
  const div=document.createElement('div');
  div.id='typing-indicator';
  div.style.cssText='display:flex;align-items:flex-start;gap:10px';
  div.innerHTML=`<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#c4a8f0,#a78de0);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" style="width:17px;height:17px"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
  <div style="background:var(--purple-light);border-radius:0 12px 12px 12px;padding:12px 16px">
    <div style="font-size:12px;font-weight:700;color:var(--purple);margin-bottom:6px">Ruena</div>
    <div style="display:flex;gap:4px;align-items:center">
      <div style="width:7px;height:7px;border-radius:50%;background:var(--purple);animation:bounce .8s infinite"></div>
      <div style="width:7px;height:7px;border-radius:50%;background:var(--purple);animation:bounce .8s .15s infinite"></div>
      <div style="width:7px;height:7px;border-radius:50%;background:var(--purple);animation:bounce .8s .3s infinite"></div>
    </div>
  </div>`;
  container.appendChild(div);
  container.scrollTop=container.scrollHeight;
}

async function sendChat(){
  const input=document.getElementById('chat-input');
  const text=input.value.trim();
  if(!text) return;
  input.value='';
  appendMessage(text,true);
  chatHistory.push({role:'user',content:text});
  appendTyping();
  try{
    const reply=await groq(chatHistory);
    document.getElementById('typing-indicator')?.remove();
    appendMessage(reply,false);
    chatHistory.push({role:'assistant',content:reply});
    trackActivity();
  }catch(e){
    document.getElementById('typing-indicator')?.remove();
    appendMessage('Sorry, I had trouble responding. Please try again!',false);
  }
}

function sendQuickMsg(text){
  document.getElementById('chat-input').value=text;
  sendChat();
}

document.getElementById('chat-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}});


// EXPLAIN TOPIC
let explainLevel='Simple';
function setLevel(btn){
  document.querySelectorAll('.level-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  explainLevel=btn.textContent;
}
function setTopic(t){ document.getElementById('explain-input').value=t; showExplain(); }

async function showExplain(){
  const t=document.getElementById('explain-input').value.trim();
  if(!t){ showToast('Please enter a topic first!','error'); return; }
  const out=document.getElementById('explain-output');
  out.classList.remove('empty');
  setLoading(out,`Explaining "${t}"...`);
  try{
    const reply=await groq([
      {role:'system',content:`You are Ruena, a student-friendly AI tutor. Explain topics clearly at a ${explainLevel} level. Use examples, analogies, bullet points or numbered steps. Keep it concise but thorough. Use HTML tags like <h3>, <p>, <ul>, <li>, <strong> for formatting.`},
      {role:'user',content:`Explain this topic: ${t}`}
    ]);
    out.innerHTML=`<div class="output-title">${t} <span style="font-size:12px;font-weight:600;color:var(--muted);margin-left:8px">${explainLevel} level</span></div>${reply}`;
    trackTopic(t); trackActivity();
  }catch(e){
    out.innerHTML=`<div style="color:#e05050">Error: ${e.message}</div>`;
  }
}

function copyExplain(){
  navigator.clipboard.writeText(document.getElementById('explain-output').innerText).then(()=>{
    const b=document.getElementById('copy-btn');
    const orig=b.innerHTML;
    b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Copied!`;
    setTimeout(()=>b.innerHTML=orig,2000);
  });
}

// SUMMARY
async function generateSummary(){
  const topicInput=document.getElementById('summary-topic-input')?.value?.trim();
  const notesCtx=getNotesContext();
  const out=document.getElementById('summary-output');
  const topic=topicInput||(selectedNote?selectedNote:null);

  if(!notesCtx && !topic){
    out.innerHTML=`<div style="color:#a05000;background:#fff8ee;border:1.5px solid #fcd9a0;border-radius:10px;padding:14px">
      📌 Type a topic in the box below, or upload your notes first!</div>`;
    return;
  }

  setLoading(out,`Summarizing ${topic||'your notes'}...`);
  const userMsg=notesCtx
    ?`Summarize these study notes${topic?` focusing on "${topic}"`:''}:\n\n${notesCtx}`
    :`Generate a comprehensive study summary for: "${topic}". Include overview, key concepts, definitions, examples, and a quick revision checklist.`;
  try{
    const reply=await groq([
      {role:'system',content:'You are Ruena. Generate well-structured summaries using HTML: <h3>, <p>, <ul>, <li>, <strong>. Be clear, thorough and student-friendly.'},
      {role:'user',content:userMsg}
    ]);
    out.innerHTML=reply;
    trackTopic(topic||'Summary'); trackActivity();
  }catch(e){ out.innerHTML=`<div style="color:#e05050">Error: ${e.message}</div>`; }
}

function copySummary(){
  navigator.clipboard.writeText(document.getElementById('summary-output').innerText)
    .then(()=>{ const b=document.querySelector('#page-summary .summary-tool-btn'); const o=b.innerHTML; b.textContent='✓ Copied!'; setTimeout(()=>b.innerHTML=o,2000); });
}

async function summaryToFlashcards(){
  const content=document.getElementById('summary-output')?.innerText?.trim();
  if(!content||content.length<20){ showToast('Generate a summary first!','error'); return; }
  navigate('flashcards');
  document.getElementById('fc-topic').value='From Summary';
  try{
    const reply=await groq([
      {role:'system',content:'Generate flashcards from the given content. Return ONLY a JSON array. No markdown, no extra text.'},
      {role:'user',content:`Create 8 flashcards from:\n${content.substring(0,3000)}\nReturn ONLY: [{"q":"...","a":"..."}]`}
    ],0.5);
    cards=JSON.parse(reply.replace(/\`\`\`json|\`\`\`/g,'').trim());
    fcIdx=0; updateCard();
  }catch(e){ showToast('Could not generate flashcards from summary.','error'); }
}

// QUIZ

let currentQuiz=[];
let userAns={};

async function generateQuiz(){
  const topic=document.getElementById('quiz-topic')?.value?.trim();
  const numQ=parseInt(document.getElementById('quiz-num')?.value||10);
  const qtype=document.getElementById('quiz-type')?.value||'mcq';
  const notesCtx=getNotesContext();
  const area=document.getElementById('quiz-area');
  userAns={};
  document.getElementById('quiz-score-label').textContent='';
  if(!topic&&!notesCtx){ showToast('Enter a topic or upload notes first!','error'); return; }

  const typeLabel={'mcq':'Multiple Choice','tf':'True/False','short':'Short Answer','mixed':'Mixed'}[qtype];
  setLoading(area,`Generating ${numQ} ${typeLabel} questions${topic?` on "${topic}"`:''}...`);

  const src = notesCtx
    ? `from these notes${topic?` focusing on "${topic}"`:''}:\n\n${notesCtx}`
    : `about "${topic}"`;

  let systemPrompt, userPrompt;

  if(qtype==='mcq'){
    systemPrompt='You are a quiz generator. Return ONLY valid JSON. No markdown, no extra text.';
    userPrompt=`Generate ${numQ} multiple choice questions ${src}.\nReturn ONLY JSON: [{"type":"mcq","q":"Question?","opts":["A","B","C","D"],"ans":0}] where ans is 0-based index of correct answer.`;
  } else if(qtype==='tf'){
    systemPrompt='You are a quiz generator. Return ONLY valid JSON. No markdown, no extra text.';
    userPrompt=`Generate ${numQ} True/False questions ${src}.\nReturn ONLY JSON: [{"type":"tf","q":"Statement to judge as true or false.","opts":["True","False"],"ans":0}] where ans is 0 for True, 1 for False.`;
  } else if(qtype==='short'){
    systemPrompt='You are a quiz generator. Return ONLY valid JSON. No markdown, no extra text.';
    userPrompt=`Generate ${numQ} short answer questions ${src}.\nReturn ONLY JSON: [{"type":"short","q":"Question?","ans":"Expected answer in 1-2 sentences."}]`;
  } else {
    // mixed: roughly equal split
    systemPrompt='You are a quiz generator. Return ONLY valid JSON. No markdown, no extra text.';
    userPrompt=`Generate ${numQ} mixed questions ${src}. Include a mix of MCQ, True/False, and Short Answer.\nReturn ONLY JSON array where each item has a "type" field:\n- MCQ: {"type":"mcq","q":"?","opts":["A","B","C","D"],"ans":0}\n- True/False: {"type":"tf","q":"Statement.","opts":["True","False"],"ans":0}\n- Short Answer: {"type":"short","q":"?","ans":"Expected answer."}`;
  }

  try{
    const reply=await groq([
      {role:'system',content:systemPrompt},
      {role:'user',content:userPrompt}
    ],0.4);
    currentQuiz=JSON.parse(reply.replace(/```json|```/g,'').trim());
    renderQuiz(currentQuiz);
  }catch(e){
    area.innerHTML=`<div style="color:#e05050;padding:20px">Failed to generate quiz. Try again! (${e.message})</div>`;
  }
}

function renderQuiz(quiz){
  const area=document.getElementById('quiz-area');
  area.innerHTML=quiz.map((q,i)=>{
    const type=q.type||'mcq';

    if(type==='short'){
      // Short answer — text input
      return `<div class="quiz-q" id="qq-${i}">
        <div class="quiz-q-num">Question ${i+1} · Short Answer</div>
        <div class="quiz-q-text">${q.q}</div>
        <textarea id="qo-short-${i}" class="paste-area" style="min-height:70px;margin-top:8px" placeholder="Type your answer here..."></textarea>
        <div id="short-ans-reveal-${i}" style="display:none;margin-top:10px;background:#e8f5e9;border:1.5px solid #4caf50;border-radius:8px;padding:10px;font-size:13px;font-weight:600;color:#1b5e20">
          <strong>Model Answer:</strong> ${q.ans}
        </div>
      </div>`;
    }

    // MCQ or T/F — same option layout
    const opts=q.opts||['True','False'];
    return `<div class="quiz-q" id="qq-${i}">
      <div class="quiz-q-num">Question ${i+1}${type==='tf'?' · True / False':''}</div>
      <div class="quiz-q-text">${q.q}</div>
      <div class="quiz-options">
        ${opts.map((o,j)=>`
          <div class="quiz-option" id="qo-${i}-${j}" onclick="pickOpt(${i},${j})">
            <span style="width:26px;height:26px;border-radius:50%;background:#f0ece3;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;color:var(--muted)">${type==='tf'?(j===0?'T':'F'):String.fromCharCode(65+j)}</span>
            ${o}
          </div>`).join('')}
      </div>
    </div>`;
  }).join('')+
  `<button class="btn-primary" onclick="submitQuiz()" style="margin-top:18px;width:100%;justify-content:center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Submit Quiz
  </button>`;
}

function pickOpt(qi,oi){
  // Clear all options for this question up to 4
  for(let j=0;j<4;j++){
    document.getElementById(`qo-${qi}-${j}`)?.classList.remove('selected');
  }
  document.getElementById(`qo-${qi}-${oi}`)?.classList.add('selected');
  userAns[qi]=oi;
}

function submitQuiz(){
  let score=0; let scorable=0;
  currentQuiz.forEach((q,i)=>{
    const type=q.type||'mcq';
    if(type==='short'){
      document.getElementById(`qo-short-${i}`)?.setAttribute('disabled','true');
      document.getElementById(`short-ans-reveal-${i}`).style.display='block';
      return;
    }
    scorable++;
    const chosen=userAns[i];                 
    const correct=parseInt(q.ans);           
    const opts=q.opts||['True','False'];
    for(let j=0;j<opts.length;j++){
      const b=document.getElementById(`qo-${i}-${j}`);
      if(!b) continue;
      b.style.pointerEvents='none';
      b.classList.remove('selected');
      if(j===correct) b.classList.add('correct');
      else if(j===chosen && chosen!==correct) b.classList.add('wrong');
    }
    if(chosen===correct) score++;
  });
  const label=document.getElementById('quiz-score-label');
  if(scorable>0){
    const pct=Math.round(score/scorable*100);
    const color=pct>=80?'#2e7d32':pct>=60?'#e07000':'#c62828';
    label.innerHTML=`Score: <strong style="color:${color}">${score}/${scorable} (${pct}%)</strong>${currentQuiz.length>scorable?' · Short answers revealed below':''}`;
    trackQuiz(document.getElementById('quiz-topic')?.value?.trim()||'Quiz', score, scorable);
  } else {
    label.innerHTML=`<span style="color:var(--purple);font-weight:700">Short answers revealed! Review the model answers below.</span>`;
  }
  document.querySelector('#quiz-area .btn-primary')?.remove();
}


// FLASHCARDS
let cards=[
  {q:'What is recursion?',a:'A function that calls itself with a smaller version of the same problem until a base case is reached.'},
  {q:'What is database normalization?',a:'Process of organizing database tables to reduce redundancy and improve data integrity.'},
  {q:'What is a primary key?',a:'A column that uniquely identifies each row in a table. Must be unique and NOT NULL.'},
  {q:'What does ACID stand for?',a:'Atomicity, Consistency, Isolation, Durability — properties ensuring reliable database transactions.'},
  {q:'What is a Binary Search Tree?',a:'A tree where left child < parent < right child, enabling O(log n) search operations.'},
];
let fcIdx=0;

async function generateFlashcards(){
  const topic=document.getElementById('fc-topic')?.value?.trim();
  const notesCtx=getNotesContext();
  const btn=document.getElementById('fc-gen-btn');
  if(!topic&&!notesCtx){ showToast('Enter a topic or upload notes first!','error'); return; }
  if(btn){ btn.disabled=true; btn.textContent='Generating...'; }
  const prompt=notesCtx
    ?`Generate 8 flashcards from these notes${topic?` focusing on "${topic}"`:''}:\n\n${notesCtx}`
    :`Generate 8 flashcards for: "${topic}"`;
  try{
    const reply=await groq([
      {role:'system',content:'You are a flashcard generator. Return ONLY a valid JSON array. No markdown, no explanation, no extra text.'},
      {role:'user',content:`${prompt}\n\nReturn ONLY JSON: [{"q":"Question?","a":"Answer."}]`}
    ],0.5);
    cards=JSON.parse(reply.replace(/\`\`\`json|\`\`\`/g,'').trim());
    fcIdx=0; updateCard();
    trackFlashcards(cards.length); trackTopic(topic||'Flashcards');
  }catch(e){
    if(btn){ btn.disabled=false; btn.textContent='Generate'; }
    showToast('Failed to generate flashcards. Please try again!','error');
  }
}

function initCards(){ updateCard(); }
function updateCard(){
  document.getElementById('main-fc')?.classList.remove('flipped');
  document.getElementById('fc-q').textContent=cards[fcIdx].q;
  document.getElementById('fc-a').textContent=cards[fcIdx].a;
  document.getElementById('fc-counter').textContent=`${fcIdx+1} / ${cards.length}`;
  document.getElementById('fc-prog').style.width=`${((fcIdx+1)/cards.length)*100}%`;
}
function flipCard(){ document.getElementById('main-fc').classList.toggle('flipped'); }
function nextCard(){ fcIdx=(fcIdx+1)%cards.length; updateCard(); }
function prevCard(){ fcIdx=(fcIdx-1+cards.length)%cards.length; updateCard(); }
function setFcView(v,btn){
  document.querySelectorAll('.fc-view-btn').forEach(b=>b.classList.toggle('active',b===btn));
  document.getElementById('fc-study-view').style.display=v==='study'?'flex':'none';
  document.getElementById('fc-grid-view').style.display=v==='grid'?'block':'none';
  if(v==='grid'){
    document.getElementById('fc-grid').innerHTML=cards.map(c=>`<div class="fc-mini"><div class="fc-mini-q">${c.q}</div><div class="fc-mini-a">${c.a.substring(0,80)}…</div></div>`).join('');
  }
}


// PYQ TRAINER
let pyqText='';

function setupPYQUpload(){
  const zone=document.getElementById('pyq-drop-zone');
  if(!zone) return;
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='.pdf,.txt'; inp.style='display:none';
  document.body.appendChild(inp);
  zone.onclick=()=>inp.click();
  inp.onchange=async()=>{
    if(!inp.files[0]) return;
    const f=inp.files[0];
    zone.innerHTML=`<div style="display:flex;align-items:center;gap:10px;color:var(--muted)"><div style="width:18px;height:18px;border:2px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>Reading ${f.name}...</div>`;
    pyqText=await readFileText(f);
    zone.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:36px;height:36px;color:var(--purple)"><polyline points="20 6 9 17 4 12"/></svg><span style="font-weight:700;color:var(--active-text)">${f.name} uploaded!</span><span style="font-size:12px;color:var(--muted)">Analyzing exam patterns...</span>`;
    analyzePYQ();
    inp.value='';
  };
}

async function analyzePYQ(){
  const topicContainer=document.getElementById('pyq-topic-bars');
  if(!pyqText) return;
  if(topicContainer) topicContainer.innerHTML=`<div style="display:flex;align-items:center;gap:8px;color:var(--muted);font-style:italic;font-size:13px"><div style="width:14px;height:14px;border:2px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>Analyzing paper...</div>`;
  try{
    const reply=await groq([
      {role:'system',content:'You are an exam paper analyzer. Return ONLY valid JSON, no markdown, no explanation.'},
      {role:'user',content:`Analyze this exam paper and return JSON:\n\n${pyqText.substring(0,4000)}\n\nReturn exactly: {"topics":[{"name":"Topic Name","count":5}],"totalQ":30,"keyTopics":8,"difficulty":"Medium"}`}
    ],0.3);
    const data=JSON.parse(reply.replace(/```json|```/g,'').trim());
    if(topicContainer&&data.topics){
      const max=Math.max(...data.topics.map(t=>t.count),1);
      topicContainer.innerHTML=data.topics.slice(0,6).map(t=>{
        const pct=Math.round(t.count/max*100);
        return `<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:13px;font-weight:700;color:var(--text)">${t.name}</span>
            <span style="font-size:12px;font-weight:700;color:var(--purple)">${t.count} Qs · ${pct}%</span>
          </div>
          <div style="background:#ede8f5;border-radius:20px;height:10px;width:100%">
            <div style="background:linear-gradient(90deg,var(--purple),#a87de8);height:10px;border-radius:20px;width:${pct}%;transition:width .6s ease"></div>
          </div>
        </div>`;
      }).join('');
    }
    document.getElementById('pyq-papers').textContent='1';
    document.getElementById('pyq-total-q').textContent=data.totalQ||'—';
    document.getElementById('pyq-key-topics').textContent=data.keyTopics||'—';
    document.getElementById('pyq-difficulty').textContent=(data.difficulty||'—').substring(0,3);
  }catch(e){
    console.warn('PYQ analyze error:',e);
    if(topicContainer) topicContainer.innerHTML='<div style="color:#e05050;font-size:13px;padding:8px 0">Could not analyze — try a plain text (.txt) file.</div>';
  }
}

async function generatePYQPractice(){
  if(!pyqText){ showToast('Please upload a PYQ paper first!','error'); return; }
  navigate('quiz');
  document.getElementById('quiz-topic').value='Previous Year Questions';
  document.getElementById('quiz-num').value='10';
  document.getElementById('quiz-type').value='mcq';
  const tempKey='__pyq__';
  uploadedNotes[tempKey]=pyqText;
  await generateQuiz();
  delete uploadedNotes[tempKey];
}

async function startPYQMockTest(){
  if(!pyqText){ showToast('Please upload a PYQ paper first!','error'); return; }

  const section = document.getElementById('pyq-mock-section');
  const cardsEl = document.getElementById('pyq-mock-cards');
  section.style.display = 'block';
  section.scrollIntoView({behavior:'smooth', block:'start'});

  cardsEl.innerHTML = `<div style="grid-column:1/-1;display:flex;align-items:center;gap:10px;color:var(--muted);font-size:13px;padding:20px 0">
    <div style="width:16px;height:16px;border:2px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0"></div>
    Analyzing your PYQ paper and creating mock tests...
  </div>`;

  try{
    const reply = await groq([
      {role:'system', content:'You are an exam analyst. Return ONLY valid JSON, no markdown, no extra text.'},
      {role:'user', content:`Analyze this exam paper and create 3 mock test cards at different difficulty levels:\n\n${pyqText.substring(0,4000)}\n\nReturn ONLY JSON array with exactly 3 items:\n[{"title":"Short topic title (max 4 words)","level":"Easy","questions":10,"minutes":15,"topic":"Full topic description for quiz generation"},{"title":"...","level":"Medium","questions":20,"minutes":30,"topic":"..."},{"title":"...","level":"Hard","questions":25,"minutes":40,"topic":"..."}]`}
    ], 0.3);

    const cards = JSON.parse(reply.replace(/```json|```/g,'').trim());
    const levelClass = {'Easy':'easy','Medium':'medium','Hard':'hard'};

    cardsEl.innerHTML = cards.map(c => `
      <div class="mock-card">
        <span class="mock-card-tag ${levelClass[c.level]||'medium'}">${c.level}</span>
        <div class="mock-card-title">${c.title}</div>
        <div class="mock-card-meta"><span>${c.questions} Questions</span><span>${c.minutes} Minutes</span></div>
        <div class="mock-card-footer">
          <span class="score-badge">PYQ Based</span>
          <button class="start-btn" onclick="startMockTestFromPYQ('${c.topic.replace(/'/g,"\\'")}', ${c.questions})">Start Test</button>
        </div>
      </div>`).join('');

  } catch(e){
    cardsEl.innerHTML = `<div style="grid-column:1/-1;color:#e05050;font-size:13px;padding:12px 0">Could not generate mock tests. Try again!</div>`;
  }
}


// EXAM SIMULATION 
let examQuestions = [];
let examAnswers = {};  
let examTimer = null;
let examSecondsLeft = 0;
let examTitle = '';

async function startMockTestFromPYQ(topic, numQ){
  if(!pyqText){ showToast('Upload a PYQ paper first!','error'); return; }

  // Show overlay with loading state
  document.getElementById('exam-overlay').classList.add('active');
  document.getElementById('exam-title').textContent = topic;
  document.getElementById('exam-meta').textContent = `${numQ} Questions · Generating...`;
  document.getElementById('exam-questions').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:14px;color:var(--muted)">
      <div style="width:36px;height:36px;border:3px solid var(--purple);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>
      <div style="font-size:14px;font-weight:700">Generating your exam from the PYQ paper...</div>
    </div>`;
  document.getElementById('q-grid').innerHTML = '';
  document.getElementById('exam-answered-count').textContent = `0 / ${numQ} answered`;

  // Generate questions from PYQ
  const tempKey = '__pyq__';
  uploadedNotes[tempKey] = pyqText;
  try{
    const reply = await groq([
      {role:'system', content:'You are an exam generator. Return ONLY valid JSON. No markdown, no extra text.'},
      {role:'user', content:`Generate ${numQ} exam questions about "${topic}" from this paper:\n\n${pyqText.substring(0,4000)}\n\nMix of MCQ, True/False and Short Answer. Return ONLY JSON:\n[{"type":"mcq","q":"Question?","opts":["A","B","C","D"],"ans":0},{"type":"tf","q":"Statement.","opts":["True","False"],"ans":0},{"type":"short","q":"Question?","ans":"Model answer."}]`}
    ], 0.4);
    examQuestions = JSON.parse(reply.replace(/```json|```/g,'').trim());
  } catch(e){
    document.getElementById('exam-questions').innerHTML = `<div style="color:#e05050;padding:40px;text-align:center">Failed to generate exam. Please try again.</div>`;
    delete uploadedNotes[tempKey];
    return;
  }
  delete uploadedNotes[tempKey];

  examAnswers = {};
  examTitle = topic;

  // Set timer based on numQ roughly 1.5 min per question
  examSecondsLeft = numQ * 90;
  startExamTimer();

  // Render questions
  renderExamQuestions();
  renderQGrid();

  document.getElementById('exam-title').textContent = topic;
  document.getElementById('exam-meta').textContent = `${examQuestions.length} Questions`;
}

function renderExamQuestions(){
  const container = document.getElementById('exam-questions');
  container.innerHTML = examQuestions.map((q, i) => {
    const type = q.type || 'mcq';
    const opts = q.opts || ['True','False'];
    const optsHTML = type === 'short'
      ? `<textarea class="paste-area" id="exam-short-${i}" style="min-height:70px" placeholder="Type your answer..." oninput="examShortAnswer(${i},this.value)"></textarea>`
      : `<div class="exam-opts">${opts.map((o,j) => `
          <div class="exam-opt" id="eqo-${i}-${j}" onclick="examPickOpt(${i},${j})">
            <span class="exam-opt-letter">${type==='tf'?(j===0?'T':'F'):String.fromCharCode(65+j)}</span>${o}
          </div>`).join('')}</div>`;

    const typeTag = type==='tf' ? '· True/False' : type==='short' ? '· Short Answer' : '';
    return `<div class="exam-q-card" id="eq-${i}">
      <div class="exam-q-num-label">Q${i+1} ${typeTag}</div>
      <div class="exam-q-text">${q.q}</div>
      ${optsHTML}
    </div>`;
  }).join('');
}

function examPickOpt(qi, oi){
  const q = examQuestions[qi];
  const opts = q.opts || ['True','False'];
  // Clear selection
  for(let j=0; j<opts.length; j++){
    document.getElementById(`eqo-${qi}-${j}`)?.classList.remove('selected');
  }
  document.getElementById(`eqo-${qi}-${oi}`)?.classList.add('selected');
  examAnswers[qi] = oi;
  document.getElementById(`eq-${qi}`)?.classList.add('answered');
  updateQGrid();
  updateExamProgress();
}

function examShortAnswer(qi, val){
  if(val.trim()){
    examAnswers[qi] = val;
    document.getElementById(`eq-${qi}`)?.classList.add('answered-short');
  } else {
    delete examAnswers[qi];
    document.getElementById(`eq-${qi}`)?.classList.remove('answered-short');
  }
  updateQGrid();
  updateExamProgress();
}

function renderQGrid(){
  const grid = document.getElementById('q-grid');
  grid.innerHTML = examQuestions.map((_,i) => `
    <div class="q-dot" id="qdot-${i}" onclick="scrollToQ(${i})">${i+1}</div>`).join('');
}

function updateQGrid(){
  examQuestions.forEach((_,i) => {
    const dot = document.getElementById(`qdot-${i}`);
    if(!dot) return;
    dot.className = 'q-dot';
    if(examAnswers[i] !== undefined){
      const type = examQuestions[i].type||'mcq';
      dot.classList.add(type==='short' ? 'answered-short' : 'answered');
    }
  });
  const answered = Object.keys(examAnswers).length;
  document.getElementById('exam-answered-count').textContent = `${answered} / ${examQuestions.length} answered`;
}

function updateExamProgress(){
  const pct = Math.round(Object.keys(examAnswers).length / examQuestions.length * 100);
  document.getElementById('exam-prog').style.width = pct + '%';
}

function scrollToQ(i){
  document.getElementById(`eq-${i}`)?.scrollIntoView({behavior:'smooth', block:'center'});
}

function startExamTimer(){
  clearInterval(examTimer);
  updateTimerDisplay();
  examTimer = setInterval(()=>{
    examSecondsLeft--;
    updateTimerDisplay();
    if(examSecondsLeft <= 0){
      clearInterval(examTimer);
      showToast('⏰ Time is up! Auto-submitting your exam.','warning');
      submitExam();
    }
  }, 1000);
}

function updateTimerDisplay(){
  const m = Math.floor(examSecondsLeft / 60).toString().padStart(2,'0');
  const s = (examSecondsLeft % 60).toString().padStart(2,'0');
  const el = document.getElementById('exam-timer');
  el.textContent = `${m}:${s}`;
  el.className = 'exam-timer';
  if(examSecondsLeft <= 60) el.classList.add('danger');
  else if(examSecondsLeft <= 300) el.classList.add('warning');
}

function confirmExitExam(){
  showConfirm('Exit exam?', 'Your progress will be lost and the exam will end.', exitExam);
}

function exitExam(){
  clearInterval(examTimer);
  document.getElementById('exam-overlay').classList.remove('active');
  examQuestions = []; examAnswers = {};
}

function submitExam(){
  clearInterval(examTimer);
  document.getElementById('exam-overlay').classList.remove('active');

  // Score
  let score = 0; let scorable = 0;
  examQuestions.forEach((q,i) => {
    if((q.type||'mcq') === 'short') return;
    scorable++;
    if(examAnswers[i] === parseInt(q.ans)) score++;
  });

  const pct = scorable > 0 ? Math.round(score/scorable*100) : 0;
  const color = pct>=80?'#2e7d32':pct>=60?'#e07000':'#c62828';
  const emoji = pct>=80?'🏆':pct>=60?'👍':'💪';

  // Track in session stats
  trackQuiz(examTitle, score, scorable||1);

  // Results screen
  const ring = document.getElementById('results-ring');
  ring.style.borderColor = color;
  document.getElementById('results-pct').textContent = pct + '%';
  document.getElementById('results-pct').style.color = color;
  document.getElementById('results-title').textContent = `${emoji} Exam Complete!`;
  document.getElementById('results-subtitle').textContent = `${examTitle} · ${score}/${scorable} correct`;

  // Stats row
  const timeTaken = examTitle ? formatTimeTaken() : '—';
  document.getElementById('results-stats').innerHTML = [
    {label:'Score', val:`${score}/${scorable}`, color},
    {label:'Percentage', val:`${pct}%`, color},
    {label:'Short Answers', val:`${examQuestions.filter(q=>(q.type||'mcq')==='short').length}`},
    {label:'Time Left', val:formatTimeTaken()},
  ].map(s=>`<div style="background:var(--purple-light);border-radius:12px;padding:12px 18px;text-align:center">
    <div style="font-size:20px;font-weight:800;color:${s.color||'var(--active-text)'}"> ${s.val}</div>
    <div style="font-size:11px;font-weight:700;color:var(--muted)">${s.label}</div>
  </div>`).join('');

  // Answer review
  document.getElementById('results-review').innerHTML = examQuestions.map((q,i)=>{
    const type = q.type||'mcq';
    const isShort = type==='short';
    const correct = parseInt(q.ans);
    const chosen = examAnswers[i];
    const isCorrect = !isShort && chosen === correct;
    const cardClass = isShort ? 'short-card' : isCorrect ? 'correct-card' : 'wrong-card';
    const badge = isShort
      ? `<span style="background:#ede8f8;color:var(--active-text);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">Short Answer</span>`
      : isCorrect
        ? `<span style="background:#e8f5e9;color:#1b5e20;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">✓ Correct</span>`
        : `<span style="background:#ffebee;color:#b71c1c;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">✗ Wrong</span>`;

    let answerHTML = '';
    if(isShort){
      answerHTML = `<div style="margin-top:10px;font-size:13px">
        <div style="font-weight:700;color:var(--muted);margin-bottom:4px">Your answer:</div>
        <div style="background:#f4f1f9;border-radius:8px;padding:8px 12px;font-weight:600">${chosen||'<em style="color:var(--muted)">Not answered</em>'}</div>
        <div style="font-weight:700;color:#1b5e20;margin:8px 0 4px">Model answer:</div>
        <div style="background:#e8f5e9;border-radius:8px;padding:8px 12px;font-weight:600;color:#1b5e20">${q.ans}</div>
      </div>`;
    } else {
      const opts = q.opts||['True','False'];
      answerHTML = `<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
        ${opts.map((o,j)=>{
          let bg='#f4f1f9'; let col='var(--text)';
          if(j===correct){bg='#e8f5e9';col='#1b5e20';}
          else if(j===chosen && chosen!==correct){bg='#ffebee';col='#b71c1c';}
          return `<div style="background:${bg};border-radius:8px;padding:8px 12px;font-size:13px;font-weight:600;color:${col}">
            ${String.fromCharCode(65+j)}. ${o} ${j===correct?'✓':''}${j===chosen&&chosen!==correct?'✗':''}
          </div>`;
        }).join('')}
      </div>`;
    }

    return `<div class="review-card ${cardClass}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;font-weight:800;color:var(--purple)">Q${i+1}</span>${badge}
      </div>
      <div style="font-size:14px;font-weight:700;color:var(--text);line-height:1.5">${q.q}</div>
      ${answerHTML}
    </div>`;
  }).join('');

  document.getElementById('exam-results').classList.add('active');
}

function formatTimeTaken(){
  const m = Math.floor(examSecondsLeft/60);
  const s = examSecondsLeft%60;
  return `${m}m ${s}s left`;
}

function closeResults(){
  document.getElementById('exam-results').classList.remove('active');
  navigate('pyq');
}

// CUSTOM DROPDOWN
function toggleDropdown(ddId){
  const dd = document.getElementById(ddId);
  const trigger = dd.previousElementSibling;
  const isOpen = dd.classList.contains('open');
  // Close all dropdowns first
  document.querySelectorAll('.custom-select-dropdown.open').forEach(d => {
    d.classList.remove('open');
    d.previousElementSibling.classList.remove('open');
  });
  if(!isOpen){ dd.classList.add('open'); trigger.classList.add('open'); }
}
function selectOption(inputId, value, labelId, labelText, ddId){
  document.getElementById(inputId).value = value;
  document.getElementById(labelId).textContent = labelText;
  // Mark active
  document.querySelectorAll(`#${ddId} .custom-select-option`).forEach(o => o.classList.remove('active'));
  event.target.classList.add('active');
  // Close
  const dd = document.getElementById(ddId);
  dd.classList.remove('open');
  dd.previousElementSibling.classList.remove('open');
}
// Close dropdown on outside click
document.addEventListener('click', e => {
  if(!e.target.closest('.custom-select')){
    document.querySelectorAll('.custom-select-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.previousElementSibling.classList.remove('open');
    });
  }
});

// REDIRECT TO PYQ WITH TOAST
function redirectToPYQ(){
  // Show toast
  const toast = document.createElement('div');
  toast.textContent = '📄 Upload a PYQ paper to unlock this!';
  toast.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
    background:#3b2a6e;color:white;padding:12px 22px;border-radius:12px;
    font-size:13px;font-weight:700;font-family:var(--font);z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.15);animation:fadeUp .3s ease`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
  // Redirect to PYQ page
  setTimeout(() => navigate('pyq'), 400);
}

// MOCK TESTS
async function startMockTest(topic, numQ){
  navigate('quiz');
  document.getElementById('quiz-topic').value=topic;
  document.getElementById('quiz-num').value=numQ;
  await generateQuiz();
}


// WEEKLY WRAP
async function generateWeeklyWrap(){
  const out=document.getElementById('weekly-wrap-output');
  if(!out) return;
  setLoading(out,'Generating your weekly AI summary...');
  const topicList = [...stats.topicsAsked].join(', ') || 'None yet';
  const scoreList = stats.quizScores.map(q=>`${q.topic}: ${Math.round(q.score/q.total*100)}%`).join(', ') || 'No quizzes taken yet';
  const studyTime = getStudyTime();
  try{
    const reply=await groq([
      {role:'system',content:'You are Ruena, a warm and motivating AI study companion. Write encouraging study session summaries using HTML: <h3>, <p>, <ul>, <li>, <strong>. Be specific, actionable and upbeat. If activity is low, encourage gently.'},
      {role:'user',content:`Generate a study session summary for a student with this actual activity:
- Topics studied: ${topicList}
- Quiz scores: ${scoreList}
- Time spent in app: ${studyTime}
- Streak actions: ${stats.streak}
- Flashcards reviewed: ${stats.flashcardsViewed}

${stats.topicsAsked.size===0 && stats.quizzesTaken===0
  ? 'The student just opened the app and has not studied yet. Warmly welcome them and encourage them to get started!'
  : 'Summarize what they did, highlight strengths, note what to improve, and suggest next steps.'}`}
    ]);
    out.innerHTML=reply;
  }catch(e){
    out.innerHTML=`<div style="color:#e05050">Error: ${e.message}</div>`;
  }
}

// SESSION STATS TRACKER
const stats = {
  startTime: Date.now(),
  topicsAsked: new Set(),
  quizzesTaken: 0,
  quizScores: [],        
  flashcardsViewed: 0,
  streak: 0,             
};

// STREAK SYSTEM —localStorage persisted
const STREAK_KEY = 'ruena_streak';
const TODAY_KEY  = 'ruena_today';

function getStreakData(){
  try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || {days:0, best:0, activeDays:[]}; }
  catch{ return {days:0, best:0, activeDays:[]}; }
}
function saveStreakData(d){ localStorage.setItem(STREAK_KEY, JSON.stringify(d)); }

function getTodayData(){
  const today = new Date().toDateString();
  try {
    const d = JSON.parse(localStorage.getItem(TODAY_KEY));
    if(d && d.date === today) return d;
  } catch{}
  return { date: new Date().toDateString(), activities: 0, streakCounted: false };
}
function saveTodayData(d){ localStorage.setItem(TODAY_KEY, JSON.stringify(d)); }

function trackActivity(){
  const today = getTodayData();
  today.activities = (today.activities || 0) + 1;

  // Count streak once per day when 5 activities hit
  if(today.activities >= 15 && !today.streakCounted){
    today.streakCounted = true;
    const sd = getStreakData();
    sd.days = (sd.days || 0) + 1;
    sd.best = Math.max(sd.best || 0, sd.days);
    // Mark today's weekday
    const dayIdx = (new Date().getDay() + 6) % 7; // Mon=0
    if(!sd.activeDays.includes(dayIdx)) sd.activeDays.push(dayIdx);
    saveStreakData(sd);
    // Fire animation!
    showStreakCelebration(sd.days);
  }
  saveTodayData(today);
  updateStreakCard();
  stats.streak = getStreakData().days;
}

function showStreakCelebration(days){
  // Bounce streak number
  const sc = document.getElementById('streak-count');
  if(sc){ sc.style.transform='scale(1.4)'; setTimeout(()=>sc.style.transform='scale(1)',400); }

  // Random message
  const messages = [
    'Another W 👑',
    "Ruena's proud of you 💜",
    "Ruena sees you winning ✨"
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  // Inject keyframes if not already there
  if(!document.getElementById('streak-styles')){
    const style = document.createElement('style');
    style.id = 'streak-styles';
    style.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(-20px) rotate(0deg) scale(1);   opacity:1; }
        100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity:0; }
      }
      @keyframes popIn {
        0%   { opacity:0; transform:translate(-50%,-50%) scale(.7); }
        60%  { transform:translate(-50%,-50%) scale(1.08); }
        100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
      }
      @keyframes popOut {
        0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
        100% { opacity:0; transform:translate(-50%,-50%) scale(.8); }
      }
    `;
    document.head.appendChild(style);
  }

  // Overlay (dim background slightly)
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;z-index:9998;pointer-events:none;overflow:hidden`;
  document.body.appendChild(overlay);

  // Confetti particles — purple + gold, uneven sizes, from top
  const colors = ['#a78de0','#c4a8f0','#fcd9a0','#f59500','#ede8f5','#e07000','#7a4db5','#fceec7'];
  const shapes = ['●','★','✦','▲','◆','✶'];
  for(let i = 0; i < 60; i++){
    const p = document.createElement('div');
    const size = Math.random() * 18 + 6; // 6–24px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 1.2;
    const duration = Math.random() * 1.5 + 1.5;
    p.textContent = shape;
    p.style.cssText = `
      position:absolute;
      top:-30px;
      left:${left}%;
      font-size:${size}px;
      color:${color};
      animation:confettiFall ${duration}s ease-in ${delay}s forwards;
      pointer-events:none;
      opacity:1;
    `;
    overlay.appendChild(p);
  }

  // Frosted glass popup card
  const card = document.createElement('div');
  card.style.cssText = `
    position:fixed;top:50%;left:50%;
    transform:translate(-50%,-50%) scale(.7);
    z-index:9999;
    background:rgba(255,255,255,0.18);
    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);
    border:1.5px solid rgba(255,255,255,0.4);
    border-radius:28px;
    padding:40px 48px;
    text-align:center;
    box-shadow:0 8px 48px rgba(100,80,160,.25), 0 2px 12px rgba(0,0,0,.08);
    animation:popIn .45s cubic-bezier(.34,1.56,.64,1) forwards;
    min-width:280px;
    font-family:var(--font);
    pointer-events:none;
  `;
  card.innerHTML = `
    <div style="font-size:52px;font-weight:800;color:#e07000;line-height:1;margin-bottom:6px">${days}</div>
    <div style="font-size:18px;font-weight:800;color:#3b2a6e;margin-bottom:10px">Day Streak 🔥</div>
    <div style="font-size:15px;font-weight:700;color:#5a3fa0;opacity:.9">${msg}</div>
  `;
  document.body.appendChild(card);

  // Auto dismiss after 2.8s
  setTimeout(() => {
    card.style.animation = 'popOut .35s ease forwards';
    setTimeout(() => { card.remove(); overlay.remove(); }, 350);
  }, 6000);
}


function updateStreakCard(){
  const sd = getStreakData();
  const td = getTodayData();
  const el = id => document.getElementById(id);
  const n = sd.days || 0;
  const best = sd.best || 0;
  const acts = td.activities || 0;

  if(el('streak-count')) el('streak-count').textContent = n;
  if(el('best-streak-val')) el('best-streak-val').textContent = `${best} Day${best!==1?'s':''} 🏆`;

  // Day dots — only light up days that were actually active this week
  const todayIdx = (new Date().getDay() + 6) % 7;
  for(let i=0;i<7;i++){
    const dot = el(`sd-${i}`);
    if(!dot) continue;
    if(sd.activeDays && sd.activeDays.includes(i)){
      dot.classList.add('done'); dot.textContent = '✓';
    } else if(i === todayIdx && acts > 0){
      dot.classList.add('done'); dot.textContent = '✓';
    } else {
      dot.classList.remove('done'); dot.textContent = '·';
    }
  }

  // Today's activity progress (out of 5)
  const pct = Math.min(Math.round((acts/15)*100), 100);
  if(el('today-bar')) el('today-bar').style.width = pct+'%';
  if(el('today-pct')) el('today-pct').textContent = pct+'%';
  if(el('today-msg')){
    if(acts >= 15) el('today-msg').textContent = `Streak secured today! Amazing work 🔥`;
    else el('today-msg').textContent = `Do ${15-acts} more activit${(15-acts)===1?'y':'ies'} to build your streak!`;
  }
}

// Hook trackActivity into existing trackers
function trackQuiz(topic, score, total){
  stats.quizzesTaken++;
  stats.quizScores.push({topic: topic||'Quiz', score, total});
  saveQuizScoreToBackend(score, total);
  trackActivity();
  updateWrapStats();
}

function trackFlashcards(count){
  stats.flashcardsViewed += count||8;
  trackActivity();
  updateWrapStats();
}

function trackTopic(topic){
  if(topic) stats.topicsAsked.add(topic);
  trackActivity();
  updateWrapStats();
}

function getStudyTime(){
  const mins = Math.floor((Date.now() - stats.startTime) / 60000);
  return mins >= 60 ? `${(mins/60).toFixed(1)}h` : `${mins}m`;
}

function updateWrapStats(){
  const el = id => document.getElementById(id);
  if(el('wrap-study-time')) el('wrap-study-time').textContent = getStudyTime();
  if(el('wrap-topics')) el('wrap-topics').textContent = stats.topicsAsked.size;
  if(el('wrap-quizzes')) el('wrap-quizzes').textContent = stats.quizzesTaken;
  if(el('wrap-flashcards')) el('wrap-flashcards').textContent = stats.flashcardsViewed;
  if(el('wrap-streak-badge')) el('wrap-streak-badge').textContent = `${stats.streak} 🔥`;
  if(el('wrap-avg-score')){
    if(stats.quizScores.length > 0){
      const avg = Math.round(stats.quizScores.reduce((a,q)=>a+(q.score/q.total*100),0)/stats.quizScores.length);
      el('wrap-avg-score').textContent = `Avg score ${avg}%`;
    }
  }
  // Date range
  if(el('wrap-date-range')){
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - ((day+6)%7));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = d => d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    el('wrap-date-range').textContent = `${fmt(mon)} – ${fmt(sun)} · ${stats.streak} Day Streak 🔥`;
  }
  // Quiz scores list
  const scoresEl = document.getElementById('wrap-quiz-scores');
  if(scoresEl && stats.quizScores.length > 0){
    scoresEl.innerHTML = stats.quizScores.slice(-5).reverse().map(q => {
      const pct = Math.round(q.score/q.total*100);
      const bg = pct>=80?'var(--green-card)':pct>=60?'var(--yellow-card)':'#ffebee';
      const col = pct>=80?'#2a6e40':pct>=60?'#6b4f00':'#b71c1c';
      return `<div style="background:#f4f1f9;border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:13px;font-weight:700">${q.topic}</span>
        <span style="background:${bg};color:${col};border-radius:20px;padding:3px 10px;font-size:12px;font-weight:700">${pct}%</span>
      </div>`;
    }).join('');
  }
  // Topic bars
  const topicsEl = document.getElementById('wrap-topic-bars');
  if(topicsEl && stats.topicsAsked.size > 0){
    const topics = [...stats.topicsAsked].slice(-5);
    topicsEl.innerHTML = topics.map((t,i) => `
      <div class="topic-bar"><span class="topic-bar-name">${t}</span>
      <div class="topic-bar-track"><div class="topic-bar-fill" style="width:${100 - i*15}%"></div></div>
      <span class="topic-bar-count">studied</span></div>`).join('');
  }
}

// Init stats display on load
updateCard();
setupPYQUpload();
updateWrapStats();
updateStreakCard();
loadStatsFromBackend().then(data => {
  if(!data) return;
  const el = id => document.getElementById(id);
  if(el('wrap-quizzes')) el('wrap-quizzes').textContent = data.totalQuizzes || 0;
  if(el('wrap-avg-score') && data.avgScore) el('wrap-avg-score').textContent = `Avg score ${data.avgScore}%`;
  // Never override streak from backend — use localStorage
});
