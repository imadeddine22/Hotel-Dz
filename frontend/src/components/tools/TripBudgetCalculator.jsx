'use client';

import { useMemo, useState } from 'react';
import { fmt, NumberField, ResultCard, ToolLayout } from './ToolUI';

export default function TripBudgetCalculator() {
  const [nights, setNights] = useState(5);
  const [people, setPeople] = useState(2);
  const [lodging, setLodging] = useState(8000);
  const [food, setFood] = useState(2500);
  const [transport, setTransport] = useState(12000);
  const [activities, setActivities] = useState(6000);

  const r = useMemo(() => {
    const n = Number(nights) || 0;
    const p = Math.max(1, Number(people) || 1);
    const days = n + 1;
    const stay = n * (Number(lodging) || 0);
    const meals = days * p * (Number(food) || 0);
    const total = stay + meals + (Number(transport) || 0) + (Number(activities) || 0);
    return { stay, meals, total, perPerson: total / p, perDay: total / days };
  }, [nights, people, lodging, food, transport, activities]);

  return (
    <ToolLayout
      inputs={
        <>
          <NumberField label="Nombre de nuits" unit="nuits" value={nights} onChange={setNights} min={1} max={90} />
          <NumberField label="Nombre de voyageurs" unit="pers." value={people} onChange={setPeople} min={1} max={30} />
          <NumberField
            label="Hébergement par nuit"
            unit="DA"
            value={lodging}
            onChange={setLodging}
            step={500}
            help="Prix total de la chambre ou de la maison, pour tout le groupe."
          />
          <NumberField label="Repas par jour et par personne" unit="DA" value={food} onChange={setFood} step={250} />
          <NumberField
            label="Transport aller-retour (total)"
            unit="DA"
            value={transport}
            onChange={setTransport}
            step={1000}
            help="Billets d'avion, de train ou de bus, ou carburant et péages."
          />
          <NumberField label="Activités et visites (total)" unit="DA" value={activities} onChange={setActivities} step={1000} />
        </>
      }
      results={
        <>
          <ResultCard highlight label="Budget total du séjour" value={fmt(r.total)} />
          <ResultCard label="Par personne" value={fmt(r.perPerson)} />
          <ResultCard label="Par jour" value={fmt(r.perDay)} />
          <ResultCard label="Dont hébergement" value={fmt(r.stay)} />
          <ResultCard label="Dont repas" value={fmt(r.meals)} />
        </>
      }
    />
  );
}
