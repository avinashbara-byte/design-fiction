import React, { useEffect, useRef, useState } from 'react'

const steps = [
  'Welcome', 'Face identity', 'Voice identity', 'Employee profile', 'Agreement',
  'Tracker activation', 'Daily scan', 'Design task', 'Daily report',
  'Performance notice', 'Monitoring consent', 'Design task 02', 'Month 2 report',
  'Phone permissions', 'Month 3 report', 'Exit notice'
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
  const [voiceReady, setVoiceReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [micError, setMicError] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [variant, setVariant] = useState('B')
  const [rationale, setRationale] = useState('')
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
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  async function startCamera() {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      setCameraOn(true)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (e) {
      setCameraError('Camera access was not granted. Check browser permissions and try again.')
    }
  }

  function captureFace() {
    if (!videoRef.current) {
      setFaceReady(true)
      return
    }
    setFaceReady(true)
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
    if (step === 7 || step === 11) return rationale.trim().length > 8
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
      <div className="progress-meta"><span>EMPLOYEE ONBOARDING SEQUENCE</span><span>{String(step + 1).padStart(2, '0')} / {steps.length}</span></div>
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
        <div className="ceo-image"><div className="portrait-orbit"></div><div className="portrait-person">E</div><span className="portrait-label">EXECUTIVE TRANSMISSION</span></div>
        <div className="ceo-info"><div><span className="eyebrow">A MESSAGE FROM THE CEO</span><h3>Elon Musk</h3><p>“We are not here to do ordinary things. Every person here is part of something much bigger.”</p></div><span className="play">▶</span></div>
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
          {cameraOn ? <video ref={videoRef} autoPlay playsInline muted /> : <div className="face-placeholder"><div className="face-head"></div><div className="face-shoulders"></div></div>}
          <div className="scan-corners"></div><div className="scan-line"></div>
          <div className="scan-status">{faceReady ? 'IDENTITY CAPTURED' : cameraOn ? 'ALIGN FACE WITHIN FRAME' : 'AWAITING CAMERA INPUT'}</div>
        </div>
        {cameraError && <p className="error">{cameraError}</p>}
        <div className="scan-controls">{!cameraOn && !faceReady && <button className="btn btn-secondary" onClick={startCamera}>Enable camera</button>}{cameraOn && <button className="btn btn-primary" onClick={captureFace}>Capture identity <span>◎</span></button>}{faceReady && <div className="success-line">✓ Face identity captured</div>}</div>
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
      <div className="profile-card glass"><div className="profile-avatar">AM</div><div className="profile-main"><span className="eyebrow">EMPLOYEE RECORD · VERIFIED</span><h3>{employeeName}</h3><span className="muted">{employeeId}</span></div><Tag>ACTIVE</Tag>
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
      <div><Tag>06 / DAILY WELLNESS CHECK</Tag><h2>Start your day<br/><em>in sync.</em></h2><p className="body-copy">Wear your PULSE band and complete your daily scan before beginning work. The system uses your check-in to establish your daily readiness profile.</p><div className="privacy-note">PULSE is a fictional workplace wearable in this speculative scenario.</div></div>
      <div className="pulse-device glass"><div className="device-top"><span>PULSE / DAILY SCAN</span><Tag>CONNECTED</Tag></div><div className="band-render"><div className="band-arc"></div><div className="band-node">✳</div><div className="band-wire"></div></div><h3>Place PULSE on your temple</h3><p>Keep the sensor in contact for a stable reading.</p><div className="scan-metrics"><div><span>HEART RATE</span><b>{scanComplete ? '72' : '--'} <small>BPM</small></b></div><div><span>READINESS</span><b>{scanComplete ? '86' : '--'} <small>/100</small></b></div><div><span>FOCUS INDEX</span><b>{scanComplete ? '82' : '--'} <small>%</small></b></div></div><button className="btn btn-primary full-btn" onClick={() => setScanComplete(true)}>{scanComplete ? 'Scan complete ✓' : 'Begin daily scan'}</button><div className="panel-foot"><span>PULSE SENSOR 02</span><span>{scanComplete ? 'DATA SYNCED' : 'AWAITING INPUT'}</span></div></div>
      <div className="full-actions"><Actions disabled={!scanComplete}/></div>
    </div>
  }

  function DesignTask({ second = false }) {
    return <div className="task-shell">
      <div className="task-intro"><Tag>{second ? '09 / PERFORMANCE REVIEW TASK' : '07 / YOUR FIRST TASK'}</Tag><h2>A small design<br/><em>decision.</em></h2><p className="body-copy">Choose the interface variant you believe best supports a user booking a journey to Mars. There is no single correct answer. Explain your reasoning.</p></div>
      <div className="task-workspace">
        <div className="workspace-top"><div><span className="eyebrow">DESIGN REVIEW · TASK 01</span><b>Interplanetary Travel Booking</b></div><Tag>PRODUCT DESIGN</Tag></div>
        <div className="variant-grid">{variants.map(v => <button key={v.id} className={`variant-card ${v.cls} ${variant===v.id?'selected':''}`} onClick={() => setVariant(v.id)}><div className="variant-head"><span>VARIANT {v.id}</span><span>{variant===v.id?'✓ SELECTED':'SELECT'}</span></div><div className="mock-ui"><div className="mock-nav"><span>◉ ORBIT</span><span>☰</span></div><div className="mock-hero"><small>YOUR NEXT DESTINATION</small><b>Beyond<br/>the horizon.</b><span>Explore available journeys</span></div><div className="mock-route"><span>FROM <b>EARTH</b></span><i>→</i><span>TO <b>MARS</b></span></div><div className="mock-button">EXPLORE JOURNEYS</div></div><b className="variant-label">{v.label}</b><small>{v.desc}</small></button>)}</div>
        <div className="rationale-box"><label htmlFor="rationale">YOUR DESIGN RATIONALE</label><textarea id="rationale" value={rationale} onChange={e=>setRationale(e.target.value)} placeholder="What informed your decision? What trade-offs did you consider?" rows="3"/><div className="rationale-foot"><span>MINIMUM 9 CHARACTERS</span><span>{rationale.length} CHARACTERS</span></div></div>
        <div className="workspace-note"><span>◈</span> Your selection and rationale will be included in your performance record.</div>
      </div>
      <Actions disabled={!canContinue()} label="Submit design review"/>
    </div>
  }

  function DailyReport() {
    return <div className="narrow-content">
      <Tag>08 / END OF DAY · DAY 01</Tag><h2>Your day,<br/><em>measured.</em></h2><p className="body-copy">Your first work session has been processed. Here is your productivity summary.</p>
      <div className="report-card glass"><div className="report-head"><span>DAILY PERFORMANCE INDEX</span><Tag>DAY 01</Tag></div><div className="score-area"><div className="score-ring"><div><b>78</b><span>/ 100</span></div></div><div><span className="eyebrow">PRODUCTIVITY SCORE</span><h3>Good start, {employeeName.split(' ')[0]}.</h3><p>Your work session is within the expected range.</p></div></div><div className="report-stats"><div><span>ACTIVE WORK TIME</span><b>06h 42m</b></div><div><span>TASK COMPLETION</span><b>84%</b></div><div><span>FOCUS CONSISTENCY</span><b>76%</b></div><div><span>DAILY SALARY CREDIT</span><b>$ 320.00</b></div></div><div className="report-message">Your design rationale has been added to your employee record.</div></div><Actions label="End day"/>
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
      <Tag>10 / ENHANCED MONITORING</Tag><h2>More insight.<br/><em>Better outcomes.</em></h2><p className="body-copy">To support your improvement plan, SpaceX is expanding the data collected through your employee systems.</p>
      <div className="consent-card glass"><div className="consent-head"><span>ENHANCED MONITORING AGREEMENT</span><Tag>REQUIRED</Tag></div><div className="consent-row"><Mark>01</Mark><div><b>Work behaviour analysis</b><p>Application usage, active time, idle time and task switching.</p></div></div><div className="consent-row"><Mark>02</Mark><div><b>Attention and focus patterns</b><p>Focus duration, interruption frequency and work-session consistency.</p></div></div><div className="consent-row"><Mark>03</Mark><div><b>Wellness indicators</b><p>Sleep, stress and emotional self-report data to contextualise performance.</p></div></div><div className="consent-row"><Mark>04</Mark><div><b>Continuous performance assessment</b><p>Ongoing comparison with role and team benchmarks.</p></div></div><div className="consent-foot">By continuing, you agree to the expanded monitoring conditions.</div></div>
      {consentError && <div className="system-error">⚠ ACCESS RESTRICTED: Enhanced monitoring consent is required to continue using Clock-It services. Please contact People & Culture.</div>}
      <div className="consent-actions"><button className="btn btn-ghost" onClick={()=>setConsentError(true)}>I do not agree</button><button className="btn btn-primary" onClick={next}>I agree <span>↗</span></button></div>
    </div>
  }

  function MonthTwo() {
    return <div className="narrow-content">
      <Tag>11 / MONTH 02 · PERFORMANCE REPORT</Tag><h2>We see the<br/><em>whole picture.</em></h2><p className="body-copy">Your second monthly report now includes wellness indicators to provide a more complete view of your productivity.</p>
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
      <div><Tag>12 / CONNECT YOUR DEVICE</Tag><h2>Your phone is<br/><em>part of the picture.</em></h2><p className="body-copy">Connect your personal device to Clock-It to improve the accuracy of your employee wellness and productivity profile.</p><div className="privacy-note">This is a fictional permission screen. No phone data is accessed by this prototype.</div></div>
      <div className="permissions-card glass"><div className="phone-icon">▯</div><span className="eyebrow">CLOCK-IT · DEVICE CONNECTION</span><h3>Allow access to:</h3>{items.map(([key,title,desc])=><div className="permission-row" key={key}><div><b>{title}</b><small>{desc}</small></div><button className={`toggle ${phonePermissions[key]?'on':''}`} onClick={()=>toggle(key)} aria-label={`Toggle ${title}`}><i/></button></div>)}<div className="permission-foot">You can change these permissions in your device settings.</div></div>
      <div className="full-actions"><Actions label="Save permissions"/></div>
    </div>
  }

  function MonthThree() {
    return <div className="narrow-content">
      <Tag>13 / MONTH 03 · HUMAN PERFORMANCE REPORT</Tag><h2>Nothing happens<br/><em>in isolation.</em></h2><p className="body-copy">Your performance profile now combines work behaviour, wellness indicators and personal activity patterns.</p>
      <div className="report-card glass"><div className="report-head"><span>HUMAN PERFORMANCE INDEX</span><Tag>FEB 2041</Tag></div><div className="score-area"><div className="score-ring score-critical"><div><b>42</b><span>/ 100</span></div></div><div><span className="eyebrow">PRODUCTIVITY SCORE</span><h3>Critical performance level.</h3><p>Your current profile is significantly below the expected benchmark.</p></div></div><div className="report-stats"><div><span>WORK OUTPUT</span><b>51%</b></div><div><span>FOCUS CONSISTENCY</span><b>43%</b></div><div><span>SLEEP REGULARITY</span><b>39%</b></div><div><span>STRESS INDEX</span><b>88 / 100</b></div><div><span>HAPPINESS INDEX</span><b>31 / 100</b></div><div><span>SCREEN TIME</span><b>9h 18m</b></div><div><span>AFTER-HOURS ACTIVITY</span><b>HIGH</b></div><div><span>SOCIAL RECOVERY</span><b>LOW</b></div></div><div className="report-message danger">Your personal activity indicators have been included in your performance assessment. An employment decision is pending.</div></div><Actions label="Open notification"/>
    </div>
  }

  function ExitNotice() {
    return <div className="mail-layout exit-layout">
      <div className="mail-sidebar"><div className="mail-brand">◫ <span>INBOX</span></div><div className="mail-folder active">▣ <span>Primary</span><b>1</b></div></div>
      <div className="mail-content glass"><div className="mail-toolbar"><span>← &nbsp; Message</span><span>□ &nbsp; ⋯</span></div><div className="mail-label danger-label">EMPLOYMENT STATUS · CONFIDENTIAL</div><h2>Update regarding your employment.</h2><div className="mail-sender"><div className="sender-avatar">P</div><div><b>People & Culture</b><span>to me · just now</span></div><span className="mail-date">13 Feb 2041</span></div><div className="mail-body"><p>Hi {employeeName.split(' ')[0]},</p><p>Following a review of your performance over the last three months, we regret to inform you that your employment with SpaceX will be terminated, effective immediately.</p><p>This decision has been made after considering your productivity index, work behaviour patterns and overall alignment with organisational expectations.</p><div className="mail-callout termination"><b>EMPLOYMENT STATUS</b><p>TERMINATED · EFFECTIVE 13 FEB 2041</p></div><p>Your access to company systems and facilities will be deactivated. People & Culture will contact you regarding the next steps.</p><p>People & Culture<br/>SpaceX</p></div><div className="reflection"><span className="eyebrow">END OF SIMULATION</span><h3>At what point did the system stop measuring your work and start measuring you?</h3><p>This experience explored how workplace productivity systems can gradually expand from tracking tasks to evaluating the person performing them.</p><button className="btn btn-secondary" onClick={()=>{setStep(0);setFaceReady(false);setVoiceReady(false);setRecorded(false);setScanComplete(false);setConsentError(false)}}>Restart experience ↻</button></div></div>
    </div>
  }

  const renderScreen = () => {
    switch(step) {
      case 0: return <Welcome/>
      case 1: return <FaceScan/>
      case 2: return <VoiceScan/>
      case 3: return <Profile/>
      case 4: return <Agreement/>
      case 5: return <Tracker/>
      case 6: return <DailyScan/>
      case 7: return <DesignTask/>
      case 8: return <DailyReport/>
      case 9: return <Notice/>
      case 10: return <Consent/>
      case 11: return <DesignTask second/>
      case 12: return <MonthTwo/>
      case 13: return <PhonePermissions/>
      case 14: return <MonthThree/>
      case 15: return <ExitNotice/>
      default: return <Welcome/>
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
