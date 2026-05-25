import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PilotShell from '@/components/pilot/PilotShell';
import ResourceLocationPrompt from '@/components/resources/ResourceLocationPrompt';
import ResourceFilters from '@/components/resources/ResourceFilters';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceMapView from '@/components/resources/ResourceMapView';
import { defaultLocation, distanceMiles, openStatus } from '@/components/resources/resourceUtils';

export default function ResourceHub() {
  const [location, setLocation] = useState(() => JSON.parse(localStorage.getItem('resourceLocation') || 'null'));
  const [resources, setResources] = useState([]);
  const [saved, setSaved] = useState([]);
  const [category, setCategory] = useState('All');
  const [activeFilters, setActiveFilters] = useState(['Nearby']);
  const [view, setView] = useState('list');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
    base44.entities.LocalResource.list().then(setResources);
  }, []);

  useEffect(() => {
    if (user?.email) base44.entities.SavedLocalResource.filter({ user_email: user.email }).then(setSaved);
  }, [user]);

  const setSearchLocation = (nextLocation) => {
    localStorage.setItem('resourceLocation', JSON.stringify(nextLocation));
    setLocation(nextLocation);
  };

  const toggleFilter = (filter) => {
    setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  };

  const saveResource = async (resource) => {
    if (!user?.email || saved.some((item) => item.resource_id === resource.id)) return;
    const created = await base44.entities.SavedLocalResource.create({ user_email: user.email, resource_id: resource.id, resource_name: resource.name, category: resource.category, address: resource.address, phone: resource.phone, website: resource.website });
    setSaved((current) => [...current, created]);
  };

  const displayedResources = useMemo(() => {
    const origin = location || defaultLocation;
    let list = resources.map((resource) => ({ ...resource, distance: distanceMiles(origin, resource) }));
    if (category !== 'All') list = list.filter((resource) => resource.category === category);
    if (activeFilters.includes('Open Now')) list = list.filter((resource) => openStatus(resource.hours).open);
    if (activeFilters.includes('Saved')) list = list.filter((resource) => saved.some((item) => item.resource_id === resource.id));
    if (activeFilters.includes('Transportation Available')) list = list.filter((resource) => resource.transportation_available);
    if (activeFilters.includes('Medicaid Accepted')) list = list.filter((resource) => resource.accepts_medicaid || resource.medicaid_accepted);
    if (activeFilters.includes('Veterans')) list = list.filter((resource) => resource.veteran_support || resource.veterans);
    if (activeFilters.includes('Free Services')) list = list.filter((resource) => resource.free_service ?? resource.free_services);
    if (activeFilters.includes('Highest Rated')) list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else list.sort((a, b) => a.distance - b.distance);
    return list;
  }, [resources, location, category, activeFilters, saved]);

  return (
    <PilotShell title="Resource Hub" subtitle="Real nearby help for food, shelter, recovery, jobs, legal support, and urgent needs.">
      <div className="space-y-5">
        {!location && <ResourceLocationPrompt onSetLocation={setSearchLocation} />}

        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/80">Survival companion</p>
              <h2 className="mt-2 font-sans text-3xl font-black text-white">Resources near {location?.label || defaultLocation.label}</h2>
            </div>
            <button onClick={() => setLocation(null)} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-white">Change location</button>
          </div>
          <div className="mt-5"><ResourceFilters category={category} setCategory={setCategory} activeFilters={activeFilters} toggleFilter={toggleFilter} /></div>
          <div className="mt-5 grid grid-cols-2 rounded-3xl border border-white/12 bg-white/10 p-1">
            <button onClick={() => setView('list')} className={`rounded-3xl py-3 text-sm font-black ${view === 'list' ? 'bg-white text-slate-950' : 'text-white'}`}>List View</button>
            <button onClick={() => setView('map')} className={`rounded-3xl py-3 text-sm font-black ${view === 'map' ? 'bg-white text-slate-950' : 'text-white'}`}>Map View</button>
          </div>
        </section>

        {displayedResources.length === 0 ? (
          <section className="rounded-[30px] border border-white/12 bg-white/10 p-6 text-center shadow-xl backdrop-blur-2xl">
            <h3 className="font-sans text-2xl font-black text-white">No nearby resources found</h3>
            <p className="mt-2 text-sm font-bold text-slate-300">Try searching Somerset, New Brunswick, Edison, Plainfield, or Newark.</p>
          </section>
        ) : view === 'map' ? (
          <ResourceMapView resources={displayedResources} />
        ) : (
          <div className="grid gap-4">
            {displayedResources.map((resource) => <ResourceCard key={resource.id} resource={resource} saved={saved.some((item) => item.resource_id === resource.id)} onSave={saveResource} />)}
          </div>
        )}
      </div>
    </PilotShell>
  );
}