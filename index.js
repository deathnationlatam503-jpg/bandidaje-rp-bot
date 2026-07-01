require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

/* =========================
   CONFIG RP AVANZADA
========================= */

const config = {
  // Administradores supremos
  superAdmins: ["1234567890"], // REEMPLAZA CON TU ID
  
  roles: {
    verificado: "1435828866194214912",
    noverificado: "1436940707003760640",
    dni: "1515114494072852510",
    policia: "1513311932289908867",
    medico: "1513312202961064088",
    bombero: "1513312126297575444",
    ejercito: "1513312017996316834"
  },

  channels: {
    bienvenida: "1436942303741608028",
    entornos: "1521638065473589419",
    votaciones: "1514597396355747973",
    logs: "1518613297195384943",
    soporte: "1436942303741608028"
  },

  economy: {
    initialMoney: 1000,
    minTransfer: 100,
    maxTransfer: 50000,
    dailyBonus: 500,
    crimeReward: { min: 500, max: 2000 },
    crimeChance: 0.6 // 60% de éxito
  },

  timeouts: {
    dailyBonus: 24 * 60 * 60 * 1000, // 24 horas
    crime: 30 * 60 * 1000 // 30 minutos
  }
};

/* =========================
   DATABASE MANAGER MEJORADO
========================= */

class Database {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      users: {},
      votes: {},
      crimes: {},
      lastDaily: {}
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const rawData = fs.readFileSync(this.filePath, "utf8");
        this.data = JSON.parse(rawData);
      } else {
        this.save();
      }
    } catch (error) {
      console.error("❌ Error cargando base de datos:", error);
      this.data = { users: {}, votes: {}, crimes: {}, lastDaily: {} };
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error("❌ Error guardando base de datos:", error);
    }
  }

  getUser(id) {
    if (!this.data.users[id]) {
      this.data.users[id] = {
        money: config.economy.initialMoney,
        phone: Math.floor(10000 + Math.random() * 90000),
        dni: false,
        profession: null,
        level: 1,
        exp: 0,
        crimes: 0,
        arrests: 0,
        reputation: 0,
        createdAt: new Date().toISOString()
      };
      this.save();
    }
    return this.data.users[id];
  }

  setUser(id, userData) {
    this.data.users[id] = userData;
    this.save();
  }

  getVote(id) {
    return this.data.votes[id];
  }

  setVote(id, voteData) {
    this.data.votes[id] = voteData;
    this.save();
  }

  canClaimDaily(id) {
    const lastClaim = this.data.lastDaily[id];
    if (!lastClaim) return true;
    return Date.now() - lastClaim > config.timeouts.dailyBonus;
  }

  setDailyClaim(id) {
    this.data.lastDaily[id] = Date.now();
    this.save();
  }
}

const dbPath = process.env.DATABASE_URL || "./database.json";
const db = new Database(dbPath);

/* =========================
   UTILITY FUNCTIONS
========================= */

function isSuperAdmin(userId) {
  return config.superAdmins.includes(userId);
}

function logEvent(guild, event, details, color = "Blue") {
  const logChannel = guild.channels.cache.get(config.channels.logs);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle(`📋 ${event}`)
    .setDescription(details)
    .setColor(color)
    .setTimestamp();

  logChannel.send({ embeds: [embed] }).catch(() => {});
}

function getLevel(exp) {
  return Math.floor(Math.sqrt(exp / 100)) + 1;
}

function formatMoney(amount) {
  return `$${amount.toLocaleString()}`;
}

/* =========================
   READY
========================= */

client.once("ready", () => {
  console.log(`
╔════════════════════════════════════════╗
║  🔥 BANDIDAJE RP BOT ONLINE 🔥        ║
║  Usuario: ${client.user.tag.padEnd(29)}║
║  Base de datos: ${dbPath.padEnd(20)}║
║  Versión: 3.0 ULTIMATE                  ║
╚════════════════════════════════════════╝
  `);

  client.user.setActivity("!ayuda para comandos", { type: "LISTENING" });
});

/* =========================
   BIENVENIDA + AUTOROLE
========================= */

client.on("guildMemberAdd", (member) => {
  const ch = member.guild.channels.cache.get(config.channels.bienvenida);

  if (ch) {
    const embed = new EmbedBuilder()
      .setTitle("👋 ¡Bienvenido a Bandidaje RP!")
      .setDescription(`
${member} acaba de unirse al servidor.

**Pasos para empezar:**
1️⃣ Usa \`!verificar\` para verificarte
2️⃣ Usa \`!dni\` para crear tu DNI
3️⃣ Elige una profesión con \`!profesion\`
4️⃣ Usa \`!ayuda\` para ver todos los comandos

¡Bienvenido a la familia!
      `)
      .setColor("Green")
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch((err) => {
      console.error("❌ Error enviando bienvenida:", err);
    });
  }

  member.roles.add(config.roles.noverificado).catch((err) => {
    console.error("❌ Error asignando rol:", err);
  });

  logEvent(member.guild, "Nuevo Miembro", `${member.user.tag} se unió`, "Green");
});

/* =========================
   SISTEMA PRINCIPAL RP
========================= */

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.guild) return;

  const id = msg.author.id;
  const user = db.getUser(id);
  const prefix = "!";

  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args[0].toLowerCase();

  try {
    /* ================= VERIFICACIÓN ================= */
    if (command === "verificar") {
      if (msg.member.roles.cache.has(config.roles.verificado)) {
        return msg.reply("⚠️ Ya estás verificado");
      }

      try {
        await msg.member.roles.add(config.roles.verificado);
        await msg.member.roles.remove(config.roles.noverificado);

        const embed = new EmbedBuilder()
          .setTitle("✅ Verificado Exitosamente")
          .setDescription("¡Bienvenido a Bandidaje RP!")
          .setColor("Green");

        msg.reply({ embeds: [embed] });
        logEvent(msg.guild, "Verificación", `${msg.author.tag} se verificó`, "Green");
      } catch (error) {
        console.error("❌ Error en verificación:", error);
        msg.reply("❌ Error al verificar. Intenta de nuevo.");
      }
      return;
    }

    /* ================= DNI ================= */
    if (command === "dni") {
      if (user.dni) {
        return msg.reply("⚠️ Ya tienes un DNI");
      }

      user.dni = true;
      db.setUser(id, user);

      try {
        await msg.member.roles.add(config.roles.dni);

        const embed = new EmbedBuilder()
          .setTitle("🆔 DNI Creado")
          .addFields(
            { name: "Número de Teléfono", value: `${user.phone}`, inline: true },
            { name: "Nivel", value: `${user.level}`, inline: true },
            { name: "Dinero", value: formatMoney(user.money), inline: true }
          )
          .setColor("Blue");

        msg.reply({ embeds: [embed] });
        logEvent(msg.guild, "DNI Creado", `${msg.author.tag} creó su DNI`, "Blue");
      } catch (error) {
        console.error("❌ Error en DNI:", error);
        msg.reply("❌ Error al crear DNI.");
      }
      return;
    }

    /* ================= PERFIL ================= */
    if (command === "perfil") {
      const targetUser = msg.mentions.users.first() || msg.author;
      const targetData = db.getUser(targetUser.id);

      const embed = new EmbedBuilder()
        .setTitle(`👤 Perfil de ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: "💰 Dinero", value: formatMoney(targetData.money), inline: true },
          { name: "📱 Teléfono", value: `${targetData.phone}`, inline: true },
          { name: "🆔 DNI", value: targetData.dni ? "✅ Sí" : "❌ No", inline: true },
          { name: "⭐ Nivel", value: `${targetData.level}`, inline: true },
          { name: "📊 Experiencia", value: `${targetData.exp}/100`, inline: true },
          { name: "👔 Profesión", value: targetData.profession || "Ninguna", inline: true },
          { name: "🚨 Crímenes", value: `${targetData.crimes}`, inline: true },
          { name: "🚔 Arrestos", value: `${targetData.arrests}`, inline: true },
          { name: "⭐ Reputación", value: `${targetData.reputation}`, inline: true }
        )
        .setColor("Purple")
        .setTimestamp();

      msg.reply({ embeds: [embed] });
      return;
    }

    /* ================= ECONOMÍA ================= */
    if (command === "bal" || command === "balance") {
      const embed = new EmbedBuilder()
        .setTitle("💰 Estado Financiero")
        .addFields(
          { name: "Dinero en Banco", value: formatMoney(user.money), inline: false },
          { name: "Teléfono", value: `${user.phone}`, inline: false }
        )
        .setColor("Gold")
        .setTimestamp();

      return msg.reply({ embeds: [embed] });
    }

    if (command === "daily") {
      if (!db.canClaimDaily(id)) {
        const lastClaim = db.data.lastDaily[id];
        const timeLeft = Math.ceil((config.timeouts.dailyBonus - (Date.now() - lastClaim)) / 1000 / 60);
        return msg.reply(`⏳ Ya reclamaste tu bono diario. Intenta en ${timeLeft} minutos.`);
      }

      user.money += config.economy.dailyBonus;
      user.exp += 10;
      db.setUser(id, user);
      db.setDailyClaim(id);

      const newLevel = getLevel(user.exp);
      const levelUp = newLevel > user.level;

      let description = `✅ Recibiste ${formatMoney(config.economy.dailyBonus)}\n📊 +10 EXP`;
      if (levelUp) {
        description += `\n🎉 ¡SUBISTE A NIVEL ${newLevel}!`;
        user.level = newLevel;
        db.setUser(id, user);
      }

      const embed = new EmbedBuilder()
        .setTitle("📅 Bono Diario Reclamado")
        .setDescription(description)
        .setColor("Green");

      msg.reply({ embeds: [embed] });
      return;
    }

    if (command === "transfer") {
      const targetUser = msg.mentions.users.first();
      const amount = parseInt(args[2]) || 0;

      if (!targetUser || amount <= 0) {
        return msg.reply("❌ Uso: !transfer @usuario cantidad");
      }

      if (amount < config.economy.minTransfer) {
        return msg.reply(`❌ Mínimo a transferir: ${formatMoney(config.economy.minTransfer)}`);
      }

      if (user.money < amount) {
        return msg.reply("❌ No tienes suficiente dinero");
      }

      user.money -= amount;
      db.setUser(id, user);

      const targetData = db.getUser(targetUser.id);
      targetData.money += amount;
      db.setUser(targetUser.id, targetData);

      const embed = new EmbedBuilder()
        .setTitle("💵 Transferencia Completada")
        .setDescription(`Enviaste ${formatMoney(amount)} a ${targetUser.tag}`)
        .setColor("Blue");

      msg.reply({ embeds: [embed] });
      logEvent(msg.guild, "Transferencia", `${msg.author.tag} transfirió ${formatMoney(amount)} a ${targetUser.tag}`, "Blue");
      return;
    }

    if (command === "give" && isSuperAdmin(id)) {
      const targetUser = msg.mentions.users.first();
      const amount = parseInt(args[2]) || 0;

      if (!targetUser || amount <= 0) {
        return msg.reply("❌ Uso: !give @usuario cantidad");
      }

      const targetData = db.getUser(targetUser.id);
      targetData.money += amount;
      db.setUser(targetUser.id, targetData);

      const embed = new EmbedBuilder()
        .setTitle("💸 Dinero Otorgado")
        .setDescription(`Se le dieron ${formatMoney(amount)} a ${targetUser.tag}`)
        .setColor("Green");

      msg.reply({ embeds: [embed] });
      logEvent(msg.guild, "Admin - Dinero", `${msg.author.tag} otorgó ${formatMoney(amount)} a ${targetUser.tag}`, "Yellow");
      return;
    }

    /* ================= CRÍMENES RP ================= */
    if (command === "robar") {
      if (user.profession === "policia" || user.profession === "medico") {
        return msg.reply("❌ Tu profesión no puede robar");
      }

      const targetUser = msg.mentions.users.first();
      if (!targetUser) {
        return msg.reply("❌ Uso: !robar @usuario");
      }

      const targetData = db.getUser(targetUser.id);
      const reward = Math.floor(Math.random() * (config.economy.crimeReward.max - config.economy.crimeReward.min + 1) + config.economy.crimeReward.min);
      const success = Math.random() < config.economy.crimeChance;

      if (success) {
        if (targetData.money >= reward) {
          targetData.money -= reward;
          user.money += reward;
          user.crimes++;
          user.exp += 25;
          targetData.arrests = (targetData.arrests || 0) + 1;

          db.setUser(id, user);
          db.setUser(targetUser.id, targetData);

          const embed = new EmbedBuilder()
            .setTitle("🚨 ¡ROBO EXITOSO!")
            .setDescription(`Robaste ${formatMoney(reward)} a ${targetUser.tag}`)
            .setColor("Red");

          msg.reply({ embeds: [embed] });
          logEvent(msg.guild, "Robo", `${msg.author.tag} robó ${formatMoney(reward)} a ${targetUser.tag}`, "Red");
        } else {
          return msg.reply(`❌ ${targetUser.tag} no tiene suficiente dinero`);
        }
      } else {
        user.arrests = (user.arrests || 0) + 1;
        db.setUser(id, user);

        const embed = new EmbedBuilder()
          .setTitle("🚔 ¡ATRAPADO!")
          .setDescription("¡La policía RP te atrapó! -1 reputación")
          .setColor("Red");

        msg.reply({ embeds: [embed] });
        logEvent(msg.guild, "Intento fallido", `${msg.author.tag} intentó robar a ${targetUser.tag} pero fue atrapado`, "Orange");
      }
      return;
    }

    /* ================= TELÉFONO RP ================= */
    if (command === "telefono") {
      const embed = new EmbedBuilder()
        .setTitle("📱 Tu Número de Teléfono")
        .setDescription(`\`\`\`\n${user.phone}\n\`\`\``)
        .setColor("Purple")
        .setFooter({ text: "Guarda este número en tu inventario RP" });

      return msg.reply({ embeds: [embed] });
    }

    /* ================= PROFESIONES ================= */
    if (command === "profesion") {
      const profession = args[1]?.toLowerCase();
      const validProfessions = ["policia", "medico", "bombero", "ejercito", "civil"];

      if (!profession || !validProfessions.includes(profession)) {
        return msg.reply(`❌ Profesiones válidas: ${validProfessions.join(", ")}`);
      }

      if (user.profession === profession) {
        return msg.reply("⚠️ Ya tienes esa profesión");
      }

      user.profession = profession;
      db.setUser(id, user);

      try {
        if (profession !== "civil") {
          const roleId = config.roles[profession];
          await msg.member.roles.add(roleId);
        }

        const embed = new EmbedBuilder()
          .setTitle("👔 Profesión Asignada")
          .setDescription(`Eres **${profession.toUpperCase()}**`)
          .setColor("Blue");

        msg.reply({ embeds: [embed] });
        logEvent(msg.guild, "Profesión", `${msg.author.tag} se convirtió en ${profession}`, "Blue");
      } catch (error) {
        console.error("❌ Error asignando profesión:", error);
        msg.reply("❌ Error al asignar profesión");
      }
      return;
    }

    /* ================= ENTORNOS ================= */
    if (command === "911") {
      const text = msg.content.slice(4).trim();
      if (!text) {
        return msg.reply("❌ Uso: !911 [descripción del evento]");
      }

      const ch = msg.guild.channels.cache.get(config.channels.entornos);
      if (!ch) {
        return msg.reply("❌ Canal de entornos no configurado");
      }

      const embed = new EmbedBuilder()
        .setTitle("🚨 EVENTO RP - 911")
        .setDescription(text)
        .addFields(
          { name: "📍 Reportante", value: msg.author.tag, inline: false },
          { name: "📞 Teléfono", value: `${user.phone}`, inline: false }
        )
        .setColor("Red")
        .setTimestamp();

      ch.send({ embeds: [embed] }).catch((err) => {
        console.error("❌ Error enviando evento:", err);
      });

      msg.reply("📡 Evento enviado a los canales de RP");
      return;
    }

    /* ================= VOTACIONES ================= */
    if (command === "votacion") {
      const text = msg.content.slice(10).trim();
      if (!text) {
        return msg.reply("❌ Uso: !votacion [pregunta]");
      }

      const embed = new EmbedBuilder()
        .setTitle("🗳️ VOTACIÓN BANDIDAJE RP")
        .setDescription(text)
        .setColor("Green")
        .setFooter({ text: `Iniciada por: ${msg.author.tag}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("yes")
          .setLabel("🟢 Sí")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("maybe")
          .setLabel("🟡 Tal vez")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("no")
          .setLabel("🔴 No")
          .setStyle(ButtonStyle.Danger)
      );

      try {
        const message = await msg.channel.send({
          embeds: [embed],
          components: [row]
        });

        db.setVote(message.id, { yes: 0, maybe: 0, no: 0 });
        logEvent(msg.guild, "Votación", `${msg.author.tag} inició una votación`, "Purple");
      } catch (error) {
        console.error("❌ Error en votación:", error);
        msg.reply("❌ Error al crear votación");
      }
      return;
    }

    /* ================= LEADERBOARD ================= */
    if (command === "top" || command === "ranking") {
      const users = Object.entries(db.data.users)
        .sort((a, b) => b[1].money - a[1].money)
        .slice(0, 10);

      let leaderboard = "```\n";
      users.forEach((entry, index) => {
        leaderboard += `${index + 1}. ${entry[0]}: ${formatMoney(entry[1].money)}\n`;
      });
      leaderboard += "```";

      const embed = new EmbedBuilder()
        .setTitle("💰 Top 10 Más Ricos")
        .setDescription(leaderboard)
        .setColor("Gold")
        .setTimestamp();

      msg.reply({ embeds: [embed] });
      return;
    }

    /* ================= AYUDA ================= */
    if (command === "ayuda" || command === "help") {
      const embed = new EmbedBuilder()
        .setTitle("📖 Comandos Disponibles - Bandidaje RP")
        .setDescription("Usa los comandos con el prefijo `!`")
        .addFields(
          {
            name: "🔐 Verificación",
            value: "`!verificar` - Verificarte\n`!dni` - Crear DNI"
          },
          {
            name: "💰 Economía",
            value: "`!bal` - Ver dinero\n`!daily` - Bono diario\n`!transfer @user cantidad` - Transferir dinero\n`!top` - Ranking de dinero"
          },
          {
            name: "👤 Perfil",
            value: "`!perfil [@user]` - Ver perfil\n`!telefono` - Ver teléfono RP\n`!profesion [prof]` - Elegir profesión"
          },
          {
            name: "🚨 Crimen RP",
            value: "`!robar @user` - Intentar robar (60% éxito)\n`!911 [evento]` - Reportar un evento"
          },
          {
            name: "🗳️ Votaciones",
            value: "`!votacion [pregunta]` - Crear votación"
          }
        )
        .setColor("Blue")
        .setFooter({ text: "¡Diviértete en Bandidaje RP!" })
        .setTimestamp();

      msg.reply({ embeds: [embed] });
      return;
    }

  } catch (error) {
    console.error("❌ Error procesando comando:", error);
    msg.reply("❌ Ocurrió un error al procesar el comando").catch(() => {});
  }
});

/* =========================
   BOTONES VOTACIÓN
========================= */

client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  const vote = db.getVote(i.message.id);
  if (!vote) return;

  if (i.customId === "yes") vote.yes++;
  if (i.customId === "maybe") vote.maybe++;
  if (i.customId === "no") vote.no++;

  db.setVote(i.message.id, vote);

  const totals = `🟢 Sí: ${vote.yes} | 🟡 Tal vez: ${vote.maybe} | 🔴 No: ${vote.no}`;

  i.reply({
    content: `🗳️ Voto registrado\n\n${totals}`,
    ephemeral: true
  });
});

/* =========================
   ERROR HANDLING
========================= */

client.on("error", (error) => {
  console.error("❌ Error del cliente:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Promise rejection no manejada:", reason);
});

/* =========================
   LOGIN
========================= */

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN no está configurado en variables de entorno");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
