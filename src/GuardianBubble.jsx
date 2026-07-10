import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Shield, CheckCircle, AlertTriangle, XCircle, Info, Sun, Moon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GuardianBubble() {
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ===================================================== 
  // ALL ORIGINAL GUARDIAN CONTROLS RESTORED
  // ===================================================== 
  // Environment Inputs
  const [roadSlope, setRoadSlope] = useState(0);
  const [trafficDensity, setTrafficDensity] = useState(40);
  const [weather, setWeather] = useState("Clear");
  const [headwind, setHeadwind] = useState(10);
  const [roadSpeedLimit, setRoadSpeedLimit] = useState(80);
  
  // Incident Status Checkboxes
  const [schoolZone, setSchoolZone] = useState(false);
  const [pedestrianDetected, setPedestrianDetected] = useState(false);
  const [emergencyVehicleNearby, setEmergencyVehicleNearby] = useState(false);

  // Vehicle State
  const [battery, setBattery] = useState(70);
  const [tireCondition, setTireCondition] = useState(90);
  const [currentSpeed, setCurrentSpeed] = useState(60);

  // Machine Learning Pipeline Comparative States
  const [modelComparisons, setModelComparisons] = useState({
    random_forest: { approved: true, confidence: 100 },
    logistic_regression: { approved: true, confidence: 100 },
    xgboost: { approved: true, confidence: 100 }
  });

  // ===================================================== 
  // 10-SECOND SIMULATION ENGINE PIPELINE
  // ===================================================== 
  useEffect(() => {
    const runSimulationStep = async () => {
      const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const rollBoolean = () => Math.random() < 0.25;
      const weatherOptions = ["Clear", "Rain", "Fog"];

      const generatedSlope = getRandomInt(-15, 15);
      const generatedTraffic = getRandomInt(0, 100);
      const generatedWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      const generatedHeadwind = getRandomInt(0, 50);
      const generatedSpeedLimit = getRandomInt(30, 120);
      
      const generatedSchool = rollBoolean();
      const generatedPedestrian = rollBoolean();
      const generatedEmergency = rollBoolean();

      const generatedBattery = getRandomInt(0, 100);
      const generatedTire = getRandomInt(30, 100);
      const generatedCurrentSpeed = getRandomInt(0, 110);

      // Sync variables to UI controls
      setRoadSlope(generatedSlope);
      setTrafficDensity(generatedTraffic);
      setWeather(generatedWeather);
      setHeadwind(generatedHeadwind);
      setRoadSpeedLimit(generatedSpeedLimit);
      setSchoolZone(generatedSchool);
      setPedestrianDetected(generatedPedestrian);
      setEmergencyVehicleNearby(generatedEmergency);
      setBattery(generatedBattery);
      setTireCondition(generatedTire);
      setCurrentSpeed(generatedCurrentSpeed);

      // Map parameters cleanly for database and model calculations
      let sScore = 100;
      if (generatedWeather !== "Clear") sScore -= 25;
      if (generatedPedestrian) sScore -= 40;
      if (generatedTire < 50) sScore -= 20;
      sScore = Math.max(0, sScore);

      let eScore = generatedBattery;
      if (generatedSlope > 5) eScore = Math.max(0, eScore - 15);
      
      let rScore = 100;
      if (generatedCurrentSpeed > generatedSpeedLimit) rScore -= 40;
      if (generatedSchool && generatedCurrentSpeed > 30) rScore -= 30;
      rScore = Math.max(0, rScore);

      let ethScore = 100;
      if (generatedPedestrian && generatedCurrentSpeed > 20) ethScore -= 60;
      if (generatedEmergency) ethScore -= 20;
      ethScore = Math.max(0, ethScore);

      let compositeScore = Math.round((0.4 * sScore + 0.2 * eScore + 0.2 * rScore + 0.2 * ethScore) * 100) / 100;

      try {
        const response = await axios.post('http://localhost:3001/api/telemetry', {
          energyInput: eScore,
          ethicalEmergency: 100 - ethScore,
          regulatorySpeed: generatedSpeedLimit,
          trafficDensity: generatedTraffic,
          weather: generatedWeather,
          roadCondition: generatedSlope > 0 ? "Uphill" : "Normal",
          battery: generatedBattery,
          currentSpeed: generatedCurrentSpeed,
          guardianScore: compositeScore
        });

        if (response.data.status === "success") {
          setModelComparisons(response.data.models);
        }
      } catch (err) {
        console.warn("Python Multi-Model Server Unreachable.");
      }
    };

    runSimulationStep();
    const cycleInterval = setInterval(runSimulationStep, 10000);
    return () => clearInterval(cycleInterval);
  }, []);

  // Heuristic Analytical Computations
  const calculations = useMemo(() => {
    let safetyScore = 100;
    if (weather === "Rain") safetyScore -= 20;
    if (weather === "Fog") safetyScore -= 35;
    if (tireCondition < 60) safetyScore -= 25;
    if (pedestrianDetected) safetyScore -= 45;
    safetyScore = Math.max(0, safetyScore);

    let energyScore = battery;
    if (roadSlope > 4) energyScore -= 10; 
    if (headwind > 30) energyScore -= 10;
    energyScore = Math.max(0, Math.min(100, energyScore));

    let regulatoryScore = 100;
    if (currentSpeed > roadSpeedLimit) regulatoryScore -= 40;
    if (schoolZone && currentSpeed > 30) regulatoryScore -= 30;
    if (trafficDensity > 85 && currentSpeed > 60) regulatoryScore -= 20;
    regulatoryScore = Math.max(0, regulatoryScore);

    let ethicalScore = 100;
    if (pedestrianDetected && currentSpeed > 30) ethicalScore -= 70;
    if (emergencyVehicleNearby && currentSpeed > 40) ethicalScore -= 30;
    ethicalScore = Math.max(0, ethicalScore);

    let recommendedSpeed = Math.min(roadSpeedLimit, 90);
    if (weather === "Rain") recommendedSpeed -= 20;
    if (weather === "Fog") recommendedSpeed -= 35;
    if (schoolZone) recommendedSpeed = 25;
    if (pedestrianDetected) recommendedSpeed = 0;
    recommendedSpeed = Math.max(0, recommendedSpeed);

    let recommendedRegen = "Medium";
    if (trafficDensity > 70 || roadSlope < -3) recommendedRegen = "High";
    let energyOpportunity = roadSlope < -2 ? Math.abs(roadSlope) * 1.5 : 0;

    let guardianScore = (0.4 * safetyScore) + (0.2 * energyScore) + (0.2 * regulatoryScore) + (0.2 * ethicalScore);
    guardianScore = Math.round(guardianScore * 100) / 100;

    const violations = [];
    if (currentSpeed > roadSpeedLimit) violations.push("Regulatory Speed Boundary Breach");
    if (schoolZone && currentSpeed > 30) violations.push("School Zone Over-Speed Fault");
    if (pedestrianDetected && currentSpeed > 15) violations.push("Critical Vulnerable Road User Vulnerability");

    return { safetyScore, energyScore, regulatoryScore, ethicalScore, guardianScore, recommendedSpeed, recommendedRegen, energyOpportunity, violations };
  }, [roadSlope, trafficDensity, weather, headwind, roadSpeedLimit, schoolZone, pedestrianDetected, emergencyVehicleNearby, battery, tireCondition, currentSpeed]);

  // ===================================================== 
  // RESTORED VOICE NARRATION AUDIO OUTPUT LINK
  // ===================================================== 
  useEffect(() => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech so it doesn't overlap
        window.speechSynthesis.cancel();
        
        // Determine state text based on the core consensus loop approval
        const operationalStatus = modelComparisons.random_forest.approved ? "Approved" : "Rejected";
        
        // Construct the clean voice sentence focusing on verdict and converted speed limit
        const narration = `The Model is ${operationalStatus}. and Recommended speed is set to ${calculations.recommendedSpeed} kilometers per hour.`;
        
        const utterance = new SpeechSynthesisUtterance(narration);
        window.speechSynthesis.speak(utterance);
      }
    }, [modelComparisons.random_forest.approved, calculations.recommendedSpeed]);
  const chartData = [
    { name: 'Safety', score: calculations.safetyScore },
    { name: 'Energy', score: calculations.energyScore },
    { name: 'Regulatory', score: calculations.regulatoryScore },
    { name: 'Ethical', score: calculations.ethicalScore },
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ===================================================== 
          RESTORED FULL GUARDIAN SIDEBAR CONTROLS
          ===================================================== */}
      <aside className={`w-80 border-r p-6 overflow-y-auto space-y-5 h-screen sticky top-0 backdrop-blur-md transition-colors ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2 border-b pb-3 border-slate-700/40">
          <Shield className={isDark ? 'text-cyan-400' : 'text-cyan-600'} size={22} />
          <div>
            <h2 className="text-lg font-bold tracking-tight">Guardian Controls</h2>
            <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider animate-pulse">● Auto Simulation Active</span>
          </div>
        </div>

        {/* ENVIRONMENT SECTION */}
        <div className="space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Environment Inputs</h3>
          <div>
            <label className="text-xs flex justify-between">Road Slope: <span>{roadSlope}%</span></label>
            <input type="range" min="-15" max="15" value={roadSlope} onChange={(e) => setRoadSlope(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="text-xs flex justify-between">Traffic Density: <span>{trafficDensity}%</span></label>
            <input type="range" min="0" max="100" value={trafficDensity} onChange={(e) => setTrafficDensity(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="text-xs block mb-1">Weather Context</label>
            <select value={weather} onChange={(e) => setWeather(e.target.value)} className={`w-full border rounded p-1.5 text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
              <option>Clear</option><option>Rain</option><option>Fog</option>
            </select>
          </div>
          <div>
            <label className="text-xs flex justify-between">Headwind Force: <span>{headwind} km/h</span></label>
            <input type="range" min="0" max="100" value={headwind} onChange={(e) => setHeadwind(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="text-xs flex justify-between">Road Speed Limit: <span>{roadSpeedLimit} km/h</span></label>
            <input type="range" min="30" max="120" value={roadSpeedLimit} onChange={(e) => setRoadSpeedLimit(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>
        </div>

        {/* CHECKBOX MARGINS */}
        <div className="space-y-2 border-t pt-3 border-slate-700/40 text-xs">
          <label className="flex items-center gap-2 font-medium cursor-pointer py-0.5">
            <input type="checkbox" checked={schoolZone} onChange={(e) => setSchoolZone(e.target.checked)} className="rounded accent-cyan-500 w-3.5 h-3.5" />
            <span>Active School Zone Flag</span>
          </label>
          <label className="flex items-center gap-2 font-medium cursor-pointer py-0.5">
            <input type="checkbox" checked={pedestrianDetected} onChange={(e) => setPedestrianDetected(e.target.checked)} className="rounded accent-cyan-500 w-3.5 h-3.5" />
            <span className={pedestrianDetected ? "text-red-400 font-bold" : ""}>Pedestrian Threat Detected</span>
          </label>
          <label className="flex items-center gap-2 font-medium cursor-pointer py-0.5">
            <input type="checkbox" checked={emergencyVehicleNearby} onChange={(e) => setEmergencyVehicleNearby(e.target.checked)} className="rounded accent-cyan-500 w-3.5 h-3.5" />
            <span>Emergency Responder Nearby</span>
          </label>
        </div>

        {/* VEHICLE STATE METRICS */}
        <div className="space-y-4 border-t pt-3 border-slate-700/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vehicle State</h3>
          <div>
            <label className="text-xs flex justify-between">Battery Core Reserve: <span>{battery}%</span></label>
            <input type="range" min="0" max="100" value={battery} onChange={(e) => setBattery(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="text-xs flex justify-between">Tire Friction Integrity: <span>{tireCondition}%</span></label>
            <input type="range" min="0" max="100" value={tireCondition} onChange={(e) => setTireCondition(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="text-xs flex justify-between">Current Vehicle Speed: <span>{currentSpeed} km/h</span></label>
            <input type="range" min="0" max="120" value={currentSpeed} onChange={(e) => setCurrentSpeed(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>
        </div>
      </aside>

      {/* ===================================================== 
          MAIN PROCESSING CONTAINER DISPLAY AREA
          ===================================================== */}
      <main className="flex-1 p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">🛡 Guardian Bubble Dashboard</h1>
            <p className="text-slate-400 text-xs">AI Safety Verification Framework for Software Defined Mobility [Multi-Model Comparative Core]</p>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-yellow-400 hover:bg-slate-800 transition-colors">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* 1. ORIGINAL CORE SCORE CARDS PLACED AT THE TOP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'SAFETY SCORE', value: calculations.safetyScore },
            { title: 'ENERGY SCORE', value: calculations.energyScore },
            { title: 'REGULATORY SCORE', value: calculations.regulatoryScore },
            { title: 'ETHICAL SCORE', value: calculations.ethicalScore }
          ].map((card, i) => (
            <div key={i} className={`border rounded-xl p-5 shadow-sm ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold tracking-wider block text-slate-400">{card.title}</span>
              <div className="text-2xl font-black mt-1 tracking-tight">{card.value}</div>
            </div>
          ))}
        </div>

        {/* SECONDARY PIPELINE PROPERTIES LOG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`border rounded-xl p-5 ${isDark ? 'bg-slate-900/20 border-slate-800/60' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Info size={16} /> Adaptive Energy Bubble</h3>
            <div className="space-y-1 text-xs text-slate-400">
              <p>Recommended Speed Limit Vector: <span className="font-semibold text-white">{calculations.recommendedSpeed} km/h</span></p>
              <p>Calculated Ideal Brake Regeneration Index: <span className="font-semibold text-white">{calculations.recommendedRegen}</span></p>
              <p>Calculated Gravity Energy Opportunity Score: <span className="font-semibold text-white">{calculations.energyOpportunity}</span></p>
            </div>
          </div>
          <div className={`border rounded-xl p-5 ${isDark ? 'bg-slate-900/20 border-slate-800/60' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-bold mb-3">Vehicle AI Decision Object Log</h3>
            <pre className="border border-white/5 bg-slate-950 rounded-lg p-3 font-mono text-[11px] text-cyan-400">
{JSON.stringify({
  VelocityMetrics: `${currentSpeed} / ${roadSpeedLimit} km/h`,
  WeatherMatrix: weather,
  SlopeAngleFactor: `${roadSlope}%`,
  PedestrianThreatSafety: pedestrianDetected ? "CRITICAL ALERT" : "CLEAR",
  PipelineScoreIndex: calculations.guardianScore
}, null, 2)}
            </pre>
          </div>
        </div>

        {/* 2. FEATURE RISK PROFILES BAR GRAPH PLACED IN THE MIDDLE */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold">Dynamic Feature Risk Profiles Matrix</h3>
          <div className="border border-white/5 rounded-xl p-4 h-52 bg-slate-900/10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 12 }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 60 ? '#06b6d4' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border border-white/5 rounded-xl px-4 py-2 inline-block bg-slate-900/50">
            <span className="text-[10px] block uppercase font-bold text-slate-400">Guardian Baseline Pipeline Score</span>
            <span className="text-xl font-black">{calculations.guardianScore}</span>
          </div>
        </div>

        {/* 3. MULTI-MODEL SUPERVISED ML CARDS ARRANGED PRECISELY AT THE BOTTOM AFTER THE GRAPH */}
        <div className="space-y-3 border-t pt-4 border-slate-800/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Supervised Machine Learning Predictions Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Model 1: Random Forest */}
            <div className={`border rounded-xl p-5 border-l-4 ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200'} ${modelComparisons.random_forest.approved ? 'border-l-cyan-500' : 'border-l-rose-500'}`}>
              <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-wider block">MODEL 1: RANDOM FOREST</span>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold">{modelComparisons.random_forest.approved ? "✅ APPROVED" : "❌ REJECTED"}</span>
                <span className="text-xs font-mono text-slate-400">{modelComparisons.random_forest.confidence}% Conf.</span>
              </div>
            </div>

            {/* Model 2: Logistic Regression */}
            <div className={`border rounded-xl p-5 border-l-4 ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200'} ${modelComparisons.logistic_regression.approved ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
              <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-wider block">MODEL 2: LOGISTIC REGRESSION</span>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold">{modelComparisons.logistic_regression.approved ? "✅ APPROVED" : "❌ REJECTED"}</span>
                <span className="text-xs font-mono text-slate-400">{modelComparisons.logistic_regression.confidence}% Conf.</span>
              </div>
            </div>

            {/* Model 3: XGBoost */}
            <div className={`border rounded-xl p-5 border-l-4 ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200'} ${modelComparisons.xgboost.approved ? 'border-l-purple-500' : 'border-l-rose-500'}`}>
              <span className="text-[10px] font-bold text-purple-400 font-mono tracking-wider block">MODEL 3: XGBOOST CLASS.</span>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold">{modelComparisons.xgboost.approved ? "✅ APPROVED" : "❌ REJECTED"}</span>
                <span className="text-xs font-mono text-slate-400">{modelComparisons.xgboost.confidence}% Conf.</span>
              </div>
            </div>

          </div>
        </div>

        {/* PIPELINE ERROR ANOMALIES LOG */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold">Pipeline Structural Anomalies</h3>
          {calculations.violations.length > 0 ? (
            <div className="space-y-1.5">
              {calculations.violations.map((v, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-amber-300">
                  <AlertTriangle className="flex-shrink-0 text-amber-400" size={14} />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg inline-block">
              Nominal Status: Zero active pipeline violations registered.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}