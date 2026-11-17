import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Droplets, Dumbbell, Utensils, Bot, Settings, 
  CheckCircle2, Circle, Play, Pause, RotateCcw, Plus, 
  Coffee, AlertTriangle, ShieldCheck, Calendar, TrendingDown,
  Bell, Database, Key, Copy, Check, Send, Video, Flame
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SABİT VERİLER: PROGRAM, VİDEOLAR VE BESLENME ---
const PHYSIO_EXERCISES = [
  {
    id: 'physio_1',
    name: 'Kuadriseps İzometrik Sıkıştırma (Havlulu)',
    target: 'Sol Diz (Menisküs)',
    sets: '3 Set x 12 Tekrar (6 sn tut)',
    timerSec: 6,
    note: 'Diz altındaki rulo havluyu aşağı bastır, üst bacak kasını sık ve 6 sn sabit tut.',
    videoId: '85Aj0TruKcE'
  },
  {
    id: 'physio_2',
    name: 'Düz Bacak Kaldırma (Straight Leg Raise)',
    target: 'Sol Diz Çevresi',
    sets: '3 Set x 15 Tekrar',
    timerSec: 5,
    note: 'Sol dizini hiç bükmeden, parmak ucunu kendine çekerek 30-40 cm kaldır.',
    videoId: 'z681N2cb5KU'
  },
  {
    id: 'physio_3',
    name: 'Düz Zeminde İzometrik Calf Raise',
    target: 'Sağ & Sol Aşil (Haglund)',
    sets: '3 Set x 25 Saniye Sabit',
    timerSec: 25,
    note: 'MUTLAKA düz zeminde yap. Çok aşırı yükselmeden orta seviyede 25 sn bekle.',
    videoId: 'isVPZTr5iXk'
  },
  {
    id: 'physio_4',
    name: 'El Bileği Fleksiyon & Ekstansiyon',
    target: 'Sağ El Bileği',
    sets: '2 Set x 15 Tekrar',
    timerSec: 30,
    note: 'Çok hafif (1-2 kg) ağırlıkla ön kolu destekleyerek yavaşça bük.',
    videoId: 'M8TpHw5aYgA'
  }
];

const WORKOUT_DAYS = {
  Pazartesi: {
    title: 'Üst Vücut A (İtiş & Çekiş) + Hafif Yürüyüş',
    focus: 'Göğüs, Sırt & Metabolizma',
    exercises: [
      { id: 'mon_1', name: 'Push-up Bar ile Şınav', sets: '3 Set x Maks', timerSec: 45, note: 'Bilekler tamamen düz. Zorlanırsan dizler yerde.', videoId: 'ik8q1YBkzCw' },
      { id: 'mon_2', name: 'Dumbbell Floor Press', sets: '4 Set x 10-12', timerSec: 60, note: 'Dirsekler yere değdiği an dur ve yukarı it.', videoId: 'Fk1lGJse0ho' },
      { id: 'mon_3', name: 'One-Arm Dumbbell Row', sets: '4 Set x 10-12', timerSec: 60, note: 'Dirseği geriye, kalçaya doğru çek.', videoId: 'K1SPOiwe6FU' },
      { id: 'mon_4', name: 'Dumbbell Pullover', sets: '3 Set x 12', timerSec: 45, note: 'Ağırlığı yüz hizasına kadar çekip gerilimi koru.', videoId: 'Datv2L6t3-4' }
    ]
  },
  Salı: {
    title: 'Alt Vücut (45° Diz Dostu) & Core',
    focus: 'Bacak, Kalça & Karın',
    exercises: [
      { id: 'tue_1', name: 'Wall Sit (Maksimum 45° Açı)', sets: '3 Set x 35 Sn', timerSec: 35, note: 'UYARI: Videodaki gibi 90° inme! En fazla 45° yarı yolda bekle.', videoId: 'gn1GW7dBoog' },
      { id: 'tue_2', name: 'Glute Bridge (Geniş Açılı)', sets: '4 Set x 15', timerSec: 45, note: 'Ayakları biraz önde konumlandır, diz açısı 45° civarı kalsın.', videoId: '2mX8PZZORVw' },
      { id: 'tue_3', name: 'Romanian Deadlift (RDL)', sets: '4 Set x 12', timerSec: 60, note: 'Dizler hafif kırık sabit, hareket kalçayı geriye iterek yapılır.', videoId: 'TYzHvpqEs6s' },
      { id: 'tue_4', name: 'Dead Bug (Bel Koruyucu)', sets: '3 Set x 16', timerSec: 45, note: 'Bel boşluğunu yere tam bastır.', videoId: 'Z4MiU1phK68' },
      { id: 'tue_5', name: 'Forearm Plank', sets: '3 Set x 35 Sn', timerSec: 35, note: 'Dirsekler üzerinde, bileklere sıfır yük.', videoId: 'UQ78pw0WNZI' }
    ]
  },
  Çarşamba: {
    title: 'Doğada Bisiklet Sürüşü + Fizik Tedavi',
    focus: 'Düşük Darbeli Kardiyo & Yağ Yakımı',
    exercises: [
      { id: 'wed_1', name: 'Düz/Hafif Eğimli Rota Bisiklet (35-45 Dk)', sets: '1 Seans (Hafif Vites)', timerSec: 60, note: 'Sele yüksek olmalı (üstte diz max 45° bükülmeli). Pedala ayağın orta kısmıyla bas.', videoId: '' }
    ]
  },
  Perşembe: {
    title: 'Üst Vücut B (Omuz & Kol)',
    focus: 'Atletik V Formu & Kol',
    exercises: [
      { id: 'thu_1', name: 'Seated Shoulder Press (Neutral Grip)', sets: '4 Set x 10-12', timerSec: 60, note: 'Bilek bandajını tak. Avuç içleri birbirine baksın.', videoId: '1WOecdL8nrI' },
      { id: 'thu_2', name: 'Dumbbell Lateral Raise', sets: '4 Set x 12-15', timerSec: 45, note: 'Gövde çok hafif öne eğik, dirsekler bilekten hafif yukarıda.', videoId: 'dybxZJaWxCY' },
      { id: 'thu_3', name: 'Dumbbell Hammer Curl', sets: '3 Set x 12', timerSec: 45, note: 'Avuç içleri karşılıklı, sağ bileği zorlamaz.', videoId: 'OPhgvwKBOwI' },
      { id: 'thu_4', name: 'Lying Dumbbell Triceps Extension', sets: '3 Set x 12', timerSec: 45, note: 'Üst kolu hafif geriye açılı tut.', videoId: 'Mq9eoGIiCSU' }
    ]
  },
  Cuma: {
    title: 'Alt Vücut & Core + Bant Yürüyüşü',
    focus: 'Bacak Dayanıklılığı & Yağ Yakımı',
    exercises: [
      { id: 'fri_1', name: 'Wall Sit (Maksimum 45° Açı)', sets: '3 Set x 35 Sn', timerSec: 35, note: 'En fazla 45 derece açıda sabit bekle.', videoId: 'gn1GW7dBoog' },
      { id: 'fri_2', name: 'Glute Bridge + RDL Süper Set', sets: '3 Set x 12+12', timerSec: 60, note: 'Diz eklemine yük bindirmeden arka zinciri çalıştır.', videoId: '2mX8PZZORVw' },
      { id: 'fri_3', name: 'Yürüyüş Bandı (5.2 km/s - %0-1 Eğim)', sets: '25 Dakika', timerSec: 60, note: 'Koşmak ve yüksek eğim Aşil için yasak. Tempolu düz yürüyüş.', videoId: '' }
    ]
  },
  Cumartesi: {
    title: 'Doğada Tempolu Yürüyüş veya Bisiklet',
    focus: 'Açık Hava Yağ Yakımı (45-60 Dk)',
    exercises: [
      { id: 'sat_1', name: 'Toprak Zemin Yürüyüş / Bisiklet', sets: '45-60 Dakika', timerSec: 60, note: 'Dik yokuşlardan kaçın. Ayakkabı içinde topuk yükseltici ped kullan.', videoId: '' }
    ]
  },
  Pazar: {
    title: 'Tam Dinlenme & Doku Onarımı',
    focus: 'Sadece 15 Dk Günlük Fizik Tedavi',
    exercises: []
  }
};

const MEAL_PLAN = [
  { id: 'meal_1', time: '09:00', title: 'Kahvaltı (~650 kcal | 42g Protein)', desc: '4 tam yumurta, 60g beyaz/lor peynir, 2 ince dilim tam buğday ekmek, 8 zeytin, bol yeşillik.' },
  { id: 'meal_2', time: '13:30', title: 'Öğle Yemeği (~700 kcal | 55g Protein)', desc: '200g pişmiş tavuk/hindi/et, 8-10 yk bulgur/basmati, 1 kase yoğurt, zeytinyağlı salata.' },
  { id: 'meal_3', time: '17:30', title: 'Antrenman Öncesi (~200 kcal | 10g Protein)', desc: '1 orta boy muz + 10 çiğ badem + 1 fincan sade filtre/Türk kahvesi.' },
  { id: 'meal_4', time: '20:00', title: 'Akşam Yemeği (~650 kcal | 58g Protein)', desc: '220-250g balık/tavuk/köfte, 1 tabak zeytinyağlı sebze, bol salata. (Ekmek ve pilav YOK).' },
  { id: 'meal_5', time: '22:00', title: 'Gece Onarım Desteği', desc: 'Magnezyum (Sitrat/Glisinat) + 1 fincan papatya/yeşil çay.' }
];

const DAYS_LIST = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function App() {
  const todayName = DAYS_LIST[new Date().getDay()];
  const todayDateStr = new Date().toISOString().split('T')[0];

  // --- STATE YÖNETİMİ ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Supabase & Gemini Ayarları
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('rehab_coach_config');
    return saved ? JSON.parse(saved) : { supabaseUrl: '', supabaseKey: '', geminiKey: '' };
  });

  // Günlük Sağlık & İlerleme Verileri
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('rehab_coach_state');
    const defaultState = {
      lastDate: todayDateStr,
      pain: { knee: 2, achilles: 3, wrist: 1 },
      waterMl: 0,
      waterTargetMl: 3000,
      coffeeCount: 0,
      completedItems: {},
      weights: [{ date: todayDateStr, weight: 97.0, waist: 104 }],
      exerciseNotes: {}
    };
    if (!saved) return defaultState;
    const parsed = JSON.parse(saved);
    if (parsed.lastDate !== todayDateStr) {
      return {
        ...parsed,
        lastDate: todayDateStr,
        waterMl: 0,
        waterTargetMl: 3000,
        coffeeCount: 0,
        completedItems: {}
      };
    }
    return parsed;
  });

  // Sayaç State
  const [timer, setTimer] = useState({ active: false, seconds: 0, label: '' });
  const timerRef = useRef(null);

  // AI Koç Sohbet State
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Merhaba! Sol diz (45° sınırı), iki Aşil (Haglund) ve sağ el bileği hassasiyetine göre programın hazır. Bugünkü ağrı skorlarına göre antrenmanını veya beslenmeni nasıl optimize edelim?'
    }
  ]);

  // --- SUPABASE SENKRONİZASYON ---
  useEffect(() => {
    localStorage.setItem('rehab_coach_state', JSON.stringify(state));
    if (config.supabaseUrl && config.supabaseKey) {
      syncToSupabase(state);
    }
  }, [state]);

  useEffect(() => {
    if (config.supabaseUrl && config.supabaseKey) {
      loadFromSupabase();
    }
  }, [config.supabaseUrl, config.supabaseKey]);

  const getSupabase = () => {
    if (!config.supabaseUrl || !config.supabaseKey) return null;
    try {
      return createClient(config.supabaseUrl, config.supabaseKey);
    } catch {
      return null;
    }
  };

  const loadFromSupabase = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('user_rehab_state')
      .select('data')
      .eq('id', 'primary_user')
      .single();
    if (data?.data) {
      setState((prev) => ({ ...prev, ...data.data }));
    }
  };

  const syncToSupabase = async (newState) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase
      .from('user_rehab_state')
      .upsert({ id: 'primary_user', data: newState, updated_at: new Date().toISOString() });
  };

  // --- SAYAÇ MANTIĞI ---
  useEffect(() => {
    if (timer.active && timer.seconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimer((t) => ({ ...t, seconds: t.seconds - 1 }));
      }, 1000);
    } else if (timer.active && timer.seconds === 0) {
      setTimer((t) => ({ ...t, active: false }));
      playBeep();
    }
    return () => clearTimeout(timerRef.current);
  }, [timer]);

  const startTimer = (seconds, label) => {
    setTimer({ active: true, seconds, label });
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  // --- YARDIMCI FONKSİYONLAR ---
  const toggleComplete = (id) => {
    setState((prev) => ({
      ...prev,
      completedItems: {
        ...prev.completedItems,
        [id]: !prev.completedItems[id]
      }
    }));
  };

  const addWater = (ml) => {
    setState((prev) => ({
      ...prev,
      waterMl: Math.max(0, prev.waterMl + ml)
    }));
  };

  const addCoffeeTax = (label) => {
    setState((prev) => ({
      ...prev,
      coffeeCount: prev.coffeeCount + 1,
      waterTargetMl: prev.waterTargetMl + 250
    }));
    alert(`${label} kaydedildi! Kafein dengesi için günlük su hedefine +250 ml eklendi.`);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tarayıcınız bildirimleri desteklemiyor.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      new Notification('Kişisel Koç Aktif!', {
        body: 'Su içme ve fizik tedavi hatırlatıcıların başarıyla etkinleştirildi.'
      });
    }
  };

  // --- GEMINI AI KOÇ SORGUSU ---
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    if (!config.geminiKey) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Sağ üstteki Ayarlar (⚙️) menüsünden ücretsiz Gemini API anahtarını girdiğinde; bugünkü ağrı skorlarını (Diz: ' +
              state.pain.knee + '/10, Aşil: ' + state.pain.achilles + '/10) ve su tüketimini (' + state.waterMl + ' ml) analiz ederek canlı yanıt verebilirim!'
          }
        ]);
        setChatLoading(false);
      }, 500);
      return;
    }

    try {
      const systemContext = `Sen profesyonel bir fizik tedavi ve fitness koçusun. Danışanın özellikleri: 1.73 boy, 97 kg (göbek yağlarını eritip kaslanmak istiyor). Sakatlıkları: 1) Sol diz menisküs (max 45 derece bükülme sınırı var, tam squat/koşu yasak), 2) İki ayakta Haglund deformitesi / Aşil tendiniti (merdiven kenarı heel drop ve koşu yasak, düz zeminde izometrik calf raise ve yüksek sele bisiklet uygun), 3) Sağ el bileğinde eski çatlak hassasiyeti (push-up bar ve neutral grip kullanıyor). Bugünkü ağrı skorları (1-10): Sol diz ${state.pain.knee}, Aşil ${state.pain.achilles}, Sağ bilek ${state.pain.wrist}. Bugünkü su tüketimi: ${state.waterMl}/${state.waterTargetMl} ml. Kısa, net ve uygulanabilir yanıt ver.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemContext}\n\nDanışan Sorusu: ${userMsg}` }] }]
          })
        }
      );
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı, API anahtarını kontrol et.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Bağlantı hatası: ' + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  const isHighPain = state.pain.knee >= 5 || state.pain.achilles >= 5 || state.pain.wrist >= 5;
  const waterPercent = Math.min(100, Math.round((state.waterMl / state.waterTargetMl) * 100));

  const sqlSetupCode = `create table if not exists user_rehab_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table user_rehab_state enable row level security;
create policy "Public access" on user_rehab_state for all using (true) with check (true);`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans">
      {/* ÜST BAR */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white">Rehab & Fit Koç</h1>
            <p className="text-xs text-slate-400">{todayName} • Faz 1: Adaptasyon & Onarım</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full border ${config.supabaseUrl ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            {config.supabaseUrl ? 'Bulut Aktif' : 'Yerel Mod'}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* AKTİF SAYAÇ ÇUBUĞU */}
      {timer.active && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between sticky top-[61px] z-20 shadow-lg">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">{timer.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold">{timer.seconds} sn</span>
            <button
              onClick={() => setTimer({ active: false, seconds: 0, label: '' })}
              className="bg-black/20 px-2.5 py-1 rounded-lg text-xs font-semibold"
            >
              Durdur
            </button>
          </div>
        </div>
      )}

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-3xl mx-auto p-4 space-y-5">
        {/* 1. SEKME: KONTROL PANELİ */}
        {activeTab === 'dashboard' && (
          <>
            {/* Sabah Ağrı Skoru Kartı */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Sabah Ağrı & Sertlik Kontrolü (1-10)
                </h2>
                <span className="text-xs text-slate-400">Otomatik Yük Ayarı</span>
              </div>

              {isHighPain && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-amber-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Koruma Modu Devrede:</strong> Ağrı skorun 5 veya üzerinde. Bugün bacak/kardiyo setlerini yarıya düşür, sadece düz zeminde izometrik fizik tedavi uygula.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'knee', label: 'Sol Diz (Menisküs)' },
                  { key: 'achilles', label: 'Aşil & Haglund' },
                  { key: 'wrist', label: 'Sağ El Bileği' }
                ].map((item) => (
                  <div key={item.key} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">{item.label}</span>
                      <span className={`font-bold ${state.pain[item.key] >= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {state.pain[item.key]} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={state.pain[item.key]}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          pain: { ...prev.pain, [item.key]: Number(e.target.value) }
                        }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hızlı Su & Kalori Özeti */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setActiveTab('nutrition')}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-sky-500/40 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <Droplets className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-400">%{waterPercent}</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {state.waterMl} <span className="text-xs font-normal text-slate-400">/ {state.waterTargetMl} ml</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-sky-400 h-full transition-all" style={{ width: `${waterPercent}%` }} />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('nutrition')}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Hedef: 2.250 kcal</span>
                </div>
                <div className="text-lg font-bold text-white">
                  165g <span className="text-xs font-normal text-slate-400">Günlük Protein</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Akşam karbonhidrat sıfır</p>
              </div>
            </div>

            {/* Günlük Fizik Tedavi Kontrol Listesi */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-white">Günlük Fizik Tedavi Rutini (15 Dk)</h2>
                <button
                  onClick={() => setActiveTab('workout')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" /> Videoları Gör
                </button>
              </div>
              <div className="space-y-2">
                {PHYSIO_EXERCISES.map((ex) => {
                  const done = !!state.completedItems[ex.id];
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleComplete(ex.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        done ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400' : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {done ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <Circle className="w-5 h-5 text-slate-600 shrink-0" />}
                        <div>
                          <p className={`text-sm font-medium ${done ? 'line-through' : ''}`}>{ex.name}</p>
                          <p className="text-xs text-slate-400">{ex.target} • {ex.sets}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTimer(ex.timerSec, ex.name);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-xs font-medium text-white transition"
                      >
                        ⏱️ {ex.timerSec}s
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bugünün Spor Özeti */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase">Bugünün Programı ({todayName})</span>
                <h3 className="font-bold text-white mt-0.5">{WORKOUT_DAYS[todayName]?.title}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedDay(todayName);
                  setActiveTab('workout');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition"
              >
                Başla
              </button>
            </div>
          </>
        )}

        {/* 2. SEKME: ANTRENMAN & VİDEOLAR */}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            {/* Gün Seçici */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedDay === day ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Seçili Günün Fitness Hareketleri */}
            <div className="space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h2 className="font-bold text-base text-white">{WORKOUT_DAYS[selectedDay].title}</h2>
                <p className="text-xs text-emerald-400 mt-0.5">Odak: {WORKOUT_DAYS[selectedDay].focus}</p>
              </div>

              {WORKOUT_DAYS[selectedDay].exercises.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
                  Bugün aktif ağırlık antrenmanı yok. Aşağıdaki 15 dakikalık fizik tedavi rutinini uygulayıp dinlenebilirsin.
                </div>
              ) : (
                WORKOUT_DAYS[selectedDay].exercises.map((ex) => {
                  const done = !!state.completedItems[ex.id];
                  return (
                    <div key={ex.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div onClick={() => toggleComplete(ex.id)} className="flex items-start gap-3 cursor-pointer">
                            {done ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" /> : <Circle className="w-5 h-5 text-slate-600 mt-0.5" />}
                            <div>
                              <h3 className={`font-semibold text-sm ${done ? 'line-through text-slate-500' : 'text-white'}`}>{ex.name}</h3>
                              <p className="text-xs text-emerald-400 font-medium">{ex.sets}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => startTimer(ex.timerSec, ex.name)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-xs font-semibold text-white shrink-0"
                          >
                            ⏱️ {ex.timerSec} sn
                          </button>
                        </div>

                        <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                          {ex.note}
                        </p>

                        {/* Ağırlık Notu Girişi */}
                        <input
                          type="text"
                          placeholder="Kullandığın ağırlık / not (Örn: 7.5 kg x 12)"
                          value={state.exerciseNotes[ex.id] || ''}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              exerciseNotes: { ...prev.exerciseNotes, [ex.id]: e.target.value }
                            }))
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {ex.videoId && (
                        <div className="aspect-video w-full bg-black border-t border-slate-800">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${ex.videoId}`}
                            title={ex.name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Günlük Fizik Tedavi Videoları Bölümü */}
            <div className="pt-4 space-y-3">
              <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Her Gün Yapılacak Fizik Tedavi Videoları</h2>
              {PHYSIO_EXERCISES.map((ex) => (
                <div key={ex.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-white">{ex.name}</h3>
                      <p className="text-xs text-slate-400">{ex.note}</p>
                    </div>
                    <button
                      onClick={() => startTimer(ex.timerSec, ex.name)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0"
                    >
                      ⏱️ {ex.timerSec} sn
                    </button>
                  </div>
                  <div className="aspect-video w-full bg-black border-t border-slate-800">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${ex.videoId}`}
                      title={ex.name}
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SEKME: SU & BESLENME */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            {/* Su & Kahve Vergisi Modülü */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-white flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-sky-400" />
                    Akıllı Su & Kahve Vergisi Takibi
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Hedef: 3 Matara (3.000 ml) + Kafein Telafisi</p>
                </div>
                <span className="text-xl font-bold text-sky-400">{state.waterMl} ml</span>
              </div>

              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${waterPercent}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => addWater(250)} className="py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold hover:bg-sky-500/20">
                  +250 ml Bardak
                </button>
                <button onClick={() => addWater(500)} className="py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold hover:bg-sky-500/20">
                  +500 ml Yarım Matara
                </button>
                <button onClick={() => addWater(1000)} className="py-2.5 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500">
                  +1.000 ml Tam Matara
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => addCoffeeTax('1 Kupa Kahve')}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-2 hover:bg-amber-500/20"
                >
                  <Coffee className="w-4 h-4" /> 1 Kupa Kahve İçtim (+250ml Hedef)
                </button>
                <button
                  onClick={() => addCoffeeTax('2 Bardak Çay')}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-2 hover:bg-amber-500/20"
                >
                  <Coffee className="w-4 h-4" /> 2 Bardak Çay İçtim (+250ml Hedef)
                </button>
              </div>
            </div>

            {/* 97 Kg Beslenme Planı */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-white">Günlük Beslenme Planı (2.250 kcal | 165g Protein)</h2>
              </div>
              <div className="space-y-2.5">
                {MEAL_PLAN.map((meal) => {
                  const done = !!state.completedItems[meal.id];
                  return (
                    <div
                      key={meal.id}
                      onClick={() => toggleComplete(meal.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        done ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-400">{meal.time} • {meal.title}</span>
                        {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-600" />}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{meal.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. SEKME: GEMINI AI KİŞİSEL KOÇ */}
        {activeTab === 'coach' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[72vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="font-bold text-sm text-white">Gemini AI Kişisel Fizik Tedavi & Spor Koçu</h2>
                  <p className="text-xs text-slate-400">Ağrı skorlarını ve programını anlık bilir</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-200'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && <div className="text-xs text-slate-400 animate-pulse">Koç yanıt hazırlıyor...</div>}
            </div>

            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Örn: Bugün sağ Aşil biraz sert, yürüyüş yerine ne yapayım?"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendChat}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ALT NAVİGASYON BARI */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-2 z-30">
        <div className="max-w-3xl mx-auto grid grid-cols-4 gap-1">
          {[
            { id: 'dashboard', label: 'Özet', icon: Activity },
            { id: 'workout', label: 'Antrenman', icon: Dumbbell },
            { id: 'nutrition', label: 'Su & Öğün', icon: Utensils },
            { id: 'coach', label: 'AI Koç', icon: Bot }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition ${
                  active ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* AYARLAR VE SUPABASE / GEMINI MODALI */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-white">Bulut, AI Koç ve Bildirim Ayarları</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white text-sm">Kapat</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase Project URL
                </label>
                <input
                  type="text"
                  value={config.supabaseUrl}
                  onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                  placeholder="https://xxxx.supabase.co"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Key className="w-3.5 h-3.5 text-emerald-400" /> Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={config.supabaseKey}
                  onChange={(e) => setConfig({ ...config, supabaseKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Bot className="w-3.5 h-3.5 text-sky-400" /> Gemini API Key (Google AI Studio)
                </label>
                <input
                  type="password"
                  value={config.geminiKey}
                  onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                onClick={requestNotificationPermission}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" /> Su & Antrenman Bildirimlerine İzin Ver
              </button>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Supabase SQL Editor Tablo Kodu:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sqlSetupCode);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="text-xs text-emerald-400 flex items-center gap-1"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
                <pre className="text-[10px] text-slate-400 overflow-x-auto">{sqlSetupCode}</pre>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('rehab_coach_config', JSON.stringify(config));
                setShowSettings(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white"
            >
              Ayarları Kaydet ve Eşitle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}