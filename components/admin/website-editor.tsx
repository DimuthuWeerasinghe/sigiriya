'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useContext, useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Plus, Save, Trash2, Upload } from 'lucide-react';
import { AdminContext } from '@/components/admin/admin-ui';
import { defaultSections, type SavedSection, type SectionId, type Translations } from '@/lib/site/defaults';
import { definition, type Field } from '@/lib/site/schema';

function replaceAt(value: unknown, path: string[], next: unknown): unknown {
  if (!path.length) return next;
  const [head, ...tail] = path;
  if (Array.isArray(value)) return value.map((item,index) => String(index) === head ? replaceAt(item,tail,next) : item);
  const record = value as Record<string, unknown>;
  return { ...record, [head]: replaceAt(record[head],tail,next) };
}
type Language = 'en' | 'si' | 'ta';
type EditorFieldProps = { field: Field; value: unknown; path: string[]; setValue: (path: string[], value: unknown) => void; language: Language; translations: Translations; setTranslation: (text: string, value: string) => void; errors: Record<string,string>; onUpload: (change: number) => void };
function EditorField(props: EditorFieldProps) {
  const { field, value, path, setValue, language, translations, setTranslation, errors, onUpload } = props;
  const { csrfToken } = useContext(AdminContext);
  const [uploading,setUploading] = useState(false);
  const [uploadError,setUploadError] = useState('');
  const inputId = 'content-' + path.join('-');
  const error = errors[path.join('.')];
  const child = (item: Field, data: Record<string,unknown>, childPath: string[]) => <EditorField key={childPath.join('.')} {...props} field={item} value={data[item.key]} path={childPath} />;
  if (field.kind === 'group') return <fieldset className="site-editor-group"><legend>{field.label}</legend>{field.fields!.map(item=>child(item,value as Record<string,unknown>,[...path,item.key]))}</fieldset>;
  if (field.kind === 'list') {
    const items = value as Record<string,unknown>[];
    return <fieldset className="site-editor-list"><legend>{field.label}</legend>{error && <p role="alert" className="admin-field-error">{error}</p>}
      {items.map((item,index)=><details className="site-editor-item" key={index} open={items.length < 3}>
        <summary><span>{index + 1}. {String(item.title ?? item.label ?? item.name ?? field.label)}</span></summary>
        <div className="site-editor-item-controls">
          <button type="button" aria-label={`Move item ${index+1} up`} disabled={index===0} onClick={()=>{const next=[...items];[next[index-1],next[index]]=[next[index],next[index-1]];setValue(path,next);}}><ArrowUp size={14}/>Up</button>
          <button type="button" aria-label={`Move item ${index+1} down`} disabled={index===items.length-1} onClick={()=>{const next=[...items];[next[index+1],next[index]]=[next[index],next[index+1]];setValue(path,next);}}><ArrowDown size={14}/>Down</button>
          <button type="button" disabled={items.length<=1} onClick={()=>setValue(path,items.filter((_,i)=>i!==index))}><Trash2 size={14}/>Remove</button>
        </div>
        <div className="site-editor-item-body">{field.fields!.map(itemField=>child(itemField,item,[...path,String(index),itemField.key]))}</div>
      </details>)}
      <button type="button" className="admin-button admin-button-secondary" disabled={items.length>=40} onClick={()=>setValue(path,[...items,structuredClone((field.defaultValue as unknown[])[0])])}><Plus size={15}/>Add item</button>
    </fieldset>;
  }
  if (field.kind === 'boolean') return <label className="site-editor-toggle"><input type="checkbox" checked={Boolean(value)} onChange={event=>setValue(path,event.target.checked)}/><span>{field.label}</span>{error && <small className="admin-field-error">{error}</small>}</label>;
  const raw = String(value ?? '');
  const translatable = field.kind === 'text' || field.kind === 'textarea';
  const display = language === 'en' || !translatable ? raw : translations[raw]?.[language === 'si' ? 0 : 1] ?? '';
  function change(text: string) { if (language !== 'en' && translatable) setTranslation(raw,text); else setValue(path,text); }
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true); onUpload(1); setUploadError('');
    try {
      const form = new FormData(); form.set('file',file);
      const response = await fetch('/api/admin/website/media',{method:'POST',headers:{'X-CSRF-Token':csrfToken},body:form});
      const result = await response.json() as { url: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Image upload failed.');
      setValue(path,result.url);
    } catch(error) { setUploadError(error instanceof Error ? error.message : 'Image upload failed.'); }
    finally { setUploading(false); onUpload(-1); }
  }
  return <div className={`site-editor-field ${field.kind === 'textarea' || field.kind === 'image' ? 'site-editor-wide' : ''}`}>
    <label htmlFor={inputId}>{field.label}{translatable && language !== 'en' ? ` · ${language === 'si' ? 'සිංහල' : 'தமிழ்'}` : ''}</label>
    {field.kind === 'textarea' ? <textarea id={inputId} rows={field.key === 'message' ? 10 : 4} maxLength={20000} value={display} disabled={language !== 'en' && !raw} onChange={event=>change(event.target.value)} aria-invalid={!!error}/> : field.kind === 'select' ? <select id={inputId} value={raw} onChange={event=>change(event.target.value)}>{field.choices!.map(choice=><option key={choice}>{choice}</option>)}</select> : <input id={inputId} type="text" maxLength={1000} value={display} disabled={translatable && language !== 'en' && !raw} onChange={event=>change(event.target.value)} aria-invalid={!!error}/>}
    {translatable && language !== 'en' && <small className="site-editor-hint">English: {raw || 'Add the English text first.'} · Blank translations use English.</small>}
    {field.kind === 'link' && <small className="site-editor-hint">Use /page, #section, https://…, mailto:… or tel:…. An empty online-service link keeps its status popup.</small>}
    {field.kind === 'image' && <div className="site-image-control">{raw ? <img src={raw} alt="Current image"/> : <div className="site-image-empty">Photo space</div>}<div><label className="admin-button admin-button-secondary"><Upload size={15}/>{uploading?'Uploading…':'Upload image'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={event=>{void upload(event.target.files?.[0]); event.target.value='';}}/></label><small>PNG, JPEG or WebP · up to 2 MB. Uploads are public images. Save the section to apply.</small>{field.key==='photo' && raw && <button type="button" onClick={()=>setValue(path,'')}>Clear photo</button>}</div></div>}
    {(error || uploadError) && <small role="alert" className="admin-field-error">{error || uploadError}</small>}
  </div>;
}
export function WebsiteSectionEditor({ id, initial }: { id: SectionId; initial: SavedSection }) {
  const section = definition(id);
  const { csrfToken } = useContext(AdminContext);
  const [draft,setDraft] = useState(initial);
  const [language,setLanguage] = useState<Language>('en');
  const [dirty,setDirty] = useState(false);
  const [busy,setBusy] = useState(false);
  const [uploads,setUploads] = useState(0);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [errors,setErrors] = useState<Record<string,string>>({});
  useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  function setValue(path:string[], value:unknown) {setDraft(current=>({...current,values:replaceAt(current.values,path,value) as Record<string,unknown>}));setDirty(true);setNotice('');}
  function setTranslation(text:string,value:string) {setDraft(current=>{const pair:[string,string]=[...(current.translations[text]??['',''])];pair[language==='si'?0:1]=value;return {...current,translations:{...current.translations,[text]:pair}};});setDirty(true);setNotice('');}
  async function save(event:FormEvent) {
    event.preventDefault(); if(busy || uploads) return;
    setBusy(true);setError('');setErrors({});setNotice('');
    try {
      const response=await fetch(`/api/admin/website/${id}`,{method:'PUT',headers:{'Content-Type':'application/json','X-CSRF-Token':csrfToken},body:JSON.stringify(draft)});
      const result=await response.json() as SavedSection & { error?: string; fields?: Record<string,string> };
      if(!response.ok){setErrors(result.fields??{});throw new Error(result.error??'Could not save changes.');}
      setDraft(result);setDirty(false);setNotice(`Saved revision ${result.version}. Your changes are now on the website.`);
    }catch(error){setError(error instanceof Error?error.message:'Could not save changes.');}
    finally{setBusy(false);}
  }
  return <>
    <div className="admin-page-heading"><div><a href="/admin/website" className="site-editor-back"><ArrowLeft size={14}/>Website sections</a><h1>{section.label}<span>.</span></h1><p className="admin-muted">Edit this section, then save to update the public website.</p></div><a className="admin-button admin-button-secondary" href={section.preview} target="_blank" rel="noreferrer">View page<ExternalLink size={15}/></a></div>
    {id==='downloads' && <div className="site-editor-related"><Link href="/admin/documents">Manage PDF files →</Link></div>}
    {id==='contact' && <div className="site-editor-related"><Link href="/admin/inbox">Open enquiries & requests →</Link></div>}
    <form onSubmit={save} className="admin-panel site-editor-form">
      <div className="site-editor-toolbar"><div role="group" aria-label="Content language">{([['en','English'],['si','සිංහල'],['ta','தமிழ்']] as const).map(([code,label])=><button key={code} type="button" aria-pressed={language===code} onClick={()=>setLanguage(code)}>{label}</button>)}</div><span>{dirty?'Unsaved changes':`Revision ${draft.version}`}</span></div>
      <fieldset disabled={busy || uploads>0} className="site-editor-fields">{section.fields.map(field=><EditorField key={field.key} field={field} value={draft.values[field.key]} path={[field.key]} setValue={setValue} language={language} translations={draft.translations} setTranslation={setTranslation} errors={errors} onUpload={change=>setUploads(current=>current+change)}/>)}</fieldset>
      <div className="site-editor-save">{error && <p className="admin-field-error" role="alert">{error}</p>}{notice && <p role="status" className="site-editor-success">{notice}</p>}<div><button className="admin-button admin-button-primary" type="submit" disabled={busy || uploads>0 || !dirty}><Save size={16}/>{busy?'Saving…':uploads?'Uploading…':'Save changes'}</button><button type="button" className="admin-button admin-button-secondary" disabled={busy || uploads>0} onClick={()=>{setDraft(current=>({...current,values:structuredClone(defaultSections[id]),translations:{}}));setDirty(true);setNotice('Default content loaded into the editor. Save to apply it.');}}>Load defaults</button></div><small>Each save keeps the previous revision and records the change in the activity log.</small></div>
    </form>
  </>;
}