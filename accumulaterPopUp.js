document.addEventListener('DOMContentLoaded', init);

async function init() {
    const elem = document.getElementById('clear');
    elem.addEventListener('click', () => more('clear'));
    // const elem2 = document.getElementById('add');
    // elem2.addEventListener('click', () => more('add'));
    // const elem3 = document.getElementById('inject');
    // elem3.addEventListener('click', () => more('inject'));
    const strict = document.getElementById('Strict');
    strict.addEventListener('change', (e) => strictFunc(e.target.checked));
    const run = document.getElementById('Run');
    run.addEventListener('change', (e) => runFunc(e.target.checked));
    createList();

    let data = await chrome.storage.local.get('options');
    if (await data) {
        let options = await data.options;

        run.checked = options.run;
        strict.checked = options.strict;
    }
}

const createList = async () => {
    let list = await chrome.storage.local.get('myArray');
    const listArea = document.getElementById('List');
    // sets array to myArray in store
    let array = list.myArray;

    chrome.action.setBadgeText({ text: JSON.stringify(array.length) }); // We have 10+ unread items.

    listArea.innerHTML = '';
    array.map((item) => {
        let li = document.createElement('li');
        li.innerText = item.site;
        listArea.append(li);
    });
};

const strictFunc = async (checked) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'strict',
            value: checked
        });
    });
};

const runFunc = async (checked) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'run', value: checked });
    });
};

var first = true;

function more(type) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: type });
    });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key == 'myArray') {
            createList();
        }
    }
});
