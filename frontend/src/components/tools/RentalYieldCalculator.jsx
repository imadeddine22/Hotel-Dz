'use client';

import { useMemo, useState } from 'react';
import { fmt, fmtPct, NumberField, ResultCard, ToolLayout } from './ToolUI';

export default function RentalYieldCalculator() {
  const [price, setPrice] = useState(15000000);
  const [fees, setFees] = useState(7);
  const [works, setWorks] = useState(800000);
  const [night, setNight] = useState(9000);
  const [occupancy, setOccupancy] = useState(40);
  const [charges, setCharges] = useState(15000);

  const r = useMemo(() => {
    const invest = (Number(price) || 0) * (1 + (Number(fees) || 0) / 100) + (Number(works) || 0);
    const nights = 365 * ((Number(occupancy) || 0) / 100);
    const revenue = nights * (Number(night) || 0);
    const net = revenue - (Number(charges) || 0) * 12;
    return {
      invest,
      nights,
      revenue,
      net,
      gross: invest > 0 ? (revenue / invest) * 100 : NaN,
      netYield: invest > 0 ? (net / invest) * 100 : NaN,
      payback: net > 0 ? invest / net : NaN,
    };
  }, [price, fees, works, night, occupancy, charges]);

  return (
    <ToolLayout
      inputs={
        <>
          <NumberField label="Prix d'achat" unit="DA" value={price} onChange={setPrice} step={100000} />
          <NumberField
            label="Frais d'acquisition"
            unit="%"
            value={fees}
            onChange={setFees}
            step={0.5}
            help="Notaire, enregistrement et publicité foncière : faites confirmer le montant par votre notaire."
          />
          <NumberField label="Travaux et ameublement" unit="DA" value={works} onChange={setWorks} step={50000} />
          <NumberField label="Prix de location par nuit" unit="DA" value={night} onChange={setNight} step={500} />
          <NumberField
            label="Taux d'occupation"
            unit="%"
            value={occupancy}
            onChange={setOccupancy}
            max={100}
            help="Part des nuits louées sur l'année. Plus élevé en été sur le littoral, en hiver dans le Sud."
          />
          <NumberField
            label="Charges mensuelles"
            unit="DA"
            value={charges}
            onChange={setCharges}
            step={1000}
            help="Électricité, eau, gaz, internet, ménage, entretien."
          />
        </>
      }
      results={
        <>
          <ResultCard highlight label="Rendement net annuel" value={fmtPct(r.netYield)} unit="" />
          <ResultCard label="Rendement brut annuel" value={fmtPct(r.gross)} unit="" />
          <ResultCard label="Revenu locatif annuel" value={fmt(r.revenue)} />
          <ResultCard label="Bénéfice net annuel" value={fmt(r.net)} />
          <ResultCard label="Investissement total" value={fmt(r.invest)} />
          <ResultCard
            label="Durée d'amortissement"
            value={Number.isFinite(r.payback) ? r.payback.toFixed(1).replace('.', ',') : '—'}
            unit="ans"
          />
        </>
      }
    />
  );
}
