chrome.runtime.onMessage.addListener(async function (request) {
    console.log(request.action);

    if (request.action == 'add') {
        await add_css();
    }

    // clears store
    if (request.action == 'clear') {
        chrome.storage.local.set({ myArray: [] }, function () {
            console.log('store cleared successfully');
        });
    }

    // injects css
    if (request.action == 'inject') {
        //Gets array from store

        await inject_css(css);
    }

    if (request.action == 'strict') {
        //Gets array from store

        console.log(request.value);
        let data = await chrome.storage.local.get('options');
        let options = data.options;

        options.strict = request.value;

        console.log(options);

        //adds the mutated array to store
        chrome.storage.local.set({ options: options }, function () {
            console.log(`change "${options}"'s store successfully`);
        });
    }

    if (request.action == 'run') {
        //Gets array from store

        console.log(request.value);
        let data = await chrome.storage.local.get('options');
        // if (!isEmpty(await data)) {
        let options = data.options;

        options.run = request.value;

        console.log(options);

        //adds the mutated array to store
        chrome.storage.local.set({ options: options }, function () {
            console.log(`change "${options}"'s store successfully`);
        });
    }
});

const getAllCss = async () => {
    console.log(
        `Number of Sheets to add from ${document.location.hostname}: ${document.styleSheets.length}`
    );

    var css = [];

    for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];

        try {
            var rules = 'cssRules' in sheet ? sheet.cssRules : sheet.rules;
        } catch (e) {
            console.log('access denied at ', sheet.href);
        }
        if (rules) {
            css.push(
                '\n/* Stylesheet : ' + (sheet.href || '[inline styles]') + ' */'
            );
            for (var j = 0; j < rules.length; j++) {
                var rule = rules[j];
                if ('cssText' in rule) css.push(rule.cssText);
                else
                    css.push(
                        rule.selectorText +
                            ' {\n' +
                            rule.style.cssText +
                            '\n}\n'
                    );
            }
        }
    }

    var cssInline = css.join('\n') + '\n';

    // add site hostname data to return object
    let newRules = {
        site: document.location.hostname || 'Anon',
        css: cssInline
    };

    return newRules;
};

const add_css = async () => {
    // check if extension is enabled
    let data = await chrome.storage.local.get('options');
    let options = await data.options;

    if (!options.run) {
        console.log('Extension is Off');
        // return if extension is disabled
        return;
    }

    //Gets array from store
    let list = await chrome.storage.local.get('myArray');

    // // sets array to myArray in store

    // sets array to myArray in store
    let array = list.myArray;

    if (array) {
        //checks if we already have this
        if (array.some((e) => e.site === document.location.hostname)) {
            console.log('all ready got did one ');
            return;
        }
    }

    if (!array) {
        array = [];
    }

    console.log('adding css to store');

    //gets new stuff about page
    const newRules = await getAllCss();

    array = array.filter((item) => {
        return item.site != newRules.site;
    });

    //adds to array
    array.push(newRules);

    //adds the mutated array to store
    chrome.storage.local.set({ myArray: array }, function () {
        console.log(`added "${newRules.site}"'s CSS to store successfully`);
    });
};

const inject_css = async () => {
    // check if extension is enabled

    let data = await chrome.storage.local.get('options');

    let options = await data.options;
    if (!options.run) {
        console.log('Extension is Off');
        // return if extension is disabled
        return;
    }

    let list = await chrome.storage.local.get('myArray');

    // sets array to myArray in store
    let array = list.myArray;

    let css = '';

    array.map((item) => {
        css += item.css;
        css += '\n';
    });

    // make all css important if strict
    if (options.strict) {
        // making all css important
        console.log('making everything important innit');
        css = css.replaceAll(';', ' !important;');
    }
    console.log('inject new css juice');

    // import new pad as style
    let el = document.createElement('style');
    el.id = 'accumulater';
    el.type = 'text/css';
    el.innerText = css;
    document.head.appendChild(el);
    console.log('injected!');

    // let everything = document.querySelectorAll('*');
    // for (thing of everything) {
    //     thing.setAttribute('tabindex', '0');
    // }
};

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue.length}", new value is "${newValue.length}".`
        );
    }
});

const init = async () => {
    const data = await chrome.storage.local.get('myArray');
    const options = await chrome.storage.local.get('options');
    console.log(options, data);
    if (isEmpty(options)) {
        let defualts = {
            strict: false,
            run: false
        };
        chrome.storage.local.set({ options: defualts }, function () {
            console.log(`change "options"'s store successfully`);
        });
    }

    await add_css();
    await inject_css();
};

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) return false;
    }

    return true;
}

init();
