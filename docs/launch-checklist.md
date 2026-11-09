# Antes de aceptar pagos o abrir el servicio

Esta lista refleja el estado de la primera versión local. La vista previa mantiene el checkout cerrado.

- Completar y revisar los términos, la política de privacidad, cookies, reembolsos, el aviso de alcance y el Libro de Reclamaciones con los datos reales del responsable. No publicar datos inventados ni campos vacíos.
- Revisar con asesoría local los textos y obligaciones legales aplicables a cada país.
- Verificar el nombre ZoneShield ante las oficinas de marcas pertinentes y confirmar que puede usarse.
- Crear y verificar la tienda Lemon Squeezy, sus variantes, claves y webhook; implementar el webhook firmado, idempotencia y activación/revocación de compras.
- Conectar la entrega real de los beneficios de los planes antes de habilitar el checkout. La vista previa no concede acceso pagado.
- Configurar Supabase, autenticación, políticas RLS y almacenamiento mínimo si se habilitan cuentas o historial remoto.
- Añadir protecciones de abuso para cualquier API: Turnstile que falle cerrado, límites distribuidos, validación de tamaño antes de leer cuerpos y cuotas de correo.
- Conectar RDAP y Google Web Risk con caché, límites y credenciales solo en servidor. Verificar las condiciones y atribuciones de cada fuente.
- Reemplazar las listas de prueba por datos propios revisados y evaluar sensibilidad y falsos positivos con casos representativos antes de presentar la puntuación como calibrada.
- Revisar accesibilidad, seguridad, rendimiento, privacidad de red y la entrega de compra y reembolso en una vista previa de producción.
- Mantener el sitio fuera de indexación hasta completar la revisión y aprobar el lanzamiento.
