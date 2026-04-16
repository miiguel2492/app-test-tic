let preguntas = [];
let indiceActual = 0;
let respuestas = {};
let tiempo = 0;
let interval;
let modoCorreccion = false;
let respuestaSeleccionada = null;


const examen = localStorage.getItem("examenSeleccionado") || "examen_2025.json";

fetch(examen)
  .then(res => res.json())
  .then(data => {
    preguntas = data.preguntas;
    tiempo = data.tiempo_minutos * 60;
    iniciarTemporizador();
    mostrarPregunta();
  });
  

function mostrarPregunta() {
  const p = preguntas[indiceActual];

  document.getElementById("contador").textContent =
    `Pregunta ${indiceActual + 1} de ${preguntas.length}`;

  document.getElementById("pregunta").textContent = p.enunciado;

  const opcionesDiv = document.getElementById("opciones");
  opcionesDiv.innerHTML = "";

  for (let letra in p.opciones) {
    const label = document.createElement("label");
    label.className = "opcion";

    label.innerHTML = `
      <input type="radio" name="opcion" value="${letra}">
      ${letra}) ${p.opciones[letra]}
    `;
    opcionesDiv.appendChild(label);
  }
  document.getElementById("feedback").innerHTML = "";

}


document.getElementById("siguiente").addEventListener("click", () => {
  const feedback = document.getElementById("feedback");
  const preguntaActual = preguntas[indiceActual];

  if (!modoCorreccion) {
    const seleccionada = document.querySelector('input[name="opcion"]:checked');
    if (!seleccionada) {
      alert("Selecciona una respuesta");
      return;
    }

    respuestaSeleccionada = seleccionada.value;
    respuestas[preguntaActual.id] = respuestaSeleccionada;

    if (respuestaSeleccionada === preguntaActual.correcta) {
      feedback.innerHTML = "✅ Correcto";
      feedback.style.color = "green";
    } else {
      feedback.innerHTML = `❌ Incorrecto. La respuesta correcta es <strong>${preguntaActual.correcta}</strong>`;
      feedback.style.color = "red";
    }

    document.getElementById("siguiente").textContent = "Continuar";
    modoCorreccion = true;
  } else {
    // Pasar a la siguiente pregunta
    feedback.innerHTML = "";
    document.getElementById("siguiente").textContent = "Siguiente";
    modoCorreccion = false;

    indiceActual++;
    if (indiceActual < preguntas.length) {
      mostrarPregunta();
    } else {
      finalizarExamen();
    }
  }
});

function finalizarExamen() {
  clearInterval(interval);

  let aciertos = 0;
  preguntas.forEach(p => {
    if (respuestas[p.id] === p.correcta) aciertos++;
  });

  const nota = (aciertos / preguntas.length * 10).toFixed(2);

  document.getElementById("resultado").innerHTML = `
    <h2>Resultado</h2>
    <p>Aciertos: ${aciertos}</p>
    <p>Errores: ${preguntas.length - aciertos}</p>
    <p>Nota: ${nota}</p>
  `;
}

function iniciarTemporizador() {
  interval = setInterval(() => {
    tiempo--;
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;

    document.getElementById("temporizador").textContent =
      `Tiempo: ${minutos}:${segundos.toString().padStart(2, "0")}`;

    if (tiempo <= 0) finalizarExamen();
  }, 1000);
}