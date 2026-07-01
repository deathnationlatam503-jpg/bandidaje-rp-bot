# ☁️ Guía Discloud - Bandidaje RP Bot

## 🚀 Desplegar en Discloud (5 minutos)

### Paso 1: Ir a Discloud
Accede a https://discloud.app/

### Paso 2: Login con Discord
1. Click en "Login with Discord"
2. Autoriza Discloud
3. Click en "Dashboard"

### Paso 3: Crear Aplicación

**Opción A: Desde ZIP (Recomendado)**
1. Click en "Aplicaciones"
2. Click en "Crear nueva aplicación"
3. Descarga el ZIP: https://github.com/deathnationlatam503-jpg/bandidaje-rp-bot/archive/refs/heads/main.zip
4. Extrae el ZIP
5. Comprime la carpeta `bandidaje-rp-bot-main` nuevamente
6. Sube el ZIP en Discloud
7. Espera compilación (1-2 minutos)

**Opción B: Desde GitHub**
1. Click en "Conectar GitHub"
2. Selecciona el repositorio
3. Click en "Conectar"
4. Auto-deploy habilitado

### Paso 4: Configurar Variables

Una vez que Discloud compile el bot:

1. Ve a "Configuración" de la aplicación
2. Busca "Variables de Entorno"
3. Agrega estas variables:

```
DISCORD_TOKEN=tu_token_del_bot
DATABASE_URL=./database.json
```

**Cómo obtener el token:**
1. Ve a https://discord.com/developers/applications
2. Selecciona tu bot
3. Ve a "Bot"
4. Click "Reset Token"
5. Copia el token

### Paso 5: Editar Configuración

En tu repositorio local, edita `index.js` línea ~30:

```javascript
superAdmins: ["TU_ID_DISCORD"],  // Tu ID de usuario
```

Y actualiza los IDs de roles y canales (línea 33-50).

Sube estos cambios a GitHub o vuelve a subir el ZIP.

### Paso 6: Iniciar Bot

1. Ve a la aplicación en Discloud
2. Click en "Encender" (botón verde)
3. Espera a que diga "Online"
4. ¡Listo! 🎉

---

## 📊 Panel de Control Discloud

### Ver Logs
- Click en "Logs" para ver en tiempo real

### Reiniciar Bot
- Click en "Reiniciar"

### Detener Bot
- Click en "Apagar"

### Editar Configuración
- Click en "Configuración"
- Modifica variables
- Click "Guardar"

---

## 🔧 Estructura Discloud

```
Tu Proyecto en Discloud:
├── Bot activo 24/7 ✅
├── Base de datos persistente ✅
├── Logs en tiempo real ✅
├── Auto-restart si cae ✅
├── Backup automático ✅
└── Panel web de control ✅
```

---

## ✅ Archivos Necesarios

Para que Discloud funcione perfectamente:

```
✅ package.json       (Dependencias)
✅ index.js           (Código del bot)
✅ .env               (Variables - Discloud las maneja)
✅ discloud.config    (Configuración de Discloud)
✅ database.json      (Se crea automáticamente)
```

---

## ⚡ Verificar que Funciona

1. **Bot aparece online en Discord** ✅
2. **Responde a `!ayuda`** ✅
3. **Crea base de datos** ✅
4. **Asigna roles** ✅
5. **Guarda dinero** ✅

---

## 📱 Ventajas de Discloud

✨ **24/7 Online** - Bot nunca se apaga
✨ **Gratis** - Hasta cierto límite
✨ **Fácil** - Sin complicaciones
✨ **Rápido** - Despliegue en minutos
✨ **Panel web** - Controla desde navegador
✨ **Logs** - Ve todo en tiempo real
✨ **Backup** - Tus datos están seguros
✨ **Auto-restart** - Se reinicia si cae

---

## ❌ Si hay Errores en Discloud

### Error: "Cannot find module discord.js"
```bash
# En tu terminal local:
npm install
# Sube los cambios a GitHub o ZIP
```

### Error: "DISCORD_TOKEN no está configurado"
1. Ve a Configuración en Discloud
2. Verifica que `DISCORD_TOKEN` está en variables
3. Verifica que el token es válido
4. Reinicia el bot

### Bot se desconecta frecuentemente
1. Ve a Logs en Discloud
2. Busca errores
3. Verifica los IDs en `index.js`
4. Verifica permisos del bot en Discord

### Dinero no se guarda
1. Verifica que `DATABASE_URL` es `./database.json`
2. Verifica permisos de carpeta
3. Reinicia el bot

---

## 💾 Backup y Restauración

### Descargar Base de Datos
1. Ve a "Archivos" en Discloud
2. Descarga `database.json`
3. Guarda en lugar seguro

### Restaurar Base de Datos
1. Sube `database.json` a "Archivos"
2. Reinicia el bot

---

## 🔐 Seguridad en Discloud

✅ Variables de entorno protegidas
✅ Token nunca en código fuente
✅ HTTPS para conexiones
✅ Encriptación de datos
✅ Backups automáticos

---

## 📞 Soporte Discloud

- Documentación: https://discloud.app/docs
- Discord de soporte: https://discloud.app/discord
- Email: support@discloud.app

---

## 🎯 Checklist Final

- [ ] Repositorio creado
- [ ] ZIP descargado
- [ ] Cuenta Discloud creada
- [ ] ZIP subido a Discloud
- [ ] Variables configuradas
- [ ] IDs actualizados
- [ ] Bot online
- [ ] Comandos funcionan
- [ ] Base de datos se crea

---

## 🎉 ¡Listo!

Tu bot está corriendo 24/7 en Discloud sin necesidad de tener tu PC encendido.

**Ahora:**
1. Invita el bot a tu servidor
2. Prueba los comandos
3. ¡Diviértete en Bandidaje RP!

**¡Que disfrutes!** 🔥🎭
