import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PilotShell from '@/components/pilot/PilotShell';
import ResourceLocationPrompt from '@/components/resources/ResourceLocationPrompt';
import ResourceFilters from '@/components/resources/ResourceFilters';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceMapView from '@/components/resources/ResourceMapView';
import { getCurrentUser } from '@/services/serviceUtils';
import { getSavedResources, reportIncorrectResource, saveResource, searchResources, unsaveResource } from '@/services/resourceService';
import { Loader2 } from 'lucide-react';

export default function ResourceHub() {
  const [location, setLocation] = useState(() => JSON.parse(localStorage.getItem('resourceLocation') || 'null'));
  const [category, setCategory] = useState('All');
  const [activeFilters, setActiveFilters] = useState([]);
  const [view, setView] = useState('list');
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const user = userQuery.data;

  const setSearchLocation = (nextLocation) => {
    localStorage.setItem('resourceLocation', JSON.stringify(nextLocation));
    setLocation(nextLocation);
    setQuery(nextLocation.query || nextLocation.label || '');
  };

  const toggleFilter = (filter) => {
    setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  };

  const savedQuery = useQuery({ queryKey: ['saved-resources', user?.email], queryFn: () => getSavedResources(user), enabled: !!user?.email });

  const resourceFilters = useMemo(() => ({
    query,
    location,
    category,
    openNow: activeFilters.includes('Open Now'),
    freeOrLowCost: activeFilters.includes('Free / Low Cost'),
    acceptsMedicaid: activeFilters.includes('Medicaid Accepted'),
    veteranFocused: activeFilters.includes('Veteran Focused'),
    reentryFocused: activeFilters.includes('Reentry Focused'),
    crisisAvailable: activeFilters.includes('Crisis / Emergency'),
    virtualAvailable: activeFilters.includes('Virtual Available'),
  }), [activeFilters, category, location, query]);

  const resourcesQuery = useQuery({ queryKey: ['resources', resourceFilters], queryFn: () => searchResources(resourceFilters) });
  const saved = savedQuery.data || [];
  const displayedResources = activeFilters.includes('Saved')
    ? (resourcesQuery.data || []).filter((resource) => saved.some((item) => item.resource_id === resource.id))
    : resourcesQuery.data || [];

  const saveMutation = useMutation({ mutationFn: (resource) => saveResource(user, resource), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-resources'] }) });
  const unsaveMutation = useMutation({ mutationFn: (resource) => unsaveResource(user, resource), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-resources'] }) });
  const reportMutation = useMutation({ mutationFn: (resource) => reportIncorrectResource(user, resource), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] }) });

  return (
    <PilotShell title="Resources" subtitle="Real imported resources, verified source labels, and honest setup states.">
      <div className="space-y-5">
        {!location && <ResourceLocationPrompt onSetLocation={setSearchLocation} />}

        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/80">National resource database</p>
              <h2 className="mt-2 font-sans text-3xl font-black text-white">{location?.label ? `Resources near ${location.label}` : 'Search imported resources'}</h2>
            </div>
            <button onClick={() => setLocation(null)} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-white">Change location</button>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by ZIP, city, state, category, or resource name" className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500" />
          <div className="mt-5"><ResourceFilters category={category} setCategory={setCategory} activeFilters={activeFilters} toggleFilter={toggleFilter} /></div>
          <div className="mt-5 grid grid-cols-2 rounded-3xl border border-white/12 bg-white/10 p-1">
            <button onClick={() => setView('list')} className={`rounded-3xl py-3 text-sm font-black ${view === 'list' ? 'bg-white text-slate-950' : 'text-white'}`}>List View</button>
            <button onClick={() => setView('map')} className={`rounded-3xl py-3 text-sm font-black ${view === 'map' ? 'bg-white text-slate-950' : 'text-white'}`}>Map View</button>
          </div>
        </section>

        {resourcesQuery.isLoading ? (
          <section className="rounded-[30px] border border-white/12 bg-white/10 p-6 text-center shadow-xl backdrop-blur-2xl"><Loader2 className="mx-auto h-5 w-5 animate-spin" /><p className="mt-2 font-bold text-slate-300">Loading resources...</p></section>
        ) : resourcesQuery.error ? (
          <section className="rounded-[30px] border border-red-300/30 bg-red-400/10 p-6 text-center shadow-xl backdrop-blur-2xl"><h3 className="font-sans text-2xl font-black text-white">Resources could not load</h3><p className="mt-2 text-sm font-bold text-slate-300">{resourcesQuery.error.message}</p></section>
        ) : displayedResources.length === 0 ? (
          <section className="rounded-[30px] border border-white/12 bg-white/10 p-6 text-center shadow-xl backdrop-blur-2xl">
            <h3 className="font-sans text-2xl font-black text-white">No matching resources found</h3>
            <p className="mt-2 text-sm font-bold text-slate-300">Try expanding the search or removing filters. If the database is empty, import resources through Admin Data Management or connect an approved API source.</p>
          </section>
        ) : view === 'map' ? (
          <ResourceMapView resources={displayedResources} />
        ) : (
          <div className="grid gap-4">
            {displayedResources.map((resource) => <ResourceCard key={resource.id} resource={resource} saved={saved.some((item) => item.resource_id === resource.id)} onSave={(item) => saveMutation.mutate(item)} onUnsave={(item) => unsaveMutation.mutate(item)} onReport={(item) => reportMutation.mutate(item)} />)}
          </div>
        )}
      </div>
    </PilotShell>
  );
}