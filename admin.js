(() => {
  "use strict";
  const CONTENT_KEY = "kiratveerStudioContentV5";
  const ANALYTICS_KEY = "kiratveerStudioAnalyticsV1";
  const clone = value => JSON.parse(JSON.stringify(value));
  const defaults = clone(window.KS_DEFAULTS || {projects:[], references:[], offer:""});
  let content;
  try { content = {...defaults, ...JSON.parse(localStorage.getItem(CONTENT_KEY) || "{}")}; } catch (_) { content = clone(defaults); }
  if (!Array.isArray(content.projects)) content.projects = clone(defaults.projects);
  if (!Array.isArray(content.references)) content.references = clone(defaults.references);
  const $ = selector => document.querySelector(selector);
  const esc = (value = "") => String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  let toastTimer;
  function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2400); }
  function save(message = "Changes saved locally") { localStorage.setItem(CONTENT_KEY, JSON.stringify(content)); render(); toast(message); }

  function renderAnalytics() {
    let analytics = {pageViews:0,sessions:0,events:{},lastVisit:""};
    try { analytics = {...analytics,...JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "{}")}; } catch (_) {}
    const entries = Object.entries(analytics.events || {}).sort((a,b) => b[1]-a[1]);
    const sum = entries.reduce((total,item) => total + item[1], 0);
    const contact = entries.filter(([name]) => name === "cta:contact" || name === "cta:whatsapp" || name === "form:submitted").reduce((n,item) => n + item[1],0);
    const projects = entries.filter(([name]) => name.startsWith("project:")).reduce((n,item) => n + item[1],0);
    $("#metricViews").textContent = analytics.pageViews || 0; $("#metricSessions").textContent = analytics.sessions || 0; $("#metricContact").textContent = contact; $("#metricProjects").textContent = projects; $("#pulseScore").textContent = sum;
    $("#lastVisit").textContent = analytics.lastVisit ? `Last visit ${new Date(analytics.lastVisit).toLocaleString()}` : "No visits tracked yet";
    $("#eventList").innerHTML = entries.length ? entries.map(([name,count]) => `<div class="event-row"><p>${esc(name.replace(/:/g," / "))}</p><strong>${count}</strong></div>`).join("") : '<p class="empty-state">No interactions tracked yet. Open the portfolio and explore it to populate this report.</p>';
  }
  function renderProjects() {
    $("#projectCount").textContent = `${content.projects.length} item${content.projects.length === 1 ? "" : "s"}`;
    $("#projectList").innerHTML = content.projects.length ? content.projects.map((item,index) => `<article class="admin-item"><span class="item-mark" style="--item-color:${esc(item.color || "#333")}">${esc(item.monogram || item.title.slice(0,2))}</span><div><strong>${esc(item.title)}</strong><small>${esc(item.status)}</small></div><div class="item-actions"><button type="button" data-project-move="${index}" data-direction="-1" aria-label="Move ${esc(item.title)} up">↑</button><button type="button" data-project-move="${index}" data-direction="1" aria-label="Move ${esc(item.title)} down">↓</button><button type="button" data-project-edit="${index}" aria-label="Edit ${esc(item.title)}">✎</button><button type="button" data-project-delete="${index}" aria-label="Delete ${esc(item.title)}">×</button></div></article>`).join("") : '<p class="empty-state">No projects yet. Add your first one.</p>';
  }
  function renderReferences() {
    $("#referenceCount").textContent = `${content.references.length} item${content.references.length === 1 ? "" : "s"}`;
    $("#referenceList").innerHTML = content.references.length ? content.references.map((item,index) => `<article class="admin-item"><span class="item-mark" style="--item-color:${esc(item.color || "#333")}">${esc(item.name.replace("@","").slice(0,2).toUpperCase())}</span><div><strong>${esc(item.name)}</strong><small>${esc(item.type)}</small></div><div class="item-actions"><button type="button" data-reference-edit="${index}" aria-label="Edit ${esc(item.name)}">✎</button><button type="button" data-reference-delete="${index}" aria-label="Delete ${esc(item.name)}">×</button></div></article>`).join("") : '<p class="empty-state">No references yet.</p>';
  }
  function render() { renderAnalytics(); renderProjects(); renderReferences(); $("#offerText").value = content.offer || ""; }

  function resetProjectForm() { $("#projectForm").reset(); $("#projectId").value=""; $("#projectColor").value="#171717"; $("#projectFormTitle").textContent="Add new project"; $("#projectMessage").textContent=""; }
  function editProject(index) { const item=content.projects[index]; if(!item)return; $("#projectId").value=index; $("#projectTitle").value=item.title||""; $("#projectStatus").value=item.status||""; $("#projectCategory").value=item.category||""; $("#projectDescription").value=item.description||""; $("#projectUrl").value=item.url||""; $("#projectMonogram").value=item.monogram||""; $("#projectTags").value=(item.tags||[]).join(", "); $("#projectColor").value=item.color||"#171717"; $("#projectImage").value=/^data:/.test(item.image||"")?"":item.image||""; $("#projectFormTitle").textContent=`Edit ${item.title}`; $("#projectForm").scrollIntoView({behavior:"smooth",block:"start"}); }
  async function uploadedImage() { const file=$("#projectUpload").files[0]; if(!file)return ""; if(file.size>1.5*1024*1024) throw new Error("Image must be under 1.5 MB"); return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)}); }
  $("#projectForm").addEventListener("submit", async event => { event.preventDefault(); try { const index=$("#projectId").value; const uploaded=await uploadedImage(); const existing=index!==""?content.projects[Number(index)]:{}; const project={...existing,id:existing.id||`project-${Date.now()}`,title:$("#projectTitle").value.trim(),status:$("#projectStatus").value.trim(),category:$("#projectCategory").value.trim(),description:$("#projectDescription").value.trim(),url:$("#projectUrl").value.trim(),monogram:$("#projectMonogram").value.trim()||$("#projectTitle").value.trim().slice(0,2),tags:$("#projectTags").value.split(",").map(tag=>tag.trim()).filter(Boolean),color:$("#projectColor").value,image:uploaded||$("#projectImage").value.trim()||existing.image||""}; if(index!=="")content.projects[Number(index)]=project;else content.projects.push(project); save(index!==""?"Project updated":"Project added"); resetProjectForm(); } catch(error){$("#projectMessage").textContent=error.message||"Could not save this project.";} });
  $("#projectList").addEventListener("click", event => { const edit=event.target.closest("[data-project-edit]"); const del=event.target.closest("[data-project-delete]"); const move=event.target.closest("[data-project-move]"); if(edit)editProject(Number(edit.dataset.projectEdit)); if(del && confirm(`Delete ${content.projects[Number(del.dataset.projectDelete)]?.title}?`)){content.projects.splice(Number(del.dataset.projectDelete),1);save("Project deleted");resetProjectForm()} if(move){const from=Number(move.dataset.projectMove),to=from+Number(move.dataset.direction);if(to>=0&&to<content.projects.length){[content.projects[from],content.projects[to]]=[content.projects[to],content.projects[from]];save("Project order updated")}} });
  $("#newProject").addEventListener("click",()=>{resetProjectForm();$("#projectForm").scrollIntoView({behavior:"smooth"})}); $("#cancelProject").addEventListener("click",resetProjectForm);

  function resetReferenceForm(){$("#referenceForm").reset();$("#referenceId").value="";$("#referenceColor").value="#d7ff3f";$("#referenceFormTitle").textContent="Add reference";$("#referenceMessage").textContent=""}
  function editReference(index){const item=content.references[index];if(!item)return;$("#referenceId").value=index;$("#referenceName").value=item.name||"";$("#referenceType").value=item.type||"";$("#referenceNote").value=item.note||"";$("#referenceUrl").value=item.url||"";$("#referenceImage").value=item.image||"";$("#referenceColor").value=item.color||"#d7ff3f";$("#referenceFormTitle").textContent=`Edit ${item.name}`;$("#referenceForm").scrollIntoView({behavior:"smooth"})}
  $("#referenceForm").addEventListener("submit",event=>{event.preventDefault();const index=$("#referenceId").value;const item={name:$("#referenceName").value.trim(),type:$("#referenceType").value.trim(),note:$("#referenceNote").value.trim(),url:$("#referenceUrl").value.trim(),image:$("#referenceImage").value.trim(),color:$("#referenceColor").value};if(index!=="")content.references[Number(index)]=item;else content.references.push(item);save(index!==""?"Reference updated":"Reference added");resetReferenceForm()});
  $("#referenceList").addEventListener("click",event=>{const edit=event.target.closest("[data-reference-edit]");const del=event.target.closest("[data-reference-delete]");if(edit)editReference(Number(edit.dataset.referenceEdit));if(del&&confirm(`Delete ${content.references[Number(del.dataset.referenceDelete)]?.name}?`)){content.references.splice(Number(del.dataset.referenceDelete),1);save("Reference deleted");resetReferenceForm()}});$("#cancelReference").addEventListener("click",resetReferenceForm);
  $("#offerForm").addEventListener("submit",event=>{event.preventDefault();content.offer=$("#offerText").value.trim();save("Public offer updated")});
  $("#resetAnalytics").addEventListener("click",()=>{if(confirm("Reset local analytics?")){localStorage.removeItem(ANALYTICS_KEY);renderAnalytics();toast("Analytics reset")}});
  $("#exportContent").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(content,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`kiratveer-studio-content-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url);toast("Content backup exported")});
  $("#importContent").addEventListener("change",async event=>{const file=event.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.projects)||!Array.isArray(parsed.references))throw new Error("Invalid content file");content={...defaults,...parsed};save("Content backup imported")}catch(error){toast(error.message||"Could not import this file")}event.target.value=""});
  $("#resetContent").addEventListener("click",()=>{if(confirm("Restore the original portfolio content?")){content=clone(defaults);localStorage.removeItem(CONTENT_KEY);render();resetProjectForm();resetReferenceForm();toast("Original content restored")}});
  document.querySelectorAll(".sidebar nav a").forEach(link=>link.addEventListener("click",()=>{document.querySelectorAll(".sidebar nav a").forEach(item=>item.classList.remove("active"));link.classList.add("active")}));
  render();
})();
