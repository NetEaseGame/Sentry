import {_} from 'underscore';

const catalogs = (function() {
  let info = require('../../../locale/catalogs.json');
  return info.supported_locales;
})();

export const translations = (function() {
  let ctx = require.context('../../../locale/', true, /\.po$/);
  let rv = {};
  ctx.keys().forEach((translation) => {
    let langCode = translation.match(/([a-zA-Z_]+)/)[1];
    if (_.contains(catalogs, langCode)) {
      rv[dirname_to_locale(langCode)] = ctx(translation);
    }
  });
  return rv;
})();

export function getTranslations(language) {
  return translations[language] || translations.en;
}

export function translationsExist(language) {
  return translations[language] !== undefined;
}

// t(text) has bug to translate which `LOCALE` has char `-`
function dirname_to_locale(dir_name) {
  if (dir_name.indexOf('_') >= 0) {
      let locale_array = dir_name.split('_');
        console.log(locale_array);
      dir_name = locale_array[0] + '-' + locale_array[1].toLowerCase();
  }
  return dir_name
}
