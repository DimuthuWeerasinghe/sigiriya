import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { getSession } from '@/lib/admin/server';
import { listWebsiteSections } from '@/lib/site/server';
import { definition } from '@/lib/site/schema';

export default async function WebsiteSectionsPage() {
  if (!await getSession(new Headers(await headers()))) redirect('/admin/login');
  const sections = await listWebsiteSections();
  return <><div className="admin-page-heading"><div><p className="admin-eyebrow">PUBLIC WEBSITE</p><h1>Website sections<span>.</span></h1><p className="admin-muted">Manage the words, photographs, links and visibility of every homepage section.</p></div><a className="admin-button admin-button-secondary" href="/" target="_blank" rel="noreferrer">View website<ArrowUpRight size={16}/></a></div><div className="site-section-grid">{sections.map((section,index)=><Link key={section.id} className="admin-panel site-section-card" href={`/admin/website/${section.id}`}><span className="site-section-number">{String(index+1).padStart(2,'0')}</span><h2>{section.label}</h2><p>{section.visible?'Visible':'Hidden'} · {section.version?`Revision ${section.version}`:'Default content'}</p><span>Edit section <ArrowUpRight size={15}/></span><small>{definition(section.id).preview}</small></Link>)}</div></>;
}