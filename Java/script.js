class EventFormManager {
  constructor() {
    this.form = document.getElementById('eventForm');
    this.previewModal = document.getElementById('previewModal');
    this.successModal = document.getElementById('successModal');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Submit del formulario
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Vista previa
    document.getElementById('previewBtn').addEventListener('click', () => this.mostrarVistaPrevia());
    
    // Modal controls
    document.querySelector('.close').addEventListener('click', () => this.cerrarModal('previewModal'));
    document.getElementById('closePreview').addEventListener('click', () => this.cerrarModal('previewModal'));
    document.getElementById('confirmSubmit').addEventListener('click', () => this.confirmarEnvio());
    document.getElementById('newForm').addEventListener('click', () => this.nuevoFormulario());
    
    // Validación en tiempo real para sedes participantes
    document.getElementById('sedesParticipantes').addEventListener('input', () => this.validarSedes());
    document.getElementById('totalSedes').addEventListener('input', () => this.validarSedes());
    
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.cerrarModal(e.target.id);
      }
    });
  }

  validarSedes() {
    const totalSedes = parseInt(document.getElementById('totalSedes').value);
    const sedesParticipantes = parseInt(document.getElementById('sedesParticipantes').value);
    
    if (totalSedes && sedesParticipantes && sedesParticipantes > totalSedes) {
      this.mostrarMensaje('Las sedes participantes no pueden ser más que el total de sedes', 'warning');
      document.getElementById('sedesParticipantes').style.borderColor = '#e74c3c';
    } else {
      document.getElementById('sedesParticipantes').style.borderColor = '#e8ecf4';
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validarFormulario()) {
      return;
    }
    
    this.mostrarVistaPrevia();
  }

  validarFormulario() {
    const requiredFields = this.form.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      } else {
        field.style.borderColor = '#ddd';
      }
    });
    
    if (!isValid) {
      this.mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidField.focus();
      }
    }
    
    return isValid;
  }

  mostrarVistaPrevia() {
    const formData = new FormData(this.form);
    const data = this.procesarDatos(formData);
    
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = this.generarVistaPrevia(data);
    
    this.previewModal.style.display = 'block';
  }

  procesarDatos(formData) {
    const tipoEventoTexto = {
      'culto_normal': 'Culto Normal',
      'confraternidad_zona': 'Confraternidad de Zona'
    };

    const data = {
      evento: {
        zona: formData.get('zona'),
        liderZona: formData.get('liderZona'),
        totalSedes: formData.get('totalSedes'),
        sedesParticipantes: formData.get('sedesParticipantes'),
        tipoEvento: tipoEventoTexto[formData.get('tipoEvento')] || formData.get('tipoEvento'),
        cantidadJovenes: formData.get('cantidadJovenes')
      }
    };
    
    return data;
  }

  generarVistaPrevia(data) {
    let html = `
      <div class="preview-section">
        <h4>Información del Evento Vuelve a Casa</h4>
        <div class="preview-item"><strong>Zona:</strong> ${data.evento.zona}</div>
        <div class="preview-item"><strong>Líder de Zona:</strong> ${data.evento.liderZona}</div>
        <div class="preview-item"><strong>Total de Sedes en la Zona:</strong> ${data.evento.totalSedes}</div>
        <div class="preview-item"><strong>Sedes que Participaron:</strong> ${data.evento.sedesParticipantes}</div>
        <div class="preview-item"><strong>Tipo de Evento:</strong> ${data.evento.tipoEvento}</div>
        <div class="preview-item"><strong>Total de Jóvenes Asistentes:</strong> ${data.evento.cantidadJovenes}</div>
      </div>
    `;
    
    return html;
  }

  async confirmarEnvio() {
    this.cerrarModal('previewModal');
    
    // Mostrar mensaje de envío
    this.mostrarMensaje('Enviando información...', 'info');
    
    try {
      // Obtener los datos del formulario
      const formData = new FormData(this.form);
      const data = this.procesarDatos(formData);
      
      console.log('Datos a enviar:', data);
      
      // URL del nuevo Google Apps Script para Vuelve a Casa
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwy1po3mBJbygFNxWtNtTTBMAtXsv9vchCj-Qlso2a0453CxCehQ-MVEb2OE-Y5FJMNdA/exec';
      
      // Método 1: Enviar como FormData (más compatible)
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(data));
      
      console.log('Enviando datos...');
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formDataToSend,
        mode: 'no-cors' // Cambiar a no-cors para evitar problemas de CORS
      });
      
      console.log('Respuesta recibida');
      
      // Con no-cors no podemos leer la respuesta, pero si no hay error, asumimos éxito
      this.successModal.style.display = 'block';
      this.mostrarMensaje('¡Registro enviado exitosamente!', 'success');
      
    } catch (error) {
      console.error('Error al enviar datos:', error);
      
      // Método alternativo: Enviar como JSON en caso de error
      try {
        console.log('Intentando método alternativo...');
        
        const alternativeResponse = await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(JSON.stringify(data))}`,
          mode: 'no-cors'
        });
        
        this.successModal.style.display = 'block';
        this.mostrarMensaje('¡Registro enviado exitosamente!', 'success');
        
      } catch (alternativeError) {
        console.error('Error en método alternativo:', alternativeError);
        this.mostrarMensaje('Error al enviar el registro. Por favor intente nuevamente.', 'error');
      }
    }
  }

  nuevoFormulario() {
    this.cerrarModal('successModal');
    this.form.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  mostrarMensaje(mensaje, tipo) {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${tipo}`;
    messageDiv.textContent = mensaje;
    
    // Estilos del mensaje
    Object.assign(messageDiv.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '600',
      zIndex: '9999',
      maxWidth: '300px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    // Colores según tipo
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };
    
    messageDiv.style.backgroundColor = colors[tipo] || colors.info;
    
    document.body.appendChild(messageDiv);
    
    // Animación de entrada
    setTimeout(() => {
      messageDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
      messageDiv.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 300);
    }, 4000);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new EventFormManager();
});
