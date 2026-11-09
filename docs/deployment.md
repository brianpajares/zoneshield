# Estado del despliegue — 7 de noviembre de 2026

La app está preparada para Vercel mediante `vercel.json`, Node.js 24.x y el lockfile de npm. Las credenciales no forman parte del código. La revisión añadió cabeceras HTTP de seguridad y elimina el resultado anterior al editar el mensaje.

Se verificaron las 14 pruebas del motor, lint, licencias, TypeScript, build optimizado y cinco pruebas Playwright contra el servidor de producción. Estas cubren el análisis, móvil, accesibilidad, idiomas, rutas no válidas y que el texto analizado no se incluya en solicitudes de red.

## Bloqueos observados

- La conexión HTTPS a `api.vercel.com` es denegada por el proxy del entorno con HTTP 403. Se guardaron `api.vercel.com` y `vercel.com` en el borrador de configuración; el borrador aún necesita aplicarse desde los ajustes del entorno. Guardar el borrador no modifica la red activa.
- Vercel CLI 65.12.1 confirma que no hay sesión. La CLI también rechazó el modo temporal sin cuenta para este intento. No se creó ningún despliegue ni URL pública.
- El borrador incluye un requisito personal opcional `VERCEL_TOKEN`, limitado a `api.vercel.com`, para introducir la credencial por la configuración segura del entorno. No se creó ni se guardó ningún valor de token. Esta alternativa permite autenticación de CLI sin colocar credenciales en el chat o en el repositorio.

## Continuar

1. Revisar y guardar el borrador en los ajustes del entorno y publicar ese entorno para aplicar la red.
2. Desde `/workspace/zoneshield`, ejecutar `npx vercel --global-config /tmp/zoneshield-vercel login` y aprobar el acceso mediante el navegador de la persona propietaria.
3. Ejecutar `npx vercel --global-config /tmp/zoneshield-vercel link` y elegir la cuenta/equipo y proyecto correctos.
4. Ejecutar `npx vercel --global-config /tmp/zoneshield-vercel deploy --prod`.
5. Verificar el dominio devuelto, las rutas `/es`, `/en`, `/pt`, el analizador y la compra desactivada. Si la red restringida impide verificar la URL, añadir ese hostname exacto mediante la configuración del entorno.

La compra sigue desactivada: desplegar esta app no conecta una tienda ni activa suscripciones. El analizador actual funciona sin credenciales de terceros y ejecuta el análisis dentro del navegador.
