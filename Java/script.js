class EventFormManager {
  constructor() {
    this.form = document.getElementById('eventForm');
    this.previewModal = document.getElementById('previewModal');
    this.successModal = document.getElementById('successModal');
    // COLOCA AQUÍ LA URL QUE TE DIO GOOGLE APPS SCRIPT
    this.SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwy1po3mBJbygFNxWtNtTTBMAtXsv9vchCj-Qlso2a0453CxCehQ-MVEb2OE-Y5FJMNdA/exec';
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('previewBtn').addEventListener('click', () => {
        if(this.validarFormulario()) this.mostrarVistaPrevia();
    });
    
    document.querySelector('.close').addEventListener('click', () => this.cerrarModal('previewModal'));
    document.getElementById('closePreview').addEventListener('click', () => this.cerrarModal('previewModal'));
    document.getElementById('confirmSubmit').addEventListener('click', () => this.confirmarEnvio());
    document.getElementById('newForm').addEventListener('click', () => location.reload());

    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) this.cerrarModal(e.target.id);
    });
  }

  validarFormulario() {
    const requiredFields = this.form.querySelectorAll('[required]');
    let isValid = true;
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        isValid = false;
      } else {
        field.style.borderColor = '#e8ecf4';
      }
    });
    return isValid;
  }

  procesarDatos() {
    const formData = new FormData(this.form);
    const tipoEventoTexto = {
      'culto_normal': 'Culto Normal',
      'confraternidad_zona': 'Confraternidad de Zona'
    };

    return {
      evento: {
        zona: formData.get('zona'),
        liderZona: formData.get('liderZona'),
        totalSedes: formData.get('totalSedes'),
        sedesParticipantes: formData.get('sedesParticipantes'),
        tipoEvento: tipoEventoTexto[formData.get('tipoEvento')] || formData.get('tipoEvento'),
        cantidadJovenes: formData.get('cantidadJovenes'),
        // Nuevos campos de asistencia
        asistenciaGeneral: formData.get('asistenciaGeneral'),
        reconciliadosTotal: formData.get('reconciliadosTotal'),
        asistenciaIcam: formData.get('asistenciaIcam'),
        reconciliadosIcam: formData.get('reconciliadosIcam'),
        asistenciaJuvic: formData.get('asistenciaJuvic'),
        reconciliadosJuvic: formData.get('reconciliadosJuvic')
      }
    };
  }

  mostrarVistaPrevia() {
    const data = this.procesarDatos().evento;
    const previewContent = document.getElementById('previewContent');
    
    previewContent.innerHTML = `
      <div class="preview-section">
        <p><strong>Zona:</strong> ${data.zona} | <strong>Líder:</strong> ${data.liderZona}</p>
        <p><strong>Evento:</strong> ${data.tipoEvento} | <strong>Total Jóvenes:</strong> ${data.cantidadJovenes}</p>
        <hr style="margin:15px 0; border:0; border-top:1px solid #eee;">
        <p><strong>Asistencia Gral:</strong> ${data.asistenciaGeneral} | <strong>Reconciliados:</strong> ${data.reconciliadosTotal}</p>
        <div style="background:#f8faff; padding:10px; margin-top:10px; border-radius:8px;">
          <p><strong>ICAM:</strong> Asistencia: ${data.asistenciaIcam} / Recon: ${data.reconciliadosIcam}</p>
          <p><strong>JUVIC:</strong> Asistencia: ${data.asistenciaJuvic} / Recon: ${data.reconciliadosJuvic}</p>
        </div>
      </div>
    `;
    this.previewModal.style.display = 'block';
  }

  async confirmarEnvio() {
    const btn = document.getElementById('confirmSubmit');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Enviando...';

    try {
      const data = this.procesarDatos();
      await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ 'data': JSON.stringify(data) })
      });
      
      this.cerrarModal('previewModal');
      this.successModal.style.display = 'block';
    } catch (error) {
      alert('Error de conexión. Intente de nuevo.');
      btn.disabled = false;
      btn.innerHTML = 'Confirmar y Enviar';
    }
  }

  cerrarModal(id) { document.getElementById(id).style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => new EventFormManager());
