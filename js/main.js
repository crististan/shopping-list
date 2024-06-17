const addItemForm = document.querySelector('#add_item_form');
const itemsList = document.querySelector("#items_list");
const removeItemsButtons = document.querySelectorAll('.remove-item-button');

let db;
let dbName = 'shoppingListItems';
let dbVersion = 1;
let openRequest = indexedDB.open(dbName, dbVersion);

openRequest.onerror = (event) => {
    console.error("Why didn't you allow my web app to use IndexedDB?!");
};

openRequest.onsuccess = (event) => {
    db = event.target.result;
    geItemsFromIndexedDb();
};

openRequest.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains("items")) {
        let objectStore = db.createObjectStore("items", { keyPath: "id", autoIncrement: true });

        objectStore.createIndex("item", "item", { unique: false });
        objectStore.createIndex("quantity", "quantity", { unique: false });
        objectStore.createIndex("unit", "unit", { unique: false });
        objectStore.createIndex("created_at", "created_at", { unique: false });
    }
};

function geItemsFromIndexedDb() {
    let objectStore = db.transaction(["items"], "readwrite").objectStore("items");

    objectStore.getAll().onsuccess = (event) => {
        itemsList.innerHTML = '';

        event.target.result.forEach(item => {
            const li = document.createElement("li");

            li.innerHTML = `
                <div>
                    <input type="checkbox" />
                    <span>${JSON.stringify(item.item)}</span>
                    <button class="remove-item-button">X</button>
                </div>`;
            itemsList.appendChild(li);

            const button = li.querySelector(".remove-item-button");

            button.addEventListener("click", function() {
                itemsList.removeChild(li);

                db.transaction(["items"], "readwrite").objectStore("items").delete(item.id);
            });
        });
    };
}

function removeItem() {
    console.log('remove item');
}

removeItemsButtons.forEach(removeItemButton => {
    removeItemButton.addEventListener('click', removeItem);
});

addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let formData = new FormData(addItemForm);

    let itemObj = {
        item: formData.get('item'),
        quantity: 1,
        unit: 'kg',
        created_at: new Date()
    }

    const transaction = db.transaction(["items"], "readwrite");
    const objectStore = transaction.objectStore("items");
    const addRequest = objectStore.add(itemObj);

    addRequest.onsuccess = function() {
        console.log('form submitted');
        geItemsFromIndexedDb();
        addItemForm.reset();
    }

    addRequest.onerror = function(event) {
        console.log("Error adding item:", event.target.errorCode);
    };
});

