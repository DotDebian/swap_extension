(function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: 'IS_SHOPIFY'}, () => {});
    });

    function commandIsShopify(message) {
        const
            url = message.url,
            collectionsButton = document.getElementById('collections'),
            productsButton = document.getElementById('products');

        collectionsButton.removeAttribute('disabled');
        collectionsButton.addEventListener('click', function () {
            chrome.tabs.create({url: "collections.html?url=" + url})
        });

        productsButton.removeAttribute('disabled');
        productsButton.addEventListener('click', function () {
            chrome.tabs.create({url: "products.html?url=" + url})
        });
    }

    /**
     * Listen product count from content script
     *
     * @param message
     */
    function commandProductCount(message) {
        const countElement = document.getElementById('product_count');
        countElement.innerHTML = '(' + message.count + ')'
    }

    /**
     * Listen collection count from content script
     *
     * @param message
     */
    function commandCollectionCount(message) {
        const countElement = document.getElementById('collection_count');
        countElement.innerHTML =  '(' + message.count  + ')'
    }

    chrome.runtime.onMessage.addListener(function(message) {
        switch (message?.command) {
            case "IS_SHOPIFY":
                commandIsShopify(message);
                break;
            case "COLLECTION_COUNT":
                commandCollectionCount(message);
                break;
            case "PRODUCT_COUNT":
                commandProductCount(message);
                break;
            default:
                break;
        }
    });
})()