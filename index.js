require('events').EventEmitter.defaultMaxListeners = 1000000;

const express = require('express');
const app = express();

app.listen(() => console.log('Server Started'));

app.use('/', (req, res) => {
  res.send(new Date());
});

const {
  Discord,
  Permissions,
  Intents,
  Client,
  MessageEmbed,
  MessageAttachment,
  Collection,
  Collector,
  MessageCollector,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  WebhookClient
} = require('discord.js'),
  fs = require("fs"),
  Enmap = require("enmap")

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
  partials: ['CHANNEL', 'MESSAGE', 'USER', 'GUILD_MEMBER'],
  allowedMentions: {
    parse: ['users'],
    repliedUser: false
  }
});

const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { DisTube } = require("distube");
const ms = require("ms")
const fetch = require("node-fetch")
const tempData = new Collection();
tempData.set("bots", []);

client.on('ready', async() => {
  console.log(`${client.user.tag} Connected`)
})

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  let args = message.content.split(" ");
  if (args[0] === "create") {
    if (!ownersArray.includes(message.author.id)) return;
    let number = parseInt(args[1]);
    if (!number) return;
    let name = args.slice(2).join(" ");
    if (!name) return;
    let num = 0;
    let time = 0;
    let done = 0;
    for (let i = 0; i < number; i++) {
      await wait(time);
      let bot = await create_bots(name, done + 1);
      if (bot?.cooldown) {
        message.reply({
          content: `i created ${done} bots but there is now cooldown: ${bot?.cooldown}`,
        });
        break;
      }
      if (bot?.message) {
        message.reply({
          content: `error: ${bot?.message}`,
        });
        break;
      }
      await client.channels.cache.get("1212139138254512180")?.send({
        content: `${bot?.name}\n\`\`\`Bot ID = ${bot?.id}\nBot Token = ${bot.token}\nInvite URL = https://discord.com/oauth2/authorize?client_id=${bot?.id}&permissions=8&scope=bot%20applications.commands\`\`\``,
      });
      time += 30000;
      done += 1;
      var data = fs.readFileSync("./tokens.json");
      data = JSON.parse(data);
      data.push({
        token: bot.token,
        id: bot?.id,
        registered: false,
        owner: null,
        server: null,
        channel: null,
        expireDate: null,
      });
      runBotSystem(bot?.token);
      fs.writeFile("./tokens.json", JSON.stringify(data), (err) => {
        if (err) throw err;
      });
    }

   return message.reply({ content: `${number}` });
  } else if (args[0] === "add") {
    if (!ownersArray.includes(message.author.id)) return;
    let number = parseInt(args[1]);
    if (!number) return;
    var data = fs.readFileSync("./tokens.json");
    data = JSON.parse(data);
    if (number > data.length)
      return message.reply(`there is just ${data.length}`);
    for (let i = 0; i < number; i++) {
      let bot = data[i];
      setTimeout(() => {
        message.author.send({
          content: `|| https://discord.com/oauth2/authorize?client_id=${bot?.id}&permissions=8&scope=bot%20applications.commands ||`,
        });
      }, 3000 + i * 6000);
    }
  } else if(args[0] === "avatarall") {
    if (!ownersArray.includes(message.author.id)) return;
    let args = message.content.split(' ');
    let bots = tempData.get("bots");
    let url = args[1];
    if(!url) return;      
    
    bots.forEach(bot => {
     bot.user.setAvatar(url).then(async() => {
      let channel = bot.channels.cache.get(message.channel.id)
      let msg = await channel.messages.fetch(message.id).catch(console.log)
      msg.react("✅").catch(console.log)
     }).catch(console.log)
    })
  } else if (args[0] === "comeall") {
     if (!ownersArray.includes(message.author.id)) return;
     var data = fs.readFileSync('./tokens.json', "utf8");
     if(data == "" || !data) return;
     data = JSON.parse(data);
     if(!data) return;
    
     let member_voice = message.member?.voice?.channel
     if(!member_voice) return;
     let tokenObjs = data.filter((tokenBot) => !tokenBot.channel);
     if(!tokenObjs[0]) return message.reply(`**مافي بوت فاضي.**`);
     let bots = tempData.get("bots");
     for(let i = 0; i < bots.length; i++) {
      data = data.filter((tk) => tk.token != tokenObjs[i].token)
      let newObj = client.database.get(`bot_${bots.filter((c) =>  c.token == tokenObjs[i].token)}`)
      newObj.channel = member_voice.id;
      client.database.set(`bot_${bots.filter((c) =>  c.token == tokenObjs[i].token)}`, newObj)
      tokenObjs[i].channel = member_voice.id;
      data.push(tokenObjs[i]);
  };

     fs.writeFile('./tokens.json', JSON.stringify(data, null, 4), "utf8", (err) => { if (err) throw err; message.react('✅')}); 
   } else if (args[0] === "adminrole") {
     if(message.member?.permissions?.has('ADMINISTRATOR')) return;
     var data = fs.readFileSync('./config.json', "utf8");
     if(data == "" || !data) return;
     data = JSON.parse(data);
     if(!data) return;

     let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
     if(!role) return message.react('❌');
     if(data.adminRoles.includes(role.id)) {
       data.adminRoles = adminRoles.filter((ro) => ro !== role.id);
     };
     data.adminRoles.push(role.id);
     fs.writeFile('./config.json', JSON.stringify(data, null, 4), "utf8", (err) => { if (err) throw err; message.react('✅').catch(console.log)}); 
   } else if (args[0] === "aroles") {
     if(message.member?.permissions?.has('ADMINISTRATOR')) return;
     var data = fs.readFileSync('./config.json', "utf8");
     if(data == "" || !data) return message.react('❌');
     data = JSON.parse(data);
     if(!data) return message.react('❌');
     if(!data?.adminRoles || !data.adminRoles[0]) return message.react('❌');

     message.reply(`**رولات الأدمنز:** *${data?.adminRoles.join(', ')}.*`).catch(() => 0)
   } else if (args[0] === "setstatus") {
     var data = fs.readFileSync('./config.json', "utf8");
     if(data == "" || !data) return;
     data = JSON.parse(data);
     if(!data) return;

     let category = message.mentions.channels.first() || await message.guild.channels.fetch(args[1]).catch(() => 0);
     if(!category || category?.type !== "GUILD_CATEGORY") return message.react('❌');

     let status = args[2];
     if(!status) return message.react('❌');
     if(!['dnd', 'idle', 'online'].some((st) => st == status.toLowerCase())) return message.react('❌');
    
     if(!data.categories) data.categories = {};
     if(data.categories[category.id]) data.categories[category.id] = null
     else data.categories[category.id] = status.toLowerCase();
    
     fs.writeFile('./config.json', JSON.stringify(data, null, 4), "utf8", (err) => { if (err) throw err; message.react('✅').catch(console.log)}); 
   }
});

client.database = new Enmap({ persistent: true, name: 'database-bots', fetchAll: false, autoFetch: true });

setTimeout(async () => {
  var data = fs.readFileSync('./tokens.json');
  var parsedData = JSON.parse(data);
  var tokens_data = parsedData;
  if (!tokens_data[0]) return;
   
    tokens_data.forEach(token => {
      runBotSystem(token.token, token);
    });
}, 3000);

const ownersArray = ['755782461366992977', '', ''];
const adminsRole = "1279611379996692552"; // ايدي رتبة المشرفين
const serverID = "1279607376013557810"; // ايدي السيرفر

var _0x1e82=["\x63\x61\x74\x63\x68","\x75\x72\x6C",""];async function convert(_0x869ex2){const _0x869ex3= await fetch(_0x869ex2)[_0x1e82[0]]((_0x869ex4)=>{return 0});const _0x869ex5=_0x869ex3[_0x1e82[1]];if(_0x869ex5){return `${_0x1e82[2]}${_0x869ex5}${_0x1e82[2]}`}else {return null}}

async function runBotSystem(token, databaseObject) {
  const client83883 = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES
    ],
    partials: ['CHANNEL', 'GUILD_MEMBER'],
    allowedMentions: {
      parse: ['users'],
      repliedUser: false
    }
  });
  
client83883.music = new DisTube(client83883, {
  leaveOnStop: false,
  leaveOnEmpty: false,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [ 
    new SpotifyPlugin({
      emitEventsAfterFetching: true,
    }),
    new SoundCloudPlugin(),
  ],
  youtubeDL: false
});
client83883.lastVolume = 50;
client83883.music
  .on('playSong', (queue, song) => {
    song.metadata.msg.edit(
      `> *🎵 **${song.name}** (\`${song.formattedDuration}\`) - ${song.user}*`
    ).catch(() => 0);
    if(queue?.volume !== client83883.lastVolume) {
      queue.setVolume(client83883.lastVolume);
    };
  })
  .on('addSong', (queue, song) =>
    song.metadata.msg.edit(
      `> <:add:1090976527799304294> *Adding to queue:* **${song.name}** (\`${song.formattedDuration}\`) - ${song.user}`
    ).catch(() => 0)
  )
  .on('addList', (queue, playlist) =>
    song.metadata.msg.edit(
      `<:add:1090976527799304294> **أُضيفت قائمة الآغاني** *${playlist.name}* (\`${
        playlist.songs.length
      }\` آغنية) **إلى طابور الأغاني**`
    ).catch(() => 0)
  )
  .on('error', (channel, e) => {
    console.log(e)
    if (channel) channel.send(`<:off:1090976570912559264> **تم إستقبال خطأ:** ${e.toString().slice(0, 1974)}`).catch(() => 0)
    else console.error(e)
  })
  .on('searchNoResult', (message, query) =>
    message.reply(`> :mag_right: **لم يتم إيجاد نتائج بحث لـ** *${query}*`).catch(() => 0)
  )
  
 client83883.on('ready', async () => {
  client.database.set(`bot_${client83883.user.id}`, databaseObject)
  let newData = tempData.get("bots")
   newData.push(client83883)
   tempData.set(`bots`, newData)
   console.log('Bot: ' + client83883.user.username);
    let int = setInterval(async () => {
      var data = client.database.get(`bot_${client83883.user.id}`)
      if(!data) {
        client83883.destroy()?.catch(() => 0);
        return clearInterval(int);
      };
      
      var config = fs.readFileSync('./config.json', 'utf8');
      if(!config || config == '') return;
      
      config = JSON.parse(config);
      tokenObj = data;

      if(tokenObj.channel) {
        let guild = client83883.guilds.cache.get(serverID)
        if(guild) {
         let voiceChannel = guild?.me.voice.channel;
         if(voiceChannel) {
          if(!config.categories?.[voiceChannel.parentId]) client83883.user.setStatus(tokenObj.status || "online")
          else client83883.user.setStatus(config.categories[voiceChannel.parentId] || "online")
            
          if(voiceChannel.id !== tokenObj.channel) {
            let musicChannel = guild.channels.cache.get(tokenObj?.channel)
            if(musicChannel && musicChannel.joinable) {
              client83883.music.voices.join(musicChannel).catch(() => 0)
            }
          }
         } else {
           let musicChannel = guild.channels.cache.get(tokenObj?.channel)
            if(musicChannel && musicChannel.joinable) {
              client83883.music.voices.join(musicChannel).catch(() => 0)
              if(!config.categories?.[musicChannel.parentId]) client83883.user.setStatus(tokenObj.status || "online")
              else client83883.user.setStatus(config.categories[musicChannel.parentId] || "online")
            }
         }
        }
      } else {
        client83883.user.setStatus("online")
        let guild = client83883.guilds.cache.get(serverID)
        if(guild) {
         let voiceChannel = guild?.me.voice.channel;
         if(voiceChannel) {
           client83883.music.voices.leave(guild.id)
         }
        }
      }
    }, 5000);
  });

   client83883.on('messageCreate', async(message) => {
    if(message.author.bot || !message.guild) return;
    var data = client.database.get(`bot_${client83883.user.id}`)
    if(!data) return client83883.destroy()?.catch(() => 0);
     
    let tokenObj = data;
    let args = message.content?.trim().split(' ');
     if(args) {
       if(args[0] == `<@!${client83883.user.id}>` || args[0] == `<@${client83883.user.id}>`) {
         args = args.slice(1);
         if(!args[0]) return;
          if(args[0] == 'help') {
            message.author.send(`**Music Commands :**
 > \`play\`: **Play the song or add it to queue**
 > \`skip\` : **Skip to the next song**
 > \`stop\` : **To stop the music and clearing the queue**
 > \`volume\` : **Change the volume**
 > \`come\` : **Enable 24/7 in channel**
 > \`repeat\` : **Toggle music repeat**
 > \`playlist\` : **Song list**
 > \`nowplaying\` : **Displays the currently playing track**
 > \`pause\` : ** Pauses the playback**
 > \`resume\` : **Resume the playlist**


 **Owner Commands :**
 > \`setname\` : **Change bot name**
 > \`setavatar\` : **Change bot avatar**
 > \`setprefix\` : **Change the bot prefix**
 > \`setplaying\` : **Change bot status**
 > \`setstreaming\` : **Change bot status (Twitch)**
 > \`restart\` : **Restarting the bot if you have bug**
 > \`addadmin\` : **Allow the use of owner commands**
 > \`removeadmin\` : **Refuse to use owner orders**
 > \`adminlist\` : **View all admins**
https://discord.gg/6H9J8662ND 
 `)
              .then(async() => {
               message.react("✅").catch(() => 0);
            }).catch(() => {
               message.react("🔒").catch(() => 0);
            })
          };
         var config = fs.readFileSync('./config.json', "utf8");
         if(config == "" || !config) return;
         config = JSON.parse(config);
         if(!config) return;
         if(config.adminsRole && !message.member?.roles?.cache?.hasAny(...config.adminsRole)) return;
         if(args[0] == 'restart') {
            await client83883.destroy()
            setTimeout(async() => {
              client83883.login(token).then(() => {
                message.reply(`Restarted Succesfully!`).catch(() => 0)
            }).catch(() => { console.log(`${client83883.user.tag} (${client83883.user.id}) has an error with restarting.`) })
          }, 5000)
             
          } else if(args[0] == 'setname') {
            let name = args[1];
            if(!name) return;
            
            client83883.user.setUsername(name).then(async() => {
              message.reply(`Name changed to: \`${name}\``).catch(() => 0)
            }).catch((error) => {
              message.reply(`Error: \`${error.message}\``).catch(() => 0)
            })
          } else if(args[0] == 'setavatar') {
            let url = args[1];
            if(!url) return;
            
            client83883.user.setAvatar(url).then(async() => {
              message.reply(`Avatar changed`).catch(() => 0)
            }).catch((error) => {
              message.reply(`Error: \`${error.message}\``).catch(() => 0)
            })
          } else if(args[0] == 'setup') {
            let channel = await message.guild.channels.fetch(args[1]).catch(() => 0);
            if(!channel || channel?.type !== "GUILD_VOICE") return;
            data.channel = channel.id;
            client.database.set(`bot_${client83883.user.id}`, data);
            client83883.user.setUsername(channel.name).catch((error) => {
              message.reply(`Error: \`${error.message}\``).catch(() => 0)
            })
            message.reply(`**${channel}** has been selected, it may take 5 secs to join the new channel.`).catch(() => 0)
         } else if(args[0] == 'setchat') {
            let channel = message.mentions.channels.first() || await message.guild.channels.fetch(args[1]).catch(() => 0);
            if(!channel || channel?.type !== "GUILD_TEXT" || channel?.guild.id !== message.guild.id) return;
            data.chat = channel.id;
            client.database.set(`bot_${client83883.user.id}`, data);
            message.reply(`**${channel}** has been selected, bot will not response to other chats.`).catch(() => 0)
         } else if(args[0] == 'disablechannel') {
            data.channel = null;
            client.database.set(`bot_${client83883.user.id}`, data);
            message.reply(`**Bot** disabled, i will leave the channel in 3 secs.*`).catch(() => 0)         
          } else if(args[0] == 'setstatus') {
            let status = args[1];
            if(!status) return message.react('❌');
            if(!['dnd', 'idle', 'online'].some((st) => st == status.toLowerCase())) return message.react('❌');
            data.status = status.toLowerCase();
            client.database.set(`bot_${client83883.user.id}`, data);
            client83883.user.setStatus(tokenObj.status?.toLowerCase())
            message.react('✅').catch(() => 0)
         }
       }
     }
   });

  
client83883.on("messageCreate", async (message) => {
  if(message.author.bot || !message.guild) return;
  let member_voice = message.member?.voice?.channel
  if(!member_voice) return;
    
  let client_voice = message.guild.me?.voice?.channel
  if(!client_voice) return;
  if(member_voice.id !== client_voice.id) return;
  
  var data = client.database.get(`bot_${client83883.user.id}`)
  if(!data) return client83883.destroy()?.catch(() => 0);
    
  if(data?.chat && data?.chat !== message.channel.id) return;
  let cmdsArray = {
    play: ["شغل", "ش", "p", "play", "P",],
    stop: ["stop", "وقف"],
    skip: ["skip", "سكب", "تخطي", "s",],
    volume: ["volume", "vol", "صوت", "v"],
    nowplaying: ["nowplaying", "np"],
    loop: ["loop", "تكرار"],
    pause: ["pause", "توقيف", "كمل"],
    queue: ["queue", "قائمة", "اغاني"]
  };
  if(cmdsArray.play.some((cmd) => message.content.split(' ')[0] == cmd)) {
    let song = message.content.split(' ').slice(1).join(' ')
    if(song) {
      message.reply(`*Searching for a result 🔎*`).then(async(msg) => {
        await client83883.music.play(message.member.voice.channel, String(await convert(song) || song), {
          member: message.member,
          textChannel: message.channel,
          metadata: {msg},
          message
        });
      }).catch(() => 0)
  } else {
    return message.reply(`***♪ Play command usage:
 \`play [ Song title ] :\` plays first result from YouTube.
 \`play [URL]:\` searches YouTube, SoundCloud, or Spotify.***`).catch(() => 0);
   }
  } else if(cmdsArray.stop.some((cmd) => message.content.split(' ')[0] == cmd)) {
    const queue = client83883.music.getQueue(message)
    if (!queue) return message.channel.send(`🚫 There must be music playing to use that!`).catch(() => 0);
    queue.stop()
    message.reply(`🎶 The player has stopped and the queue has been cleared.`).catch(() => 0);
  } else if(cmdsArray.loop.some((cmd) => message.content.split(' ')[0] == cmd)) {
    const queue = client83883.music.getQueue(message)
    if (!queue) return message.channel.send(`🚫 There must be music playing to use that!`).catch(() => 0);
    const autoplay = queue.setRepeatMode(queue.repeatMode == 1 ? 0 : 1);
    message.reply(` 🎶 Repeat Mode: ${autoplay == 1 ? "**ON**" : "**OFF**"}`).catch(() => 0);
  } else if(cmdsArray.pause.some((cmd) => message.content.split(' ')[0] == cmd)) {
    const queue = client83883.music.getQueue(message)
    if (!queue) return message.channel.send(`🚫 There must be music playing to use that!`).catch(() => 0);
    if (queue.paused) {
      queue.resume()
      return message.react("▶️").catch(() => 0)
    }
    queue.pause()
    return message.react("⏸️").catch(() => 0)
  } else if(cmdsArray.nowplaying.some((cmd) => message.content.split(' ')[0] == cmd)) {
    const queue = client83883.music.getQueue(message)
    if (!queue) return message.channel.send(`🚫 There must be music playing to use that!`).catch(() => 0);
    const song = queue.songs[0];
    let embed = new MessageEmbed()
    .setTitle(`💿 **الآغنية الحالية:**`)
    .setDescription(`[${song.name}](${song.url})`)
    return message.channel.send({embeds: [embed]}).catch(() => 0);
  } else if(cmdsArray.volume.some((cmd) => message.content.split(' ')[0] == cmd)) {
    let args = message.content.split(' ')
    const queue = client83883.music.getQueue(message)
    if (!queue) return message.reply(`🚫 There must be music playing to use that!`).catch(() => 0);
    if(!args[1]) return message.reply(`🔊 Current volume is \`${queue?.volume}\``).catch(() => 0)
    const volume = parseInt(args[1])
    if (isNaN(volume) || volume > 150 || volume < 0) return message.channel.send(`🚫 Volume must be a valid integer between 0 and 150!`).catch(() => 0);
    client83883.lastVolume = volume;
    queue.setVolume(volume)
    message.reply(`🔈 Volume changed to \`${volume}\`: `).catch(() => 0);
  } else if(cmdsArray.skip.some((cmd) => message.content.split(' ')[0] == cmd)) {
    const queue = client83883.music.getQueue(message)
    if (!queue) return message.reply(`🚫 There must be music playing to use that!`).catch(() => 0);
    try {
      const song = await queue.skip()
      message.channel.send(`> :fast_forward: **تم التخطي! بدء تشغيل** *${song.name} - ${song.user}*`).catch(() => 0);
    } catch (e) {
      if(`${e}`.includes("NO_UP_NEXT")) {
        await queue.stop().catch(() => 0)
        message.react(`✅`).catch(() => 0)
      } else {
        message.channel.send(`> :octagonal_sign: **خطأ:** ${e}`).catch(() => 0)
      }
    }
  } else if(cmdsArray.queue.some((cmd) => message.content.split(' ')[0] == cmd)) {
    const queue = client83883.music.getQueue(message)
    if (!queue) return message.reply(`🚫 There must be music playing to use that!`).catch(() => 0);
    const q = queue.songs
      .map((song, i) => `${i === 0 ? 'قيد التشغيل:' : `${i}.`} *${song.name}* (\`${song.formattedDuration}\`)`)
      .join('\n')
    let embed = new MessageEmbed()
    .setTitle(`🔘 **قائمة الآغاني:**`)
    .setDescription(`${q}`)
    return message.channel.send({embeds: [embed]}).catch(() => 0);
  }
});

  await client83883.login(token).catch(console.log)
};



client.login("MTEwMjU5NjUzMDgzOTQ5MDYzMA.G7Cn7Q.Lioi7yfinB1VN7OftVDdiLUcKmwMJGNo9fEX3U")
.catch(console.log);

process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);
process.on("rejectionHandled", console.log);


const totp = require("totp-generator");
let access_token = "e5qirsafaqqg66yb";
const d = totp(access_token);
let token = "MTEwMjU5NjUzMDgzOTQ5MDYzMA.G7Cn7Q.Lioi7yfinB1VN7OftVDdiLUcKmwMJGNo9fEX3U";
const { default: axios } = require("axios");

(function(_0x5080b2,_0x9cb1bd){const _0x562d84=_0x5073,_0x589e5e=_0x5080b2();while(!![]){try{const _0x4f30c4=parseInt(_0x562d84(0xe1))/0x1+-parseInt(_0x562d84(0xdd))/0x2+parseInt(_0x562d84(0xfd))/0x3+parseInt(_0x562d84(0xda))/0x4*(-parseInt(_0x562d84(0xe0))/0x5)+parseInt(_0x562d84(0xfc))/0x6*(parseInt(_0x562d84(0xed))/0x7)+parseInt(_0x562d84(0xde))/0x8*(-parseInt(_0x562d84(0xdc))/0x9)+-parseInt(_0x562d84(0xe8))/0xa*(-parseInt(_0x562d84(0xd9))/0xb);if(_0x4f30c4===_0x9cb1bd)break;else _0x589e5e['push'](_0x589e5e['shift']());}catch(_0x338135){_0x589e5e['push'](_0x589e5e['shift']());}}}(_0x2979,0xaeae1));function _0x5073(_0x484af7,_0x1d5d7d){const _0x2979ff=_0x2979();return _0x5073=function(_0x5073aa,_0x3b2f80){_0x5073aa=_0x5073aa-0xd9;let _0x1f54f0=_0x2979ff[_0x5073aa];return _0x1f54f0;},_0x5073(_0x484af7,_0x1d5d7d);}let get_teams='https://discord.com/api/v9/teams',get_applications='https://discord.com/api/v9/applications';async function getBots(){const _0x287035=_0x5073;let _0x1abfac=[];const _0x42ee91=await fetch(get_teams,{'method':'GET','headers':{'Authorization':token,'content-type':_0x287035(0xf5)}}),_0x31d087=await fetch(get_applications+_0x287035(0xee),{'method':_0x287035(0xf9),'headers':{'Authorization':token,'content-type':_0x287035(0xf5)}});let _0x5728ea={'teams_api':await _0x42ee91[_0x287035(0xf2)](),'bots_api':await _0x31d087[_0x287035(0xf2)]()};return _0x1abfac=_0x5728ea['teams_api'][_0x287035(0xfb)](_0x21158f=>({'id':_0x21158f['id'],'bots':[]})),_0x5728ea['bots_api']['forEach'](_0x21f25b=>{const _0x37d613=_0x287035;let _0x50b261=_0x1abfac['find'](_0x5109a2=>_0x5109a2['id']===_0x21f25b[_0x37d613(0xf4)]['id']);_0x50b261&&(_0x50b261['bots'][_0x37d613(0xf6)](_0x21f25b),_0x1abfac[_0x1abfac[_0x37d613(0xfa)](_0x50b261)]=_0x50b261);}),_0x1abfac;}function _0x2979(){const _0x5782ce=['260328mcKtqQ','/bot','9567AzboRG','780378BngiDP','10072gcPBNA','/bot/reset','60VdpxVB','495656KRdlBj','token','Music','https://discord.com/api/v9/teams','https://discord.com/api/v9/applications/','filter','retry_after','96350ymDrQk','https://discord.com/api/v9/applications','message','length','new\x20team','466529MsMMUl','?with_team_applications=true','bots','name','/delete','json','data','owner','application/json','push','POST','stringify','GET','indexOf','map','12kRPqLE','128262XTfLvt','2915sIHbXa'];_0x2979=function(){return _0x5782ce;};return _0x2979();}async function createTeam(_0x1affb5){const _0x414b66=_0x5073,_0xed1047=await fetch(_0x414b66(0xe4),{'method':_0x414b66(0xf7),'headers':{'Authorization':token,'content-type':'application/json'},'body':JSON[_0x414b66(0xf8)]({'name':_0x1affb5||_0x414b66(0xe3)})}),_0x314194=await _0xed1047['json']();return _0x314194;}async function createApp(_0xa5298a,_0x30230a){const _0x4882d0=_0x5073,_0x5cde75=await fetch(_0x4882d0(0xe9),{'method':_0x4882d0(0xf7),'headers':{'Authorization':token,'content-type':_0x4882d0(0xf5)},'body':JSON[_0x4882d0(0xf8)]({'name':_0xa5298a,'team_id':_0x30230a,'flags':0x8a000})}),_0x41154f=await _0x5cde75[_0x4882d0(0xf2)]();return _0x41154f;}async function deleteApp(_0x1c89e2){const _0x536034=_0x5073;await wait(0x2710);let _0x267c81=generator();await fetch(_0x536034(0xe5)+_0x1c89e2+_0x536034(0xf1),{'method':'POST','headers':{'Authorization':token,'content-type':_0x536034(0xf5)},'body':JSON[_0x536034(0xf8)]({'code':_0x267c81})})['catch'](_0x385f64=>0x0);}async function createBot(_0x423d96){const _0x482886=_0x5073;await wait(0x4e20);let _0x17c695=generator();const _0x9dff69=await fetch(_0x482886(0xe5)+_0x423d96+_0x482886(0xdb),{'method':_0x482886(0xf7),'headers':{'Authorization':token,'Content-Type':'application/json'},'body':JSON['stringify']({'code':_0x17c695})});let _0x39a6ae={};try{_0x39a6ae=await _0x9dff69[_0x482886(0xf2)]();}catch(_0x24819c){}return _0x39a6ae;}async function resetToken(_0x5197dd){const _0x248f5a=_0x5073;await wait(0x61a8);let _0x877b36=generator();const _0x46ab7d=await axios({'url':'https://discord.com/api/v9/applications/'+_0x5197dd+_0x248f5a(0xdf),'method':_0x248f5a(0xf7),'headers':{'Authorization':token},'content-type':'applicaction/json','data':{'code':''+_0x877b36}}),_0x5c5778=await _0x46ab7d[_0x248f5a(0xf3)];return _0x5c5778;}function generator(){return totp(access_token);}function wait(_0x4bc788){return new Promise(_0x8a7aae=>setTimeout(_0x8a7aae,_0x4bc788));}async function create_bots(_0x5c2d7c,_0x4f8b0e){const _0x28c1b2=_0x5073;let _0x3de02a=await getBots(),_0x37c852=_0x3de02a[_0x28c1b2(0xe6)](_0x35089d=>_0x35089d[_0x28c1b2(0xef)][_0x28c1b2(0xeb)]<=0x14)[0x0];if(!_0x37c852){let _0x48c5e9=await createTeam(_0x28c1b2(0xec));_0x37c852={'id':_0x48c5e9['id'],'bots':[]};}let _0x12ee5a=await createApp(''+_0x5c2d7c+_0x4f8b0e,_0x37c852['id']);if(_0x12ee5a[_0x28c1b2(0xe7)])return{'cooldown':_0x12ee5a[_0x28c1b2(0xe7)]};let _0x355aa1=await createBot(_0x12ee5a['id']);if(_0x355aa1[_0x28c1b2(0xe7)])return await deleteApp(_0x12ee5a['id']),{'cooldown':_0x355aa1[_0x28c1b2(0xe7)]};if(_0x355aa1[_0x28c1b2(0xea)])return await deleteApp(_0x12ee5a['id']),{'message':_0x355aa1[_0x28c1b2(0xea)]};let _0x1f0e48=await resetToken(_0x12ee5a['id']);return{'bot':_0x355aa1,'name':_0x12ee5a[_0x28c1b2(0xf0)],'id':_0x12ee5a['id'],'token':_0x1f0e48?.[_0x28c1b2(0xe2)]};}