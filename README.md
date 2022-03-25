# SwearingBot
A Twitter bot that swears once a day in a variety of languages

Basically I use this package that returns a list of bad words, then I grab a random word from said list. 
```js
function getBadWord() {
    const badWordNum = Math.round(Math.random() * badwords.length)
    const badWord = badwords[badWordNum]
    return badWord
}
```

Then I get a random language from a list of all of Google Translate's language ID's
```js
// Get language
function getLanguage() {
    const langList = ['af','sq','am','ar','hy','az','eu','be','bn','bs','bg','ca','ceb','zh-CN','zh-TW','co','hr','cs','da','nl','en','eo','et','fi','fr','fy','gl','ka','de','el','gu','ht','ha','haw','he','hi','hmn','hu','is','ig','id','ga','it','ja','jv','kn','kk','km','rw','ko','ku','ky','lo','lv','lt','lb','mk','mg','ms','ml','mt','mi','mr','mn','my','ne','no','ny','or','ps','fa','pl','pt','pa','ro','ru','sm','gd','sr','st','sn','sd','si','sk','sl','so','es','su','sw','sv','tl','tg','ta','tt','te','th','tr','tk','uk','ur','ug','uz','vi','cy','xh','yi','yo','zu']
    const langNum = Math.round(Math.random() * langList.length)
    const lang = langList[langNum]
    return lang
}
```

Then I find the whole word for the language based off the ID in a list I made (it looks weird but that's because I had to format it weird ignore that)
```js
// Lang id -> full word
const langIdToFullLang = {["Afrikaans"]:"af",["Albanian"]: "sq",["Amharic"]: "am",["Arabic"]: "ar",["Armenian"]:	"hy",["Azerbaijani"]:	"az",["Basque"]:	"eu",["Belarusian"]:	"be",["Bengali"]:	"bn",["Bosnian"]:	"bs",["Bulgarian"]:	"bg",["Catalan"]:  "ca",["Cebuano"]:	"ceb",["Chinese (Simplified)"]:	"zh-CN",["Chinese (Traditional)"]:	"zh-TW" ,["Corsican"]:	"co",["Croatian"]:	"hr",["Czech"]:	"cs",["Danish"]:	"da",["Dutch"]:	"nl",["English"]:	"en",["Esperanto"]:	"eo",["Estonian"]:	"et",["Finnish"]:	"fi",["French"]:	"fr",["Frisian"]:	"fy",["Galician"]:	"gl",["Georgian"]:	"ka",["German"]:	"de",["Greek"]: "el",["Gujarati"]:	"gu",["Haitian Creole"]:	"ht",["Hausa"]:	"ha",["Hawaiian"]:	"haw",["Hebrew"]:	"he",["Hindi"]:	"hi",["Hmong"]:	"hmn",["Hungarian"]:	"hu",["Icelandic"]:	"is",["Igbo"]:	"ig",["Indonesian"]:	"id",["Irish"]:	"ga",["Italian"]:  "it",["Japanese"]:	"ja",["Javanese"]:	"jv",["Kannada"]:	"kn",["Kazakh"]:	"kk",["Khmer"]:	"km",["Kinyarwanda"]:	"rw",["Korean"]:	"ko",["Kurdish"]:	"ku",["Kyrgyz"]:	"ky",["Lao"]:	"lo",["Latvian"]:	"lv",["Lithuanian"]:	"lt",["Luxembourgish"]:	"lb",["Macedonian"]:	"mk",["Malagasy"]:	"mg",["Malay"]:	"ms",["Malayalam"]:	"ml",["Maltese"]:	"mt",["Maori"]:	"mi",["Marathi"]:	"mr",["Mongolian"]:	"mn",["Myanmar (Burmese)"]:	"my",["Nepali"]:	"ne",["Norwegian"]:	"no",["Nyanja (Chichewa)"]:	"ny",["Odia (Oriya)"]:	"or",["Pashto"]:	"ps",["Persian"]:	"fa",["Polish"]:	"pl",["Portuguese (Portugal, Brazil)"]:	"pt",["Punjabi"]:	"pa",["Romanian"]:	"ro",["Russian"]: "ru",["Samoan"]:	"sm",["Scots Gaelic"]:	"gd",["Serbian"]:	"sr",["Sesotho"]:	"st",["Shona"]:	"sn",["Sindhi"]:	"sd",["Sinhala (Sinhalese)"]:	"si",["Slovak"]:	"sk",["Slovenian"]:	"sl",["Somali"]:	"so",["Spanish"]:	"es",["Sundanese"]:	"su",["Swahili"]:	"sw",["Swedish"]:	"sv",["Tagalog (Filipino)"]:	"tl",["Tajik"]:	"tg",["Tamil"]:	"ta",["Tatar"]:	"tt",["Telugu"]:	"te",["Thai"]:	"th",["Turkish"]:	"tr",["Turkmen"]:	"tk",["Ukrainian"]:	"uk",["Urdu"]:	"ur",["Uyghur"]:	"ug",["Uzbek"]:	"uz",["Vietnamese"]:	"vi",["Welsh"]:	"cy",["Xhosa"]:	"xh",["Yiddish"]:	"yi",["Yoruba"]:	"yo",["Zulu"]:	"zu"}
```

Then I translate the word, get the full word language, then tweet the result
```js
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
        const toTweet = `${translation}\nLanguage: ${origLang}`

        client.post('statuses/update', { status: toTweet }).then(result => {
            console.log(`Tweeted: ${badWord} -> ${translation} | ${origLang}`);
        }).catch(console.error);
    });
}
```

This code is hosted in a Google Cloud Serverless Function and it runs every 24 hours
```js
exports.scheduledFunction = functions.pubsub.schedule('every 24 hours').onRun(main())
```
