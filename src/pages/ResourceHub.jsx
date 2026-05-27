import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PilotShell from '@/components/pilot/PilotShell';
import ResourceLocationPrompt from '@/components/resources/ResourceLocationPrompt';
import ResourceFilters from '@/components/resources/ResourceFilters';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceMapView from '@/components/resources/ResourceMapView';
import { defaultLocation, distanceMiles, openStatus } from '@/components/resources/resourceUtils';
import { pilotResources } from '@/lib/pilotSeedData';

export default function ResourceHub() {
  const routeLocation = useLocation();
  const [location, setLocation] = useState(() => JSON.parse(localStorage.getItem('resourceLocation') || 'null'));
  const [resources, setResources] = useState([]);
  const [saved, setSaved] = useState([]);
  const [category, setCategory] = useState('All');
  const [activeFilters, setActiveFilters] = useState(['Nearby']);
  const [view, setView] = useState('list');
  const [user, setUser] = useState(null);
  const [seedMessage, setSeedMessage] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    base44.entities.LocalResource.list().then((rows) => setResources(rows.length ? rows : pilotResources)).catch(() => setResources(pilotResources));
  }, []);

  useEffect(() => {
    const requestedCategory = new URLSearchParams(routeLocation.search).get('category');
    if (requestedCategory) setCategory(requestedCategory);
  }, [routeLocation.search]);

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

  const seedBackend = async () => {
    try {
      setSeedMessage('Syncing pilot resources...');
      const response = await base44.functions.invoke('seedPilotData', {});
      setSeedMessage(`Pilot catalog synced: ${response.data?.summary?.resources || 0} new resources added.`);
      const rows = await base44.entities.LocalResource.list();
      setResources(rows.length ? rows : pilotResources);
    } catch {
      setSeedMessage('Pilot catalog is available locally; sign in as staff to sync backend collections.');
    }
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
              {seedMessage && <p className="mt-2 text-sm font-black text-emerald-100">{seedMessage}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={seedBackend} className="rounded-full border border-amber-200/25 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-100">Sync pilot data</button>
              <button onClick={() => setLocation(null)} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-white">Change location</button>
            </div>
          </div>
          <div className="mt-5"><ResourceFilters category={category} setCategory={setCategory} activeFilters={activeFilters} toggleFilter={toggleFilter} /></div>
          <div className="mt-5 grid grid-cols-2 rounded-3xl border border-white/12 bg-white/10 p-1">
            <button onClick={() => setView('list')} className={`rounded-3xl py-3 text-sm font-black ${view === 'list' ? 'bg-white text-slate-950' : 'text-white'}`}>List View</button>
            <button onClick={() => setView('map')} className={`rounded-3xl py-3 text-sm font-black ${view === 'map' ? 'bg-white text-slate-950' : 'text-white'}`}>Map View</button>
          </div>
        </section>

        {displayedResources.length === 0 ? (
          <div className="grid gap-4">
            {pilotResources.slice(0, 3).map((resource) => <ResourceCard key={resource.id} resource={{ ...resource, distance: distanceMiles(location || defaultLocation, resource) }} saved={saved.some((item) => item.resource_id === resource.id)} onSave={saveResource} />)}
          </div>
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