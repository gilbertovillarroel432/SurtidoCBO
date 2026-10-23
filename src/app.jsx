import React, { useState, useEffect, useRef } from 'react';
import { cronogramaMes, estacionesSubsidiadas } from './data/cronograma';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const [isEstacionesOpen, setIsEstacionesOpen] = useState(false);
  const [openDirecciones, setOpenDirecciones] = useState({});
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Estados para el menú, alertas, widgets, compartir imagen y páginas legales
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFooterInfo, setActiveFooterInfo] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showWidgetPreviewModal, setShowWidgetPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  
  // Modales Legales
  const [showAvisoLegal, setShowAvisoLegal] = useState(false);
  const [showPrivacidad, setShowPrivacidad] = useState(false);
  const [showCookiesConfig, setShowCookiesConfig] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState({
    necesarias: true,
    analiticas: false,
    preferencias: true
  });

  // Notificaciones y PWA
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const [alertDate, setAlertDate] = useState('');
  const [alertHour, setAlertHour] = useState('08');
  const [alertMinute, setAlertMinute] = useState('00');
  const [alertPeriod, setAlertPeriod] = useState('AM');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSavedMsg, setAlertSavedMsg] = useState('');
  const [alertErrorMsg, setAlertErrorMsg] = useState('');

  const [slideDirection, setSlideDirection] = useState('translate-x-0');
  const shareCardRef = useRef(null);

  // Capturar evento de instalación de PWA en navegadores compatibles
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDateChange = (newDateStr) => {
    if (newDateStr === selectedDateStr) return;
    
    const isForward = newDateStr > selectedDateStr;
    setSlideDirection(isForward ? 'translate-x-4 opacity-50' : '-translate-x-4 opacity-50');

    setTimeout(() => {
      setSelectedDateStr(newDateStr);
      setSlideDirection('translate-x-0 opacity-100');
    }, 150);
  };

  const toggleDireccion = (nombreEstacion) => {
    setOpenDirecciones(prev => ({
      ...prev,
      [nombreEstacion]: !prev[nombreEstacion]
    }));
  };

  const direccionesEspecificas = {
    "Angostura": "Avenida Perimetral, Ciudad Bolívar (Parroquia La Sabanita, Municipio Angostura del Orinoco), Bolívar, Venezuela.",
    "Perú": "Av. Principal del Perú, Sector El Perú, Ciudad Bolívar (cerca de la Iglesia de Jesucristo de los Santos de los Últimos Días y la Parroquia Espíritu Santo).",
    "Tacoma": "Prolongación de la Avenida Sucre, sector Puente Gómez, parroquia La Sabanita, Municipio Heres, Ciudad Bolívar, Estado Bolívar."
  };

  const footerModalData = {
    "comoFunciona": {
      title: "¿Cómo funciona?",
      content: "Puedes navegar fácilmente entre los días utilizando la barra superior interactiva de 5 días o abriendo el botón de 'Ver Calendario' para seleccionar cualquier fecha del mes actual. Al seleccionar un día, la tarjeta principal se actualizará automáticamente mostrando los terminales de placas correspondientes y las estaciones de servicio subsidiadas autorizadas."
    },
    "esGubernamental": {
      title: "¿Es una app gubernamental?",
      content: "No. Esta aplicación es una iniciativa independiente creada por un ciudadano y usuario común de Ciudad Bolívar. Su único propósito es recopilar, organizar y facilitar el acceso a la información pública del cronograma de suministro de combustible de manera rápida y amigable."
    },
    "objetivo": {
      title: "Objetivo",
      content: "El objetivo principal es optimizar el tiempo de los conductores en Ciudad Bolívar, ofreciendo una herramienta digital transparente, ligera y sin publicidad invasiva que permita consultar de antemano el terminal de placas asignado para el surtido diario de gasolina subsidiada."
    },
    "privacidad": {
      title: "Privacidad absoluta",
      content: "Tu privacidad es total. Esta aplicación no recopila ningún tipo de información personal, no solicita registros de usuario, correos electrónicos ni contraseñas. Toda la configuración de preferencias (como el modo oscuro) se almacena de forma local en tu propio dispositivo."
    },
    "exencion": {
      title: "Exención total de responsabilidad",
      content: "Esta plataforma se ofrece con fines puramente informativos y de apoyo comunitario. Los desarrolladores no tienen vinculación con las autoridades de suministro de combustible y no se hacen responsables por cambios imprevistos en el cronograma oficial, retrasos, reprogramaciones o disponibilidad de combustible en las estaciones."
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const today = new Date();
  const formatDateStr = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = formatDateStr(today);

  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  useEffect(() => {
    const hideModal = localStorage.getItem('hideWelcomeModal');
    if (!hideModal) {
      setShowModal(true);
    }
    const cookieConsent = localStorage.getItem('surtidoCboCookiesAccepted');
    if (!cookieConsent) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleCloseModal = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideWelcomeModal', 'true');
    }
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 250);
  };

  const handleAcceptAllCookies = () => {
    localStorage.setItem('surtidoCboCookiesAccepted', 'all');
    setShowCookieBanner(false);
  };

  const handleSaveCookiePrefs = () => {
    localStorage.setItem('surtidoCboCookiesAccepted', JSON.stringify(cookiePrefs));
    setShowCookiesConfig(false);
    setShowCookieBanner(false);
  };

  const getFiveDaysRange = () => {
    const days = [];
    const baseDate = new Date(selectedDateStr + 'T00:00:00');
    for (let i = -2; i <= 2; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push({
        dateStr: formatDateStr(d),
        dayNum: d.getDate(),
        monthShort: d.toLocaleDateString('es-ES', { month: 'short' }),
        dayName: d.toLocaleDateString('es-ES', { weekday: 'short' }),
        isToday: formatDateStr(d) === todayStr,
      });
    }
    return days;
  };

  const fiveDays = getFiveDaysRange();

  const getDaysInCurrentMonth = () => {
    const currentDateObj = new Date(selectedDateStr + 'T00:00:00');
    const year = currentDateObj.getFullYear();
    const month = currentDateObj.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysArray = [];
    let startDayOfWeek = firstDayOfMonth.getDay(); 
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push(null);
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      daysArray.push({
        dateStr: formatDateStr(d),
        dayNum: i,
        isToday: formatDateStr(d) === todayStr,
      });
    }
    return { daysArray, monthName: firstDayOfMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) };
  };

  const { daysArray, monthName } = getDaysInCurrentMonth();

  const currentData = cronogramaMes.find(item => item.fecha === selectedDateStr) || {
    fecha: selectedDateStr,
    placas: "Sin información",
    actividad: "No hay información registrada para este día."
  };

  const handleDownloadApp = async () => {
    setIsMenuOpen(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuideModal(true);
    }
  };

  const handleDownloadSelectedWidget = (widgetName) => {
    handleGenerateShareImage();
    setShowWidgetPreviewModal(false);
  };

  // Crear el lienzo Canvas para la imagen de compartir
  const createShareCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.roundRect(50, 50, 700, 500, 24);
    ctx.fill();

    ctx.strokeStyle = 'rgba(165, 253, 181, 0.3)';
    ctx.lineWidth = 2;
    ctx.roundRect(50, 50, 700, 500, 24);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`FECHA: ${currentData.fecha}`, 90, 120);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('TERMINALES HABILITADOS', 90, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px sans-serif';
    ctx.fillText(`Placa ${currentData.placas}`, 90, 250);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '22px sans-serif';
    
    const wrapText = (text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
    };

    wrapText(currentData.actividad, 90, 320, 620, 32);

    ctx.fillStyle = '#A5FDB5';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Surtido CBO • Ciudad Bolívar, Venezuela', 90, 500);

    return canvas;
  };

  const handleGenerateShareImage = () => {
    const canvas = createShareCanvas();
    const imageURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = `SurtidoCBO-${currentData.fecha}.png`;
    link.click();
    setShowShareModal(false);
  };

  // Compartir en WhatsApp con Texto e Imagen Novedosa
  const handleShareWhatsApp = async () => {
    const pageUrl = window.location.href;
    const textMessage = `⛽ *SURTIDO CBO - Ciudad Bolívar*\n📅 *Fecha:* ${currentData.fecha}\n🚙 *Placas Habilitadas:* Placa ${currentData.placas}\n\nℹ️ Consulta el cronograma diario de gasolina subsidiada y estaciones aquí:\n👉 ${pageUrl}`;
    
    const canvas = createShareCanvas();
    
    canvas.toBlob(async (blob) => {
      if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'surtido.png', { type: 'image/png' })] })) {
        try {
          const file = new File([blob], `SurtidoCBO-${currentData.fecha}.png`, { type: 'image/png' });
          await navigator.share({
            title: 'Surtido CBO',
            text: textMessage,
            files: [file]
          });
          setShowShareModal(false);
          return;
        } catch (e) {
          // Fallback a enlace nativo si cancela o no soporta
        }
      }
      
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;
      window.open(whatsappUrl, '_blank');
      setShowShareModal(false);
    }, 'image/png');
  };

  // Activación Real de Notificaciones
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setAlertErrorMsg('Tu navegador no soporta notificaciones de escritorio o móvil.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        new Notification('Surtido CBO', {
          body: '¡Notificaciones activadas! Te avisaremos cuando sea momento de surtir.',
          icon: '/logo.png'
        });
        return true;
      } else {
        setAlertErrorMsg('Permiso de notificación denegado en tu navegador.');
        return false;
      }
    } catch (e) {
      setAlertErrorMsg('Error al solicitar permisos de notificación.');
      return false;
    }
  };

  const handleSaveAlert = async (e) => {
    e.preventDefault();
    if (!alertDate) return;

    let h = parseInt(alertHour, 10);
    const m = parseInt(alertMinute, 10);

    if (alertPeriod === 'PM') {
      if (h === 12) {
        // 12 PM mediodía
      } else if (h > 5) {
        setAlertErrorMsg('La hora máxima permitida es hasta las 5:30 PM.');
        return;
      } else if (h === 5 && m > 30) {
        setAlertErrorMsg('La hora máxima permitida es hasta las 5:30 PM.');
        return;
      }
    }

    setAlertErrorMsg('');

    // Solicitar permiso explícito del sistema
    const permissionGranted = await requestNotificationPermission();

    const formattedTime = `${alertHour}:${alertMinute} ${alertPeriod}`;
    const alertConfig = {
      date: alertDate,
      time: formattedTime,
      message: alertMessage || `¡Atención! Es momento de surtir gasolina según el cronograma.`
    };
    
    localStorage.setItem('surtidoCboAlert', JSON.stringify(alertConfig));
    setAlertSavedMsg(permissionGranted ? '¡Alerta y Notificaciones activadas con éxito!' : '¡Alerta guardada en dispositivo!');
    setTimeout(() => {
      setAlertSavedMsg('');
      setShowAlertModal(false);
      setIsMenuOpen(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-coolvetica p-4 sm:p-6 pb-12 flex flex-col justify-between">
      
      <div>
        {/* ENCABEZADO FIJO (STICKY BAR) */}
        <header className="sticky top-0 z-40 max-w-xl mx-auto bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md py-3 flex justify-between items-center mb-6 px-1 transition-colors">
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 active:scale-90 transition-transform shadow-sm"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex justify-center flex-1 mx-2">
            <img 
              src="/logo.png" 
              alt="Surtido CBO Logo" 
              className="h-12 sm:h-16 object-contain" 
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-sky-400 border border-slate-200 dark:border-slate-800 active:scale-90 transition-transform shadow-sm"
              aria-label="Compartir Imagen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            <button
              onClick={() => setShowAlertModal(true)}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 active:scale-90 transition-transform shadow-sm"
              aria-label="Configurar Notificaciones"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-800 active:scale-90 transition-transform shadow-sm"
              aria-label="Cambiar tema"
            >
              {darkMode ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* 1. SELECTOR DE DÍAS CON RECORRIDO */}
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-3 mb-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Cronograma por Días
            </span>
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-900/50 active:scale-95 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Ver Calendario</span>
            </button>
          </div>

          <div className={`grid grid-cols-5 gap-1.5 text-center transition-all duration-200 transform ${slideDirection}`}>
            {fiveDays.map((item) => {
              const isSelected = item.dateStr === selectedDateStr;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => handleDateChange(item.dateStr)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl active:scale-90 transition-all duration-200 ${
                    isSelected
                      ? 'bg-sky-600 text-white font-bold shadow-md scale-105'
                      : item.isToday
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {item.isToday ? 'HOY' : item.dayName}
                  </span>
                  <span className="text-xl font-black my-0.5">{item.dayNum}</span>
                  <span className="text-[9px] uppercase font-medium opacity-70">
                    {item.monthShort}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. TARJETA PRINCIPAL */}
        <main className="max-w-xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 transition-all duration-300">
            
            <div className="flex items-center justify-between mb-5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border ${
                selectedDateStr === todayStr
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {selectedDateStr === todayStr ? 'Día Actual' : 'Fecha Consulta'}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {currentData.fecha}
              </span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-r-xl mb-5">
              <p className="text-xs uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400">
                Terminales Habilitados
              </p>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-amber-300 mt-1">
                Placa {currentData.placas}
              </p>
            </div>

            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Detalle del Cronograma
              </h2>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                {currentData.actividad}
              </p>
            </div>
          </div>

          {/* 3. ESTACIONES DE SERVICIO SUBSIDIADAS */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            
            <button
              onClick={() => setIsEstacionesOpen(!isEstacionesOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Estaciones de servicio subsidiadas
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Ubicaciones autorizadas en Ciudad Bolívar
                  </p>
                </div>
              </div>
              
              <div className={`p-2 rounded-xl text-slate-400 transition-transform duration-300 ${isEstacionesOpen ? 'rotate-180' : 'rotate-0'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isEstacionesOpen && (
              <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {estacionesSubsidiadas && estacionesSubsidiadas.map((estacion) => {
                  const isOpenDir = openDirecciones[estacion.nombre];
                  const direccionTexto = direccionesEspecificas[estacion.nombre] || estacion.ubicacion;

                  return (
                    <div
                      key={estacion.nombre}
                      className="bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-800 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                            {estacion.nombre}
                          </h3>
                          <span className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 px-2.5 py-0.5 rounded-full inline-block">
                            {estacion.estado}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleDireccion(estacion.nombre)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 px-3 py-2 rounded-xl active:scale-95 transition-transform"
                        >
                          <span>Dirección</span>
                          <svg className={`w-4 h-4 transition-transform duration-300 ${isOpenDir ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {isOpenDir && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                          <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{direccionTexto}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* FOOTER / PISO CON OPCIONES INTERACTIVAS Y ENLACES LEGALES */}
      <footer className="max-w-xl mx-auto w-full mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Información de Interés
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => setActiveFooterInfo('comoFunciona')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 px-3 py-2 rounded-xl active:scale-95 transition-all shadow-sm"
          >
            ¿Cómo funciona?
          </button>
          <button
            onClick={() => setActiveFooterInfo('esGubernamental')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 px-3 py-2 rounded-xl active:scale-95 transition-all shadow-sm"
          >
            ¿Es una app gubernamental?
          </button>
          <button
            onClick={() => setActiveFooterInfo('objetivo')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 px-3 py-2 rounded-xl active:scale-95 transition-all shadow-sm"
          >
            Objetivo
          </button>
          <button
            onClick={() => setActiveFooterInfo('privacidad')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 px-3 py-2 rounded-xl active:scale-95 transition-all shadow-sm"
          >
            Privacidad absoluta
          </button>
          <button
            onClick={() => setActiveFooterInfo('exencion')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 px-3 py-2 rounded-xl active:scale-95 transition-all shadow-sm"
          >
            Exención total de responsabilidad
          </button>
        </div>

        {/* ENLACES LEGALES */}
        <div className="flex justify-center gap-4 text-xs font-bold text-sky-600 dark:text-sky-400 mb-4">
          <button onClick={() => setShowAvisoLegal(true)} className="hover:underline">Aviso Legal</button>
          <span>•</span>
          <button onClick={() => setShowPrivacidad(true)} className="hover:underline">Política de Privacidad</button>
          <span>•</span>
          <button onClick={() => setShowCookiesConfig(true)} className="hover:underline">Cookies</button>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-600">
          Surtido CBO © 2026 - Ciudad Bolívar, Venezuela.
        </p>
      </footer>

      {/* BANNER FLOTANTE DE COOKIES */}
      {showCookieBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center sm:text-left">
            Utilizamos cookies locales para guardar tus preferencias (modo oscuro) de forma anónima y privada.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCookiesConfig(true)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              Configurar
            </button>
            <button
              onClick={handleAcceptAllCookies}
              className="text-xs font-black bg-sky-500 hover:bg-sky-600 text-slate-950 px-4 py-2 rounded-xl shadow-md active:scale-95 transition-transform"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* MODAL GUÍA DE INSTALACIÓN PWA */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Cómo instalar Surtido CBO
              </h3>
              <button onClick={() => setShowInstallGuideModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-1">📱 En Android (Chrome / Edge / Brave):</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400">
                  <li>Toca el menú de 3 puntos (⋮) en la esquina superior derecha.</li>
                  <li>Selecciona <strong>"Añadir a la pantalla de inicio"</strong> o <strong>"Instalar aplicación"</strong>.</li>
                </ol>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-1">🍏 En iPhone / iPad (Safari):</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400">
                  <li>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha abajo).</li>
                  <li>Desplázate hacia abajo y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="w-full mt-5 py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl shadow-md active:scale-95 transition-transform text-sm"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN DE COOKIES */}
      {showCookiesConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Aviso y Configuración de Cookies
              </h3>
              <button onClick={() => setShowCookiesConfig(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-3 mb-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Cookies Necesarias</p>
                  <p className="text-[11px] text-slate-400">Guarda el tema y configuración PWA local.</p>
                </div>
                <input type="checkbox" checked disabled className="w-4 h-4 accent-sky-500" />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Preferencias de Usuario</p>
                  <p className="text-[11px] text-slate-400">Recordatorio de alertas de surtido.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={cookiePrefs.preferencias} 
                  onChange={(e) => setCookiePrefs({...cookiePrefs, preferencias: e.target.checked})}
                  className="w-4 h-4 accent-sky-500 cursor-pointer" 
                />
              </div>
            </div>

            <button
              onClick={handleSaveCookiePrefs}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl shadow-md active:scale-95 transition-transform text-sm"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* MODAL AVISO LEGAL */}
      {showAvisoLegal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Aviso Legal</h3>
              <button onClick={() => setShowAvisoLegal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>
                <strong>1. Carácter Informativo:</strong> Surtido CBO es un portal informativo independiente desarrollado de forma comunitaria. No representa ni tiene relación institucional con entidades gubernamentales de Venezuela ni con PDVSA.
              </p>
              <p>
                <strong>2. Exención de Responsabilidad:</strong> La información sobre el cronograma de combustible subsidiado se recopila de fuentes públicas. No garantizamos cambios repentinos en las estaciones de servicio (Angostura, Tacoma, Perú) o interrupciones de suministro.
              </p>
              <p>
                <strong>3. Uso de la Aplicación:</strong> La consulta de placas se proporciona gratuitamente. El usuario asume toda la responsabilidad en la verificación presencial en las estaciones correspondientes.
              </p>
            </div>
            <button onClick={() => setShowAvisoLegal(false)} className="w-full mt-6 py-2.5 bg-sky-500 text-slate-950 font-bold rounded-xl text-xs">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL POLÍTICA DE PRIVACIDAD */}
      {showPrivacidad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Política de Privacidad</h3>
              <button onClick={() => setShowPrivacidad(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>
                <strong>Protección Total:</strong> Surtido CBO garantiza privacidad absoluta. No registramos direcciones IP, no requerimos login ni recopilamos datos personales.
              </p>
              <p>
                <strong>Almacenamiento Local:</strong> Toda la información personalizada, como tus alertas de surtido y el tema visual (modo claro/oscuro), permanece guardada de forma segura dentro del almacenamiento local (`localStorage`) de tu navegador web.
              </p>
              <p>
                <strong>Control del Usuario:</strong> Puedes eliminar todos tus datos guardados en cualquier momento borrando la memoria caché de tu navegador.
              </p>
            </div>
            <button onClick={() => setShowPrivacidad(false)} className="w-full mt-6 py-2.5 bg-sky-500 text-slate-950 font-bold rounded-xl text-xs">
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MENÚ LATERAL DESPLEGABLE (HAMBURGUESA) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-80 max-w-full h-full p-6 shadow-2xl flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
            
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-transform"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleDownloadApp}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-sky-600 font-bold text-sm border border-slate-200/60 dark:border-slate-800 transition-all active:scale-98 text-left"
                >
                  <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Descargar la App</p>
                    <p className="text-[11px] text-slate-400 font-normal">Instala la aplicación web (PWA)</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowWidgetPreviewModal(true);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-sky-600 font-bold text-sm border border-slate-200/60 dark:border-slate-800 transition-all active:scale-98 text-left"
                >
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Descargar Widget</p>
                    <p className="text-[11px] text-slate-400 font-normal">Modelos con tamaño en pantalla</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowAlertModal(true);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-sky-600 font-bold text-sm border border-slate-200/60 dark:border-slate-800 transition-all active:scale-98 text-left"
                >
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Configurar Alerta</p>
                    <p className="text-[11px] text-slate-400 font-normal">Recordatorio personal de surtido</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              Surtido CBO v1.0
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE COMPARTIR / DESCARGAR IMAGEN & WHATSAPP */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Compartir Información
                </h3>
                <p className="text-xs text-slate-400">
                  Envía la información diaria por WhatsApp o descarga la imagen
                </p>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div 
              ref={shareCardRef}
              className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 text-white rounded-2xl p-5 border border-sky-500/30 shadow-xl my-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
                <span className="text-[11px] font-bold text-sky-300 bg-white/10 px-2.5 py-1 rounded-lg">
                  {currentData.fecha}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300">
                  Terminales Habilitados
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  Placa {currentData.placas}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {currentData.actividad}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-sky-300 font-semibold uppercase tracking-wider">
                <span>Surtido CBO • Ciudad Bolívar</span>
                <span>Gasolina Subsidiada</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleShareWhatsApp}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl shadow-md active:scale-95 transition-transform text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
                <span>Compartir por WhatsApp</span>
              </button>

              <button
                onClick={handleGenerateShareImage}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl active:scale-95 transition-transform text-xs flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Solo Descargar Imagen</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE PREVIEW DE WIDGETS */}
      {showWidgetPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Galería de Widgets Estéticos
                </h3>
                <p className="text-xs text-slate-400">
                  Diseños de alta gama en azul cyan con indicación del espacio en pantalla
                </p>
              </div>
              <button 
                onClick={() => setShowWidgetPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div 
                onClick={() => handleDownloadSelectedWidget("Widget Cuadrado 2x2 Glass")}
                className="group cursor-pointer bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 text-white rounded-3xl p-5 border border-sky-500/30 hover:border-sky-400 transition-all shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-sky-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-2xl">
                  Ocupa: 2x2 Cuadros
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-300">{currentData.fecha}</span>
                </div>
                <div className="text-2xl font-black text-amber-300 mb-1">Placas {currentData.placas}</div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{currentData.actividad}</p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-sky-400 group-hover:underline">
                  <span>Descargar Tarjeta para Pantalla</span> &rarr;
                </div>
              </div>

              <div 
                onClick={() => handleDownloadSelectedWidget("Widget Rectangular 4x2 Glow")}
                className="group cursor-pointer bg-gradient-to-r from-sky-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-5 border border-sky-400/50 hover:border-white transition-all shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-bl-2xl">
                  Ocupa: 4x2 Cuadros
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-300">{currentData.fecha}</span>
                </div>
                <div className="text-2xl font-black text-amber-200 mb-1">Terminal: {currentData.placas}</div>
                <p className="text-xs text-slate-200 line-clamp-2">{currentData.actividad}</p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-sky-300 group-hover:underline">
                  <span>Descargar Tarjeta para Pantalla</span> &rarr;
                </div>
              </div>

              <div 
                onClick={() => handleDownloadSelectedWidget("Widget Compacto 4x1 Minimal")}
                className="group cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-sky-500 transition-all shadow-md relative overflow-hidden flex items-center justify-between"
              >
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-md mb-1 inline-block border border-sky-200 dark:border-sky-900">
                    Ocupa: 4x1 Cuadros (Barra)
                  </span>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400">Placas {currentData.placas}</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentData.fecha}</p>
                </div>
                <div className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                  Usar &rarr;
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PARA CONFIGURAR ALERTA Y NOTIFICACIONES */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Configurar Alerta de Surtido
              </h3>
              <button 
                onClick={() => setShowAlertModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Fecha del recordatorio
                </label>
                <input 
                  type="date" 
                  value={alertDate} 
                  onChange={(e) => setAlertDate(e.target.value)} 
                  required 
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Hora de la alerta (Máx. 5:30 PM)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={alertHour}
                    onChange={(e) => setAlertHour(e.target.value)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
                  >
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <select
                    value={alertMinute}
                    onChange={(e) => setAlertMinute(e.target.value)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
                  >
                    {['00','10','15','20','30','40','45','50'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={alertPeriod}
                    onChange={(e) => setAlertPeriod(e.target.value)}
                    className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-900 text-sm font-black text-sky-600 dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nota personalizada (Opcional)
                </label>
                <input 
                  type="text" 
                  placeholder="Ej. Me toca surtir con terminal..." 
                  value={alertMessage} 
                  onChange={(e) => setAlertMessage(e.target.value)} 
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>

              {alertErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold text-center border border-red-200 dark:border-red-900">
                  {alertErrorMsg}
                </div>
              )}

              {alertSavedMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center border border-emerald-200 dark:border-emerald-900">
                  {alertSavedMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl shadow-md active:scale-95 transition-transform text-sm mt-2"
              >
                Activar Notificación y Guardar
              </button>
            </form>

          </div>
        </div>
      )}

      {/* MODAL INFORMACIÓN FOOTER */}
      {activeFooterInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 relative">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {footerModalData[activeFooterInfo]?.title}
              </h3>
              <button 
                onClick={() => setActiveFooterInfo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {footerModalData[activeFooterInfo]?.content}
            </p>

            <button
              onClick={() => setActiveFooterInfo(null)}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl shadow-md active:scale-95 transition-transform text-sm"
            >
              Entendido
            </button>

          </div>
        </div>
      )}

      {/* MODAL DE CALENDARIO */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black capitalize text-slate-900 dark:text-white">
                {monthName}
              </h3>
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {daysArray.map((dayItem, index) => {
                if (!dayItem) {
                  return <div key={`empty-${index}`} />;
                }
                const isSelected = dayItem.dateStr === selectedDateStr;
                return (
                  <button
                    key={dayItem.dateStr}
                    onClick={() => {
                      handleDateChange(dayItem.dateStr);
                      setShowCalendarModal(false);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold active:scale-90 transition-transform ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : dayItem.isToday
                        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayItem.dayNum}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE BIENVENIDA */}
      {showModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-7 border border-slate-200 dark:border-slate-800 relative transition-all duration-200 transform ${isClosing ? 'scale-110 opacity-0' : 'scale-100 opacity-100 animate-in fade-in zoom-in-95'}`}>
            
            <button 
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                ¡Bienvenido a Surtido CBO!
              </h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed border border-slate-200 dark:border-slate-800">
              Esta aplicación te permite consultar el cronograma diario de combustible subsidiado para Ciudad Bolívar.
              <br /><br />
              Consulta las estaciones habilitadas (Angostura, Tacoma y Perú) y navega entre días seleccionándolos en la barra superior o mediante el nuevo botón de calendario.
              <br /><br />
               Ten en cuenta que esta aplicación fue creada por un usuario común, con el único fin de facilitar la información del combustible según el día. 
              <br /><br />
               Esta es la primera versión con los datos e información cargada hasta el día 31/10/2026
            </div>

            <div className="flex items-center space-x-3 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                id="dontShow"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="dontShow" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                No volver a mostrar este mensaje
              </label>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl shadow-md active:scale-95 transition-transform text-sm"
            >
              Comenzar
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
