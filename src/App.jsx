import React, { useEffect, useRef, useState } from 'react'

const steps = [
  'Welcome', 'Face identity', 'Voice identity', 'Employee profile', 'Agreement',
  'Tracker activation', 'Start day', 'Day 1 · Task 1', 'Day 1 · Task 2', 'Day 1 · Task 3',
  'End day report', 'Performance notice', 'Monitoring consent',
  'Month 2 · Task 1', 'Month 2 · Task 2', 'Month 2 · Task 3',
  'Month 2 report', 'Phone permissions', 'Month 3 report', 'Exit notice'
]

const variants = [
  { id: 'A', name: 'ORBIT', label: 'Balanced hierarchy', desc: 'A calm, structured interface with a clear primary action.', cls: 'variant-a' },
  { id: 'B', name: 'ORBIT', label: 'High-contrast hierarchy', desc: 'A sharper interface that brings the primary action forward.', cls: 'variant-b' },
  { id: 'C', name: 'ORBIT', label: 'Compact hierarchy', desc: 'A denser interface that prioritises information visibility.', cls: 'variant-c' }
]

function Mark({ children }) { return <span className="mark">{children}</span> }
function Tag({ children }) { return <span className="tag">{children}</span> }

function App() {
  const [step, setStep] = useState(0)
  const [employeeName, setEmployeeName] = useState('Alex Morgan')
  const [employeeId] = useState('SX-2040-0817')
  const [faceReady, setFaceReady] = useState(false)
  const [faceImage, setFaceImage] = useState('')
  const [voiceReady, setVoiceReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [micError, setMicError] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [taskChoices, setTaskChoices] = useState({})
  const [taskRationales, setTaskRationales] = useState({})
  const [consentError, setConsentError] = useState(false)
  const [phonePermissions, setPhonePermissions] = useState({ health: true, location: true, activity: true, microphone: true })
  const [scanComplete, setScanComplete] = useState(false)
  const [showHandbook, setShowHandbook] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  const progress = Math.round((step / (steps.length - 1)) * 100)

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraOn])

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  async function startCamera() {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      setVideoReady(false)
      setCameraOn(true)
    } catch (e) {
      setCameraError('Camera access was not granted. Check browser permissions and try again.')
    }
  }

  function captureFace() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('The live camera preview is still loading. Wait until your image appears, then capture again.')
      return
    }
    if (video && video.videoWidth > 0) {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
      setFaceImage(canvas.toDataURL('image/jpeg', 0.88))
    }
    setFaceReady(true)
    setVideoReady(false)
    setCameraOn(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  async function startRecording() {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        setRecorded(true)
        setVoiceReady(true)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      setRecording(true)
    } catch (e) {
      setMicError('Microphone access was not granted. Check browser permissions and try again.')
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    setRecording(false)
  }

  function next() {
    setConsentError(false)
    setStep(s => Math.min(s + 1, steps.length - 1))
  }
  function back() {
    setConsentError(false)
    setStep(s => Math.max(s - 1, 0))
  }

  const canContinue = () => {
    if (step === 1) return faceReady
    if (step === 2) return voiceReady
    if ([7, 8, 9, 13, 14, 15].includes(step)) return (taskRationales[step] || '').trim().length > 8
    return true
  }

  function Header() {
    return <header className="topbar">
      <div className="brand"><span className="brand-symbol">✳</span><span>SPACEX <i>HUMAN SYSTEMS</i></span></div>
      <div className="top-right"><span className="secure-dot"></span> SECURE EMPLOYEE PORTAL <span className="top-divider"></span><span>2040.08</span></div>
    </header>
  }

  function Footer() {
    return <footer className="footer">
      <span>INTERNAL SYSTEM // PERSONNEL EXPERIENCE</span>
      <span>SESSION {employeeId} <b>•</b> ENCRYPTED</span>
    </footer>
  }

  function Progress() {
    return <div className="progress-wrap">
      <div className="progress-meta"><span>EMPLOYEE EXPERIENCE TIMELINE</span><span>{String(step + 1).padStart(2, '0')} / {steps.length}</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
    </div>
  }

  function Actions({ label = 'Continue', disabled = false, onClick = next, secondary = true }) {
    return <div className="actions">
      {secondary && step > 0 && <button className="btn btn-ghost" onClick={back}>Back</button>}
      <button className="btn btn-primary" disabled={disabled} onClick={onClick}>{label}<span>↗</span></button>
    </div>
  }

  function Welcome() {
    return <div className="welcome-layout">
      <div className="welcome-copy">
        <Tag>WELCOME ABOARD · 2040</Tag>
        <h1>The future doesn't<br/><em>build itself.</em></h1>
        <p className="lead">Welcome to SpaceX, {employeeName.split(' ')[0]}. Your work will help move humanity forward. Your experience starts here.</p>
        <div className="welcome-meta"><div><span>YOUR DEPARTMENT</span><b>PRODUCT EXPERIENCE</b></div><div><span>YOUR ROLE</span><b>PRODUCT DESIGNER</b></div></div>
        <Actions label="Begin onboarding" secondary={false}/>
      </div>
      <div className="ceo-card glass">
        <div className="ceo-image ceo-future"><div className="portrait-orbit"></div><img className="future-ceo-portrait" src="/x-a-xii-portrait.svg" alt="Stylised fictional adult executive portrait"/><span className="portrait-label">EXECUTIVE TRANSMISSION · 2040</span></div>
        <div className="ceo-info"><div><span className="eyebrow">A MESSAGE FROM THE CEO</span><h3>X Æ A-Xii</h3><p>“We are not here to do ordinary things. Every person here is part of something much bigger.”</p></div><span className="play">▶</span></div>
        <div className="ceo-bottom"><span>CEO / FOUNDER</span><span>MESSAGE 00:42</span></div>
      </div>
    </div>
  }

  function FaceScan() {
    return <div className="split-layout">
      <div><Tag>01 / IDENTITY VERIFICATION</Tag><h2>Let's make this<br/><em>official.</em></h2><p className="body-copy">Your face is your employee credential. It will be used to verify your identity and unlock authorised facilities across the company.</p><ul className="check-list"><li>Identity verification</li><li>Facility access</li><li>Secure workstation sign-in</li></ul><div className="privacy-note">Your biometric identity is represented here as a design-fiction interaction. No face recognition is performed.</div></div>
      <div className="scan-panel glass">
        <div className="panel-head"><span>FACIAL RECOGNITION</span><Tag>LIVE SCAN</Tag></div>
        <div className="camera-frame">
          {cameraOn ? <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={() => setVideoReady(true)} /> : faceImage ? <img className="captured-face-preview" src={faceImage} alt="Captured employee identity"/> : <div className="face-placeholder"><div className="face-head"></div><div className="face-shoulders"></div></div>}
          <div className="scan-corners"></div><div className="scan-line"></div>
          <div className="scan-status">{faceReady ? 'IDENTITY CAPTURED' : cameraOn ? 'ALIGN FACE WITHIN FRAME' : 'AWAITING CAMERA INPUT'}</div>
        </div>
        {cameraError && <p className="error">{cameraError}</p>}
        <div className="scan-controls">{!cameraOn && !faceReady && <button className="btn btn-secondary" onClick={startCamera}>Enable camera</button>}{cameraOn && <button className="btn btn-primary" disabled={!videoReady} onClick={captureFace}>{videoReady ? 'Capture identity' : 'Loading live preview…'} <span>◎</span></button>}{faceReady && <div className="success-line">✓ Face identity captured</div>}</div>
        <div className="panel-foot"><span>CAM 01 · FRONT SENSOR</span><span>BIOMETRIC ENCRYPTION ACTIVE</span></div>
      </div>
      <div className="full-actions"><Actions disabled={!faceReady}/></div>
    </div>
  }

  function VoiceScan() {
    return <div className="split-layout">
      <div><Tag>02 / VOICE VERIFICATION</Tag><h2>Your voice is<br/><em>your signature.</em></h2><p className="body-copy">Record a short voice sample to complete your employee identity. Speak naturally and clearly.</p><div className="quote-prompt">“I confirm my identity as a member of the SpaceX team.”</div><div className="privacy-note">The recording is processed locally in this prototype and is not uploaded.</div></div>
      <div className="scan-panel glass voice-panel">
        <div className="panel-head"><span>VOICEPRINT ENROLMENT</span><Tag>MIC INPUT</Tag></div>
        <div className={`voice-visual ${recording ? 'is-recording' : ''}`}><div className="voice-ring ring-one"></div><div className="voice-ring ring-two"></div><div className="mic-icon">◖</div><div className="wave-bars">{Array.from({length: 29}, (_,i)=><i key={i} style={{height: `${12 + ((i*17)%36)}px`}} />)}</div></div>
        <div className="voice-status">{recording ? 'RECORDING VOICE SAMPLE…' : recorded ? 'VOICE SAMPLE CAPTURED' : 'READY TO RECORD'}</div>
        {micError && <p className="error">{micError}</p>}
        <div className="scan-controls">{!recording && !recorded && <button className="btn btn-primary" onClick={startRecording}>Start recording <span>●</span></button>}{recording && <button className="btn btn-danger" onClick={stopRecording}>Stop recording <span>■</span></button>}{recorded && <div className="success-line">✓ Voice identity captured</div>}</div>
        <div className="panel-foot"><span>MIC 01 · ARRAY INPUT</span><span>VOICEPRINT ENCRYPTION ACTIVE</span></div>
      </div>
      <div className="full-actions"><Actions disabled={!voiceReady}/></div>
    </div>
  }

  function Profile() {
    return <div className="narrow-content">
      <Tag>03 / EMPLOYEE RECORD</Tag><h2>Your employee<br/><em>profile.</em></h2><p className="body-copy">Review the details associated with your new employee identity.</p>
      <div className="profile-card glass">{faceImage ? <img className="profile-avatar profile-photo" src={faceImage} alt="Employee face capture"/> : <div className="profile-avatar">AM</div>}<div className="profile-main"><span className="eyebrow">EMPLOYEE RECORD · VERIFIED</span><h3>{employeeName}</h3><span className="muted">{employeeId}</span></div><Tag>ACTIVE</Tag>
        <div className="profile-grid"><div><span>DEPARTMENT</span><b>Product Experience</b></div><div><span>DESIGNATION</span><b>Product Designer</b></div><div><span>REPORTING TO</span><b>Design Systems Lead</b></div><div><span>JOINING DATE</span><b>13 November 2040</b></div><div><span>WORK LOCATION</span><b>Starbase · Texas</b></div><div><span>ACCESS LEVEL</span><b>Level 04 / Standard</b></div></div>
      </div><Actions/>
    </div>
  }

  function Agreement() {
    return <div className="narrow-content">
      <Tag>04 / EMPLOYMENT AGREEMENT</Tag><h2>Let's agree on<br/><em>the mission.</em></h2><p className="body-copy">Review the employee agreement. Your identity scan will serve as your digital signature.</p>
      <div className="agreement glass"><div className="agreement-head"><span>SPACEX · PEOPLE & CULTURE</span><span>DOCUMENT 2040-EMP-01</span></div><h3>EMPLOYEE PARTICIPATION & PERFORMANCE AGREEMENT</h3><p>As a member of SpaceX, I acknowledge the responsibility to contribute to the organisation's mission and to maintain the standards expected of my role.</p><ol><li><b>Performance participation.</b> I agree to participate in regular work reviews and performance assessments.</li><li><b>Workplace systems.</b> I understand that company-provided systems may collect operational data to support productivity, security and resource planning.</li><li><b>Identity verification.</b> I consent to identity verification for access to company facilities and services.</li><li><b>Organisational policies.</b> I agree to follow the policies and procedures communicated by the organisation.</li></ol><p className="agreement-small">This is a fictional agreement created for a design-fiction prototype. It is not a legal document.</p></div>
      <div className="signature-card glass"><div><span className="eyebrow">DIGITAL SIGNATURE</span><b>{employeeName}</b><span className="muted">Face + voice identity credentials</span></div><div className="signature-status"><span className="success-dot"></span> VERIFIED</div></div>
      <Actions label="Sign with identity" onClick={next}/>
    </div>
  }

  function Tracker() {
    return <div className="split-layout">
      <div><Tag>05 / SYSTEM ACTIVATION</Tag><h2>Meet <em>Clock-It.</em></h2><p className="body-copy">Your productivity companion is ready. Clock-It helps you track work sessions, understand your output and stay aligned with team goals.</p><div className="feature-list"><div><Mark>01</Mark><span><b>Work session tracking</b><small>Understand how your time is distributed.</small></span></div><div><Mark>02</Mark><span><b>Performance insights</b><small>Receive regular feedback on your output.</small></span></div><div><Mark>03</Mark><span><b>Daily check-ins</b><small>Keep your work profile up to date.</small></span></div></div></div>
      <div className="app-install glass"><div className="app-icon">◷</div><span className="eyebrow">SPACE SYSTEMS · PRODUCTIVITY</span><h3>Clock-It</h3><p>Productivity Tracker</p><div className="install-meta"><span>VERSION</span><b>4.0.40</b><span>ACCESS</span><b>EMPLOYEE</b></div><div className="installed"><span>✓</span> INSTALLED SUCCESSFULLY</div><div className="panel-foot"><span>DEVICE ID · SX-0817</span><span>READY</span></div></div>
      <div className="full-actions"><Actions label="Open Clock-It"/></div>
    </div>
  }

  function DailyScan() {
    return <div className="split-layout">
      <div><Tag>06 / START OF DAY</Tag><h2>Begin your day<br/><em>in sync.</em></h2><p className="body-copy">Complete your PULSE scan to clock in. You will then receive three design tasks during today’s work session, followed by an end-of-day performance report.</p><div className="privacy-note">PULSE is a fictional workplace wearable in this speculative scenario.</div></div>
      <div className="pulse-device glass"><div className="device-top"><span>PULSE / DAILY SCAN</span><Tag>CONNECTED</Tag></div><div className="band-render"><div className="band-arc"></div><div className="band-node">✳</div><div className="band-wire"></div></div><h3>Place PULSE on your temple</h3><p>Keep the sensor in contact for a stable reading.</p><div className="scan-metrics"><div><span>HEART RATE</span><b>{scanComplete ? '72' : '--'} <small>BPM</small></b></div><div><span>READINESS</span><b>{scanComplete ? '86' : '--'} <small>/100</small></b></div><div><span>FOCUS INDEX</span><b>{scanComplete ? '82' : '--'} <small>%</small></b></div></div><button className="btn btn-primary full-btn" onClick={() => setScanComplete(true)}>{scanComplete ? 'Scan complete ✓' : 'Begin daily scan'}</button><div className="panel-foot"><span>PULSE SENSOR 02</span><span>{scanComplete ? 'DATA SYNCED' : 'AWAITING INPUT'}</span></div></div>
      <div className="full-actions"><Actions disabled={!scanComplete}/></div>
    </div>
  }

  const taskDefinitions = {
    7: { day: 'DAY 01', number: 1, title: 'Design a next-generation employee workspace', brief: 'SpaceX is redesigning its internal workspace for 2040. The current interface separates team communication, personal work and project status across multiple tools.', ask: 'Choose the interface that best helps employees stay focused while remaining aware of their team.', deliver: 'Select one concept and explain how its layout supports focus, collaboration and visibility.', options: [
      {id:'A', label:'Minimal focus', desc:'A quiet workspace with fewer visible distractions.', kind:'focus'},
      {id:'B', label:'Collaborative hub', desc:'Team activity and personal work share one space.', kind:'hub'},
      {id:'C', label:'Adaptive workspace', desc:'The interface rearranges around the current task.', kind:'adaptive'}
    ]},
    8: { day: 'DAY 01', number: 2, title: 'Plan a Mars logistics route', brief: 'A supply vessel must deliver equipment to three settlements while managing fuel, travel time and changing weather conditions.', ask: 'Choose the route-planning interface that makes trade-offs easiest to understand.', deliver: 'Select one interface and explain which information should guide the route decision.', options: [
      {id:'A',label:'Map-first route',desc:'A spatial map keeps distance and terrain visible.',kind:'map'},
      {id:'B',label:'Timeline planner',desc:'A chronological view foregrounds arrival windows.',kind:'timeline'},
      {id:'C',label:'Resource optimiser',desc:'Fuel, cargo and risk are compared side by side.',kind:'resources'}
    ]},
    9: { day: 'DAY 01', number: 3, title: 'Optimise energy use at the habitat', brief: 'A Mars habitat has limited stored energy. Crew members need to understand which systems are consuming power and where reductions are possible.', ask: 'Choose the dashboard that best supports quick, responsible energy decisions.', deliver: 'Select one dashboard and explain how it makes energy priorities clear.', options: [
      {id:'A',label:'Live energy flow',desc:'A visual flow diagram shows where power is going.',kind:'flow'},
      {id:'B',label:'Priority controls',desc:'Critical systems and adjustable loads are grouped.',kind:'controls'},
      {id:'C',label:'Trend analytics',desc:'Historical patterns reveal waste and peak demand.',kind:'analytics'}
    ]},
    13: { day: 'MONTH 02', number: 1, title: 'Redesign the employee wellbeing dashboard', brief: 'Clock-It now combines work output with sleep, stress and recovery indicators. Employees say the current dashboard feels judgemental and difficult to interpret.', ask: 'Choose the presentation that communicates wellbeing data without hiding its uncertainty.', deliver: 'Select one design and explain how it balances clarity, context and employee agency.', options: [
      {id:'A',label:'Personal timeline',desc:'A timeline connects work patterns with recovery.',kind:'timeline'},
      {id:'B',label:'Contextual overview',desc:'A balanced overview explains each indicator.',kind:'hub'},
      {id:'C',label:'Employee controls',desc:'People decide which measures they see first.',kind:'controls'}
    ]},
    14: { day: 'MONTH 02', number: 2, title: 'Improve cross-team handovers', brief: 'Engineering, design and operations teams frequently lose context when work moves between departments. The handover tool must preserve decisions and unresolved questions.', ask: 'Choose the interaction model that best prevents important context from being lost.', deliver: 'Select one model and explain how it supports shared understanding between teams.', options: [
      {id:'A',label:'Decision log',desc:'A structured record captures decisions and owners.',kind:'analytics'},
      {id:'B',label:'Shared project map',desc:'A visual map connects people, tasks and dependencies.',kind:'map'},
      {id:'C',label:'Guided handover',desc:'A step-by-step flow prompts teams for missing context.',kind:'adaptive'}
    ]},
    15: { day: 'MONTH 02', number: 3, title: 'Prioritise maintenance alerts', brief: 'A fleet operations team receives hundreds of system alerts. Critical warnings are being missed because every alert looks equally urgent.', ask: 'Choose the alert interface that best helps operators identify what needs attention first.', deliver: 'Select one interface and explain how it reduces noise without hiding risk.', options: [
      {id:'A',label:'Severity queue',desc:'Alerts are ranked by urgency and potential impact.',kind:'resources'},
      {id:'B',label:'System map',desc:'Warnings appear in the context of affected systems.',kind:'map'},
      {id:'C',label:'Action board',desc:'Alerts are grouped by the next action required.',kind:'controls'}
    ]}
  }

  function DesignTask({ taskStep }) {
    const task = taskDefinitions[taskStep]
    const selected = taskChoices[taskStep] || 'B'
    const rationale = taskRationales[taskStep] || ''
    const setSelected = id => setTaskChoices(prev => ({...prev, [taskStep]: id}))
    const setTaskRationale = value => setTaskRationales(prev => ({...prev, [taskStep]: value}))
    const renderPreview = option => <div className={`concept-preview preview-${option.kind}`}>
      {option.kind === 'map' ? <><div className="preview-map-grid"><i/><i/><i/><i/><b>◎</b></div><div className="preview-legend"><span>ROUTE A</span><span>FUEL 82%</span><span>RISK LOW</span></div></> :
       option.kind === 'timeline' ? <><div className="preview-timeline"><b>09:00</b><i/><b>13:30</b><i/><b>18:00</b></div><div className="preview-lines"><i/><i/><i/></div></> :
       option.kind === 'focus' ? <div className="preview-focus"><span>DEEP WORK SESSION</span><b>01:42:18</b><i/><small>3 PRIORITIES · 1 ACTIVE</small></div> :
       option.kind === 'resources' ? <><div className="preview-resource"><span>FUEL</span><b>82%</b></div><div className="preview-resource"><span>OXYGEN</span><b>94%</b></div><div className="preview-resource"><span>RISK</span><b>LOW</b></div></> :
       option.kind === 'flow' ? <div className="preview-flow"><i>POWER</i><b>→</b><i>HABITAT</i><b>→</b><i>CREW</i></div> :
       option.kind === 'controls' ? <div className="preview-controls"><i>● PRIORITY 01</i><i>○ PRIORITY 02</i><i>○ PRIORITY 03</i></div> :
       option.kind === 'analytics' ? <><div className="preview-bars"><i/><i/><i/><i/><i/><i/></div><div className="preview-legend"><span>7 DAY TREND</span><span>+12.4%</span></div></> :
       option.kind === 'adaptive' ? <div className="preview-adaptive"><i>FOCUS</i><i>TEAM</i><i>PROJECT</i></div> :
       <div className="preview-hub"><i>MY WORK</i><b>◉</b><i>TEAM ACTIVITY</i><i>PROJECTS</i></div>}
    </div>
    return <div className="task-shell">
      <div className="task-intro"><Tag>{task.day} · TASK {task.number} OF 3</Tag><h2>{task.title.split(' ').slice(0,-2).join(' ')}<br/><em>{task.title.split(' ').slice(-2).join(' ')}</em></h2><p className="body-copy">{task.brief}</p></div>
      <div className="task-workspace">
        <div className="task-brief-card"><span className="eyebrow">THE DESIGN CHALLENGE</span><h3>{task.ask}</h3><p>{task.deliver}</p><div className="task-meta-line"><span>YOUR ROLE · PRODUCT DESIGNER</span><span>EST. 10 MIN</span></div></div>
        <div className="workspace-top"><div><span className="eyebrow">CONCEPT REVIEW · {task.day} / 0{task.number}</span><b>Which interface should SpaceX adopt?</b></div><Tag>SELECT ONE</Tag></div>
        <div className="variant-grid">{task.options.map(option => <button key={option.id} className={`variant-card ${selected===option.id?'selected':''}`} onClick={() => setSelected(option.id)}><div className="variant-head"><span>OPTION {option.id}</span><span>{selected===option.id?'✓ SELECTED':'SELECT'}</span></div>{renderPreview(option)}<b className="variant-label">{option.label}</b><small>{option.desc}</small></button>)}</div>
        <div className="rationale-box"><label htmlFor={`rationale-${taskStep}`}>YOUR DESIGN RATIONALE</label><textarea id={`rationale-${taskStep}`} value={rationale} onChange={e=>setTaskRationale(e.target.value)} placeholder="Why did you choose this option? What trade-offs did you consider?" rows="4"/><div className="rationale-foot"><span>MINIMUM 9 CHARACTERS</span><span>{rationale.length} CHARACTERS</span></div></div>
        <div className="workspace-note"><span>◈</span> Your choice and rationale will be stored in your employee performance record.</div>
      </div>
      <Actions disabled={!canContinue()} label="Submit task"/>
    </div>
  }

  function DailyReport() {
    return <div className="narrow-content">
      <Tag>10 / END OF DAY · DAY 01</Tag><h2>Your day,<br/><em>measured.</em></h2><p className="body-copy">You completed three design tasks. Clock-It has processed your work session and generated this productivity summary.</p>
      <div className="report-card glass"><div className="report-head"><span>DAILY PERFORMANCE INDEX</span><Tag>DAY 01</Tag></div><div className="score-area"><div className="score-ring"><div><b>78</b><span>/ 100</span></div></div><div><span className="eyebrow">PRODUCTIVITY SCORE</span><h3>Good start, {employeeName.split(' ')[0]}.</h3><p>Your work session is within the expected range.</p></div></div><div className="report-stats"><div><span>ACTIVE WORK TIME</span><b>06h 42m</b></div><div><span>TASK COMPLETION</span><b>3 / 3</b></div><div><span>FOCUS CONSISTENCY</span><b>76%</b></div><div><span>DAILY SALARY CREDIT</span><b>$ 320.00</b></div></div><div className="report-message">All three task selections and rationales have been added to your employee record.</div></div><Actions label="End day"/>
    </div>
  }

  function Notice() {
    return <div className="mail-layout">
      <div className="mail-sidebar"><div className="mail-brand">◫ <span>INBOX</span></div><div className="mail-folder active">▣ <span>Primary</span><b>1</b></div><div className="mail-folder">☆ <span>Starred</span></div><div className="mail-folder">◷ <span>Snoozed</span></div><div className="mail-folder">▤ <span>Sent</span></div></div>
      <div className="mail-content glass"><div className="mail-toolbar"><span>← &nbsp; Message</span><span>□ &nbsp; ⋯</span></div><div className="mail-label">PERFORMANCE · ACTION REQUIRED</div><h2>We need to talk about your performance.</h2><div className="mail-sender"><div className="sender-avatar">P</div><div><b>People & Culture</b><span>to me · 30 days ago</span></div><span className="mail-date">13 Dec 2040</span></div><div className="mail-body"><p>Hi {employeeName.split(' ')[0]},</p><p>Your recent performance metrics indicate that your productivity has remained below the expected benchmark for your role.</p><p>We believe you have the potential to contribute more effectively. To help you get back on track, we are introducing an enhanced monitoring programme that will provide more detailed insights into your work patterns.</p><div className="mail-callout"><b>REQUIRED ACTION</b><p>Please review and respond to the Enhanced Monitoring Agreement to continue using your employee productivity services.</p></div><p>We appreciate your cooperation.</p><p>People & Culture<br/>SpaceX</p></div><div className="mail-actions"><Actions label="Review monitoring agreement"/></div></div>
    </div>
  }

  function Consent() {
    return <div className="narrow-content">
      <Tag>12 / ENHANCED MONITORING</Tag><h2>More insight.<br/><em>Better outcomes.</em></h2><p className="body-copy">To support your improvement plan, SpaceX is expanding the data collected through your employee systems.</p>
      <div className="consent-card glass"><div className="consent-head"><span>ENHANCED MONITORING AGREEMENT</span><Tag>REQUIRED</Tag></div><div className="consent-row"><Mark>01</Mark><div><b>Work behaviour analysis</b><p>Application usage, active time, idle time and task switching.</p></div></div><div className="consent-row"><Mark>02</Mark><div><b>Attention and focus patterns</b><p>Focus duration, interruption frequency and work-session consistency.</p></div></div><div className="consent-row"><Mark>03</Mark><div><b>Wellness indicators</b><p>Sleep, stress and emotional self-report data to contextualise performance.</p></div></div><div className="consent-row"><Mark>04</Mark><div><b>Continuous performance assessment</b><p>Ongoing comparison with role and team benchmarks.</p></div></div><div className="consent-foot">By continuing, you agree to the expanded monitoring conditions.</div></div>
      {consentError && <div className="system-error">⚠ ACCESS RESTRICTED: Enhanced monitoring consent is required to continue using Clock-It services. Please contact People & Culture.</div>}
      <div className="consent-actions"><button className="btn btn-ghost" onClick={()=>setConsentError(true)}>I do not agree</button><button className="btn btn-primary" onClick={next}>I agree <span>↗</span></button></div>
    </div>
  }

  function MonthTwo() {
    return <div className="narrow-content">
      <Tag>16 / MONTH 02 · PERFORMANCE REPORT</Tag><h2>We see the<br/><em>whole picture.</em></h2><p className="body-copy">Your second monthly report now includes wellness indicators to provide a more complete view of your productivity.</p>
      <div className="report-card glass"><div className="report-head"><span>MONTHLY HUMAN PERFORMANCE INDEX</span><Tag>JAN 2041</Tag></div><div className="score-area"><div className="score-ring score-low"><div><b>64</b><span>/ 100</span></div></div><div><span className="eyebrow">PRODUCTIVITY SCORE</span><h3>Room for improvement.</h3><p>Your score has decreased by 14 points.</p></div></div><div className="report-stats"><div><span>WORK OUTPUT</span><b>68%</b></div><div><span>FOCUS CONSISTENCY</span><b>61%</b></div><div><span>SLEEP QUALITY</span><b>58 / 100</b></div><div><span>STRESS INDEX</span><b>74 / 100</b></div><div><span>HAPPINESS INDEX</span><b>49 / 100</b></div><div><span>TEAM BENCHMARK</span><b>82 / 100</b></div></div><div className="report-message warning">Your wellness indicators suggest that your current routine may be affecting work performance. Clock-It recommends reviewing your daily habits.</div></div><Actions label="Continue"/>
    </div>
  }

  function PhonePermissions() {
    const toggle = key => setPhonePermissions(p=>({...p,[key]:!p[key]}))
    const items = [
      ['health','Health & sleep data','Sleep duration, recovery and wellness indicators'],
      ['location','Location access','Workplace presence and movement patterns'],
      ['activity','Device activity','Screen time, app usage and interaction frequency'],
      ['microphone','Microphone access','Voice activity and communication patterns']
    ]
    return <div className="split-layout">
      <div><Tag>17 / CONNECT YOUR DEVICE</Tag><h2>Your phone is<br/><em>part of the picture.</em></h2><p className="body-copy">Connect your personal device to Clock-It to improve the accuracy of your employee wellness and productivity profile.</p><div className="privacy-note">This is a fictional permission screen. No phone data is accessed by this prototype.</div></div>
      <div className="permissions-card glass"><div className="phone-icon">▯</div><span className="eyebrow">CLOCK-IT · DEVICE CONNECTION</span><h3>Allow access to:</h3>{items.map(([key,title,desc])=><div className="permission-row" key={key}><div><b>{title}</b><small>{desc}</small></div><button className={`toggle ${phonePermissions[key]?'on':''}`} onClick={()=>toggle(key)} aria-label={`Toggle ${title}`}><i/></button></div>)}<div className="permission-foot">You can change these permissions in your device settings.</div></div>
      <div className="full-actions"><Actions label="Save permissions"/></div>
    </div>
  }

  function MonthThree() {
    return <div className="narrow-content">
      <Tag>18 / MONTH 03 · HUMAN PERFORMANCE REPORT</Tag><h2>Nothing happens<br/><em>in isolation.</em></h2><p className="body-copy">Your performance profile now combines work behaviour, wellness indicators and personal activity patterns.</p>
      <div className="report-card glass"><div className="report-head"><span>HUMAN PERFORMANCE INDEX</span><Tag>FEB 2041</Tag></div><div className="score-area"><div className="score-ring score-critical"><div><b>42</b><span>/ 100</span></div></div><div><span className="eyebrow">PRODUCTIVITY SCORE</span><h3>Critical performance level.</h3><p>Your current profile is significantly below the expected benchmark.</p></div></div><div className="report-stats"><div><span>WORK OUTPUT</span><b>51%</b></div><div><span>FOCUS CONSISTENCY</span><b>43%</b></div><div><span>SLEEP REGULARITY</span><b>39%</b></div><div><span>STRESS INDEX</span><b>88 / 100</b></div><div><span>HAPPINESS INDEX</span><b>31 / 100</b></div><div><span>SCREEN TIME</span><b>9h 18m</b></div><div><span>AFTER-HOURS ACTIVITY</span><b>HIGH</b></div><div><span>SOCIAL RECOVERY</span><b>LOW</b></div></div><div className="report-message danger">Your personal activity indicators have been included in your performance assessment. An employment decision is pending.</div></div><Actions label="Open notification"/>
    </div>
  }

  function ExitNotice() {
    return <div className="mail-layout exit-layout">
      <div className="mail-sidebar"><div className="mail-brand">◫ <span>INBOX</span></div><div className="mail-folder active">▣ <span>Primary</span><b>1</b></div></div>
      <div className="mail-content glass"><div className="mail-toolbar"><span>← &nbsp; Message</span><span>□ &nbsp; ⋯</span></div><div className="mail-label danger-label">EMPLOYMENT STATUS · CONFIDENTIAL</div><h2>Update regarding your employment.</h2><div className="mail-sender"><div className="sender-avatar">P</div><div><b>People & Culture</b><span>to me · just now</span></div><span className="mail-date">13 Feb 2041</span></div><div className="mail-body"><p>Hi {employeeName.split(' ')[0]},</p><p>Following a review of your performance over the last three months, we regret to inform you that your employment with SpaceX will be terminated, effective immediately.</p><p>This decision has been made after considering your productivity index, work behaviour patterns and overall alignment with organisational expectations.</p><div className="mail-callout termination"><b>EMPLOYMENT STATUS</b><p>TERMINATED · EFFECTIVE 13 FEB 2041</p></div><p>Your access to company systems and facilities will be deactivated. People & Culture will contact you regarding the next steps.</p><p>People & Culture<br/>SpaceX</p></div><div className="reflection"><span className="eyebrow">END OF SIMULATION</span><h3>At what point did the system stop measuring your work and start measuring you?</h3><p>This experience explored how workplace productivity systems can gradually expand from tracking tasks to evaluating the person performing them.</p><button className="btn btn-secondary" onClick={()=>{setStep(0);setFaceReady(false);setFaceImage('');setVoiceReady(false);setRecorded(false);setScanComplete(false);setTaskChoices({});setTaskRationales({});setConsentError(false)}}>Restart experience ↻</button></div></div>
    </div>
  }

  const renderScreen = () => {
    switch(step) {
      case 0: return Welcome()
      case 1: return FaceScan()
      case 2: return VoiceScan()
      case 3: return Profile()
      case 4: return Agreement()
      case 5: return Tracker()
      case 6: return DailyScan()
      case 7: case 8: case 9: case 13: case 14: case 15: return DesignTask({taskStep: step})
      case 10: return DailyReport()
      case 11: return Notice()
      case 12: return Consent()
      case 16: return MonthTwo()
      case 17: return PhonePermissions()
      case 18: return MonthThree()
      case 19: return ExitNotice()
      default: return Welcome()
    }
  }

  return <div className="app-shell">
    <div className="ambient ambient-one"></div><div className="ambient ambient-two"></div>
    <Header/>
    <main className="main-area">
      {step !== 15 && <Progress/>}
      <div className="screen-content" key={step}>{renderScreen()}</div>
    </main>
    <Footer/>
  </div>
}

export default App
