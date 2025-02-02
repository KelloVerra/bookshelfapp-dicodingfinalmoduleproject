/*
============================= CONSTANTS =============================
*/

const BOOK_DATA_STORAGE_KEY = "BOOK_DATA_3kVidx2lOmxJ";
const BOOKLIST_STATE_STORAGE_KEY = "BOOKSHELF_STATE_oHc6eW3vR";
// const BOOK_INCOMPLETED_COUNT_STORAGE_KEY = "INCOMPLETED_BOOK_COUNT_bXo9jLfQtDICODINGACADEMY";
// const BOOK_COMPLETED_COUNT_STORAGE_KEY = "COMPLETED_BOOK_COUNT_P7lQdMpxDldzDICODINGACADEMY";

const RENDERED_BOOKLIST = [];

const RERENDER_BOOKSHELF_EVENT = new Event("RERENDER_BOOKSHELF_EVENT");




/*
============================= UTILITIES =============================
*/ 

/**
 * @returns {Boolean}
 */
function checkStorageAvailability() {
    const availability = (typeof Storage !== "undefined");
    if (availability) checkAndInitializeLocalStorage();

    return availability;
}

/**
 * @returns {String}
 */
function generateBookID() {
    return Number(new Date());
}

/**
 * @returns {String} separated by commas
 */
function combineStrings() {
    if (arguments.length === 0) return "";
    return Array.from(arguments).reduce((prev, curr, i) => {
        return `${prev}, ${curr}`
    });
}

/**
 * Checks if local data is not defined, then sets with default value
 */
function checkAndInitializeLocalStorage() {
    if(localStorage.getItem(BOOK_DATA_STORAGE_KEY) === null) 
        localStorage.setItem(BOOK_DATA_STORAGE_KEY, "{}");
    
    if(localStorage.getItem(BOOKLIST_STATE_STORAGE_KEY) === null) 
        localStorage.setItem(BOOKLIST_STATE_STORAGE_KEY, 0);
}


// ----------- ELEMENT BUILDERS -----------

/**
 * @param {int} id
 * @param {string} title
 * @param {string} author
 * @param {int} year
 * @param {boolean} isUnsaved
 * @param {boolean} isComplete
 * @return {HTMLElement} of the book item
 */
function buildBookItemElement(id, title, author, year, isComplete) {
    const element = document.createElement("div");
    element.classList.add("book-item");
    element.dataset.bookid = String(id);
    element.dataset.testid = "bookItem";

    // TODO: CHECK THE TEST IDS!!!
    element.innerHTML = `
        <div class="book-info-wrapper" oninput="onBookItemEdited(event, this)">
            <input class="fontstyle1 book-title" placeholder="Title" value="${title}" data-testid="bookItemTitle" />
            <div class="book-descriptor"> 
                <input value="${author}" type="text" placeholder="Author" class="fontstyle0" data-testid="bookItemAuthor" />
                &nbsp;&nbsp;&bull;&nbsp;&nbsp;
                <input value="${String(year)}" type="text" placeholder="Year" class="fontstyle0" data-testid="bookItemYear" />
            </div>
            <p class="book-unsaved" data-type="unsaved-message"></p>
        </div>
        <div class="book-option-wrapper">
            ${ !isComplete ?
                `<button onclick="onBookItemCompleted(event)" data-testid="bookItemIsCompleteButton"><img src="assets/complete-book.svg" alt="mark read"/></button>` :
                `<button onclick="onBookItemIncompleted(event)" data-testid="bookItemIsCompleteButton"><img src="assets/move-book.svg" alt="mark unread"/></button>`}
            ${  !isComplete ?
                `<button onclick="onBookItemSaved(event)" data-testid="bookItemEditButton" disabled><img src="assets/edit-book.svg" alt="edit"/></button>` :
                `<button onclick="onBookItemSaved(event)" data-testid="bookItemEditButton" disabled><img src="assets/edit-book-alt.svg" alt="edit"/></button>`}
            ${  !isComplete ?
                `<button onclick="onBookItemDeleted(event)" data-testid="bookItemDeleteButton"><img src="assets/delete-book.svg" alt="delete"/></button>` :
                `<button onclick="onBookItemDeleted(event)" data-testid="bookItemDeleteButton"><img src="assets/delete-book-alt.svg" alt="delete"/></button>`}
        </div>`;
        
    return element;
}


/*
============================== EVENTS ===============================
*/ 

// ----------------- ADD BOOK FORM EVENT HANDLERS -----------------
function onAddBookFormChange(ev) {
    
}

function onAddBookFormSubmit(ev) {
    ev.preventDefault();

    if (!checkStorageAvailability()) return;
    const parsed_book_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));
    
    const new_book_data = {
        id: generateBookID(),
        title: "",
        author: "",
        year: 0,
        isComplete: false,
    };
    Array.from(ev.target.children).forEach(input_group => {
        const input_element = input_group.lastElementChild;
        switch(input_element.id) {
            case "bookFormTitle":
                new_book_data.title = String(input_element.value);
                break;
            case "bookFormAuthor":
                new_book_data.author = String(input_element.value);
                break;
            case "bookFormYear":
                new_book_data.year = parseInt(input_element.value);
                break;
            case "bookFormIsComplete":
                new_book_data.isComplete = input_element.checked;
                break;
        }
    });
    parsed_book_data[new_book_data.id] = new_book_data;

    localStorage.setItem(BOOK_DATA_STORAGE_KEY, JSON.stringify(parsed_book_data));
    RENDERED_BOOKLIST.push(new_book_data);
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}



// ----------------- BOOKSHELF EVENT HANDLERS -----------------
function onSearch(ev) {
    ev.preventDefault();
    console.log(localStorage);
    console.log(ev.target.children.namedItem("searchBookTitle").value);
}

function onBookshelfStateChange(ev) {
    if(!checkStorageAvailability()) return;

    localStorage.setItem(BOOKLIST_STATE_STORAGE_KEY, String(
        (parseInt(localStorage.getItem(BOOKLIST_STATE_STORAGE_KEY)) + 1) % 2
    ));
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}

function reduceBookItem(ev, reduce_function) {

    const this_book_id = ev.target.parentElement.parentElement.dataset.bookid;
    const parsed_book_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));
    let iteration = 0;
    for (const id in parsed_book_data) {
        if (id === this_book_id) {
            reduce_function(parsed_book_data, id, iteration);
        }
        ++iteration;
    }

    localStorage.setItem(BOOK_DATA_STORAGE_KEY, JSON.stringify(parsed_book_data));
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}
function onBookItemEdited(ev, book_info_wrapper_element) {
    ev.preventDefault();
    
    let additional_messages = [];

    // custom validation
    
    const title_input = book_info_wrapper_element.children.item(0);
    if(title_input.value === "") additional_messages.push("<strong>Judul</strong> tidak boleh kosong");
    else if(title_input.value.length > 22) additional_messages.push("<strong>Judul</strong> tidak boleh melebihi 22 karakter");
    else if(/[\^\*#%{}\[\]`<>¬@\\]/g.test(title_input.value)) additional_messages.push("<strong>Judul</strong> tidak boleh mengandung karakter invalid");
    
    const author_input = book_info_wrapper_element.children.item(1).children.item(0);
    if(author_input.value === "") additional_messages.push("<strong>Author</strong> tidak boleh kosong");
    else if(author_input.value.length > 22) additional_messages.push("<strong>Author</strong> tidak boleh melebihi 22 karakter");
    else if(/[\^\*#%{}\[\]`<>¬@\\]/g.test(author_input.value)) additional_messages.push("<strong>Author</strong> tidak boleh mengandung karakter invalid");
    
    const year_input = book_info_wrapper_element.children.item(1).children.item(1);
    if(year_input.value === "") additional_messages.push("<strong>Year</strong> tidak boleh kosong");
    else if(parseInt(year_input.value) < 1) additional_messages.push("<strong>Year</strong> tidak boleh dibawah 1");
    else if(parseInt(year_input.value) > new Date().getFullYear()) additional_messages.push("<strong>Year</strong> tidak boleh menandakan rilis di masa depan");
    else if((/[^0-9]/g.test(year_input.value))) additional_messages.push("<strong>Year</strong> harus mengandung angka yang valid");


    const book_unsaved_indicator = book_info_wrapper_element.lastElementChild;
    book_unsaved_indicator.innerHTML = additional_messages.length > 0 ? `*diubah (${combineStrings(...additional_messages)})` : `*diubah`;
    book_info_wrapper_element.dataset.errcount = additional_messages.length; // set bookitem's error coun

    const book_save_button = book_info_wrapper_element.parentElement.lastElementChild.children.item(1);
    book_save_button.disabled = additional_messages.length > 0;
}
function onBookItemSaved(ev) {
    ev.preventDefault();
    
    const book_option_wrapper_element = ev.target.parentElement;
    const book_item_element = book_option_wrapper_element.parentElement;
    const book_info_wrapper_element = book_item_element.firstElementChild;

    // set properties
    reduceBookItem(ev, (storage_item, storage_index, rendered_index) => {
        storage_item[storage_index].title = book_info_wrapper_element.children.item(0).value;
        RENDERED_BOOKLIST[rendered_index].title = book_info_wrapper_element.children.item(0).value;

        storage_item[storage_index].author = book_info_wrapper_element.children.item(1).children.item(0).value;
        RENDERED_BOOKLIST[rendered_index].author = book_info_wrapper_element.children.item(1).children.item(0).value;

        storage_item[storage_index].year = book_info_wrapper_element.children.item(1).children.item(1).value;
        RENDERED_BOOKLIST[rendered_index].year = book_info_wrapper_element.children.item(1).children.item(1).value;
    });
}
function onBookItemCompleted(ev) {
    ev.preventDefault();
    reduceBookItem(ev, (storage_item, storage_index, rendered_index) => {
        storage_item[storage_index].isComplete = true;
        RENDERED_BOOKLIST[rendered_index].isComplete = true;
    });
}
function onBookItemIncompleted(ev) {
    ev.preventDefault();
    reduceBookItem(ev, (storage_item, storage_index, rendered_index) => {
        storage_item[storage_index].isComplete = false;
        RENDERED_BOOKLIST[rendered_index].isComplete = false;
    });
}
function onBookItemDeleted(ev) {
    ev.preventDefault();
    reduceBookItem(ev, (storage_item, storage_index, rendered_index) => {
        delete storage_item[storage_index];
        RENDERED_BOOKLIST.splice(rendered_index, 1);
    });
}

function renderBooklist(bookshelf) {
    const booklist_state = parseInt(localStorage.getItem(BOOKLIST_STATE_STORAGE_KEY));
    const booklist = bookshelf.children[1];

    
    if(booklist_state === 0) {
        booklist.id = 'incompleteBookList';
    } else {
        booklist.id = 'completeBookList';
    }
    booklist.innerHTML = "";

    let iteration = 0;
    for (const bookitem of RENDERED_BOOKLIST) {

        const display_state = bookitem.isComplete ? 0 : 1;
        if(booklist_state === display_state) continue;

        if(bookitem.isUnsaved === undefined) RENDERED_BOOKLIST[iteration].isUnsaved = false;

        booklist.appendChild(
            buildBookItemElement(
                bookitem.id, 
                bookitem.title, 
                bookitem.author,
                bookitem.year,
                bookitem.isComplete
            )
        );
        ++iteration;
    }
}



// ----------------- FOOTER EVENT HANDLERS -----------------
function updateFooterStats(footer) {

    // Count book stats
    let incompleted_books_count = 0;
    let books_count = 0;
    Object.entries(JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY))).forEach(book =>{
        if (!book[1].isComplete) incompleted_books_count++;
        books_count++;
    });

    // Show stats
    Object.entries(footer.children).forEach(children => {
        const element = children[1];
        const stat_number_children = 0;
        switch(element.id) {
            case "incompleted-books-stat":
                element.children[stat_number_children].innerHTML = incompleted_books_count;
                break;
            case "completed-books-stat":
                element.children[stat_number_children].innerHTML = books_count - incompleted_books_count;
                break;
        }
    });
}



// ----------------- GENERAL EVENT HANDLERS -----------------

function rerenderBookContents(ev) {
    const bookshelf = document.getElementById("bookshelf");
    const footer = document.getElementById("footer");

    renderBooklist(bookshelf);
    updateFooterStats(footer);
}
function syncBookContents() {
    if(!checkStorageAvailability()) return;
    const parsed_book_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));

    // empty cached booklist
    RENDERED_BOOKLIST.length = 0;

    for(const book_data in parsed_book_data) {
        RENDERED_BOOKLIST.push(parsed_book_data[book_data]);
        console.log(RENDERED_BOOKLIST);
    }
}

function onDOMContentLoaded(ev) {
    // --- Storage inits ---

    checkAndInitializeLocalStorage();
    

    // --- Elements ---

    const bookshelf_searchForm = document.getElementById("searchBook");
    const addBookForm = document.getElementById("bookForm");
    const bookshelf_changeStateButton = document.getElementById("toggleBookList");



    // --- Event registration ---

    document.addEventListener("RERENDER_BOOKSHELF_EVENT", rerenderBookContents);

    bookshelf_searchForm.addEventListener("submit", onSearch);
    addBookForm.addEventListener("submit", onAddBookFormSubmit);
    bookshelf_changeStateButton.addEventListener("click", onBookshelfStateChange);



    // --- Render event dispatchs ---

    syncBookContents();
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);