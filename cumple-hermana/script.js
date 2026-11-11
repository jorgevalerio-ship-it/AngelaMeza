/* No hace falta editar este archivo. Los textos se cambian en config.js */

(function () {
  const TOTAL_FOTOS = 8;
  const EXTENSIONES = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"];
  const COLORES = ["#f9c5d5", "#f08fb0", "#d9c8f5", "#bfeee0", "#ffd8b8", "#c3e3fb", "#fff1a8"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
                 "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  const $ = (sel) => document.querySelector(sel);
  const audio = $("#musica");
  const musicaBtn = $("#musicaBtn");

  /* ---------- Textos desde config.js ---------- */
  document.title = "¡Feliz cumpleaños, " + CONFIG.nombre + "! 🎈";
  $("#nombre").textContent = CONFIG.nombre;
  $("#firma").textContent = CONFIG.firma;
  $("#edad").innerHTML = String(CONFIG.edad).split("").map((d) => "<span>" + d + "</span>").join("");
  $("#fecha").textContent = "🎂 " + CONFIG.fecha.dia + " de " + MESES[CONFIG.fecha.mes - 1] + " 🎂";
  $("#mensaje").innerHTML = "";
  CONFIG.mensaje.forEach((parrafo) => {
    const p = document.createElement("p");
    p.textContent = parrafo;
    $("#mensaje").appendChild(p);
  });

  // Cuenta regresiva / "hoy es tu día"
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const cumple = new Date(CONFIG.fecha.anio, CONFIG.fecha.mes - 1, CONFIG.fecha.dia);
  const dias = Math.round((cumple - hoy) / 86400000);
  let estado = "";
  if (dias === 0) estado = "✨ ¡Hoy es tu día! ✨";
  else if (dias === 1) estado = "⏳ ¡Falta solo 1 día!";
  else if (dias > 1) estado = "⏳ Faltan " + dias + " días";
  $("#estado").textContent = estado;

  /* ---------- Galería ---------- */
  const galeria = $("#galeria");
  const fotos = []; // { src, pie }

  function cargarFoto(n, img, marco, pie) {
    let i = 0;
    const probar = () => {
      if (i >= EXTENSIONES.length) {
        marco.innerHTML = '<div class="sin-foto"><span><b>📷</b>Sube aquí<br>fotos/foto' + n + '.jpg</span></div>';
        return;
      }
      img.src = "fotos/foto" + n + "." + EXTENSIONES[i++];
    };
    img.onerror = probar;
    img.onload = () => { fotos[n - 1] = { src: img.src, pie: pie }; };
    probar();
  }

  for (let n = 1; n <= TOTAL_FOTOS; n++) {
    const pie = (CONFIG.piesDeFoto && CONFIG.piesDeFoto[n - 1]) || "";
    const tarjeta = document.createElement("button");
    tarjeta.className = "polaroid";
    tarjeta.setAttribute("aria-label", "Ver foto " + n);
    const giro = (Math.random() * 8 - 4).toFixed(1);
    tarjeta.dataset.giro = giro;
    tarjeta.innerHTML = '<span class="cinta"></span><div class="marco"><img alt="Foto ' + n + '" loading="lazy"></div><span class="pie"></span>';
    tarjeta.querySelector(".pie").textContent = pie;
    cargarFoto(n, tarjeta.querySelector("img"), tarjeta.querySelector(".marco"), pie);
    tarjeta.addEventListener("click", () => abrirVisor(n - 1));
    galeria.appendChild(tarjeta);
  }

  // Aparecen al bajar
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        const idx = [...galeria.children].indexOf(el);
        setTimeout(() => {
          el.classList.add("visible");
          el.style.transform = "rotate(" + el.dataset.giro + "deg)";
        }, (idx % 4) * 120);
        observador.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  [...galeria.children].forEach((el) => observador.observe(el));

  /* ---------- Visor ---------- */
  const visor = $("#visor");
  let actual = 0;
  const disponibles = () => fotos.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);

  function abrirVisor(i) {
    if (!fotos[i]) return; // aún no hay foto
    actual = i;
    $("#visorImg").src = fotos[i].src;
    $("#visorPie").textContent = fotos[i].pie;
    visor.hidden = false;
  }
  function mover(paso) {
    const lista = disponibles();
    if (!lista.length) return;
    let pos = lista.indexOf(actual);
    pos = (pos + paso + lista.length) % lista.length;
    abrirVisor(lista[pos]);
  }
  $(".visor-cerrar").addEventListener("click", () => (visor.hidden = true));
  $(".visor-flecha.izq").addEventListener("click", (e) => { e.stopPropagation(); mover(-1); });
  $(".visor-flecha.der").addEventListener("click", (e) => { e.stopPropagation(); mover(1); });
  visor.addEventListener("click", (e) => { if (e.target === visor) visor.hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (visor.hidden) return;
    if (e.key === "Escape") visor.hidden = true;
    if (e.key === "ArrowLeft") mover(-1);
    if (e.key === "ArrowRight") mover(1);
  });
  let toqueX = null;
  visor.addEventListener("touchstart", (e) => (toqueX = e.touches[0].clientX), { passive: true });
  visor.addEventListener("touchend", (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
    toqueX = null;
  });

  /* ---------- Globos ---------- */
  const capaGlobos = $("#globos");
  function soltarGlobo() {
    const g = document.createElement("div");
    g.className = "globo";
    const escala = 0.6 + Math.random() * 0.7;
    g.style.left = Math.random() * 95 + "vw";
    g.style.background = COLORES[Math.floor(Math.random() * COLORES.length)];
    g.style.width = 64 * escala + "px";
    g.style.height = 80 * escala + "px";
    g.style.animationDuration = 9 + Math.random() * 8 + "s";
    capaGlobos.appendChild(g);
    g.addEventListener("animationend", () => g.remove());
  }
  for (let i = 0; i < 6; i++) setTimeout(soltarGlobo, i * 700);
  setInterval(soltarGlobo, 1800);

  /* ---------- Confeti ---------- */
  const lienzo = $("#confeti");
  const ctx = lienzo.getContext("2d");
  let piezas = [];
  let animando = false;
  function ajustar() { lienzo.width = innerWidth; lienzo.height = innerHeight; }
  addEventListener("resize", ajustar); ajustar();

  function confeti(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      piezas.push({
        x: Math.random() * lienzo.width,
        y: -20 - Math.random() * lienzo.height * 0.5,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
        vy: 2 + Math.random() * 3, vx: -1.5 + Math.random() * 3,
        giro: Math.random() * 6, vgiro: -0.2 + Math.random() * 0.4,
        color: COLORES[Math.floor(Math.random() * COLORES.length)]
      });
    }
    if (!animando) { animando = true; requestAnimationFrame(dibujar); }
  }
  function dibujar() {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    piezas.forEach((p) => {
      p.y += p.vy; p.x += p.vx + Math.sin(p.y / 30) * 0.6; p.giro += p.vgiro;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.giro);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    piezas = piezas.filter((p) => p.y < lienzo.height + 30);
    if (piezas.length) requestAnimationFrame(dibujar);
    else { animando = false; ctx.clearRect(0, 0, lienzo.width, lienzo.height); }
  }

  /* ---------- Música ---------- */
  function actualizarBoton() {
    musicaBtn.classList.toggle("sonando", !audio.paused);
    musicaBtn.classList.toggle("pausado", audio.paused);
  }
  musicaBtn.addEventListener("click", () => {
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  });
  audio.addEventListener("play", actualizarBoton);
  audio.addEventListener("pause", actualizarBoton);

  /* ---------- Abrir el regalo ---------- */
  const regalo = $("#regalo");
  regalo.addEventListener("click", () => {
    if (regalo.classList.contains("abierto")) return;
    regalo.classList.add("abierto");
    audio.volume = 0.8;
    audio.play().catch(() => {}); // el navegador permite el sonido tras el toque
    confeti(180);
    for (let i = 0; i < 8; i++) setTimeout(soltarGlobo, i * 150);
    setTimeout(() => {
      $("#inicio").classList.add("oculto");
      const main = $("#principal");
      main.hidden = false;
      main.classList.add("aparecer");
      musicaBtn.hidden = false;
      actualizarBoton();
    }, 900);
  });

  /* ---------- Soplar las velas ---------- */
  const pastel = $("#pastel");
  pastel.addEventListener("click", () => {
    if (pastel.classList.contains("soplado")) {
      pastel.classList.remove("soplado");
      $("#pastelPista").textContent = "Toca las velitas para soplarlas";
      return;
    }
    pastel.classList.add("soplado");
    $("#pastelPista").textContent = "¡Que se cumplan todos tus deseos! 🌟";
    confeti(220);
  });
})();
