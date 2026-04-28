class EventFormManager {
  constructor() {
    this.form = document.getElementById('eventForm');
    this.previewModal = document.getElementById('previewModal');
    this.successModal = document.getElementById('successModal');
    
    // URL de tu Google Apps Script 2026 personalizada
    this.SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhYhraz_mDVyF63mmJugE1wJ23bhH0XQSHrIlPRattg-pMb4t7939Vcnqv52uopIHO6g/exec';
    
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

    if (!isValid) {
      alert('Por favor, completa todos los campos obligatorios antes de continuar.');
    }
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
        // Datos de asistencia consolidados y específicos
        asistenciaGeneral: formData.get('asistenciaGeneral'),
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
        <h4 style="color: #2c5aa0; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Datos Principales</h4>
        <p><strong>Número de zona:</strong> ${data.zona}</p>
        <p><strong>Líder de Zona:</strong> ${data.liderZona}</p>
        <p><strong>Evento:</strong> ${data.tipoEvento}</p>
        
        <h4 style="color: #2c5aa0; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Estadísticas Generales</h4>
        <p><strong>Asistencia General:</strong> ${data.asistenciaGeneral}</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
          <div style="background:#f0f7ff; padding: 10px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <p style="font-weight: bold; color: #1976d2; margin-bottom: 5px;">ICAM</p>
            <p><small>Asist: ${data.asistenciaIcam}</small></p>
            <p><small>Recon: ${data.reconciliadosIcam}</small></p>
          </div>
          <div style="background:#fffaf0; padding: 10px; border-radius: 8px; border-left: 4px solid #ffa500;">
            <p style="font-weight: bold; color: #ef6c00; margin-bottom: 5px;">JUVIC</p>
            <p><small>Asist: ${data.asistenciaJuvic}</small></p>
            <p><small>Recon: ${data.reconciliadosJuvic}</small></p>
          </div>
        </div>
      </div>
    `;
    this.previewModal.style.display = 'block';
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.validarFormulario()) {
      this.mostrarVistaPrevia();
    }
  }

  async confirmarEnvio() {
    const btn = document.getElementById('confirmSubmit');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Enviando...';

    try {
      const data = this.procesarDatos();
      
      await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ 'data': JSON.stringify(data) })
      });
      
      this.cerrarModal('previewModal');
      this.successModal.style.display = 'block';
      
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Hubo un problema al conectar con el servidor. Por favor, revisa tu conexión a internet e inténtalo de nuevo.');
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new EventFormManager();
});
