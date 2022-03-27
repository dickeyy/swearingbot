// TODO Wait for Twitter to approve application then test then deploy to Firebase

const functions = require("firebase-functions");
const badwords = require("badwordspluss");
const {Translate} = require('@google-cloud/translate').v2;
const dotenv = require('dotenv');
const twitter = require('twitter-lite');

// Load .env
dotenv.config();

// Twitter Setup
const config = {
    consumer_key: process.env.T_API_KEY,
    consumer_secret: process.env.T_API_KEY_SECRET,
    access_token_key: process.env.T_API_ACCESS_TOKEN,
    access_token_secret: process.env.T_API_ACCESS_TOKEN_SECRET
}
const client = new twitter(config);

// Lang id -> full word
const langIdToFullLang = {["Afrikaans"]:"af",["Albanian"]: "sq",["Amharic"]: "am",["Arabic"]: "ar",["Armenian"]:	"hy",["Azerbaijani"]:	"az",["Basque"]:	"eu",["Belarusian"]:	"be",["Bengali"]:	"bn",["Bosnian"]:	"bs",["Bulgarian"]:	"bg",["Catalan"]:  "ca",["Cebuano"]:	"ceb",["Chinese (Simplified)"]:	"zh-CN",["Chinese (Traditional)"]:	"zh-TW" ,["Corsican"]:	"co",["Croatian"]:	"hr",["Czech"]:	"cs",["Danish"]:	"da",["Dutch"]:	"nl",["English"]:	"en",["Esperanto"]:	"eo",["Estonian"]:	"et",["Finnish"]:	"fi",["French"]:	"fr",["Frisian"]:	"fy",["Galician"]:	"gl",["Georgian"]:	"ka",["German"]:	"de",["Greek"]: "el",["Gujarati"]:	"gu",["Haitian Creole"]:	"ht",["Hausa"]:	"ha",["Hawaiian"]:	"haw",["Hebrew"]:	"he",["Hindi"]:	"hi",["Hmong"]:	"hmn",["Hungarian"]:	"hu",["Icelandic"]:	"is",["Igbo"]:	"ig",["Indonesian"]:	"id",["Irish"]:	"ga",["Italian"]:  "it",["Japanese"]:	"ja",["Javanese"]:	"jv",["Kannada"]:	"kn",["Kazakh"]:	"kk",["Khmer"]:	"km",["Kinyarwanda"]:	"rw",["Korean"]:	"ko",["Kurdish"]:	"ku",["Kyrgyz"]:	"ky",["Lao"]:	"lo",["Latvian"]:	"lv",["Lithuanian"]:	"lt",["Luxembourgish"]:	"lb",["Macedonian"]:	"mk",["Malagasy"]:	"mg",["Malay"]:	"ms",["Malayalam"]:	"ml",["Maltese"]:	"mt",["Maori"]:	"mi",["Marathi"]:	"mr",["Mongolian"]:	"mn",["Myanmar (Burmese)"]:	"my",["Nepali"]:	"ne",["Norwegian"]:	"no",["Nyanja (Chichewa)"]:	"ny",["Odia (Oriya)"]:	"or",["Pashto"]:	"ps",["Persian"]:	"fa",["Polish"]:	"pl",["Portuguese (Portugal, Brazil)"]:	"pt",["Punjabi"]:	"pa",["Romanian"]:	"ro",["Russian"]: "ru",["Samoan"]:	"sm",["Scots Gaelic"]:	"gd",["Serbian"]:	"sr",["Sesotho"]:	"st",["Shona"]:	"sn",["Sindhi"]:	"sd",["Sinhala (Sinhalese)"]:	"si",["Slovak"]:	"sk",["Slovenian"]:	"sl",["Somali"]:	"so",["Spanish"]:	"es",["Sundanese"]:	"su",["Swahili"]:	"sw",["Swedish"]:	"sv",["Tagalog (Filipino)"]:	"tl",["Tajik"]:	"tg",["Tamil"]:	"ta",["Tatar"]:	"tt",["Telugu"]:	"te",["Thai"]:	"th",["Turkish"]:	"tr",["Turkmen"]:	"tk",["Ukrainian"]:	"uk",["Urdu"]:	"ur",["Uyghur"]:	"ug",["Uzbek"]:	"uz",["Vietnamese"]:	"vi",["Welsh"]:	"cy",["Xhosa"]:	"xh",["Yiddish"]:	"yi",["Yoruba"]:	"yo",["Zulu"]:	"zu"}

// get bad word
function getBadWord() {
    const badWordNum = Math.round(Math.random() * badwords.length)
    const badWord = badwords[badWordNum]
    return badWord
}

// Get language
function getLanguage() {
    const langList = ['af','sq','am','ar','hy','az','eu','be','bn','bs','bg','ca','ceb','zh-CN','zh-TW','co','hr','cs','da','nl','en','eo','et','fi','fr','fy','gl','ka','de','el','gu','ht','ha','haw','he','hi','hmn','hu','is','ig','id','ga','it','ja','jv','kn','kk','km','rw','ko','ku','ky','lo','lv','lt','lb','mk','mg','ms','ml','mt','mi','mr','mn','my','ne','no','ny','or','ps','fa','pl','pt','pa','ro','ru','sm','gd','sr','st','sn','sd','si','sk','sl','so','es','su','sw','sv','tl','tg','ta','tt','te','th','tr','tk','uk','ur','ug','uz','vi','cy','xh','yi','yo','zu']
    const langNum = Math.round(Math.random() * langList.length)
    const lang = langList[langNum]
    return lang
}

// Main function
async function main() {
    const lang = getLanguage()
    const badWord = getBadWord()

    const origLang = Object.keys(langIdToFullLang).find(key => langIdToFullLang[key] === lang)

    const CREDENTIALS = JSON.parse(process.env.TRANSLATE_CRED)
    const translate = new Translate(trasnlateConfig={
        credentials: CREDENTIALS,
        projectId: CREDENTIALS.project_id
    });

    let [translations] = await translate.translate(badWord, lang);
    translations = Array.isArray(translations) ? translations : [translations];
    translations.forEach((translation, i) => {
        const toTweet = `${translation}\n\nLanguage: ${origLang}`

        client.post('statuses/update', { status: toTweet }).then(result => {
            console.log(`Tweeted: ${badWord} -> ${translation} | ${origLang}`);
        }).catch(console.error);
    });
}

// // Uncomment for Testing 
// main()

// Firebase function
exports.scheduledFunction = functions.pubsub.schedule('every 24 hours').onRun(main())