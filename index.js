require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");
const fs = require("fs");
const path = require("path");

// Validar token antes de conectar
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("❌ ERROR CRÍTICO: DISCORD_TOKEN no está configurado");
  console.error("📝 Agrega DISCORD_TOKEN en Variables de Discloud");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Config RP
const config = {
  superAdmins: ["1234567890"],
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
    crimeChance: 0.6
  },
  timeouts: {
    dailyBonus: 24 * 60 * 60 * 1000,
    crime: 30 * 60 * 1000
  }
};

// Database
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
      console.error("❌ Error cargando base de datos:", error.message);
      this.data = { users: {}, votes: {}, crimes: {}, lastDaily: {} };
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error("❌ Error guardando base de datos:", error.message);
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

// Utils
function isSuperAdmin(userId) {
  return config.superAdmins.includes(userId);
}

function logEvent(guild, event, details, color = "Blue") {
  try {
    const logChannel = guild.channels.cache.get(config.channels.logs);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle(`📋 ${event}`)
      .setDescription(details)
      .setColor(color)
      .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("❌ Error en logEvent:", error.message);
  }
}

function getLevel(exp) {
  return Math.floor(Math.sqrt(exp / 100)) + 1;
}

function formatMoney(amount) {
  return `$${amount.toLocaleString()}`;
}

// Ready
client.once("ready", () => {
  console.log(`
╔════════════════════════════════════════╗
║  🔥 BANDIDAJE RP BOT ONLINE 🔥        ║
║  Usuario: ${client.user.tag}
║  Base de datos: ${dbPath}
║  Versión: 3.0 DISCLOUD                 ║
╚════════════════════════════════════════╝
  `);

  client.user.setActivity("!ayuda para comandos", { type: "LISTENING" }).catch(() => {});
});

// Member Join
client.on("guildMemberAdd", (member) => {
  try {
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
        `)
        .setColor("Green")
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

      ch.send({ embeds: [embed] }).catch(() => {});
    }

    member.roles.add(config.roles.noverificado).catch(() => {});
    logEvent(member.guild, "Nuevo Miembro", `${member.user.tag} se unió`, "Green");
  } catch (error) {
    console.error("❌ Error en guildMemberAdd:", error.message);
  }
});

// Message Create
client.on("messageCreate", async (msg) => {
  try {
    if (msg.author.bot) return;
    if (!msg.guild) return;

    const id = msg.author.id;
    const user = db.getUser(id);
    const prefix = "!";

    if (!msg.content.startsWith(prefix)) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = args[0].toLowerCase();

    // VERIFICAR
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
        console.error("❌ Error en verificación:", error.message);
        msg.reply("❌ Error al verificar").catch(() => {});
      }
      return;
    }

    // DNI
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
        console.error("❌ Error en DNI:", error.message);
        msg.reply("❌ Error al crear DNI").catch(() => {});
      }
      return;
    }

    // PERFIL
    if (command === "perfil") {
      const targetUser = msg.mentions.users.first() || msg.author;
      const targetData = db.getUser(targetUser.id);

      const embed = new EmbedBuilder()
        .setTitle(`👤 Perfil de ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: "💰 Dinero", value: formatMoney(targetData.money), inline: true },
          { name: "📱 Teléfono", value: `${targetData.phone}`, inline: true },
          { name: "🆔 DNI", value: targetData.dni ? "✅" : "❌", inline: true },
          { name: "⭐ Nivel", value: `${targetData.level}`, inline: true },
          { name: "📊 EXP", value: `${targetData.exp}/100`, inline: true },
          { name: "👔 Profesión", value: targetData.profession || "Ninguna", inline: true }
        )
        .setColor("Purple")
        .setTimestamp();

      msg.reply({ embeds: [embed] });
      return;
    }

    // BALANCE
    if (command === "bal" || command === "balance") {
      const embed = new EmbedBuilder()
        .setTitle("💰 Tu Dinero")
        .addFields(
          { name: "Saldo", value: formatMoney(user.money), inline: false }
        )
        .setColor("Gold");

      return msg.reply({ embeds: [embed] });
    }

    // DAILY
    if (command === "daily") {
      if (!db.canClaimDaily(id)) {
        return msg.reply("⏳ Ya reclamaste tu bono diario hoy");
      }

      user.money += config.economy.dailyBonus;
      db.setUser(id, user);
      db.setDailyClaim(id);

      const embed = new EmbedBuilder()
        .setTitle("📅 Bono Diario")
        .setDescription(`✅ Recibiste ${formatMoney(config.economy.dailyBonus)}`)
        .setColor("Green");

      msg.reply({ embeds: [embed] });
      return;
    }

    // TRANSFER
    if (command === "transfer") {
      const targetUser = msg.mentions.users.first();
      const amount = parseInt(args[2]) || 0;

      if (!targetUser || amount <= 0) {
        return msg.reply("❌ Uso: !transfer @usuario cantidad");
      }

      if (user.money < amount) {
        return msg.reply("❌ No tienes suficiente dinero");
      }

      user.money -= amount;
      db.setUser(id, user);

      const targetData = db.getUser(targetUser.id);
      targetData.money += amount;
      db.setUser(targetUser.id, targetData);

      msg.reply(`✅ Transferiste ${formatMoney(amount)} a ${targetUser.tag}`);
      return;
    }

    // ROBAR
    if (command === "robar") {
      const targetUser = msg.mentions.users.first();
      if (!targetUser) {
        return msg.reply("❌ Uso: !robar @usuario");
      }

      const targetData = db.getUser(targetUser.id);
      const reward = Math.floor(Math.random() * 1000) + 500;
      const success = Math.random() < 0.6;

      if (success && targetData.money >= reward) {
        targetData.money -= reward;
        user.money += reward;
        user.crimes++;
        db.setUser(id, user);
        db.setUser(targetUser.id, targetData);

        msg.reply(`🚨 ¡ROBO EXITOSO! Robaste ${formatMoney(reward)}`);
      } else {
        msg.reply("🚔 ¡ATRAPADO! La policía te detuvo");
      }
      return;
    }

    // PROFESION
    if (command === "profesion") {
      const profession = args[1]?.toLowerCase();
      const validProfessions = ["policia", "medico", "bombero", "ejercito", "civil"];

      if (!profession || !validProfessions.includes(profession)) {
        return msg.reply(`❌ Profesiones: ${validProfessions.join(", ")}`);
      }

      user.profession = profession;
      db.setUser(id, user);

      msg.reply(`✅ Eres **${profession.toUpperCase()}** ahora`);
      return;
    }

    // 911
    if (command === "911") {
      const text = msg.content.slice(4).trim();
      if (!text) {
        return msg.reply("❌ Uso: !911 [evento]");
      }

      const ch = msg.guild.channels.cache.get(config.channels.entornos);
      if (ch) {
        const embed = new EmbedBuilder()
          .setTitle("🚨 EVENTO RP")
          .setDescription(text)
          .addFields({ name: "📞 Reportante", value: msg.author.tag })
          .setColor("Red");

        ch.send({ embeds: [embed] }).catch(() => {});
      }

      msg.reply("📡 Evento enviado");
      return;
    }

    // TOP
    if (command === "top" || command === "ranking") {
      const users = Object.entries(db.data.users)
        .sort((a, b) => b[1].money - a[1].money)
        .slice(0, 5);

      let leaderboard = "```\n";
      users.forEach((entry, index) => {
        leaderboard += `${index + 1}. ${entry[1].money}\n`;
      });
      leaderboard += "```";

      const embed = new EmbedBuilder()
        .setTitle("💰 Top 5 Más Ricos")
        .setDescription(leaderboard)
        .setColor("Gold");

      msg.reply({ embeds: [embed] });
      return;
    }

    // AYUDA
    if (command === "ayuda" || command === "help") {
      const embed = new EmbedBuilder()
        .setTitle("📖 Comandos")
        .addFields(
          { name: "!verificar", value: "Verificarte" },
          { name: "!dni", value: "Crear DNI" },
          { name: "!bal", value: "Ver dinero" },
          { name: "!daily", value: "Bono diario" },
          { name: "!transfer @user cantidad", value: "Transferir dinero" },
          { name: "!robar @user", value: "Robar (60% éxito)" },
          { name: "!profesion", value: "Elegir profesión" },
          { name: "!911", value: "Reportar evento" },
          { name: "!top", value: "Ranking" }
        )
        .setColor("Blue");

      msg.reply({ embeds: [embed] });
      return;
    }

  } catch (error) {
    console.error("❌ Error en messageCreate:", error.message);
  }
});

// Interaction
client.on("interactionCreate", async (i) => {
  try {
    if (!i.isButton()) return;

    const vote = db.getVote(i.message.id);
    if (!vote) return;

    if (i.customId === "yes") vote.yes++;
    if (i.customId === "no") vote.no++;

    db.setVote(i.message.id, vote);

    i.reply({
      content: `🗳️ Voto registrado`,
      ephemeral: true
    });
  } catch (error) {
    console.error("❌ Error en interactionCreate:", error.message);
  }
});

// Error Handling
client.on("error", (error) => {
  console.error("❌ Error del cliente:", error.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Rechazo no manejado:", reason);
});

// Login
console.log("🔑 Intentando conectar con Discord...");
client.login(token).catch((error) => {
  console.error("❌ ERROR AL CONECTAR:", error.message);
  process.exit(1);
});
