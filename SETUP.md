# 🛠️ Guía de Instalación y Setup

## ⚡ Instalación Rápida (5 minutos)

### Paso 1: Descargar
```bash
git clone https://github.com/deathnationlatam503-jpg/bandidaje-rp-bot.git
cd bandidaje-rp-bot
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Token
1. Abre Discord Developer Portal: https://discord.com/developers/applications
2. Selecciona tu aplicación
3. Ve a "Bot" → "Reset Token"
4. Copia el token
5. Crea archivo `.env`:

```env
DISCORD_TOKEN=tu_token_aqui
DATABASE_URL=./database.json
```

### Paso 4: Obtener IDs

**Para tu ID de usuario:**
- En Discord: Habilita modo desarrollador (Configuración > Avanzado > Modo Desarrollador)
- Click derecho en tu nombre → "Copiar ID de usuario"

**Para IDs de roles:**
- Click derecho en un rol → "Copiar ID de rol"
- Actualiza en `index.js` línea 33-42

**Para IDs de canales:**
- Click derecho en canal → "Copiar ID de canal"
- Actualiza en `index.js` línea 44-50

### Paso 5: Editar index.js

**Línea 30:** Tu ID como admin
```javascript
superAdmins: ["1234567890"], // TU ID AQUI
```

**Línea 33-42:** IDs de roles
```javascript
roles: {
  verificado: "1435828866194214912",      // Reemplaza
  noverificado: "1436940707003760640",    // Reemplaza
  // ... resto de roles
}
```

**Línea 44-50:** IDs de canales
```javascript
channels: {
  bienvenida: "1436942303741608028",      // Reemplaza
  entornos: "1521638065473589419",        // Reemplaza
  // ... resto de canales
}
```

### Paso 6: Ejecutar
```bash
npm start
```

---

## ☁️ Desplegar en Discloud

### Opción 1: Directo desde Discloud

1. **Ir a https://discloud.app/**
2. **Login con Discord**
3. **Crear nuevo proyecto**
4. **Cargar ZIP** del repositorio
5. **Esperar compilación**
6. **Configurar variables de entorno**
7. **Iniciar bot**

### Opción 2: Desde GitHub

1. **Fork el repositorio**
2. **En Discloud:** Conectar GitHub
3. **Seleccionar repositorio**
4. **Auto-deploy habilitado**

---

## 📝 Estructura del Proyecto

```
bandidaje-rp-bot/
├── index.js              ← Bot principal (EDITAR AQUI)
├── package.json          ← Dependencias
├── .env                  ← Variables (CREAR)
├── .gitignore            ← Archivos ocultos
├── database.json         ← Base de datos (Auto)
├── README.md             ← Documentación
├── COMMANDS.md           ← Comandos
└── SETUP.md              ← Este archivo
```

---

## ⚙️ Cambios Comunes

### Cambiar dinero inicial
`index.js` línea ~47:
```javascript
initialMoney: 1000,  // Cambiar aqui
```

### Cambiar bono diario
`index.js` línea ~52:
```javascript
dailyBonus: 500,  // Cambiar aqui
```

### Cambiar recompensa de crímenes
`index.js` línea ~53-56:
```javascript
crimeReward: { 
  min: 500,    // Mínimo
  max: 2000    // Máximo
},
```

### Cambiar probabilidad de crimen
`index.js` línea ~57:
```javascript
crimeChance: 0.6  // 60% - Cambiar aqui
```

---

## ❌ Solución de Problemas

### Error: "DISCORD_TOKEN no está configurado"
✅ Crea `.env` con el token
✅ Reinicia el bot

### Error: "Cannot find module"
✅ Ejecuta: `npm install`
✅ Verifica que tienes Node.js 18+

### Bot no asigna roles
✅ Verifica IDs de roles en `index.js`
✅ Verifica que el bot está arriba de los roles

### Bot no crea base de datos
✅ Verifica permisos de carpeta
✅ Verifica que `DATABASE_URL` es correcto

### Dinero no se guarda
✅ Verifica que `database.json` existe
✅ Verifica escritura en carpeta

---

## 🔑 Permisos Necesarios del Bot

En Discord Developer Portal → Bot → Intents:

- ✅ Guilds
- ✅ Guild Members
- ✅ Guild Messages
- ✅ Message Content (Importante!)
- ✅ Direct Messages

En OAuth2 → Scopes:
- ✅ bot

En OAuth2 → Permissions:
- ✅ Send Messages
- ✅ Embed Links
- ✅ Manage Roles
- ✅ Manage Channels

---

## 🚀 Comandos de Utilidad

### Verificar que Node está instalado
```bash
node --version
```

Debe mostrar v18+ (ej: v18.16.0)

### Verificar npm
```bash
npm --version
```

### Limpiar node_modules
```bash
rm -rf node_modules
npm install
```

### Ver logs en vivo
```bash
npm start
```

---

## 📞 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| Bot no enciende | Verifica token y config |
| Sin permisos | Revisa roles del bot |
| Comandos no funcionan | Activa Message Content Intent |
| Dinero se pierde | Verifica database.json |
| Roles no se asignan | Revisa IDs en index.js |

---

## ✅ Verificar Setup

Después de ejecutar `npm start`:

- [ ] Bot aparece online en Discord
- [ ] Muestra versión 3.0 ULTIMATE en consola
- [ ] Base de datos se crea
- [ ] Comandos responden
- [ ] Roles se asignan
- [ ] Dinero se guarda

---

**¡Listo! Tu bot está completamente configurado.** 🎉

Ahora:
1. Invita el bot a tu servidor
2. Prueba `!verificar`
3. Prueba otros comandos
4. ¡Diviértete!

**¡Que disfrutes Bandidaje RP!** 🔥
