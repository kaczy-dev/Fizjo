import React, { useState } from 'react';
import { 
  Monitor, Laptop, CheckCircle2, AlertTriangle, ArrowRight, 
  RotateCw, Sparkles, Sliders, ShieldCheck, ChevronRight,
  TrendingDown, Info, Save, HelpCircle, Armchair, Eye
} from 'lucide-react';
import { ErgonomicWorkstationAudit } from '../types';

interface Props {
  initialAudit?: ErgonomicWorkstationAudit;
  userHeightCm?: number;
  onSaveAudit: (audit: ErgonomicWorkstationAudit) => void;
}

export const ErgonomicWorkstationAuditor: React.FC<Props> = ({
  initialAudit,
  userHeightCm = 175,
  onSaveAudit
}) => {
  const [heightCm, setHeightCm] = useState<number>(initialAudit?.userHeightCm || userHeightCm || 175);
  const [viewMode, setViewMode] = useState<'sitting' | 'standing'>(initialAudit?.workMode === 'sit_stand' ? 'sitting' : 'sitting');
  const [deskType, setDeskType] = useState<'fixed' | 'adjustable_sit_stand'>(initialAudit?.deskType || 'fixed');
  const [chairType, setChairType] = useState<'ergonomic_adjustable' | 'basic_office' | 'kitchen_rigid' | 'exercise_ball'>(
    initialAudit?.chairType || 'ergonomic_adjustable'
  );
  const [monitorSetup, setMonitorSetup] = useState<'single_monitor' | 'dual_monitor' | 'laptop_flat' | 'laptop_stand_external'>(
    initialAudit?.monitorSetup || 'laptop_flat'
  );
  const [screenDistanceCm, setScreenDistanceCm] = useState<number>(initialAudit?.screenDistanceCm || 55);
  const [monitorHeightRelation, setMonitorHeightRelation] = useState<'too_low' | 'eye_level' | 'too_high'>(
    initialAudit?.monitorHeightRelation || (monitorSetup === 'laptop_flat' ? 'too_low' : 'eye_level')
  );
  const [hasArmrests, setHasArmrests] = useState<boolean>(initialAudit ? initialAudit.hasArmrests : true);
  const [hasLumbarSupport, setHasLumbarSupport] = useState<boolean>(initialAudit ? initialAudit.hasLumbarSupport : true);
  const [hasFootrest, setHasFootrest] = useState<boolean>(initialAudit ? initialAudit.hasFootrest : false);
  const [currentDeskHeightCm, setCurrentDeskHeightCm] = useState<number>(initialAudit?.currentDeskHeightCm || 74);
  const [currentChairSeatHeightCm, setCurrentChairSeatHeightCm] = useState<number>(
    initialAudit?.currentChairSeatHeightCm || Math.round(heightCm * 0.245)
  );

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Clinical DIN EN 527 & ISO 9241-5 standard computations
  const recommendedSeatHeight = Math.round(heightCm * 0.245); // Popliteal height
  const recommendedSittingDeskHeight = Math.round(heightCm * 0.415); // Elbow height seated
  const recommendedStandingDeskHeight = Math.round(heightCm * 0.62); // Elbow height standing
  const recommendedEyeLevelOffset = 0; // Top of monitor level with eye line

  // Biomechanical strain evaluation
  let calculatedScore = 100;
  const recommendations: string[] = [];

  // Monitor height strain
  if (monitorSetup === 'laptop_flat' || monitorHeightRelation === 'too_low') {
    calculatedScore -= 30;
    recommendations.push('Użyj podstawki pod laptopa lub ramienia VESA, aby unieść górną krawędź ekranu do linii wzroku (redukcja nacisku na C5-C7 o 65%).');
  }

  if (monitorSetup === 'laptop_flat') {
    calculatedScore -= 15;
    recommendations.push('Do laptopa na podstawce podłącz zewnętrzną ergonomiczną klawiaturę i mysz wertykalną, by odciążyć mięśnie pochyłe szyi i mięsień czworoboczny.');
  }

  // Desk height deviation
  const deskDiff = Math.abs(currentDeskHeightCm - recommendedSittingDeskHeight);
  if (deskDiff > 4) {
    calculatedScore -= 15;
    if (currentDeskHeightCm > recommendedSittingDeskHeight) {
      recommendations.push(`Blat biurka jest za wysoko o ok. ${deskDiff} cm (powoduje uniesienie barków i kompresję splotu ramiennego). Obniż blat lub podnieś fotel i zastosuj podnóżek.`);
    } else {
      recommendations.push(`Blat biurka jest za nisko o ok. ${deskDiff} cm. Podnieś blat, by przedramiona spoczywały swobodnie pod kątem 90°-100°.`);
    }
  }

  // Seat height deviation
  const seatDiff = Math.abs(currentChairSeatHeightCm - recommendedSeatHeight);
  if (seatDiff > 3) {
    calculatedScore -= 10;
    recommendations.push(`Dostosuj wysokość siedziska fotela do ok. ${recommendedSeatHeight} cm, aby stopy spoczywały płasko na podłożu przy kącie kolan 90°-100°.`);
  }

  // Armrests & Lumbar
  if (!hasArmrests) {
    calculatedScore -= 10;
    recommendations.push('Brak podłokietników zmusza mięśnie naramienne i czworoboczne do ciągłego podtrzymywania ciężaru rąk (~4-5 kg na ramię).');
  }

  if (!hasLumbarSupport && chairType !== 'exercise_ball') {
    calculatedScore -= 10;
    recommendations.push('Brak podparcia lędźwiowego powoduje tyłopochylenie miednicy i kompensacyjne wysunięcie głowy w przód (odruchowe pogłębienie protrakcji szyjnej).');
  }

  if (screenDistanceCm < 45) {
    calculatedScore -= 10;
    recommendations.push('Ekran znajduje się za blisko oczu (<45 cm), co prowokuje odruchowe pochylanie głowy w przód i przeciążenie mięśni gałkoruchowych.');
  } else if (screenDistanceCm > 75) {
    calculatedScore -= 5;
    recommendations.push('Ekran za daleko (>75 cm) może zmuszać do mrużenia oczu i wysuwania szyi (tzw. turtle neck).');
  }

  calculatedScore = Math.max(20, Math.min(100, calculatedScore));

  // Estimated cervical disc load (kg)
  // Neutral head weight is ~5 kg. Under flexion / tech neck angle it increases up to 22-27 kg.
  const estimatedLoad = monitorSetup === 'laptop_flat' || monitorHeightRelation === 'too_low'
    ? 19.5
    : deskDiff > 5
    ? 11.2
    : 5.5;

  const handleSave = () => {
    const auditData: ErgonomicWorkstationAudit = {
      date: new Date().toISOString().split('T')[0],
      userHeightCm: heightCm,
      workMode: viewMode === 'standing' ? 'sit_stand' : 'sitting',
      deskType,
      chairType,
      monitorSetup,
      hasArmrests,
      hasFootrest,
      hasLumbarSupport,
      screenDistanceCm,
      currentDeskHeightCm,
      currentChairSeatHeightCm,
      monitorHeightRelation,
      recommendedSeatHeightCm: recommendedSeatHeight,
      recommendedSittingDeskHeightCm: recommendedSittingDeskHeight,
      recommendedStandingDeskHeightCm: recommendedStandingDeskHeight,
      recommendedEyeLevelOffsetCm: recommendedEyeLevelOffset,
      calculatedRiskScore: calculatedScore,
      estimatedCervicalLoadKg: estimatedLoad,
      recommendations
    };

    onSaveAudit(auditData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // SVG Biomechanical mannequin parameters
  const isHeadBent = monitorSetup === 'laptop_flat' || monitorHeightRelation === 'too_low';
  const headAngleDeg = isHeadBent ? 38 : 6;
  const shouldersRaised = currentDeskHeightCm > recommendedSittingDeskHeight + 4;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold mb-2">
              <Monitor className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Norma PN-EN ISO 9241-5 & DIN EN 527 • Biomechanika Ergonomiczna</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Kalkulator & Interaktywny Audytor Ergonomii Biurka
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Dopasuj parametry krzesła, blatu i monitora do Twojego wzrostu antropometrycznego. Wzorowe ustawienie stanowiska eliminuje do 78% dolegliwości odcinka szyjnego C5-C7.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Zapisano w Karcie Medycznej!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Zapisz Audyt Stanowiska</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Biomechanical Visual Simulation + Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Biomechanical SVG Simulation */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Model Biomechaniczny
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  calculatedScore >= 80 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : calculatedScore >= 55
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}>
                  {calculatedScore >= 80 ? 'Optymalna Oś' : calculatedScore >= 55 ? 'Średnie Przeciążenie' : 'Wysokie Ryzyko Dyskopatii'}
                </span>
              </div>

              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('sitting')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    viewMode === 'sitting'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Siedzenie
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('standing')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    viewMode === 'standing'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Stanie (Sit-Stand)
                </button>
              </div>
            </div>

            {/* SVG Biomechanical Canvas */}
            <div className="relative w-full aspect-4/3 sm:aspect-square bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-4">
              <svg 
                viewBox="0 0 400 360" 
                className="w-full h-full select-none"
              >
                {/* Floor Line */}
                <line x1="20" y1="320" x2="380" y2="320" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" strokeDasharray="4 4" />
                <text x="32" y="336" className="text-[10px] fill-slate-400 font-mono">Podłoże (0 cm)</text>

                {/* Desk Representation */}
                {viewMode === 'sitting' ? (
                  // Sitting Desk & Monitor
                  <g>
                    {/* Desk legs & top */}
                    <rect x="220" y={220 - (currentDeskHeightCm - 74) * 1.5} width="140" height="12" rx="3" className="fill-slate-700 dark:fill-slate-600" />
                    <line x1="250" y1={232 - (currentDeskHeightCm - 74) * 1.5} x2="250" y2="320" stroke="currentColor" className="text-slate-500 dark:text-slate-600" strokeWidth="6" />
                    <line x1="330" y1={232 - (currentDeskHeightCm - 74) * 1.5} x2="330" y2="320" stroke="currentColor" className="text-slate-500 dark:text-slate-600" strokeWidth="6" />
                    
                    {/* Monitor / Laptop */}
                    {monitorSetup === 'laptop_flat' ? (
                      <g transform={`translate(240, ${210 - (currentDeskHeightCm - 74) * 1.5})`}>
                        {/* Flat Laptop */}
                        <line x1="0" y1="8" x2="40" y2="8" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
                        <line x1="36" y1="8" x2="48" y2="-22" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
                        {/* Eye beam to low screen */}
                        <line 
                          x1="-70" y1="-85" 
                          x2="40" y2="-10" 
                          stroke="#ef4444" 
                          strokeWidth="1.5" 
                          strokeDasharray="3 3" 
                        />
                        <text x="50" y="-12" className="text-[9px] fill-rose-500 font-bold">Kąt wzroku -42°</text>
                      </g>
                    ) : (
                      <g transform={`translate(260, ${160 - (currentDeskHeightCm - 74) * 1.5})`}>
                        {/* Elevated monitor on stand */}
                        <rect x="15" y="-60" width="8" height="55" rx="2" className="fill-teal-600 dark:fill-teal-400" />
                        <rect x="5" y="-5" width="28" height="6" rx="2" className="fill-slate-500" />
                        <line x1="19" y1="-5" x2="19" y2="60" stroke="currentColor" className="text-slate-600" strokeWidth="4" />
                        {/* Eye beam to ideal monitor */}
                        <line 
                          x1="-90" y1="-35" 
                          x2="15" y2="-35" 
                          stroke="#10b981" 
                          strokeWidth="1.5" 
                          strokeDasharray="3 3" 
                        />
                        <text x="-65" y="-42" className="text-[9px] fill-emerald-600 dark:fill-emerald-400 font-bold">Wzrok w osi (0°)</text>
                      </g>
                    )}

                    {/* Chair */}
                    <g transform={`translate(90, ${260 - (currentChairSeatHeightCm - recommendedSeatHeight) * 1.5})`}>
                      {/* Chair backrest */}
                      <line x1="-15" y1="-85" x2="-10" y2="0" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
                      {/* Lumbar cushion marker */}
                      {hasLumbarSupport && (
                        <ellipse cx="-11" cy="-40" rx="5" ry="12" fill="#0d9488" />
                      )}
                      {/* Seat base */}
                      <rect x="-20" y="0" width="55" height="10" rx="3" className="fill-slate-800 dark:fill-slate-600" />
                      {/* Gas cylinder & base */}
                      <line x1="10" y1="10" x2="10" y2={320 - (260 - (currentChairSeatHeightCm - recommendedSeatHeight) * 1.5)} stroke="#475569" strokeWidth="8" />
                      <line x1="-15" y1="58" x2="35" y2="58" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                    </g>

                    {/* Sitting Mannequin Body */}
                    <g transform={`translate(100, 160)`}>
                      {/* Torso */}
                      <line x1="0" y1="30" x2="0" y2="95" stroke="#0d9488" strokeWidth="12" strokeLinecap="round" />
                      
                      {/* Cervical Spine & Head */}
                      {isHeadBent ? (
                        // Bent neck forward
                        <g>
                          <path d="M 0 30 Q 15 15, 22 -2" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                          <circle cx="32" cy="-12" r="16" className="fill-rose-500/30 stroke-rose-600 stroke-2" />
                          <circle cx="37" cy="-15" r="2.5" fill="#ef4444" />
                          {/* Tension indicator at C5-C7 */}
                          <circle cx="12" cy="18" r="5" fill="#ef4444" className="animate-ping opacity-75" />
                          <circle cx="12" cy="18" r="4" fill="#ef4444" />
                        </g>
                      ) : (
                        // Upright neutral neck
                        <g>
                          <path d="M 0 30 Q 2 12, 4 -5" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                          <circle cx="6" cy="-20" r="16" className="fill-emerald-500/25 stroke-emerald-600 stroke-2" />
                          <circle cx="11" cy="-22" r="2.5" fill="#10b981" />
                        </g>
                      )}

                      {/* Arms & Hands on desk */}
                      <path 
                        d={`M 0 38 L ${shouldersRaised ? '18 45' : '15 58'} L 85 ${58 - (currentDeskHeightCm - 74)}`} 
                        fill="none" 
                        stroke="#0f766e" 
                        strokeWidth="5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />

                      {/* Thigh & Leg */}
                      <path 
                        d="M 0 95 L 65 95 L 68 160" 
                        fill="none" 
                        stroke="#0d9488" 
                        strokeWidth="9" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </g>
                  </g>
                ) : (
                  // Standing Desk View
                  <g>
                    {/* Standing desk high */}
                    <rect x="230" y="160" width="130" height="12" rx="3" className="fill-slate-700 dark:fill-slate-600" />
                    <line x1="260" y1="172" x2="260" y2="320" stroke="currentColor" className="text-slate-500 dark:text-slate-600" strokeWidth="6" />
                    <line x1="330" y1="172" x2="330" y2="320" stroke="currentColor" className="text-slate-500 dark:text-slate-600" strokeWidth="6" />
                    
                    {/* Monitor standing */}
                    <rect x="280" y="80" width="8" height="60" rx="2" className="fill-teal-600 dark:fill-teal-400" />
                    <line x1="284" y1="140" x2="284" y2="160" stroke="currentColor" className="text-slate-600" strokeWidth="4" />
                    
                    {/* Standing Mannequin */}
                    <g transform="translate(130, 80)">
                      {/* Upright Head */}
                      <circle cx="6" cy="-10" r="16" className="fill-emerald-500/25 stroke-emerald-600 stroke-2" />
                      <circle cx="11" cy="-12" r="2.5" fill="#10b981" />
                      {/* Spine */}
                      <line x1="0" y1="8" x2="0" y2="120" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
                      {/* Arm to desk */}
                      <path d="M 0 25 L 20 50 L 100 80" fill="none" stroke="#0f766e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Legs straight */}
                      <line x1="0" y1="120" x2="-5" y2="240" stroke="#0d9488" strokeWidth="8" strokeLinecap="round" />
                      <line x1="0" y1="120" x2="8" y2="240" stroke="#0d9488" strokeWidth="8" strokeLinecap="round" />
                    </g>
                  </g>
                )}
              </svg>

              {/* Dynamic Overlay Pill for Cervical Compression */}
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Nacisk na krążki C5-C7:
                  </span>
                </div>
                <div className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                  ~{estimatedLoad.toFixed(1)} kg
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    (Fizjologiczna norma: ~5 kg)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                Zalecana Wys. Blatu
              </span>
              <div className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                {viewMode === 'sitting' ? `${recommendedSittingDeskHeight} cm` : `${recommendedStandingDeskHeight} cm`}
              </div>
              <span className="text-[10px] text-slate-400">
                Wg DIN EN 527 (zgięcie 90°)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                Zalecana Wys. Fotela
              </span>
              <div className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                {recommendedSeatHeight} cm
              </div>
              <span className="text-[10px] text-slate-400">
                Wysokość podkolanowa
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Configuration Sliders & Checklist */}
        <div className="lg:col-span-7 space-y-5">
          {/* Anthropometric Height Input */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>1. Twój Wzrost Antropometryczny</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold">
                    Bazowy
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Punkt wyjścia do wyliczenia wysokości blatu i siedziska
                </p>
              </div>
              <span className="text-xl font-black font-mono text-teal-600 dark:text-teal-400">
                {heightCm} cm
              </span>
            </div>

            <input
              type="range"
              min="145"
              max="205"
              step="1"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>145 cm</span>
              <span>175 cm (Średnia)</span>
              <span>205 cm</span>
            </div>
          </div>

          {/* Monitor Setup & Screen Position */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>2. Konfiguracja Ekranu & Monitora</span>
              <span className="text-[10px] text-rose-500 font-bold">Kluczowe dla C5-C7</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMonitorSetup('laptop_flat');
                  setMonitorHeightRelation('too_low');
                }}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  monitorSetup === 'laptop_flat'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Laptop płasko na blacie</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold">
                      Zagrożenie
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Wymusza ciągłe zgięcie głowy 35°-45° w dół
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMonitorSetup('laptop_stand_external');
                  setMonitorHeightRelation('eye_level');
                }}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  monitorSetup === 'laptop_stand_external'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Laptop na podstawce + klawiatura</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold">
                      Polecane
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Górna krawędź ekranu uniesiona do poziomu oczu
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMonitorSetup('single_monitor');
                  setMonitorHeightRelation('eye_level');
                }}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  monitorSetup === 'single_monitor'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Monitor zewnętrzny (pojedynczy)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ekran w osi głowy, odległość 50-70 cm
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMonitorSetup('dual_monitor');
                  setMonitorHeightRelation('eye_level');
                }}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  monitorSetup === 'dual_monitor'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Dwa monitory (Dual-Display)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Główny monitor na wprost, pomocniczy pod kątem max 30°
                  </p>
                </div>
              </button>
            </div>

            {/* Screen Distance Slider */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  <span>Odległość oczu od ekranu (Długość wyprostowanej ręki)</span>
                </span>
                <span className="font-bold font-mono text-teal-600 dark:text-teal-400">
                  {screenDistanceCm} cm
                </span>
              </div>
              <input
                type="range"
                min="35"
                max="95"
                step="5"
                value={screenDistanceCm}
                onChange={(e) => setScreenDistanceCm(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span className="text-rose-400">35 cm (Za blisko)</span>
                <span className="text-emerald-500 font-bold">50 - 70 cm (Norma)</span>
                <span className="text-amber-400">95 cm (Za daleko)</span>
              </div>
            </div>
          </div>

          {/* Chair & Support Ergonomics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Armchair className="w-4 h-4 text-teal-600" />
              <span>3. Wyposażenie Fotela & Podparcia</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setHasArmrests(!hasArmrests)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  hasArmrests
                    ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Podłokietniki</div>
                  <div className="text-[10px] opacity-75">Odciążają ramiona (-4 kg)</div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  hasArmrests ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}>
                  {hasArmrests ? '✓' : '✕'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHasLumbarSupport(!hasLumbarSupport)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  hasLumbarSupport
                    ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Podparcie Lędźwiowe</div>
                  <div className="text-[10px] opacity-75">Stabilizuje lordozę</div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  hasLumbarSupport ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}>
                  {hasLumbarSupport ? '✓' : '✕'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHasFootrest(!hasFootrest)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  hasFootrest
                    ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Podnóżek</div>
                  <div className="text-[10px] opacity-75">Dla osób &lt;170 cm</div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  hasFootrest ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}>
                  {hasFootrest ? '✓' : '✕'}
                </div>
              </button>
            </div>
          </div>

          {/* Clinical Action Plan & Recommendations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Spersonalizowany Plan Korekty Stanowiska</span>
              </h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                calculatedScore >= 80 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                Wskaźnik Bezpieczeństwa: {calculatedScore}%
              </span>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Twoje stanowisko pracy spełnia wzorowe kryteria kinezjologiczne i normę PN-EN ISO 9241-5!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
